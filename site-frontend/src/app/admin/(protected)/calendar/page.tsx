import Link from "next/link";
import { listScheduledPosts } from "@/lib/posts/queries";
import { utcIsoToZonedParts, formatRelative, MONTHS_PT } from "@/lib/datetime";

export const metadata = { title: "Calendário editorial — Painel Grupo Dimensão" };

const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function mondayFirstWeekday(year: number, month: number, day: number): number {
  const jsWeekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0=Sun..6=Sat
  return (jsWeekday + 6) % 7; // 0=Mon..6=Sun
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function monthHref(year: number, month: number): string {
  return `/admin/calendar?year=${year}&month=${month}`;
}

function dayHref(year: number, month: number, day: number): string {
  return `/admin/calendar?year=${year}&month=${month}&day=${year}-${pad2(month)}-${pad2(day)}`;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; day?: string }>;
}) {
  const params = await searchParams;

  const today = utcIsoToZonedParts(new Date().toISOString()).date;
  const [todayYear, todayMonth] = today.split("-").map(Number);

  const year = Number(params.year) || todayYear;
  const month = Number(params.month) || todayMonth; // 1-12
  const selectedDay = params.day ?? null;

  const posts = await listScheduledPosts();
  const postsByDay = new Map<string, typeof posts>();
  for (const post of posts) {
    if (!post.scheduledAt) continue;
    const { date } = utcIsoToZonedParts(post.scheduledAt);
    const list = postsByDay.get(date) ?? [];
    list.push(post);
    postsByDay.set(date, list);
  }

  const total = daysInMonth(year, month);
  const leadingBlanks = mondayFirstWeekday(year, month, 1);
  const cells: { date: string; day: number }[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push({ date: "", day: 0 });
  for (let d = 1; d <= total; d++) {
    cells.push({ date: `${year}-${pad2(month)}-${pad2(d)}`, day: d });
  }
  while (cells.length % 7 !== 0) cells.push({ date: "", day: 0 });

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const selectedPosts = selectedDay ? (postsByDay.get(selectedDay) ?? []) : [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Calendário editorial</h1>
        <Link
          href={monthHref(todayYear, todayMonth)}
          className="text-sm font-semibold text-primary hover:text-primary-dark"
        >
          Hoje
        </Link>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Link
          href={monthHref(prevYear, prevMonth)}
          className="rounded-full border border-gray-light px-3 py-1.5 text-sm font-semibold text-foreground hover:border-primary"
        >
          ← Anterior
        </Link>
        <span className="text-base font-bold text-foreground capitalize">
          {MONTHS_PT[month - 1]} {year}
        </span>
        <Link
          href={monthHref(nextYear, nextMonth)}
          className="rounded-full border border-gray-light px-3 py-1.5 text-sm font-semibold text-foreground hover:border-primary"
        >
          Próximo →
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-light/70 bg-white">
        <div className="grid grid-cols-7 border-b border-gray-light/70 bg-[#f7f6f6] text-xs font-semibold tracking-wide text-gray-medium uppercase">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="px-2 py-2 text-center">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((cell, i) => {
            if (!cell.date) {
              return <div key={i} className="min-h-[92px] border-b border-r border-gray-light/40" />;
            }
            const dayPosts = postsByDay.get(cell.date) ?? [];
            const isToday = cell.date === today;
            const isSelected = cell.date === selectedDay;
            return (
              <Link
                key={i}
                href={dayHref(year, month, cell.day)}
                className={`min-h-[92px] border-b border-r border-gray-light/40 p-1.5 text-left transition-colors hover:bg-[#f7f6f6] ${
                  isSelected ? "bg-primary/5" : ""
                }`}
              >
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    isToday ? "bg-primary text-white" : "text-foreground"
                  }`}
                >
                  {cell.day}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayPosts.slice(0, 2).map((post) => (
                    <p key={post.id} className="truncate text-[11px] font-medium text-primary">
                      📰 {post.title}
                    </p>
                  ))}
                  {dayPosts.length > 2 && (
                    <p className="text-[11px] font-semibold text-gray-medium">+{dayPosts.length - 2} publicações</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="mt-6 rounded-2xl border border-gray-light/70 bg-white p-5">
          <h2 className="text-sm font-bold text-foreground">
            {selectedPosts.length === 0
              ? "Nenhuma publicação agendada neste dia."
              : `${selectedPosts.length} publicação(ões) em ${selectedDay.split("-").reverse().join("/")}`}
          </h2>
          {selectedPosts.length > 0 && (
            <ul className="mt-3 space-y-3">
              {selectedPosts.map((post) => (
                <li key={post.id} className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-foreground">{post.title}</p>
                    <p className="text-xs text-gray-medium">
                      {post.categoryName ?? "Sem categoria"}
                      {post.scheduledAt && ` · ${formatRelative(post.scheduledAt, { detailed: true })}`}
                    </p>
                  </div>
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="shrink-0 text-xs font-semibold text-primary hover:text-primary-dark"
                  >
                    Editar
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
