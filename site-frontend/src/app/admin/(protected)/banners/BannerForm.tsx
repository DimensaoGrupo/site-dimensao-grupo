"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import CoverImageField from "@/components/admin/CoverImageField";
import { createBanner, updateBanner, type BannerInput } from "@/lib/banners/actions";

const TITLE_WARN_LENGTH = 90;
const TITLE_MAX_LENGTH = 120;

type ExistingBanner = {
  id: number;
  eyebrow: string;
  title: string;
  text: string;
  image: string;
  active: boolean;
};

export default function BannerForm({ banner }: { banner?: ExistingBanner }) {
  const router = useRouter();
  const [eyebrow, setEyebrow] = useState(banner?.eyebrow ?? "");
  const [title, setTitle] = useState(banner?.title ?? "");
  const [text, setText] = useState(banner?.text ?? "");
  const [image, setImage] = useState<string | null>(banner?.image ?? null);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const titleTooLong = title.length > TITLE_MAX_LENGTH;

  function handleSave() {
    setError(null);
    const input: BannerInput = { eyebrow, title, text, image };

    startTransition(async () => {
      const result = banner ? await updateBanner(banner.id, input) : await createBanner(input);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/admin/banners");
    });
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div>
          <label htmlFor="eyebrow" className="text-sm font-medium text-foreground">
            Etiqueta (eyebrow)
          </label>
          <input
            id="eyebrow"
            value={eyebrow}
            onChange={(e) => setEyebrow(e.target.value.toUpperCase())}
            placeholder="Ex.: PORTARIA E CONTROLE DE ACESSO"
            className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          />
          <p className="mt-1 text-xs text-gray-medium">
            Aparece como uma pequena etiqueta acima do título, em maiúsculas.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="title" className="text-sm font-medium text-foreground">
              Título
            </label>
            <span className={`text-xs ${titleTooLong ? "text-primary" : "text-gray-medium"}`}>
              {title.length}/{TITLE_MAX_LENGTH}
              {title.length > TITLE_WARN_LENGTH && !titleTooLong && " · título longo para o espaço"}
            </span>
          </div>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título grande de destaque do banner"
            className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-base font-semibold text-foreground outline-none focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="text" className="text-sm font-medium text-foreground">
            Texto
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Frase curta de apoio, abaixo do título."
            className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="rounded-2xl border border-gray-light/70 bg-[#201a1a] p-6">
          <p className="mb-3 text-xs font-semibold tracking-wide text-white/60 uppercase">Prévia sobre o fundo real</p>
          <span className="inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-white">
            {eyebrow || "ETIQUETA"}
          </span>
          <h2 className="mt-4 text-2xl leading-[1.1] font-extrabold text-white md:text-3xl">
            {title || "Título do banner"}
          </h2>
          <p className="mt-3 max-w-md text-sm text-white/85">{text || "Texto de apoio do banner."}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-light/70 bg-white p-5">
          <span className="text-sm font-bold text-foreground">Status</span>
          <p className="mt-1 text-sm text-gray-medium">
            {banner
              ? "Salvar atualiza este banner imediatamente na Home."
              : "O banner é criado ativo — aparece na Home assim que salvo."}
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {isPending ? "Salvando..." : banner ? "Salvar alterações" : "Criar banner"}
          </button>
          {error && <p className="mt-3 text-xs text-primary">{error}</p>}
        </div>

        <div className="rounded-2xl border border-gray-light/70 bg-white p-5">
          <CoverImageField label="Imagem do banner" kind="banner" value={image} onChange={setImage} />
        </div>
      </div>
    </div>
  );
}
