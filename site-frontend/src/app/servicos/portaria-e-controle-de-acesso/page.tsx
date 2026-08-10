import type { Metadata } from "next";
import Header from "@/components/Header";
import ServiceHero from "@/components/ServiceHero";
import ServiceIntro from "@/components/ServiceIntro";
import ServiceBenefits from "@/components/ServiceBenefits";
import ServiceHighlight from "@/components/ServiceHighlight";
import ServiceAudience from "@/components/ServiceAudience";
import ServiceCredential from "@/components/ServiceCredential";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";
import { servicePortaria } from "@/lib/content";

export const metadata: Metadata = {
  title: "Portaria e Controle de Acesso | Grupo Dimensão",
  description:
    "Profissionais treinados, atendimento personalizado e central especializada 24h para portaria e controle de acesso em empreendimentos comerciais e residenciais.",
};

export default function PortariaEControleDeAcesso() {
  return (
    <>
      {/* Own stacking context so this always paints above the fixed,
          scroll-revealed footer that sits behind it (see Footer.tsx). */}
      <div className="relative z-10 bg-background">
        <Header />
        <main>
          <ServiceHero
            title={servicePortaria.title}
            subheading={servicePortaria.subheading}
            intro={servicePortaria.heroIntro}
            image={servicePortaria.image}
          />
          <ServiceIntro
            eyebrow="O Serviço"
            title="Um serviço pensado para a rotina do seu empreendimento"
            lead={servicePortaria.intro}
            detail={servicePortaria.coverage}
          />
          <ServiceBenefits benefits={servicePortaria.benefits} />
          <ServiceHighlight
            title={servicePortaria.central.title}
            text={servicePortaria.central.text}
          />
          <ServiceAudience
            description={servicePortaria.coverage}
            audiences={servicePortaria.audiences}
          />
          <ServiceCredential
            number={servicePortaria.credential.number}
            text={servicePortaria.credential.text}
          />
          <CtaBand
            title="Precisa de uma solução profissional para controle de acesso?"
            text="Nossa equipe pode entender as necessidades do seu empreendimento e preparar uma proposta sob medida."
            buttonLabel="Solicitar Orçamento"
          />
        </main>
      </div>
      <Footer />
    </>
  );
}
