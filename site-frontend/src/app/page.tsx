import HeaderNav from "@/components/HeaderNav";
import Hero from "@/components/Hero";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import MissionSection from "@/components/MissionSection";
import StatsSection from "@/components/StatsSection";
import NewsSection from "@/components/NewsSection";
import QualitySection from "@/components/QualitySection";
import Footer from "@/components/Footer";
import { listPublishedServices } from "@/lib/services/queries";
import type { ServiceIconKey } from "@/lib/services/icons";

// NewsSection reads live post status (draft/scheduled/published/unpublished).
// Scheduled auto-publish/unpublish happens from a background poller
// (src/instrumentation.ts) with no live request in flight, so it can't call
// revalidatePath itself (that needs a request-scoped context Next doesn't
// give a setInterval callback). Forcing this route dynamic sidesteps the
// problem entirely: there's never a cached page for a stale scheduler-driven
// change to get stuck behind.
export const dynamic = "force-dynamic";

export default async function Home() {
  const services = await listPublishedServices();

  return (
    <>
      {/* Own stacking context so this always paints above the fixed,
          scroll-revealed footer that sits behind it (see Footer.tsx). */}
      <div className="relative z-10 bg-background">
        <HeaderNav />
        <main>
          <Hero />
          <ServicesSection
            services={services.map((service) => ({
              icon: service.icon as ServiceIconKey,
              title: service.title,
              description: service.listSummary,
              href: `/servicos/${service.slug}`,
            }))}
          />
          <AboutSection />
          <MissionSection />
          <StatsSection />
          <NewsSection />
          <QualitySection />
        </main>
      </div>
      <Footer />
    </>
  );
}
