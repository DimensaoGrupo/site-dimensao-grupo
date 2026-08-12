import type { Metadata } from "next";
import HeaderNav from "@/components/HeaderNav";
import AboutHero from "@/components/AboutHero";
import AboutStorySection from "@/components/AboutStorySection";
import AboutAreasSection from "@/components/AboutAreasSection";
import OfficeSection from "@/components/OfficeSection";
import AboutGallery from "@/components/AboutGallery";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";
import { listPublishedServices } from "@/lib/services/queries";

export const metadata: Metadata = {
  title: "Sobre Nós | Grupo Dimensão",
  description:
    "Há 32 anos no mercado, o Grupo Dimensão oferece soluções em segurança patrimonial, portaria e monitoramento. Conheça nossa história, estrutura e localização.",
};

// Header (via HeaderNav) and AboutAreasSection now both read live services
// data — see src/app/page.tsx for why that means this page can't stay
// statically cached.
export const dynamic = "force-dynamic";

export default async function SobreNos() {
  const services = await listPublishedServices();

  return (
    <>
      {/* Own stacking context so this always paints above the fixed,
          scroll-revealed footer that sits behind it (see Footer.tsx). */}
      <div className="relative z-10 bg-background">
        <HeaderNav />
        <main>
          <AboutHero />
          <AboutStorySection />
          <AboutAreasSection
            services={services.map((service) => ({
              title: service.title,
              description: service.listSummary,
              href: `/servicos/${service.slug}`,
            }))}
          />
          <OfficeSection />
          <AboutGallery />
          <CtaBand />
        </main>
      </div>
      <Footer />
    </>
  );
}
