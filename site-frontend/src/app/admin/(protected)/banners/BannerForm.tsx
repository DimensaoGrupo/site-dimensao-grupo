"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import CoverImageField from "@/components/admin/CoverImageField";
import { createBanner, updateBanner, type BannerInput } from "@/lib/banners/actions";

const TITLE_WARN_LENGTH = 90;
const TITLE_MAX_LENGTH = 120;

// Word-count guidance only — purely advisory (docs/HOME_EXPERIENCE_BLUEPRINT.md
// Hero refinement, §3/§5). None of this blocks saving; the only hard limit
// stays TITLE_MAX_LENGTH above (a much looser character safety valve, not a
// content-length rule). Going over just flips the counter's color.
const RECOMMENDED_WORDS = { eyebrow: 4, title: 10, text: 25, ctaLabel: 4 };

function wordCount(value: string): number {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function WordHint({ value, max }: { value: string; max: number }) {
  const count = wordCount(value);
  return (
    <span className={`text-xs ${count > max ? "text-primary" : "text-gray-medium"}`}>
      {count}/{max} palavras recomendadas
    </span>
  );
}

type ExistingBanner = {
  id: number;
  eyebrow: string;
  title: string;
  text: string;
  image: string;
  mobileImage: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  active: boolean;
};

export default function BannerForm({ banner }: { banner?: ExistingBanner }) {
  const router = useRouter();
  const [eyebrow, setEyebrow] = useState(banner?.eyebrow ?? "");
  const [title, setTitle] = useState(banner?.title ?? "");
  const [text, setText] = useState(banner?.text ?? "");
  const [image, setImage] = useState<string | null>(banner?.image ?? null);
  const [mobileImage, setMobileImage] = useState<string | null>(banner?.mobileImage ?? null);
  const [ctaLabel, setCtaLabel] = useState(banner?.ctaLabel ?? "");
  const [ctaHref, setCtaHref] = useState(banner?.ctaHref ?? "");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const titleTooLong = title.length > TITLE_MAX_LENGTH;

  function handleSave() {
    setError(null);
    const input: BannerInput = {
      eyebrow,
      title,
      text,
      image,
      mobileImage,
      ctaLabel: ctaLabel || null,
      ctaHref: ctaHref || null,
    };

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
          <div className="flex items-center justify-between">
            <label htmlFor="eyebrow" className="text-sm font-medium text-foreground">
              Etiqueta (eyebrow)
            </label>
            <WordHint value={eyebrow} max={RECOMMENDED_WORDS.eyebrow} />
          </div>
          <input
            id="eyebrow"
            value={eyebrow}
            onChange={(e) => setEyebrow(e.target.value.toUpperCase())}
            placeholder="Ex.: SEGURANÇA PATRIMONIAL"
            className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          />
          <p className="mt-1 text-xs text-gray-medium">
            Aparece como uma pequena etiqueta acima do título, em maiúsculas. Recomendado: curta e direta, até{" "}
            {RECOMMENDED_WORDS.eyebrow} palavras.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="title" className="text-sm font-medium text-foreground">
              Título
            </label>
            <div className="flex items-center gap-3">
              <WordHint value={title} max={RECOMMENDED_WORDS.title} />
              <span className={`text-xs ${titleTooLong ? "text-primary" : "text-gray-medium"}`}>
                {title.length}/{TITLE_MAX_LENGTH}
                {title.length > TITLE_WARN_LENGTH && !titleTooLong && " · título longo para o espaço"}
              </span>
            </div>
          </div>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Headline forte e direta — ex.: Proteção para operações que não podem parar."
            className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-base font-semibold text-foreground outline-none focus:border-primary"
          />
          <p className="mt-1 text-xs text-gray-medium">
            Recomendado: mensagem direta de posicionamento, até {RECOMMENDED_WORDS.title} palavras — o Hero cria
            interesse, a próxima seção explica o resto.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="text" className="text-sm font-medium text-foreground">
              Descrição
            </label>
            <WordHint value={text} max={RECOMMENDED_WORDS.text} />
          </div>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="1–2 linhas de apoio à headline, abaixo do título."
            className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          />
          <p className="mt-1 text-xs text-gray-medium">
            Recomendado: até {RECOMMENDED_WORDS.text} palavras (1–2 linhas no desktop). Evite parágrafos, listas ou
            explicar o serviço inteiro aqui.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="ctaLabel" className="text-sm font-medium text-foreground">
                Texto do botão <span className="font-normal text-gray-medium">(opcional)</span>
              </label>
              <WordHint value={ctaLabel} max={RECOMMENDED_WORDS.ctaLabel} />
            </div>
            <input
              id="ctaLabel"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="Ex.: Conheça nossas soluções"
              className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="ctaHref" className="text-sm font-medium text-foreground">
              Destino do botão <span className="font-normal text-gray-medium">(opcional)</span>
            </label>
            <input
              id="ctaHref"
              value={ctaHref}
              onChange={(e) => setCtaHref(e.target.value)}
              placeholder="Ex.: https://wa.me/..."
              className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>
        <p className="-mt-3 text-xs text-gray-medium">
          Deixe os dois em branco para não mostrar botão neste banner — nunca preencha só um dos dois.
        </p>

        <div className="rounded-2xl border border-gray-light/70 bg-[#201a1a] p-6">
          <p className="mb-3 text-xs font-semibold tracking-wide text-white/60 uppercase">Prévia sobre o fundo real</p>
          <span className="inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-white">
            {eyebrow || "ETIQUETA"}
          </span>
          <h2 className="mt-4 text-2xl leading-[1.1] font-extrabold text-white md:text-3xl">
            {title || "Título do banner"}
          </h2>
          <p className="mt-3 max-w-md text-sm text-white/85">{text || "Texto de apoio do banner."}</p>
          {ctaLabel && ctaHref && (
            <span className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white">
              {ctaLabel}
            </span>
          )}
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
          <CoverImageField label="Imagem do banner (desktop)" kind="banner" value={image} onChange={setImage} />
        </div>

        <div className="rounded-2xl border border-gray-light/70 bg-white p-5">
          <CoverImageField
            label="Imagem do banner (mobile, opcional)"
            kind="heroMobile"
            value={mobileImage}
            onChange={setMobileImage}
          />
          <p className="mt-2 text-xs text-gray-medium">Se não enviada, o mobile usa a imagem desktop.</p>
        </div>
      </div>
    </div>
  );
}
