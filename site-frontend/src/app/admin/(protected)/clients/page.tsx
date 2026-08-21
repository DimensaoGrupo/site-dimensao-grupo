import Link from "next/link";
import { listClientsAdmin } from "@/lib/clients/queries";
import ClientList from "./ClientList";

export const metadata = { title: "Clientes — Painel Grupo Dimensão" };

export default async function AdminClientsPage() {
  const clients = await listClientsAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="mt-1 text-sm text-gray-medium">
            Logos exibidos na faixa "Clientes" da Home. Arraste pelo <span aria-hidden="true">⠿</span> para reordenar.{" "}
            {clients.length} cliente(s).
          </p>
        </div>
        <Link
          href="/admin/clients/new"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Novo cliente
        </Link>
      </div>

      <div className="mt-6">
        {clients.length === 0 ? (
          <p className="rounded-2xl border border-gray-light/70 bg-white p-8 text-center text-sm text-gray-medium">
            Nenhum cliente cadastrado.
          </p>
        ) : (
          <ClientList
            clients={clients.map((c) => ({
              id: c.id,
              name: c.name,
              logo: c.logo,
              active: c.active,
            }))}
          />
        )}
      </div>
    </div>
  );
}
