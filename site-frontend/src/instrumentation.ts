// Next.js file convention: register() runs once when a new server instance
// starts (before it serves any request), inside the same Node process as
// `next dev`/`next start` — see
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation.md
//
// This is what hosts the scheduled-publishing poller: no PM2/cron/custom
// server exists in this project, and running here means it needs none —
// revalidatePath (called by the scheduler) only works inside the live Next
// server process anyway, so this is also the only place it *could* live
// without inventing a new internal API route just to reach it.
const POLL_INTERVAL_MS = 60_000;

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Dev's Fast Refresh can re-run module init without a full process
  // restart; guard on globalThis (survives HMR, unlike a module-local
  // variable) so a redundant register() call never stacks a second interval.
  const g = globalThis as typeof globalThis & { __schedulerStarted?: boolean };
  if (g.__schedulerStarted) return;
  g.__schedulerStarted = true;

  const { runSchedulerTick } = await import("@/lib/posts/scheduler");
  console.log(`[scheduler] started — polling every ${POLL_INTERVAL_MS / 1000}s`);

  const tick = () => {
    runSchedulerTick().catch((err) => {
      console.error("[scheduler] tick failed unexpectedly:", err);
    });
  };

  // Run immediately on boot — not just on the first interval — so a server
  // restart (or a gap in uptime) is caught up on the very first tick instead
  // of waiting up to POLL_INTERVAL_MS. There's no separate "recovery" code
  // path: every tick always asks the DB what's due *right now*.
  tick();
  setInterval(tick, POLL_INTERVAL_MS);
}
