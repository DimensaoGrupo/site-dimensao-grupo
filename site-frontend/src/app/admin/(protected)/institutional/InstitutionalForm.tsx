"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import CoverImageField from "@/components/admin/CoverImageField";
import {
  createInstitutionalContent,
  updateInstitutionalContent,
  type InstitutionalContentInput,
} from "@/lib/institutional/actions";
import { INSTITUTIONAL_CONTENT_TYPE_OPTIONS, type InstitutionalContentType } from "@/lib/institutional/types";

const TITLE_MAX_LENGTH = 100;

type ExistingInstitutionalContent = {
  id: number;
  type: InstitutionalContentType | null;
  eyebrow: string | null;
  title: string;
  summary: string | null;
  content: string;
  image: string | null;
};

export default function InstitutionalForm({ item }: { item?: ExistingInstitutionalContent }) {
  const router = useRouter();
  const [type, setType] = useState<InstitutionalContentType | "">(item?.type ?? "");
  const [eyebrow, setEyebrow] = useState(item?.eyebrow ?? "");
  const [title, setTitle] = useState(item?.title ?? "");
  const [summary, setSummary] = useState(item?.summary ?? "");
  const [content, setContent] = useState(item?.content ?? "");
  const [image, setImage] = useState<string | null>(item?.image ?? null);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const titleTooLong = title.length > TITLE_MAX_LENGTH;

  function handleSave() {
    setError(null);
    const input: InstitutionalContentInput = {
      type: type || null,
      eyebrow: eyebrow || null,
      title,
      summary: summary || null,
      content,
      image,
    };

    startTransition(async () => {
      const result = item
        ? await updateInstitutionalContent(item.id, input)
        : await createInstitutionalContent(input);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/admin/institutional");
    });
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div>
          <label htmlFor="type" className="text-sm font-medium text-foreground">
            Tipo
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as InstitutionalContentType | "")}
            className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">Selecione um tipo...</option>
            {INSTITUTIONAL_CONTENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-medium">
            Identifica este bloco (Sobre, Missão, Visão, Valores, História). Só pode existir um registro de cada
            tipo — para substituir o conteúdo, edite o registro existente.
          </p>
        </div>

        <div>
          <label htmlFor="eyebrow" className="text-sm font-medium text-foreground">
            Etiqueta (eyebrow) <span className="font-normal text-gray-medium">(opcional)</span>
          </label>
          <input
            id="eyebrow"
            value={eyebrow}
            onChange={(e) => setEyebrow(e.target.value)}
            placeholder="Ex.: Nossa História"
            className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="title" className="text-sm font-medium text-foreground">
              Título
            </label>
            <span className={`text-xs ${titleTooLong ? "text-primary" : "text-gray-medium"}`}>
              {title.length}/{TITLE_MAX_LENGTH}
            </span>
          </div>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: 32 anos de experiência"
            className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-base font-semibold text-foreground outline-none focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="summary" className="text-sm font-medium text-foreground">
            Resumo <span className="font-normal text-gray-medium">(opcional)</span>
          </label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            placeholder="Versão curta para a Home. Deixe em branco para usar apenas o Conteúdo completo."
            className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          />
          <p className="mt-1 text-xs text-gray-medium">
            Não é gerado automaticamente a partir do Conteúdo — escreva os dois separadamente.
          </p>
        </div>

        <div>
          <label htmlFor="content" className="text-sm font-medium text-foreground">
            Conteúdo
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="Texto institucional completo — usado na página Sobre."
            className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-light/70 bg-white p-5">
          <span className="text-sm font-bold text-foreground">Status</span>
          <p className="mt-1 text-sm text-gray-medium">
            {item ? "Salvar atualiza este conteúdo imediatamente." : "O conteúdo é criado ativo."}
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {isPending ? "Salvando..." : item ? "Salvar alterações" : "Criar conteúdo"}
          </button>
          {error && <p className="mt-3 text-xs text-primary">{error}</p>}
        </div>

        <div className="rounded-2xl border border-gray-light/70 bg-white p-5">
          <CoverImageField label="Imagem (opcional)" kind="institutional" value={image} onChange={setImage} />
        </div>
      </div>
    </div>
  );
}
