"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Counts = { scheduledCount: number; failedCount: number; publishedTodayCount: number };

export default function NotificationBell({
  counts,
  align = "right",
}: {
  counts: Counts;
  /**
   * "left" keeps the dropdown's left edge fixed and lets it grow rightward
   * — needed in the desktop sidebar (src/app/admin/(protected)/AdminNav.tsx),
   * where the bell sits close to the sidebar's own left edge and a
   * right-anchored dropdown has nowhere to go but off-screen. The mobile
   * header is full-width with room on both sides, so the default (anchor
   * the dropdown's right edge to the bell) works fine there.
   */
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const badgeCount = counts.scheduledCount + counts.failedCount;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificações"
        aria-expanded={open}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-base text-white/75 transition-colors hover:bg-white/10 hover:text-white"
      >
        🔔
        {badgeCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute z-40 mt-2 w-64 rounded-xl border border-gray-light/70 bg-white p-2 shadow-[0_20px_60px_rgba(32,26,26,0.25)] ${
            align === "left" ? "left-0" : "right-0"
          }`}
        >
          <Link
            href="/admin/posts/scheduled"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-[#f7f6f6]"
          >
            🕐 {counts.scheduledCount} publicação(ões) agendada(s)
          </Link>
          <Link
            href="/admin/posts"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-[#f7f6f6]"
          >
            ⚠️ {counts.failedCount} falharam
          </Link>
          <p className="px-3 py-2 text-sm text-gray-medium">🟢 {counts.publishedTodayCount} publicada(s) hoje</p>
        </div>
      )}
    </div>
  );
}
