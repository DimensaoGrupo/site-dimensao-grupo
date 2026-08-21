"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import CoverImageField from "@/components/admin/CoverImageField";
import { createCertification, updateCertification, type CertificationInput } from "@/lib/certifications/actions";

const NAME_MAX_LENGTH = 80;

type ExistingCertification = {
  id: number;
  name: string;
  description: string | null;
  logo: string | null;
};

export default function CertificationForm({ certification }: { certification?: ExistingCertification }) {
  const router = useRouter();
  const [name, setName] = useState(certification?.name ?? "");
  const [description, setDescription] = useState(certification?.description ?? "");
  const [logo, setLogo] = useState<string | null>(certification?.logo ?? null);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const nameTooLong = name.length > NAME_MAX_LENGTH;

  function handleSave() {
    setError(null);
    const input: CertificationInput = {
      name,
      description: description || null,
      logo,
    };

    startTransition(async () => {
      const result = certification
        ? await updateCertification(certification.id, input)
        : await createCertification(input);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/admin/certifications");
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
            placeholder="Ex.: APCER ISO 9001"
            className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-base font-semibold text-foreground outline-none focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-medium text-foreground">
            Descrição <span className="font-normal text-gray-medium">(opcional)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Pode ficar em branco até recebermos o texto oficial da certificação."
            className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-light/70 bg-white p-5">
          <span className="text-sm font-bold text-foreground">Status</span>
          <p className="mt-1 text-sm text-gray-medium">
            {certification
              ? "Salvar atualiza esta certificação imediatamente."
              : "A certificação é criada ativa."}
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {isPending ? "Salvando..." : certification ? "Salvar alterações" : "Criar certificação"}
          </button>
          {error && <p className="mt-3 text-xs text-primary">{error}</p>}
        </div>

        <div className="rounded-2xl border border-gray-light/70 bg-white p-5">
          <CoverImageField label="Logo (opcional)" kind="certification" value={logo} onChange={setLogo} />
        </div>
      </div>
    </div>
  );
}
