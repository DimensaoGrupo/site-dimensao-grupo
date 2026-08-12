import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HeaderNav from "@/components/HeaderNav";
import Footer from "@/components/Footer";
import ServiceView from "@/components/ServiceView";
import { getPublishedServiceBySlug } from "@/lib/services/queries";
import { parseServiceList } from "@/lib/services/contentTypes";

// Home, Sobre Nós and the nav dropdown all now read services live from the
// DB too — once several pages depend on the same mutable data, the real
// risk isn't "no revalidation path exists" (services have no background
// scheduler), it's "a mutating action forgets to revalidate exactly one of
// the several pages that show services" and something silently goes stale
// until an unrelated deploy. force-dynamic removes that whole class of bug.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getPublishedServiceBySlug(slug);
  if (!service) return {};

  const title = service.metaTitle || service.title;
  const description = service.metaDescription || service.listSummary || undefined;
  const ogImage = service.ogImage || service.heroImage;

  return {
    title: `${title} | Grupo Dimensão`,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getPublishedServiceBySlug(slug);
  if (!service) notFound();

  return (
    <>
      {/* Own stacking context so this always paints above the fixed,
          scroll-revealed footer that sits behind it (see Footer.tsx). */}
      <div className="relative z-10 bg-background">
        <HeaderNav />
        <main>
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
        </main>
      </div>
      <Footer />
    </>
  );
}
