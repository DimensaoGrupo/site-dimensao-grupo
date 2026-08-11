"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/admin/RichTextEditor";
import CoverImageField from "@/components/admin/CoverImageField";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { createPost, updatePost, publishPost, unpublishPost, type PostInput } from "@/lib/posts/actions";
import { slugify } from "@/lib/slugify";
import { emptyDoc } from "@/lib/posts/contentTypes";

type Category = { id: number; name: string };

type ExistingPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  contentJson: string;
  coverImage: string | null;
  categoryId: number | null;
  status: "draft" | "published";
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
};

const TITLE_WARN_LENGTH = 100;
const TITLE_MAX_LENGTH = 140;

export default function PostForm({
  categories,
  post,
}: {
  categories: Category[];
  post?: ExistingPost;
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
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription ?? "");
  const [status, setStatus] = useState<"draft" | "published">(post?.status ?? "draft");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);

  const titleLength = title.length;
  const titleTooLong = titleLength > TITLE_MAX_LENGTH;

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

  function handleSaveDraft() {
    setError(null);
    setSavedMessage(null);
    startTransition(async () => {
      const result = await persist();
      if (result.error) {
        setError(result.error);
        return;
      }
      setSavedMessage("Rascunho salvo.");
      if (!post && result.id) {
        router.replace(`/admin/posts/${result.id}`);
      }
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
      router.push(`/admin/posts/${result.id}/preview`);
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
      const publishResult = await publishPost(saveResult.id);
      if (publishResult.error) {
        setError(publishResult.error);
        return;
      }
      setStatus("published");
      setConfirmPublish(false);
      router.push("/admin/posts");
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
      setStatus("draft");
    });
  }

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
            <span className="text-sm font-bold text-foreground">Status</span>
            <p className="mt-1 text-sm text-gray-medium">
              {status === "published" ? "Publicado no site." : "Rascunho — ainda não visível no site."}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isPending}
                className="rounded-lg border border-gray-light px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary disabled:opacity-60"
              >
                Salvar rascunho
              </button>
              <button
                type="button"
                onClick={handlePreview}
                disabled={isPending}
                className="rounded-lg border border-gray-light px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary disabled:opacity-60"
              >
                Pré-visualizar
              </button>
              {status === "published" ? (
                <button
                  type="button"
                  onClick={handleUnpublish}
                  disabled={isPending}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-medium hover:text-foreground disabled:opacity-60"
                >
                  Despublicar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmPublish(true)}
                  disabled={isPending}
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
                >
                  Publicar
                </button>
              )}
            </div>
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
        </div>
      </div>

      <ConfirmDialog
        open={confirmPublish}
        title="Publicar este post?"
        description={title || "Sem título"}
        confirmLabel="Publicar"
        pending={isPending}
        onConfirm={handlePublish}
        onCancel={() => setConfirmPublish(false)}
      />
    </div>
  );
}
