import { notFound } from "next/navigation";
import { getInstitutionalContentById } from "@/lib/institutional/queries";
import InstitutionalForm from "../InstitutionalForm";

export const metadata = { title: "Editar conteúdo institucional — Painel Grupo Dimensão" };

export default async function EditInstitutionalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId)) notFound();

  const item = await getInstitutionalContentById(itemId);
  if (!item) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Editar conteúdo institucional</h1>
      <div className="mt-6">
        <InstitutionalForm item={item} />
      </div>
    </div>
  );
}
