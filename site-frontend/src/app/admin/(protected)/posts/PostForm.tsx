"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/admin/RichTextEditor";
import CoverImageField from "@/components/admin/CoverImageField";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import {
  createPost,
  updatePost,
  publishPost,
  unpublishPost,
  schedulePost,
  cancelSchedule,
  scheduleUnpublish,
  retrySchedule,
  type PostInput,
} from "@/lib/posts/actions";
import { slugify } from "@/lib/slugify";
import { emptyDoc } from "@/lib/posts/contentTypes";
import type { PostStatus } from "@/lib/posts/statusLabels";
import {
  zonedWallTimeToUtcIso,
  utcIsoToZonedParts,
  formatZoned,
  formatRelative,
  isPastInstant,
} from "@/lib/datetime";

type Category = { id: number; name: string };

type ExistingPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  contentJson: string;
  coverImage: string | null;
  categoryId: number | null;
  status: PostStatus;
  scheduledAt: string | null;
  scheduledUnpublishAt: string | null;
  lastTransitionError: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
};

type PostEventRow = { id: number; eventType: string; detail: string | null; createdAt: string };

const TITLE_WARN_LENGTH = 100;
const TITLE_MAX_LENGTH = 140;

const EVENT_LABEL: Record<string, string> = {
  schedule_created: "Agendamento criado",
  schedule_changed: "Agendamento alterado",
  schedule_canceled: "Agendamento cancelado",
  published_auto: "Publicado automaticamente",
  published_manual: "Publicado manualmente",
  unpublished_manual: "Despublicado manualmente",
  unpublished_auto: "Despublicado automaticamente",
  publish_failed: "Falha ao publicar",
};

type PublishMode = "draft" | "now" | "schedule";

function defaultPublishMode(status?: PostStatus): PublishMode {
  if (status === "scheduled") return "schedule";
  if (status === "unpublished") return "now";
  return "draft";
}

function todaySp(): string {
  return utcIsoToZonedParts(new Date().toISOString()).date;
}

/** Returns the UTC ISO instant for a date/time pair, or null if either field is empty/invalid. */
function tryZonedIso(date: string, time: string): string | null {
  if (!date || !time) return null;
  try {
    return zonedWallTimeToUtcIso(date, time);
  } catch {
    return null;
  }
}

export default function PostForm({
  categories,
  post,
  events = [],
}: {
  categories: Category[];
  post?: ExistingPost;
  events?: PostEventRow[];
}) {
  const router = useRouter();
  const [id, setId] = useState<number | undefined>(post?.id);
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [categoryId, setCategoryId] = useState<number | null>(post?.categoryId ?? null);
  const [contentJson, setContentJson] = useState(post?.contentJson ?? JSON.stringify(emptyDoc()));
  const [coverImage, setCoverImage] = useState<string | null>(post?.coverImage ?? null);
  const [seoOpen, setSeoOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription ?? "");

  const [status, setStatus] = useState<PostStatus>(post?.status ?? "draft");
  const [lastTransitionError, setLastTransitionError] = useState(post?.lastTransitionError ?? null);
  const [publishMode, setPublishMode] = useState<PublishMode>(defaultPublishMode(post?.status));

  const initialSchedule = post?.scheduledAt ? utcIsoToZonedParts(post.scheduledAt) : null;
  const [scheduleDate, setScheduleDate] = useState(initialSchedule?.date ?? "");
  const [scheduleTime, setScheduleTime] = useState(initialSchedule?.time ?? "");

  const initialUnpublish = post?.scheduledUnpublishAt ? utcIsoToZonedParts(post.scheduledUnpublishAt) : null;
  const [unpublishEnabled, setUnpublishEnabled] = useState(Boolean(initialUnpublish));
  const [unpublishDate, setUnpublishDate] = useState(initialUnpublish?.date ?? "");
  const [unpublishTime, setUnpublishTime] = useState(initialUnpublish?.time ?? "");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const [confirmCancelSchedule, setConfirmCancelSchedule] = useState(false);

  const titleLength = title.length;
  const titleTooLong = titleLength > TITLE_MAX_LENGTH;
  const isLive = status === "published";

  const currentInput: PostInput = useMemo(
    () => ({
      title,
      slug: slug || slugify(title),
      excerpt,
      contentJson,
      coverImage,
      categoryId,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      ogImage: coverImage,
    }),
    [title, slug, excerpt, contentJson, coverImage, categoryId, metaTitle, metaDescription],
  );

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function persist(): Promise<{ id?: number; error?: string }> {
    if (titleTooLong) {
      return { error: `O título não pode passar de ${TITLE_MAX_LENGTH} caracteres.` };
    }
    if (id) {
      return updatePost(id, currentInput);
    }
    const result = await createPost(currentInput);
    if (result.id) setId(result.id);
    return result;
  }

  /** Applies the optional auto-unpublish checkbox/fields — independent of publishMode. */
  async function applyUnpublishSchedule(postId: number): Promise<string | null> {
    if (unpublishEnabled) {
      if (!unpublishDate || !unpublishTime) {
        return "Escolha a data e o horário da despublicação automática, ou desmarque a opção.";
      }
      const result = await scheduleUnpublish(postId, { date: unpublishDate, time: unpublishTime });
      if (result.error) return result.error;
    } else if (post?.scheduledUnpublishAt) {
      await scheduleUnpublish(postId, null);
    }
    return null;
  }

  function handlePreview() {
    setError(null);
    startTransition(async () => {
      const result = await persist();
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(`/admin/posts/${result.id}/preview`);
    });
  }

  function handleSave() {
    setError(null);
    setSavedMessage(null);
    startTransition(async () => {
      const saveResult = await persist();
      if (saveResult.error || !saveResult.id) {
        setError(saveResult.error ?? "Não foi possível salvar.");
        return;
      }
      const postId = saveResult.id;

      if (publishMode === "now") {
        const publishResult = await publishPost(postId);
        if (publishResult.error) {
          setError(publishResult.error);
          return;
        }
        setStatus("published");
        setLastTransitionError(null);
        const unpublishError = await applyUnpublishSchedule(postId);
        if (unpublishError) {
          setError(unpublishError);
          return;
        }
        setConfirmPublish(false);
        router.push("/admin/posts");
        return;
      }

      if (publishMode === "schedule") {
        if (!scheduleDate || !scheduleTime) {
          setError("Escolha a data e o horário da publicação.");
          return;
        }
        const scheduleResult = await schedulePost(postId, { date: scheduleDate, time: scheduleTime });
        if (scheduleResult.error) {
          setError(scheduleResult.error);
          return;
        }
        setStatus("scheduled");
        setLastTransitionError(null);
        const unpublishError = await applyUnpublishSchedule(postId);
        if (unpublishError) {
          setError(unpublishError);
          return;
        }
        router.push("/admin/posts");
        return;
      }

      // publishMode === "draft"
      if (status === "scheduled") {
        const cancelResult = await cancelSchedule(postId);
        if (cancelResult.error) {
          setError(cancelResult.error);
          return;
        }
        setStatus("draft");
        setSavedMessage("Agendamento cancelado. Post salvo como rascunho.");
      } else {
        setSavedMessage("Rascunho salvo.");
      }
      if (!post && postId) router.replace(`/admin/posts/${postId}`);
    });
  }

  function handleUnpublish() {
    if (!id) return;
    setError(null);
    startTransition(async () => {
      const result = await unpublishPost(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setStatus("unpublished");
      setPublishMode("now");
      setConfirmUnpublish(false);
    });
  }

  function handleCancelSchedule() {
    if (!id) return;
    setError(null);
    startTransition(async () => {
      const result = await cancelSchedule(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setStatus("draft");
      setPublishMode("draft");
      setScheduleDate("");
      setScheduleTime("");
      setConfirmCancelSchedule(false);
      setSavedMessage("Agendamento cancelado.");
    });
  }

  function handleRetry() {
    if (!id) return;
    setError(null);
    startTransition(async () => {
      const result = await retrySchedule(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setStatus("published");
      setLastTransitionError(null);
      router.push("/admin/posts");
    });
  }

  const scheduleIso = tryZonedIso(scheduleDate, scheduleTime);
  const schedulePast = scheduleIso ? isPastInstant(scheduleIso) : false;
  const unpublishIso = tryZonedIso(unpublishDate, unpublishTime);
  const unpublishPast = unpublishIso ? isPastInstant(unpublishIso) : false;

  const showUnpublishSection = Boolean(id) && (isLive || publishMode === "now" || publishMode === "schedule");

  return (
    <div className="pb-24">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
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
              className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-base font-semibold text-foreground outline-none focus:border-primary"
              placeholder="Título do post"
            />
          </div>

          <div>
            <label htmlFor="slug" className="text-sm font-medium text-foreground">
              Slug (URL)
            </label>
            <div className="mt-1.5 flex items-center gap-1 text-sm">
              <span className="text-gray-medium">/blog/</span>
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
            <label htmlFor="excerpt" className="text-sm font-medium text-foreground">
              Resumo <span className="font-normal text-gray-medium">(opcional)</span>
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              placeholder="Uma ou duas frases sobre o artigo — aparece na listagem do Blog."
            />
          </div>

          <div>
            <span className="text-sm font-medium text-foreground">Conteúdo</span>
            <div className="mt-1.5">
              <RichTextEditor initialContentJson={contentJson} onChange={setContentJson} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-light/70 bg-white p-5">
            <span className="text-sm font-bold text-foreground">Publicação</span>

            {lastTransitionError && (
              <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                <p className="text-xs font-semibold text-primary">⚠️ Falha na publicação automática</p>
                <p className="mt-1 text-xs text-gray-medium">{lastTransitionError}</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isPending}
                  className="mt-2 text-xs font-semibold text-primary hover:text-primary-dark disabled:opacity-60"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {isLive ? (
              <>
                <p className="mt-1 text-sm text-gray-medium">Publicado no site.</p>
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
                    Salvar alterações
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmUnpublish(true)}
                    disabled={isPending}
                    className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-medium hover:text-foreground disabled:opacity-60"
                  >
                    Despublicar
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-gray-medium">
                  {status === "unpublished"
                    ? "Foi publicado, mas está despublicado."
                    : "Ainda não visível no site."}
                </p>

                <div className="mt-4 flex flex-col gap-2.5">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="radio"
                      name="publishMode"
                      checked={publishMode === "draft"}
                      onChange={() => setPublishMode("draft")}
                    />
                    Salvar como rascunho
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="radio"
                      name="publishMode"
                      checked={publishMode === "now"}
                      onChange={() => setPublishMode("now")}
                    />
                    Publicar agora
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="radio"
                      name="publishMode"
                      checked={publishMode === "schedule"}
                      onChange={() => setPublishMode("schedule")}
                    />
                    Agendar publicação
                  </label>
                </div>

                {publishMode === "schedule" && (
                  <div className="mt-3 space-y-2 rounded-lg bg-[#f7f6f6] p-3">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label htmlFor="scheduleDate" className="text-xs font-medium text-gray-medium">
                          Data
                        </label>
                        <input
                          id="scheduleDate"
                          type="date"
                          min={todaySp()}
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-gray-light bg-white px-2.5 py-2 text-sm outline-none focus:border-primary"
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="scheduleTime" className="text-xs font-medium text-gray-medium">
                          Horário
                        </label>
                        <input
                          id="scheduleTime"
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-gray-light bg-white px-2.5 py-2 text-sm outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    {scheduleIso &&
                      (schedulePast ? (
                        <p className="text-xs font-semibold text-primary">
                          Essa data já passou — escolha uma data e hora futuras.
                        </p>
                      ) : (
                        <p className="text-xs text-gray-medium">
                          🕐 {formatZoned(scheduleIso)} — {formatRelative(scheduleIso, { detailed: true })}
                        </p>
                      ))}
                  </div>
                )}

                {status === "scheduled" && (
                  <button
                    type="button"
                    onClick={() => setConfirmCancelSchedule(true)}
                    disabled={isPending}
                    className="mt-3 text-xs font-semibold text-gray-medium hover:text-primary disabled:opacity-60"
                  >
                    Cancelar agendamento
                  </button>
                )}

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
                    onClick={() => (publishMode === "now" ? setConfirmPublish(true) : handleSave())}
                    disabled={isPending || (publishMode === "schedule" && (!scheduleIso || schedulePast))}
                    className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
                  >
                    {publishMode === "draft" && "Salvar rascunho"}
                    {publishMode === "now" && "Publicar"}
                    {publishMode === "schedule" && "Agendar publicação"}
                  </button>
                </div>
              </>
            )}

            {showUnpublishSection && (
              <div className="mt-5 border-t border-gray-light/60 pt-4">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={unpublishEnabled}
                    onChange={(e) => setUnpublishEnabled(e.target.checked)}
                  />
                  Despublicar automaticamente
                </label>
                {unpublishEnabled && (
                  <div className="mt-2 space-y-2 rounded-lg bg-[#f7f6f6] p-3">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label htmlFor="unpublishDate" className="text-xs font-medium text-gray-medium">
                          Data
                        </label>
                        <input
                          id="unpublishDate"
                          type="date"
                          min={todaySp()}
                          value={unpublishDate}
                          onChange={(e) => setUnpublishDate(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-gray-light bg-white px-2.5 py-2 text-sm outline-none focus:border-primary"
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="unpublishTime" className="text-xs font-medium text-gray-medium">
                          Horário
                        </label>
                        <input
                          id="unpublishTime"
                          type="time"
                          value={unpublishTime}
                          onChange={(e) => setUnpublishTime(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-gray-light bg-white px-2.5 py-2 text-sm outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    {unpublishIso &&
                      (unpublishPast ? (
                        <p className="text-xs font-semibold text-primary">Essa data já passou.</p>
                      ) : (
                        <p className="text-xs text-gray-medium">⏸️ {formatZoned(unpublishIso)}</p>
                      ))}
                  </div>
                )}
              </div>
            )}

            {savedMessage && <p className="mt-3 text-xs text-green-700">{savedMessage}</p>}
            {error && <p className="mt-3 text-xs text-primary">{error}</p>}
          </div>

          <div className="rounded-2xl border border-gray-light/70 bg-white p-5">
            <CoverImageField label="Imagem de destaque" kind="cover" value={coverImage} onChange={setCoverImage} />
          </div>

          <div className="rounded-2xl border border-gray-light/70 bg-white p-5">
            <label htmlFor="category" className="text-sm font-bold text-foreground">
              Categoria
            </label>
            <select
              id="category"
              value={categoryId ?? ""}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
              className="mt-2 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <a href="/admin/categories" className="mt-2 inline-block text-xs font-semibold text-primary">
              + Criar nova categoria
            </a>
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
                    placeholder={title || "Usa o título do post"}
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
                    placeholder={excerpt || "Usa o resumo do post"}
                    className="mt-1 w-full rounded-lg border border-gray-light bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <p className="text-xs text-gray-medium">A imagem Open Graph usa a imagem de destaque.</p>
              </div>
            )}
          </div>

          {events.length > 0 && (
            <div className="rounded-2xl border border-gray-light/70 bg-white p-5">
              <button
                type="button"
                onClick={() => setHistoryOpen((v) => !v)}
                className="flex w-full items-center justify-between text-sm font-bold text-foreground"
              >
                Histórico <span className="text-gray-medium">{historyOpen ? "−" : "+"}</span>
              </button>
              {historyOpen && (
                <ul className="mt-3 space-y-3">
                  {events.map((event) => (
                    <li key={event.id} className="text-xs">
                      <span className="font-semibold text-foreground">
                        {EVENT_LABEL[event.eventType] ?? event.eventType}
                      </span>
                      <span className="ml-2 text-gray-medium">{formatZoned(event.createdAt)}</span>
                      {event.detail && <p className="mt-0.5 text-gray-medium">{event.detail}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmPublish}
        title="Publicar este post?"
        description={title || "Sem título"}
        confirmLabel="Publicar"
        pending={isPending}
        onConfirm={handleSave}
        onCancel={() => setConfirmPublish(false)}
      />
      <ConfirmDialog
        open={confirmUnpublish}
        title="Despublicar este post?"
        description="Ele deixa de aparecer no site, mas continua salvo."
        confirmLabel="Despublicar"
        pending={isPending}
        onConfirm={handleUnpublish}
        onCancel={() => setConfirmUnpublish(false)}
      />
      <ConfirmDialog
        open={confirmCancelSchedule}
        title="Cancelar o agendamento deste post?"
        description="Ele volta a ser um rascunho e não será publicado automaticamente."
        confirmLabel="Sim, cancelar agendamento"
        pending={isPending}
        onConfirm={handleCancelSchedule}
        onCancel={() => setConfirmCancelSchedule(false)}
      />
    </div>
  );
}
