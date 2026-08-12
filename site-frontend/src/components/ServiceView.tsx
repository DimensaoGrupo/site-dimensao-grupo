import ServiceHero from "./ServiceHero";
import ServiceIntro from "./ServiceIntro";
import ServiceBenefits from "./ServiceBenefits";
import ServiceHighlight from "./ServiceHighlight";
import ServiceAudience from "./ServiceAudience";
import ServiceCredential from "./ServiceCredential";
import CtaBand from "./CtaBand";
import type { ServiceListEntry } from "@/lib/services/contentTypes";

export type ServiceViewData = {
  title: string;
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
};

// The single source of truth for "how a service page looks" — used verbatim
// by both the public page (src/app/servicos/[slug]/page.tsx) and the admin
// preview, the same role ArticleView plays for posts. Composes the same 7
// section components the one hand-built service page always used; this is
// the "um template único" from the CMS plan — no new layout, just the
// existing template driven by CMS data instead of a static content.ts
// object. ServiceIntro's eyebrow/title and CtaBand's copy stay hardcoded
// here rather than becoming DB columns — they were already outside the
// per-service content object even in the original static page.
export default function ServiceView({ service }: { service: ServiceViewData }) {
  return (
    <>
      <ServiceHero
        title={service.title}
        subheading={service.heroSubheading}
        intro={service.heroIntro}
        image={service.heroImage}
      />
      <ServiceIntro
        eyebrow="O Serviço"
        title="Um serviço pensado para a rotina do seu empreendimento"
        lead={service.introLead}
        detail={service.introDetail}
      />
      <ServiceBenefits benefits={service.benefits} />
      <ServiceHighlight title={service.highlightTitle} text={service.highlightText} />
      <ServiceAudience description={service.audienceDescription} audiences={service.audiences} />
      {service.credentialNumber && service.credentialText && (
        <ServiceCredential number={service.credentialNumber} text={service.credentialText} />
      )}
      <CtaBand />
    </>
  );
}
