import Link from "next/link";
import { getDashboardStats } from "@/lib/posts/queries";

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
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-medium">Visão geral do conteúdo do Blog.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Total de posts" value={stats.total} />
        <StatCard label="Publicados" value={stats.published} />
        <StatCard label="Rascunhos" value={stats.draft} />
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
