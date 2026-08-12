import ServiceForm from "../ServiceForm";

export const metadata = { title: "Novo serviço — Painel Grupo Dimensão" };

export default function NewServicePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Novo serviço</h1>
      <div className="mt-6">
        <ServiceForm />
      </div>
    </div>
  );
}
