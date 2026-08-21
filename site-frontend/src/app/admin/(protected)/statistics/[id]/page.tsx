import { notFound } from "next/navigation";
import { getStatisticById } from "@/lib/statistics/queries";
import StatisticForm from "../StatisticForm";

export const metadata = { title: "Editar estatística — Painel Grupo Dimensão" };

export default async function EditStatisticPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const statisticId = Number(id);
  if (!Number.isInteger(statisticId)) notFound();

  const statistic = await getStatisticById(statisticId);
  if (!statistic) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Editar estatística</h1>
      <div className="mt-6">
        <StatisticForm statistic={statistic} />
      </div>
    </div>
  );
}
