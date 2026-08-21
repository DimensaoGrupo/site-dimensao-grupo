import { listActiveClients } from "@/lib/clients/queries";
import ClientsSectionClient from "./ClientsSectionClient";

export default async function ClientsSection() {
  const clients = await listActiveClients();
  if (clients.length === 0) return null;

  return (
    <ClientsSectionClient
      clients={clients.map((c) => ({ id: c.id, name: c.name, logo: c.logo }))}
    />
  );
}
