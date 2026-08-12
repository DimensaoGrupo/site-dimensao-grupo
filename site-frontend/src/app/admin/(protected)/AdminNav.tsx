"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "../logout/actions";
import NotificationBell from "./NotificationBell";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/services", label: "Serviços" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/posts/scheduled", label: "Agendados" },
  { href: "/admin/calendar", label: "Calendário" },
  { href: "/admin/categories", label: "Categorias" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/media", label: "Mídia" },
];

type NotificationCounts = { scheduledCount: number; failedCount: number; publishedTodayCount: number };

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-white"
                : "text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminNav({ counts }: { counts: NotificationCounts }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-[#201a1a] px-4 py-6 lg:flex">
        <div className="flex items-center justify-between px-3.5">
          <div>
            <span className="block text-sm font-bold tracking-wide text-white">Grupo Dimensão</span>
            <span className="block text-xs text-white/50">Painel administrativo</span>
          </div>
          <NotificationBell counts={counts} align="left" />
        </div>
        <div className="mt-8 flex-1">
          <NavLinks />
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            Sair
          </button>
        </form>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between bg-[#201a1a] px-4 py-3 lg:hidden">
        <span className="text-sm font-bold text-white">Painel Grupo Dimensão</span>
        <div className="flex items-center gap-1">
          <NotificationBell counts={counts} />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menu"
            className="rounded-lg p-2 text-white hover:bg-white/10"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>
      {open && (
        <div className="bg-[#201a1a] px-4 pb-4 lg:hidden">
          <NavLinks onNavigate={() => setOpen(false)} />
          <form action={logout} className="mt-1">
            <button
              type="submit"
              className="w-full rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white"
            >
              Sair
            </button>
          </form>
        </div>
      )}
    </>
  );
}
