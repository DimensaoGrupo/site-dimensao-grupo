import Link from "next/link";
import { listInstitutionalContentAdmin } from "@/lib/institutional/queries";
import InstitutionalList from "./InstitutionalList";

export const metadata = { title: "Institucional — Painel Grupo Dimensão" };

export default async function AdminInstitutionalPage() {
  const items = await listInstitutionalContentAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Institucional</h1>
          <p className="mt-1 text-sm text-gray-medium">
            Blocos de conteúdo institucional reutilizáveis (Home, Sobre, missão/visão/valores). Arraste pelo{" "}
            <span aria-hidden="true">⠿</span> para reordenar. {items.length} item(ns).
          </p>
        </div>
        <Link
          href="/admin/institutional/new"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Novo conteúdo
        </Link>
      </div>

      <div className="mt-6">
        {items.length === 0 ? (
          <p className="rounded-2xl border border-gray-light/70 bg-white p-8 text-center text-sm text-gray-medium">
            Nenhum conteúdo institucional cadastrado.
          </p>
        ) : (
          <InstitutionalList
            items={items.map((i) => ({
              id: i.id,
              type: i.type,
              eyebrow: i.eyebrow,
              title: i.title,
              image: i.image,
              active: i.active,
            }))}
          />
        )}
      </div>
    </div>
  );
}
