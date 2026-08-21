import Link from "next/link";
import { listStatisticsAdmin } from "@/lib/statistics/queries";
import StatisticList from "./StatisticList";

export const metadata = { title: "Estatísticas — Painel Grupo Dimensão" };

export default async function AdminStatisticsPage() {
  const statistics = await listStatisticsAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estatísticas</h1>
          <p className="mt-1 text-sm text-gray-medium">
            Números de autoridade exibidos na Home (anos de experiência, clientes, cidades atendidas...). Arraste
            pelo <span aria-hidden="true">⠿</span> para reordenar. {statistics.length} estatística(s).
          </p>
        </div>
        <Link
          href="/admin/statistics/new"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Nova estatística
        </Link>
      </div>

      <div className="mt-6">
        {statistics.length === 0 ? (
          <p className="rounded-2xl border border-gray-light/70 bg-white p-8 text-center text-sm text-gray-medium">
            Nenhuma estatística cadastrada.
          </p>
        ) : (
          <StatisticList
            statistics={statistics.map((s) => ({
              id: s.id,
              value: s.value,
              prefix: s.prefix,
              suffix: s.suffix,
              label: s.label,
              active: s.active,
            }))}
          />
        )}
      </div>
    </div>
  );
}
