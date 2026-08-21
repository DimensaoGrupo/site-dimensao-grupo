"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { services } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";
import { slugify } from "@/lib/slugify";
import { isServiceIconKey } from "./icons";
import { serializeServiceList, type ServiceListEntry } from "./contentTypes";
import type { ServiceStatus } from "./statusLabels";

export type ServiceInput = {
  title: string;
  slug: string;
  icon: string;
  listSummary: string;
  heroSubheading: string;
  heroIntro: string;
  heroImage: string | null;
  introEyebrow: string;
  introTitle: string;
  introLead: string;
  introDetail: string;
  benefits: ServiceListEntry[];
  highlightTitle: string;
  highlightText: string;
  audienceDescription: string;
  audiences: ServiceListEntry[];
  credentialNumber: string | null;
  credentialText: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
};

export type ServiceActionResult = { id?: number; error?: string };

const TITLE_MAX_LENGTH = 140;

function validateList(items: ServiceListEntry[], label: string): string | null {
  if (items.length === 0) return `Adicione ao menos um item em "${label}".`;
  for (const item of items) {
    if (!item.title.trim() || !item.description.trim()) {
      return `Preencha título e descrição de todos os itens em "${label}".`;
    }
    if (!isServiceIconKey(item.icon)) {
      return `Ícone inválido em "${label}".`;
    }
  }
  return null;
}

function validate(input: ServiceInput): string | null {
  if (!input.title.trim()) return "O título é obrigatório.";
  if (input.title.length > TITLE_MAX_LENGTH) {
    return `O título não pode passar de ${TITLE_MAX_LENGTH} caracteres.`;
  }
  if (!input.slug.trim()) return "O slug é obrigatório.";
  if (!isServiceIconKey(input.icon)) return "Escolha um ícone válido.";
  if (!input.listSummary.trim()) return "O resumo do card é obrigatório.";
  if (!input.heroSubheading.trim() || !input.heroIntro.trim()) {
    return "Preencha o subtítulo e a introdução do Hero.";
  }
  if (!input.heroImage) return "Envie a imagem principal do serviço.";
  if (!input.introEyebrow.trim() || !input.introTitle.trim()) {
    return "Preencha a etiqueta e o título da seção 'O Serviço'.";
  }
  if (!input.introLead.trim() || !input.introDetail.trim()) {
    return "Preencha os textos da seção 'O Serviço'.";
  }
  const benefitsError = validateList(input.benefits, "Diferenciais");
  if (benefitsError) return benefitsError;
  if (!input.highlightTitle.trim() || !input.highlightText.trim()) {
    return "Preencha o título e o texto do destaque.";
  }
  if (!input.audienceDescription.trim()) return "Preencha a descrição de abrangência.";
  const audiencesError = validateList(input.audiences, "Públicos-alvo");
  if (audiencesError) return audiencesError;
  const hasCredentialNumber = Boolean(input.credentialNumber?.trim());
  const hasCredentialText = Boolean(input.credentialText?.trim());
  if (hasCredentialNumber !== hasCredentialText) {
    return "Preencha o número e o texto da credencial juntos, ou deixe os dois em branco.";
  }
  return null;
}

async function isSlugTakenTx(slug: string, excludeId?: number) {
  const rows = await db.select({ id: services.id }).from(services).where(eq(services.slug, slug));
  return rows.some((row) => row.id !== excludeId);
}

function revalidateService(slug?: string) {
  revalidatePath("/admin/services");
  revalidatePath("/");
  revalidatePath("/sobre-nos");
  if (slug) revalidatePath(`/servicos/${slug}`);
}

export async function createService(input: ServiceInput): Promise<ServiceActionResult> {
  await requireSession();

  const validationError = validate(input);
  if (validationError) return { error: validationError };

  const slug = slugify(input.slug) || slugify(input.title);
  if (!slug) return { error: "Não foi possível gerar um slug válido para esse título." };
  if (await isSlugTakenTx(slug)) {
    return { error: "Já existe um serviço com esse slug. Ajuste o título ou o slug." };
  }

  const [{ maxOrder } = { maxOrder: null }] = await db
    .select({ maxOrder: sql<number | null>`max(${services.order})` })
    .from(services);
  const nextOrder = (maxOrder ?? -1) + 1;

  try {
    const [row] = await db
      .insert(services)
      .values({
        title: input.title.trim(),
        slug,
        icon: input.icon,
        listSummary: input.listSummary.trim(),
        heroSubheading: input.heroSubheading.trim(),
        heroIntro: input.heroIntro.trim(),
        heroImage: input.heroImage!,
        introEyebrow: input.introEyebrow.trim(),
        introTitle: input.introTitle.trim(),
        introLead: input.introLead.trim(),
        introDetail: input.introDetail.trim(),
        benefitsJson: serializeServiceList(input.benefits),
        highlightTitle: input.highlightTitle.trim(),
        highlightText: input.highlightText.trim(),
        audienceDescription: input.audienceDescription.trim(),
        audiencesJson: serializeServiceList(input.audiences),
        credentialNumber: input.credentialNumber?.trim() || null,
        credentialText: input.credentialText?.trim() || null,
        status: "draft",
        order: nextOrder,
        metaTitle: input.metaTitle?.trim() || null,
        metaDescription: input.metaDescription?.trim() || null,
        ogImage: input.heroImage,
      })
      .returning({ id: services.id });

    revalidateService();
    return { id: row.id };
  } catch {
    return { error: "Não foi possível salvar o serviço. Verifique os campos e tente novamente." };
  }
}

export async function updateService(id: number, input: ServiceInput): Promise<ServiceActionResult> {
  await requireSession();

  const validationError = validate(input);
  if (validationError) return { error: validationError };

  const slug = slugify(input.slug) || slugify(input.title);
  if (!slug) return { error: "Não foi possível gerar um slug válido para esse título." };
  if (await isSlugTakenTx(slug, id)) {
    return { error: "Já existe um serviço com esse slug. Ajuste o título ou o slug." };
  }

  const [existing] = await db.select({ slug: services.slug }).from(services).where(eq(services.id, id));
  if (!existing) return { error: "Serviço não encontrado." };

  try {
    await db
      .update(services)
      .set({
        title: input.title.trim(),
        slug,
        icon: input.icon,
        listSummary: input.listSummary.trim(),
        heroSubheading: input.heroSubheading.trim(),
        heroIntro: input.heroIntro.trim(),
        heroImage: input.heroImage!,
        introEyebrow: input.introEyebrow.trim(),
        introTitle: input.introTitle.trim(),
        introLead: input.introLead.trim(),
        introDetail: input.introDetail.trim(),
        benefitsJson: serializeServiceList(input.benefits),
        highlightTitle: input.highlightTitle.trim(),
        highlightText: input.highlightText.trim(),
        audienceDescription: input.audienceDescription.trim(),
        audiencesJson: serializeServiceList(input.audiences),
        credentialNumber: input.credentialNumber?.trim() || null,
        credentialText: input.credentialText?.trim() || null,
        metaTitle: input.metaTitle?.trim() || null,
        metaDescription: input.metaDescription?.trim() || null,
        ogImage: input.heroImage,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(services.id, id));

    revalidateService(existing.slug);
    if (slug !== existing.slug) revalidateService(slug);
    return { id };
  } catch {
    return { error: "Não foi possível salvar o serviço. Verifique os campos e tente novamente." };
  }
}

export async function setServiceStatus(id: number, status: ServiceStatus): Promise<ServiceActionResult> {
  await requireSession();

  const [row] = await db.select({ slug: services.slug }).from(services).where(eq(services.id, id));
  if (!row) return { error: "Serviço não encontrado." };

  await db
    .update(services)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(services.id, id));

  revalidateService(row.slug);
  return { id };
}

export async function deleteService(id: number): Promise<ServiceActionResult> {
  await requireSession();

  const [row] = await db.select({ slug: services.slug }).from(services).where(eq(services.id, id));
  if (!row) return { error: "Serviço não encontrado." };

  await db.delete(services).where(eq(services.id, id));

  revalidateService(row.slug);
  return { id };
}

export type ReorderResult = { success?: boolean; error?: string };

/** Same shape as reorderBanners: takes the full new ID order, validates against the current set, writes N single-row updates in parallel. */
export async function reorderServices(orderedIds: number[]): Promise<ReorderResult> {
  await requireSession();

  const current = await db.select({ id: services.id }).from(services);
  const currentIds = new Set(current.map((row) => row.id));
  const sameLength = orderedIds.length === currentIds.size;
  const sameMembers = orderedIds.every((id) => currentIds.has(id));
  if (!sameLength || !sameMembers) {
    return { error: "A lista de serviços mudou. Atualize a página e tente novamente." };
  }

  await Promise.all(
    orderedIds.map((id, index) =>
      db.update(services).set({ order: index }).where(eq(services.id, id)),
    ),
  );

  revalidateService();
  return { success: true };
}
