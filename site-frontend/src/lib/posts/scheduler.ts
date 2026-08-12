// No "server-only" guard here (unlike queries.ts): this module also needs
// to be importable from plain Node/tsx test scripts (scripts/test-scheduler.ts),
// which don't go through Next's bundler — the only place that actually
// resolves the "server-only" package. It's never imported by a Client
// Component regardless (only actions.ts, instrumentation.ts, and tests).
import { and, eq, isNull, lt, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { posts } from "@/lib/db/schema";
import { logPostEvent } from "./history";

// One attempt per tick (see runSchedulerTick's poll interval in
// src/instrumentation.ts) — this caps retries to a few minutes of transient-
// failure tolerance without retrying a broken post forever.
export const MAX_PUBLISH_ATTEMPTS = 5;

// revalidatePath needs a live Next.js request/server context (an invariant
// it throws on otherwise — e.g. it's unreachable from a plain script). The
// DB transition above it already fully succeeded by the time this runs, so
// a revalidation hiccup must never get treated as the publish/unpublish
// itself failing — worst case the public pages serve a stale cache until
// the next natural revalidation. Never let this bump retry counters or log
// a false publish_failed event.
function revalidatePublicSurfacesBestEffort(id: number, slug: string) {
  try {
    revalidatePath("/admin/posts");
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/");
  } catch (err) {
    console.warn(`[scheduler] revalidatePath failed for post ${id} (DB transition still applied):`, err);
  }
}

/**
 * Conditional UPDATE guarded by the expected current status: if another
 * tick (or a manual action) already transitioned this row, the WHERE clause
 * matches nothing, `.returning()` comes back empty, and this is a silent
 * no-op — that's the whole idempotency guarantee, no locking needed since
 * SQLite serializes writes at the engine level.
 */
export async function attemptScheduledPublish(id: number): Promise<{ ok: boolean; error?: string }> {
  const nowIso = new Date().toISOString();
  try {
    const [row] = await db
      .update(posts)
      .set({
        status: "published",
        publishedAt: nowIso,
        scheduledAt: null,
        publishAttempts: 0,
        lastTransitionError: null,
        lastTransitionErrorAt: null,
        updatedAt: nowIso,
      })
      .where(and(eq(posts.id, id), eq(posts.status, "scheduled")))
      .returning({ id: posts.id, slug: posts.slug });

    if (!row) return { ok: false };

    await logPostEvent(id, "published_auto");
    revalidatePublicSurfacesBestEffort(id, row.slug);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Status is never touched here — a failed attempt can never be mistaken
    // for a successful publish.
    await db
      .update(posts)
      .set({
        publishAttempts: sql`${posts.publishAttempts} + 1`,
        lastTransitionError: message,
        lastTransitionErrorAt: nowIso,
      })
      .where(and(eq(posts.id, id), eq(posts.status, "scheduled")));
    await logPostEvent(id, "publish_failed", message);
    return { ok: false, error: message };
  }
}

export async function attemptScheduledUnpublish(id: number): Promise<{ ok: boolean; error?: string }> {
  const nowIso = new Date().toISOString();
  try {
    const [row] = await db
      .update(posts)
      .set({
        status: "unpublished",
        unpublishedAt: nowIso,
        scheduledUnpublishAt: null,
        publishAttempts: 0,
        lastTransitionError: null,
        lastTransitionErrorAt: null,
        updatedAt: nowIso,
      })
      .where(and(eq(posts.id, id), eq(posts.status, "published")))
      .returning({ id: posts.id, slug: posts.slug });

    if (!row) return { ok: false };

    await logPostEvent(id, "unpublished_auto");
    revalidatePublicSurfacesBestEffort(id, row.slug);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(posts)
      .set({
        publishAttempts: sql`${posts.publishAttempts} + 1`,
        lastTransitionError: message,
        lastTransitionErrorAt: nowIso,
      })
      .where(and(eq(posts.id, id), eq(posts.status, "published")));
    await logPostEvent(id, "publish_failed", message);
    return { ok: false, error: message };
  }
}

/**
 * The one entry point the poller (and the standalone test script) calls.
 * Always re-derives "what's due" from the DB — never from an in-memory
 * schedule — so a server restart or a gap in polling (backlog) is handled
 * by the exact same code path as a normal on-time tick, nothing special.
 */
export async function runSchedulerTick(
  now: Date = new Date(),
): Promise<{ published: number; unpublished: number; failed: number }> {
  const nowIso = now.toISOString();
  let published = 0;
  let unpublished = 0;
  let failed = 0;

  const duePublish = await db
    .select({ id: posts.id })
    .from(posts)
    .where(
      and(
        eq(posts.status, "scheduled"),
        lte(posts.scheduledAt, nowIso),
        isNull(posts.deletedAt),
        lt(posts.publishAttempts, MAX_PUBLISH_ATTEMPTS),
      ),
    );

  for (const { id } of duePublish) {
    try {
      const result = await attemptScheduledPublish(id);
      if (result.ok) published++;
      else if (result.error) failed++;
    } catch (err) {
      failed++;
      console.error(`[scheduler] unexpected error publishing post ${id}:`, err);
    }
  }

  const dueUnpublish = await db
    .select({ id: posts.id })
    .from(posts)
    .where(
      and(
        eq(posts.status, "published"),
        lte(posts.scheduledUnpublishAt, nowIso),
        isNull(posts.deletedAt),
        lt(posts.publishAttempts, MAX_PUBLISH_ATTEMPTS),
      ),
    );

  for (const { id } of dueUnpublish) {
    try {
      const result = await attemptScheduledUnpublish(id);
      if (result.ok) unpublished++;
      else if (result.error) failed++;
    } catch (err) {
      failed++;
      console.error(`[scheduler] unexpected error unpublishing post ${id}:`, err);
    }
  }

  if (published || unpublished || failed) {
    console.log(`[scheduler] tick: ${published} published, ${unpublished} unpublished, ${failed} failed`);
  }

  return { published, unpublished, failed };
}
