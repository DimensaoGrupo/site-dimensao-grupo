// Standalone check for src/lib/posts/scheduler.ts, against a disposable
// SQLite file (never the real dev DB) — no test framework in this repo (see
// scripts/seed.ts for the same tsx-script convention). Calls
// runSchedulerTick() directly, no real timers, fully deterministic.
//
// CMS_DB_PATH must be set BEFORE src/lib/db/client.ts is first imported (it
// opens the DB file at module load), so every DB-touching module is loaded
// via a dynamic import inside main() — a static top-level import would be
// hoisted ahead of the env var assignment below.
import assert from "node:assert/strict";
import path from "node:path";
import os from "node:os";
import { mkdtempSync, rmSync } from "node:fs";

const tmpDir = mkdtempSync(path.join(os.tmpdir(), "cms-scheduler-test-"));
process.env.CMS_DB_PATH = path.join(tmpDir, "test.db");

async function main() {
  const { db } = await import("../src/lib/db/client");
  const { posts, postEvents } = await import("../src/lib/db/schema");
  const { runSchedulerTick, MAX_PUBLISH_ATTEMPTS } = await import("../src/lib/posts/scheduler");
  const { listPublishedPosts } = await import("../src/lib/posts/queries");
  const { eq } = await import("drizzle-orm");

  let nextId = 1;
  async function seedPost(overrides: Partial<typeof posts.$inferInsert> = {}) {
    const slug = `test-post-${nextId++}`;
    const [row] = await db
      .insert(posts)
      .values({
        slug,
        title: `Test post ${slug}`,
        contentJson: JSON.stringify({ type: "doc", content: [] }),
        status: "draft",
        ...overrides,
      })
      .returning({ id: posts.id });
    return row.id;
  }

  async function getPost(id: number) {
    const [row] = await db.select().from(posts).where(eq(posts.id, id));
    return row;
  }

  async function countEvents(postId: number, eventType: string) {
    const rows = await db.select().from(postEvents).where(eq(postEvents.postId, postId));
    return rows.filter((r) => r.eventType === eventType).length;
  }

  const past = (minutesAgo: number) => new Date(Date.now() - minutesAgo * 60_000).toISOString();

  // --- 1. Auto-publish ---
  {
    const id = await seedPost({ status: "scheduled", scheduledAt: past(5) });
    const result = await runSchedulerTick();
    assert.equal(result.published, 1);
    const post = await getPost(id);
    assert.equal(post.status, "published");
    assert.ok(post.publishedAt);
    assert.equal(await countEvents(id, "published_auto"), 1);
    const publicPosts = await listPublishedPosts(50);
    assert.ok(publicPosts.some((p) => p.id === id), "auto-published post must appear in listPublishedPosts()");
    console.log("OK auto-publish");
  }

  // --- 2. Idempotency + multiple posts at the same instant ---
  {
    const sameInstant = past(1);
    const ids = [
      await seedPost({ status: "scheduled", scheduledAt: sameInstant }),
      await seedPost({ status: "scheduled", scheduledAt: sameInstant }),
      await seedPost({ status: "scheduled", scheduledAt: sameInstant }),
    ];
    const first = await runSchedulerTick();
    assert.equal(first.published, 3, "all 3 posts due at the same instant must be published in one tick");
    for (const id of ids) {
      assert.equal((await getPost(id)).status, "published");
      assert.equal(await countEvents(id, "published_auto"), 1);
    }
    const second = await runSchedulerTick();
    assert.equal(second.published, 0, "a second tick must not re-publish or duplicate events");
    for (const id of ids) {
      assert.equal(await countEvents(id, "published_auto"), 1, "still exactly one event, not two");
    }
    console.log("OK idempotency + same-time multi-post");
  }

  // --- 3. Backlog / restart recovery (same code path — no separate mechanism to test) ---
  {
    const id = await seedPost({ status: "scheduled", scheduledAt: past(60 * 24 * 3) }); // 3 days overdue
    const result = await runSchedulerTick();
    assert.equal(result.published, 1);
    assert.equal((await getPost(id)).status, "published");
    console.log("OK backlog/restart recovery");
  }

  // --- 4. Auto-unpublish ---
  {
    const id = await seedPost({
      status: "published",
      publishedAt: past(120),
      scheduledUnpublishAt: past(1),
    });
    const result = await runSchedulerTick();
    assert.equal(result.unpublished, 1);
    const post = await getPost(id);
    assert.equal(post.status, "unpublished");
    assert.ok(post.unpublishedAt);
    assert.equal(await countEvents(id, "unpublished_auto"), 1);
    const publicPosts = await listPublishedPosts(50);
    assert.ok(!publicPosts.some((p) => p.id === id), "auto-unpublished post must NOT appear in listPublishedPosts()");
    console.log("OK auto-unpublish");
  }

  // --- 5. Retry cap ---
  {
    const id = await seedPost({
      status: "scheduled",
      scheduledAt: past(30),
      publishAttempts: MAX_PUBLISH_ATTEMPTS,
    });
    const result = await runSchedulerTick();
    assert.equal(result.published, 0, "a post at the attempt cap must not be picked up");
    assert.equal((await getPost(id)).status, "scheduled");

    // Simulate the "Tentar novamente" action resetting attempts.
    await db.update(posts).set({ publishAttempts: 0 }).where(eq(posts.id, id));
    const retryResult = await runSchedulerTick();
    assert.equal(retryResult.published, 1, "after resetting attempts, the next tick publishes it");
    console.log("OK retry cap");
  }

  console.log("\nAll scheduler checks passed.");
}

// node:sqlite keeps the DB file open for the life of the process (client.ts
// doesn't expose a way to close it), so on Windows the temp dir can still be
// locked here — best-effort cleanup, never let it mask a real test failure.
function cleanup() {
  try {
    rmSync(tmpDir, { recursive: true, force: true, maxRetries: 3 });
  } catch {
    console.warn(`(cleanup) could not remove ${tmpDir} — harmless, OS temp dir`);
  }
}

main()
  .then(cleanup)
  .catch((err) => {
    cleanup();
    console.error(err);
    process.exit(1);
  });
