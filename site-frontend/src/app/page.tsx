import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import MissionSection from "@/components/MissionSection";
import StatsSection from "@/components/StatsSection";
import NewsSection from "@/components/NewsSection";
import QualitySection from "@/components/QualitySection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      {/* Own stacking context so this always paints above the fixed,
          scroll-revealed footer that sits behind it (see Footer.tsx). */}
      <div className="relative z-10 bg-background">
        <Header />
        <main>
          <Hero />
          <ServicesSection />
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
