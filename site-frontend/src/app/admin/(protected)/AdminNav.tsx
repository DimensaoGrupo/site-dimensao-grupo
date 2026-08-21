"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon } from "@/components/icons";
import { logout } from "../logout/actions";
import NotificationBell from "./NotificationBell";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/services", label: "Serviços" },
  { href: "/admin/statistics", label: "Estatísticas" },
  { href: "/admin/certifications", label: "Certificações" },
  { href: "/admin/clients", label: "Clientes" },
  { href: "/admin/institutional", label: "Institucional" },
  {
    href: "/admin/posts",
    label: "Posts",
    children: [{ href: "/admin/posts/scheduled", label: "Agendados" }],
  },
  { href: "/admin/calendar", label: "Calendário" },
  { href: "/admin/categories", label: "Categorias" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/media", label: "Mídia" },
];

type NotificationCounts = { scheduledCount: number; failedCount: number; publishedTodayCount: number };

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  // Undefined = follow the route (auto-open the section containing the
  // active page); once the user clicks the arrow, their choice overrides
  // that default until they click it again.
  const [manualOpen, setManualOpen] = useState<Record<string, boolean>>({});

  // Prefix matching alone would mark "/admin/posts" active for
  // "/admin/posts/scheduled" too (it's also a prefix match), highlighting both
  // "Posts" and "Agendados" at once. Only the longest matching href — parent
  // or nested child — should light up.
  const allHrefs = NAV_ITEMS.flatMap((item) => [
    { href: item.href, exact: item.exact },
    ...(item.children?.map((child) => ({ href: child.href, exact: false })) ?? []),
  ]);
  const activeHref = allHrefs.reduce<string | null>((best, entry) => {
    const matches = entry.exact ? pathname === entry.href : pathname.startsWith(entry.href);
    if (!matches) return best;
    if (!best || entry.href.length > best.length) return entry.href;
    return best;
  }, null);

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === activeHref;
        const routeOpen = item.children ? pathname.startsWith(item.href) : false;
        const isSectionOpen = manualOpen[item.href] ?? routeOpen;

        return (
          <div key={item.href}>
            <div
              className={`flex items-center rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Link href={item.href} onClick={onNavigate} className="flex-1 px-3.5 py-2.5">
                {item.label}
              </Link>
              {item.children && (
                <button
                  type="button"
                  onClick={() => setManualOpen((prev) => ({ ...prev, [item.href]: !isSectionOpen }))}
                  aria-label={isSectionOpen ? `Recolher ${item.label}` : `Expandir ${item.label}`}
                  aria-expanded={isSectionOpen}
                  className="px-3.5 py-2.5"
                >
                  <ChevronDownIcon
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${isSectionOpen ? "rotate-180" : "-rotate-90"}`}
                  />
                </button>
              )}
            </div>

            {item.children && isSectionOpen && (
              <div className="mt-1 ml-4 flex flex-col gap-1 border-l border-white/10 pl-3">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onNavigate}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      child.href === activeHref
                        ? "bg-primary text-white"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
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
