import StatisticForm from "../StatisticForm";

export const metadata = { title: "Nova estatística — Painel Grupo Dimensão" };

export default function NewStatisticPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Nova estatística</h1>
      <div className="mt-6">
        <StatisticForm />
      </div>
    </div>
  );
}
