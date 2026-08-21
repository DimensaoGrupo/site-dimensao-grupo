import ServiceHero from "./ServiceHero";
import ServiceIntro from "./ServiceIntro";
import ServiceVideoSection from "./ServiceVideoSection";
import ServiceBenefits from "./ServiceBenefits";
import ServiceHighlight from "./ServiceHighlight";
import ServiceAudience from "./ServiceAudience";
import ServiceCredential from "./ServiceCredential";
import CtaBand from "./CtaBand";
import { activeOnly, type ServiceListEntry } from "@/lib/services/contentTypes";

// The institutional video (ServiceVideoSection) is specific to this one real
// service, not a generic slot — gated on slug rather than a data field.
const PORTARIA_REMOTA_SLUG = "portaria-remota";

export type ServiceViewData = {
  slug: string;
  title: string;
  heroSubheading: string;
  heroIntro: string;
  heroImage: string;
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
};

// The single source of truth for "how a service page looks" — used verbatim
// by both the public page (src/app/servicos/[slug]/page.tsx) and the admin
// preview, the same role ArticleView plays for posts. Composes the same 7
// section components the one hand-built service page always used; this is
// the "um template único" from the CMS plan — no new layout, just the
// existing template driven by CMS data instead of a static content.ts
// object. CtaBand's copy stays hardcoded here — it was already outside the
// per-service content object even in the original static page.
export default function ServiceView({ service }: { service: ServiceViewData }) {
  // An admin can toggle every item in a list off without emptying the
  // underlying array (see ServiceListEditor) — the section itself must then
  // disappear rather than render a heading over an empty grid.
  const visibleBenefits = activeOnly(service.benefits);
  const visibleAudiences = activeOnly(service.audiences);

  return (
    <>
      <ServiceHero
        title={service.title}
        subheading={service.heroSubheading}
        intro={service.heroIntro}
        image={service.heroImage}
      />
      <ServiceIntro
        eyebrow={service.introEyebrow}
        title={service.introTitle}
        lead={service.introLead}
        detail={service.introDetail}
      />
      {service.slug === PORTARIA_REMOTA_SLUG && (
        <ServiceVideoSection image={service.heroImage} title={service.title} caption={service.heroSubheading} />
      )}
      {visibleBenefits.length > 0 && <ServiceBenefits benefits={visibleBenefits} />}
      <ServiceHighlight title={service.highlightTitle} text={service.highlightText} />
      {visibleAudiences.length > 0 && (
        <ServiceAudience description={service.audienceDescription} audiences={visibleAudiences} />
      )}
      {service.credentialNumber && service.credentialText && (
        <ServiceCredential number={service.credentialNumber} text={service.credentialText} />
      )}
      <CtaBand />
    </>
  );
}
