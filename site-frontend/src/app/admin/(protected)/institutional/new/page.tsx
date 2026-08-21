import InstitutionalForm from "../InstitutionalForm";

export const metadata = { title: "Novo conteúdo institucional — Painel Grupo Dimensão" };

export default function NewInstitutionalPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Novo conteúdo institucional</h1>
      <div className="mt-6">
        <InstitutionalForm />
      </div>
    </div>
  );
}
