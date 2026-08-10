import type { Metadata } from "next";
import Header from "@/components/Header";
import AboutHero from "@/components/AboutHero";
import AboutStorySection from "@/components/AboutStorySection";
import AboutAreasSection from "@/components/AboutAreasSection";
import OfficeSection from "@/components/OfficeSection";
import AboutGallery from "@/components/AboutGallery";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Sobre Nós | Grupo Dimensão",
  description:
    "Há 32 anos no mercado, o Grupo Dimensão oferece soluções em segurança patrimonial, portaria e monitoramento. Conheça nossa história, estrutura e localização.",
};

export default function SobreNos() {
  return (
    <>
      {/* Own stacking context so this always paints above the fixed,
          scroll-revealed footer that sits behind it (see Footer.tsx). */}
      <div className="relative z-10 bg-background">
        <Header />
        <main>
          <AboutHero />
          <AboutStorySection />
          <AboutAreasSection />
          <OfficeSection />
          <AboutGallery />
          <CtaBand />
        </main>
      </div>
      <Footer />
    </>
  );
}
