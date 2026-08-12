"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import CoverImageField from "@/components/admin/CoverImageField";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import {
  createService,
  updateService,
  setServiceStatus,
  type ServiceInput,
  type ServiceActionResult,
} from "@/lib/services/actions";
import { slugify } from "@/lib/slugify";
import { SERVICE_ICON_OPTIONS, type ServiceIconKey } from "@/lib/services/icons";
import type { ServiceListEntry } from "@/lib/services/contentTypes";
import type { ServiceStatus } from "@/lib/services/statusLabels";

const TITLE_WARN_LENGTH = 100;
const TITLE_MAX_LENGTH = 140;

type ExistingService = {
  id: number;
  title: string;
  slug: string;
  icon: string;
  listSummary: string;
  heroSubheading: string;
  heroIntro: string;
  heroImage: string;
  introLead: string;
  introDetail: string;
  benefits: ServiceListEntry[];
  highlightTitle: string;
  highlightText: string;
  audienceDescription: string;
  audiences: ServiceListEntry[];
  credentialNumber: string | null;
  credentialText: string | null;
  status: ServiceStatus;
  metaTitle: string | null;
  metaDescription: string | null;
};

function ServiceListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: ServiceListEntry[];
  onChange: (items: ServiceListEntry[]) => void;
}) {
  function updateItem(index: number, patch: Partial<ServiceListEntry>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }
  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }
  function addItem() {
    onChange([...items, { icon: "shield", title: "", description: "" }]);
  }
  function moveItem(index: number, direction: "up" | "down") {
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= items.length) return;
    const next = [...items];
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    onChange(next);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <button
          type="button"
          onClick={addItem}
          className="text-xs font-semibold text-primary hover:text-primary-dark"
        >
          + Adicionar item
        </button>
      </div>
      <div className="mt-2 space-y-3">
        {items.length === 0 && <p className="text-xs text-gray-medium">Nenhum item ainda.</p>}
        {items.map((item, index) => (
          <div key={index} className="rounded-lg border border-gray-light bg-[#f7f6f6] p-3">
            <div className="flex items-center gap-2">
              <select
                value={item.icon}
                onChange={(e) => updateItem(index, { icon: e.target.value as ServiceIconKey })}
                className="rounded-lg border border-gray-light bg-white px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              >
                {SERVICE_ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <input
                value={item.title}
                onChange={(e) => updateItem(index, { title: e.target.value })}
                placeholder="Título"
                className="flex-1 rounded-lg border border-gray-light bg-white px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-primary"
              />
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveItem(index, "up")}
                  aria-label="Mover para cima"
                  className="rounded p-1 text-xs text-gray-medium hover:text-foreground disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  onClick={() => moveItem(index, "down")}
                  aria-label="Mover para baixo"
                  className="rounded p-1 text-xs text-gray-medium hover:text-foreground disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  aria-label="Remover item"
                  className="rounded p-1 text-xs text-gray-medium hover:text-primary"
                >
                  ✕
                </button>
              </div>
            </div>
            <textarea
              value={item.description}
              onChange={(e) => updateItem(index, { description: e.target.value })}
              rows={2}
              placeholder="Descrição"
              className="mt-2 w-full rounded-lg border border-gray-light bg-white px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ServiceForm({ service }: { service?: ExistingService }) {
  const router = useRouter();
  const [id, setId] = useState<number | undefined>(service?.id);
  const [title, setTitle] = useState(service?.title ?? "");
  const [slug, setSlug] = useState(service?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(service));
  const [icon, setIcon] = useState<ServiceIconKey>((service?.icon as ServiceIconKey) ?? "shield");
  const [listSummary, setListSummary] = useState(service?.listSummary ?? "");
  const [heroSubheading, setHeroSubheading] = useState(service?.heroSubheading ?? "");
  const [heroIntro, setHeroIntro] = useState(service?.heroIntro ?? "");
  const [heroImage, setHeroImage] = useState<string | null>(service?.heroImage ?? null);
  const [introLead, setIntroLead] = useState(service?.introLead ?? "");
  const [introDetail, setIntroDetail] = useState(service?.introDetail ?? "");
  const [benefits, setBenefits] = useState<ServiceListEntry[]>(service?.benefits ?? []);
  const [highlightTitle, setHighlightTitle] = useState(service?.highlightTitle ?? "");
  const [highlightText, setHighlightText] = useState(service?.highlightText ?? "");
  const [audienceDescription, setAudienceDescription] = useState(service?.audienceDescription ?? "");
  const [audiences, setAudiences] = useState<ServiceListEntry[]>(service?.audiences ?? []);
  const [credentialNumber, setCredentialNumber] = useState(service?.credentialNumber ?? "");
  const [credentialText, setCredentialText] = useState(service?.credentialText ?? "");
  const [seoOpen, setSeoOpen] = useState(false);
  const [metaTitle, setMetaTitle] = useState(service?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(service?.metaDescription ?? "");
  const [status, setStatus] = useState<ServiceStatus>(service?.status ?? "draft");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const titleLength = title.length;
  const titleTooLong = titleLength > TITLE_MAX_LENGTH;

  async function persist(): Promise<ServiceActionResult> {
    if (titleTooLong) {
      return { error: `O título não pode passar de ${TITLE_MAX_LENGTH} caracteres.` };
    }
    const input: ServiceInput = {
      title,
      slug: slug || slugify(title),
      icon,
      listSummary,
      heroSubheading,
      heroIntro,
      heroImage,
      introLead,
      introDetail,
      benefits,
      highlightTitle,
      highlightText,
      audienceDescription,
      audiences,
      credentialNumber: credentialNumber || null,
      credentialText: credentialText || null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
    };
    if (id) return updateService(id, input);
    const result = await createService(input);
    if (result.id) setId(result.id);
    return result;
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleSave() {
    setError(null);
    setSavedMessage(null);
    startTransition(async () => {
      const result = await persist();
      if (result.error) {
        setError(result.error);
        return;
      }
      setSavedMessage("Alterações salvas.");
      if (!service && result.id) router.replace(`/admin/services/${result.id}`);
    });
  }

  function handlePreview() {
    setError(null);
    startTransition(async () => {
      const result = await persist();
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(`/admin/services/${result.id}/preview`);
    });
  }

  function handlePublish() {
    setError(null);
    startTransition(async () => {
      const saveResult = await persist();
      if (saveResult.error || !saveResult.id) {
        setError(saveResult.error ?? "Não foi possível salvar antes de publicar.");
        return;
      }
      const publishResult = await setServiceStatus(saveResult.id, "published");
      if (publishResult.error) {
        setError(publishResult.error);
        return;
      }
      setStatus("published");
      setConfirmPublish(false);
      router.push("/admin/services");
    });
  }

  function handleDeactivate() {
    if (!id) return;
    setError(null);
    startTransition(async () => {
      const result = await setServiceStatus(id, "inactive");
      if (result.error) {
        setError(result.error);
        return;
      }
      setStatus("inactive");
      setConfirmDeactivate(false);
    });
  }

  function handleReactivate() {
    if (!id) return;
    setError(null);
    startTransition(async () => {
      const result = await setServiceStatus(id, "published");
      if (result.error) {
        setError(result.error);
        return;
      }
      setStatus("published");
    });
  }

  return (
    <div className="pb-24">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <div className="space-y-6 rounded-2xl border border-gray-light/70 bg-white p-6">
            <span className="text-sm font-bold tracking-wide text-gray-medium uppercase">Card</span>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="title" className="text-sm font-medium text-foreground">
                  Título
                </label>
                <span className={`text-xs ${titleTooLong ? "text-primary" : "text-gray-medium"}`}>
                  {titleLength}/{TITLE_MAX_LENGTH}
                  {titleLength > TITLE_WARN_LENGTH && !titleTooLong && " · título longo"}
                </span>
              </div>
              <input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ex.: Vigilância Armada"
                className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-base font-semibold text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="slug" className="text-sm font-medium text-foreground">
                Slug (URL)
              </label>
              <div className="mt-1.5 flex items-center gap-1 text-sm">
                <span className="text-gray-medium">/servicos/</span>
                <input
                  id="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                  className="flex-1 rounded-lg border border-gray-light bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="icon" className="text-sm font-medium text-foreground">
                Ícone
              </label>
              <select
                id="icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value as ServiceIconKey)}
                className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              >
                {SERVICE_ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-medium">Usado no card da Home e na lista de Sobre Nós.</p>
            </div>

            <div>
              <label htmlFor="listSummary" className="text-sm font-medium text-foreground">
                Resumo do card
              </label>
              <textarea
                id="listSummary"
                value={listSummary}
                onChange={(e) => setListSummary(e.target.value)}
                rows={2}
                placeholder="Uma frase curta — aparece no card da Home e na lista de Sobre Nós."
                className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-6 rounded-2xl border border-gray-light/70 bg-white p-6">
            <span className="text-sm font-bold tracking-wide text-gray-medium uppercase">Hero (topo da página)</span>
            <div>
              <label htmlFor="heroSubheading" className="text-sm font-medium text-foreground">
                Etiqueta (eyebrow)
              </label>
              <input
                id="heroSubheading"
                value={heroSubheading}
                onChange={(e) => setHeroSubheading(e.target.value)}
                placeholder="Ex.: Soluções na medida certa"
                className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="heroIntro" className="text-sm font-medium text-foreground">
                Texto de introdução
              </label>
              <textarea
                id="heroIntro"
                value={heroIntro}
                onChange={(e) => setHeroIntro(e.target.value)}
                rows={3}
                className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-6 rounded-2xl border border-gray-light/70 bg-white p-6">
            <span className="text-sm font-bold tracking-wide text-gray-medium uppercase">O Serviço</span>
            <div>
              <label htmlFor="introLead" className="text-sm font-medium text-foreground">
                Texto principal
              </label>
              <textarea
                id="introLead"
                value={introLead}
                onChange={(e) => setIntroLead(e.target.value)}
                rows={4}
                className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="introDetail" className="text-sm font-medium text-foreground">
                Texto complementar
              </label>
              <textarea
                id="introDetail"
                value={introDetail}
                onChange={(e) => setIntroDetail(e.target.value)}
                rows={3}
                className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-light/70 bg-white p-6">
            <span className="text-sm font-bold tracking-wide text-gray-medium uppercase">Diferenciais</span>
            <div className="mt-4">
              <ServiceListEditor label="Itens" items={benefits} onChange={setBenefits} />
            </div>
          </div>

          <div className="space-y-6 rounded-2xl border border-gray-light/70 bg-white p-6">
            <span className="text-sm font-bold tracking-wide text-gray-medium uppercase">Destaque</span>
            <div>
              <label htmlFor="highlightTitle" className="text-sm font-medium text-foreground">
                Título
              </label>
              <input
                id="highlightTitle"
                value={highlightTitle}
                onChange={(e) => setHighlightTitle(e.target.value)}
                placeholder="Ex.: Suporte especializado 24 horas"
                className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="highlightText" className="text-sm font-medium text-foreground">
                Texto
              </label>
              <textarea
                id="highlightText"
                value={highlightText}
                onChange={(e) => setHighlightText(e.target.value)}
                rows={2}
                className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-6 rounded-2xl border border-gray-light/70 bg-white p-6">
            <span className="text-sm font-bold tracking-wide text-gray-medium uppercase">Público-alvo</span>
            <div>
              <label htmlFor="audienceDescription" className="text-sm font-medium text-foreground">
                Texto de abrangência
              </label>
              <textarea
                id="audienceDescription"
                value={audienceDescription}
                onChange={(e) => setAudienceDescription(e.target.value)}
                rows={2}
                className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <ServiceListEditor label="Públicos" items={audiences} onChange={setAudiences} />
          </div>

          <div className="space-y-6 rounded-2xl border border-gray-light/70 bg-white p-6">
            <span className="text-sm font-bold tracking-wide text-gray-medium uppercase">
              Credencial <span className="font-normal normal-case text-gray-medium">(opcional)</span>
            </span>
            <p className="text-xs text-gray-medium">
              Preencha só se este serviço tiver um número de autorização oficial (ex.: vigilância armada). Deixe os
              dois campos em branco se não se aplicar.
            </p>
            <div>
              <label htmlFor="credentialNumber" className="text-sm font-medium text-foreground">
                Número da autorização
              </label>
              <input
                id="credentialNumber"
                value={credentialNumber}
                onChange={(e) => setCredentialNumber(e.target.value)}
                placeholder="Ex.: E0725"
                className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="credentialText" className="text-sm font-medium text-foreground">
                Texto legal
              </label>
              <textarea
                id="credentialText"
                value={credentialText}
                onChange={(e) => setCredentialText(e.target.value)}
                rows={3}
                className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-light/70 bg-white p-5">
            <span className="text-sm font-bold text-foreground">Publicação</span>
            <p className="mt-1 text-sm text-gray-medium">
              {status === "published" && "Publicado — visível em /servicos e nas vitrines do site."}
              {status === "draft" && "Rascunho — ainda não visível no site."}
              {status === "inactive" && "Inativo — conteúdo salvo, mas fora do ar até reativar."}
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={handlePreview}
                disabled={isPending}
                className="rounded-lg border border-gray-light px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary disabled:opacity-60"
              >
                Pré-visualizar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="rounded-lg border border-gray-light px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary disabled:opacity-60"
              >
                {status === "draft" ? "Salvar rascunho" : "Salvar alterações"}
              </button>

              {status === "draft" && (
                <button
                  type="button"
                  onClick={() => setConfirmPublish(true)}
                  disabled={isPending}
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
                >
                  Publicar
                </button>
              )}
              {status === "published" && (
                <button
                  type="button"
                  onClick={() => setConfirmDeactivate(true)}
                  disabled={isPending}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-medium hover:text-foreground disabled:opacity-60"
                >
                  Desativar
                </button>
              )}
              {status === "inactive" && (
                <button
                  type="button"
                  onClick={handleReactivate}
                  disabled={isPending}
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
                >
                  Reativar
                </button>
              )}
            </div>
            {savedMessage && <p className="mt-3 text-xs text-green-700">{savedMessage}</p>}
            {error && <p className="mt-3 text-xs text-primary">{error}</p>}
          </div>

          <div className="rounded-2xl border border-gray-light/70 bg-white p-5">
            <CoverImageField label="Imagem principal" kind="service" value={heroImage} onChange={setHeroImage} />
          </div>

          <div className="rounded-2xl border border-gray-light/70 bg-white p-5">
            <button
              type="button"
              onClick={() => setSeoOpen((v) => !v)}
              className="flex w-full items-center justify-between text-sm font-bold text-foreground"
            >
              SEO <span className="text-gray-medium">{seoOpen ? "−" : "+"}</span>
            </button>
            {seoOpen && (
              <div className="mt-3 space-y-3">
                <div>
                  <label htmlFor="metaTitle" className="text-xs font-medium text-gray-medium">
                    Meta título
                  </label>
                  <input
                    id="metaTitle"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={title || "Usa o título do serviço"}
                    className="mt-1 w-full rounded-lg border border-gray-light bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="metaDescription" className="text-xs font-medium text-gray-medium">
                    Meta descrição
                  </label>
                  <textarea
                    id="metaDescription"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={2}
                    placeholder={listSummary || "Usa o resumo do card"}
                    className="mt-1 w-full rounded-lg border border-gray-light bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <p className="text-xs text-gray-medium">A imagem Open Graph usa a imagem principal.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmPublish}
        title="Publicar este serviço?"
        description={title || "Sem título"}
        confirmLabel="Publicar"
        pending={isPending}
        onConfirm={handlePublish}
        onCancel={() => setConfirmPublish(false)}
      />
      <ConfirmDialog
        open={confirmDeactivate}
        title="Desativar este serviço?"
        description="Ele deixa de aparecer no site, mas continua salvo e pode ser reativado."
        confirmLabel="Desativar"
        pending={isPending}
        onConfirm={handleDeactivate}
        onCancel={() => setConfirmDeactivate(false)}
      />
    </div>
  );
}
