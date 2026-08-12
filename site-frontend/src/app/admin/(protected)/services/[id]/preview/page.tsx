import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceById } from "@/lib/services/queries";
import { parseServiceList } from "@/lib/services/contentTypes";
import PreviewFrame from "@/components/admin/PreviewFrame";
import ServiceView from "@/components/ServiceView";

function statusMessage(status: string) {
  if (status === "published") return "Este serviço já está publicado.";
  if (status === "inactive") return "Foi publicado, mas está inativo.";
  return "Rascunho — ainda não visível no site.";
}

export const metadata = { title: "Pré-visualização — Painel Grupo Dimensão" };

export default async function ServicePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const serviceId = Number(id);
  if (!Number.isInteger(serviceId)) notFound();

  const service = await getServiceById(serviceId);
  if (!service) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pré-visualização</h1>
          <p className="mt-1 text-sm text-gray-medium">{statusMessage(service.status)}</p>
        </div>
        <Link
          href={`/admin/services/${serviceId}`}
          className="text-sm font-semibold text-primary hover:text-primary-dark"
        >
          ← Voltar para edição
        </Link>
      </div>

      <div className="mt-6">
        <PreviewFrame>
          <ServiceView
            service={{
              title: service.title,
              heroSubheading: service.heroSubheading,
              heroIntro: service.heroIntro,
              heroImage: service.heroImage,
              introLead: service.introLead,
              introDetail: service.introDetail,
              benefits: parseServiceList(service.benefitsJson),
              highlightTitle: service.highlightTitle,
              highlightText: service.highlightText,
              audienceDescription: service.audienceDescription,
              audiences: parseServiceList(service.audiencesJson),
              credentialNumber: service.credentialNumber,
              credentialText: service.credentialText,
            }}
          />
        </PreviewFrame>
      </div>
    </div>
  );
}
