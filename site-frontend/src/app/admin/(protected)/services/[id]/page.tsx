import { notFound } from "next/navigation";
import { getServiceById } from "@/lib/services/queries";
import { parseServiceList } from "@/lib/services/contentTypes";
import ServiceForm from "../ServiceForm";

export const metadata = { title: "Editar serviço — Painel Grupo Dimensão" };

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const serviceId = Number(id);
  if (!Number.isInteger(serviceId)) notFound();

  const service = await getServiceById(serviceId);
  if (!service) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Editar serviço</h1>
      <div className="mt-6">
        <ServiceForm
          service={{
            id: service.id,
            title: service.title,
            slug: service.slug,
            icon: service.icon,
            listSummary: service.listSummary,
            heroSubheading: service.heroSubheading,
            heroIntro: service.heroIntro,
            heroImage: service.heroImage,
            introEyebrow: service.introEyebrow,
            introTitle: service.introTitle,
            introLead: service.introLead,
            introDetail: service.introDetail,
            benefits: parseServiceList(service.benefitsJson),
            highlightTitle: service.highlightTitle,
            highlightText: service.highlightText,
            audienceDescription: service.audienceDescription,
            audiences: parseServiceList(service.audiencesJson),
            credentialNumber: service.credentialNumber,
            credentialText: service.credentialText,
            status: service.status,
            metaTitle: service.metaTitle,
            metaDescription: service.metaDescription,
          }}
        />
      </div>
    </div>
  );
}
