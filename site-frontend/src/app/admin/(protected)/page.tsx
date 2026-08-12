import Link from "next/link";
import { getDashboardStats, getUpcomingScheduledPosts } from "@/lib/posts/queries";
import { formatRelative } from "@/lib/datetime";

export const metadata = { title: "Dashboard — Painel Grupo Dimensão" };

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-light/70 bg-white p-6">
      <span className="text-3xl font-extrabold text-foreground">{value}</span>
      <span className="mt-1 block text-sm text-gray-medium">{label}</span>
    </div>
  );
}

function QuickAction({ href, label, description }: { href: string; label: string; description: string }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-gray-light/70 bg-white p-6 transition-colors hover:border-primary/40"
    >
      <span className="text-base font-bold text-foreground group-hover:text-primary">{label}</span>
      <p className="mt-1.5 text-sm text-gray-medium">{description}</p>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const [stats, upcoming] = await Promise.all([getDashboardStats(), getUpcomingScheduledPosts(5)]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-medium">Visão geral do conteúdo do Blog.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total de posts" value={stats.total} />
        <StatCard label="Publicados" value={stats.published} />
        <StatCard label="Agendados" value={stats.scheduled} />
        <StatCard label="Rascunhos" value={stats.draft} />
        <StatCard label="Despublicados" value={stats.unpublished} />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-wide text-gray-medium uppercase">Próximas publicações</h2>
        <Link href="/admin/calendar" className="text-sm font-semibold text-primary hover:text-primary-dark">
          Ver calendário →
        </Link>
      </div>
      <div className="mt-4 rounded-2xl border border-gray-light/70 bg-white">
        {upcoming.length === 0 ? (
          <p className="p-6 text-sm text-gray-medium">Nenhuma publicação agendada.</p>
        ) : (
          <ul className="divide-y divide-gray-light/60">
            {upcoming.map((post) => (
              <li key={post.id} className="flex items-center justify-between gap-4 px-6 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{post.title}</p>
                  <p className="mt-0.5 text-xs text-gray-medium">
                    {post.scheduledAt && `🕐 ${formatRelative(post.scheduledAt)}`}
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

      <h2 className="mt-10 text-sm font-bold tracking-wide text-gray-medium uppercase">Ações rápidas</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction href="/admin/posts/new" label="Novo post" description="Criar um post do zero." />
        <QuickAction href="/admin/posts" label="Gerenciar posts" description="Ver, editar e publicar posts." />
        <QuickAction href="/admin/categories" label="Categorias" description="Organizar os posts por assunto." />
        <QuickAction href="/admin/banners" label="Banners" description="Gerenciar o carousel da Home." />
        <QuickAction href="/admin/media" label="Mídia" description="Ver imagens já enviadas." />
      </div>
    </div>
  );
}
