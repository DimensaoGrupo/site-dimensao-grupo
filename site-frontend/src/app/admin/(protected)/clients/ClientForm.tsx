"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import CoverImageField from "@/components/admin/CoverImageField";
import { createClient, updateClient, type ClientInput } from "@/lib/clients/actions";

const NAME_MAX_LENGTH = 80;

type ExistingClient = {
  id: number;
  name: string;
  logo: string;
};

export default function ClientForm({ client }: { client?: ExistingClient }) {
  const router = useRouter();
  const [name, setName] = useState(client?.name ?? "");
  const [logo, setLogo] = useState<string | null>(client?.logo ?? null);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const nameTooLong = name.length > NAME_MAX_LENGTH;

  function handleSave() {
    setError(null);
    const input: ClientInput = { name, logo };

    startTransition(async () => {
      const result = client ? await updateClient(client.id, input) : await createClient(input);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/admin/clients");
    });
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Nome
            </label>
            <span className={`text-xs ${nameTooLong ? "text-primary" : "text-gray-medium"}`}>
              {name.length}/{NAME_MAX_LENGTH}
            </span>
          </div>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Empresa XYZ"
            className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-base font-semibold text-foreground outline-none focus:border-primary"
          />
          <p className="mt-1.5 text-xs text-gray-medium">
            Usado como texto alternativo do logo (acessibilidade) e para identificar o cliente aqui no painel — não
            aparece como texto na Home.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-light/70 bg-white p-5">
          <span className="text-sm font-bold text-foreground">Status</span>
          <p className="mt-1 text-sm text-gray-medium">
            {client ? "Salvar atualiza este cliente imediatamente." : "O cliente é criado ativo."}
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {isPending ? "Salvando..." : client ? "Salvar alterações" : "Criar cliente"}
          </button>
          {error && <p className="mt-3 text-xs text-primary">{error}</p>}
        </div>

        <div className="rounded-2xl border border-gray-light/70 bg-white p-5">
          <CoverImageField label="Logo" kind="client" value={logo} onChange={setLogo} />
        </div>
      </div>
    </div>
  );
}
