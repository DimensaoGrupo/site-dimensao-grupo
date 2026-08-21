import { notFound } from "next/navigation";
import { getClientById } from "@/lib/clients/queries";
import ClientForm from "../ClientForm";

export const metadata = { title: "Editar cliente — Painel Grupo Dimensão" };

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clientId = Number(id);
  if (!Number.isInteger(clientId)) notFound();

  const client = await getClientById(clientId);
  if (!client) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Editar cliente</h1>
      <div className="mt-6">
        <ClientForm client={client} />
      </div>
    </div>
  );
}
