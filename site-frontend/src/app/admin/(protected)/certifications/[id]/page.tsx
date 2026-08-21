import { notFound } from "next/navigation";
import { getCertificationById } from "@/lib/certifications/queries";
import CertificationForm from "../CertificationForm";

export const metadata = { title: "Editar certificação — Painel Grupo Dimensão" };

export default async function EditCertificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const certificationId = Number(id);
  if (!Number.isInteger(certificationId)) notFound();

  const certification = await getCertificationById(certificationId);
  if (!certification) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Editar certificação</h1>
      <div className="mt-6">
        <CertificationForm certification={certification} />
      </div>
    </div>
  );
}
