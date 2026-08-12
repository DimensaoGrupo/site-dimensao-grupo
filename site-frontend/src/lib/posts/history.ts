// No "server-only" guard — see the comment in scheduler.ts.
import { db } from "@/lib/db/client";
import { postEvents } from "@/lib/db/schema";

export type PostEventType =
  | "schedule_created"
  | "schedule_changed"
  | "schedule_canceled"
  | "published_auto"
  | "published_manual"
  | "unpublished_manual"
  | "unpublished_auto"
  | "publish_failed";

/** One line per event, per src/lib/posts/actions.ts and scheduler.ts. Not a full audit trail on purpose. */
export async function logPostEvent(postId: number, eventType: PostEventType, detail?: string) {
  await db.insert(postEvents).values({ postId, eventType, detail: detail ?? null });
}
