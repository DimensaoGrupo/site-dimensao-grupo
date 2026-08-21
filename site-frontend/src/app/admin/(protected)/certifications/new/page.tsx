import CertificationForm from "../CertificationForm";

export const metadata = { title: "Nova certificação — Painel Grupo Dimensão" };

export default function NewCertificationPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Nova certificação</h1>
      <div className="mt-6">
        <CertificationForm />
      </div>
    </div>
  );
}
