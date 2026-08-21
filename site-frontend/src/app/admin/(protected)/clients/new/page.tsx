import ClientForm from "../ClientForm";

export const metadata = { title: "Novo cliente — Painel Grupo Dimensão" };

export default function NewClientPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Novo cliente</h1>
      <div className="mt-6">
        <ClientForm />
      </div>
    </div>
  );
}
