import Link from "next/link";
import { listServicesAdmin } from "@/lib/services/queries";
import ServiceList from "./ServiceList";

export const metadata = { title: "Serviços — Painel Grupo Dimensão" };

export default async function AdminServicesPage() {
  const services = await listServicesAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Serviços</h1>
          <p className="mt-1 text-sm text-gray-medium">
            Cada serviço publicado gera automaticamente sua própria página em /servicos. Arraste pelo{" "}
            <span aria-hidden="true">⠿</span> para reordenar. {services.length} serviço(s).
          </p>
        </div>
        <Link
          href="/admin/services/new"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Novo serviço
        </Link>
      </div>

      <div className="mt-6">
        {services.length === 0 ? (
          <p className="rounded-2xl border border-gray-light/70 bg-white p-8 text-center text-sm text-gray-medium">
            Nenhum serviço cadastrado.
          </p>
        ) : (
          <ServiceList
            services={services.map((s) => ({
              id: s.id,
              slug: s.slug,
              title: s.title,
              icon: s.icon,
              listSummary: s.listSummary,
              status: s.status,
            }))}
          />
        )}
      </div>
    </div>
  );
}
