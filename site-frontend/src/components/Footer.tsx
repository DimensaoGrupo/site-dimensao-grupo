"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Logo from "./Logo";
import QuoteForm from "./QuoteForm";
import { businessHours, footerLinks } from "@/lib/content";
import { useFooterReveal } from "@/hooks/useFooterReveal";
import {
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "./icons";

const socials = [
  { label: "Facebook", href: "https://facebook.com", Icon: FacebookIcon },
  { label: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { label: "YouTube", href: "https://youtube.com", Icon: YoutubeIcon },
];

export default function Footer() {
  const [today, setToday] = useState<number | null>(null);
  const {
    footerRef,
    spacerRef,
    spacerHeight,
    opacity,
    y,
    pointerEvents,
    isFocusRevealed,
  } = useFooterReveal();

  useEffect(() => {
    // Current weekday is only meaningful client-side; computing it during
    // render would desync from the server-rendered markup.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(new Date().getDay());
  }, []);

  const content = (
    <>
      <div className="container-page grid grid-cols-1 gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr] lg:gap-8">
        <div>
          <Logo height={34} />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
            Há 32 anos oferecendo soluções em segurança patrimonial, portaria
            e monitoramento com tecnologia de ponta e atendimento
            personalizado.
          </p>
          <div className="mt-6 flex gap-3">
            {socials.map(({ label, href, Icon }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                whileHover={{ scale: 1.12, y: -2 }}
                transition={{ type: "spring", stiffness: 350, damping: 18 }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-white"
              >
                <Icon className="h-4.5 w-4.5" />
              </motion.a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold tracking-[0.08em] text-white uppercase">
            <ClockIcon className="h-4 w-4 text-primary" />
            Horários de Atendimento
          </h3>
          <ul className="mt-5 flex flex-col gap-3 text-sm">
            {businessHours.map((row) => {
              const isToday = today !== null && row.weekdays.includes(today);
              return (
                <li
                  key={row.days}
                  className={`flex items-center justify-between gap-4 rounded-lg px-3 py-2 transition-colors ${
                    isToday ? "bg-primary/15 text-white" : "text-white/65"
                  }`}
                >
                  <span className="flex items-center gap-2 font-medium">
                    {isToday && (
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                      </span>
                    )}
                    {row.days}
                  </span>
                  <span>{row.hours}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold tracking-[0.08em] text-white uppercase">
            Contato e Localização
          </h3>
          <ul className="mt-5 flex flex-col gap-4 text-sm text-white/65">
            <li className="flex items-start gap-3">
              <MapPinIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary" />
              Rua Victório Partênio, 93
            </li>
            <li className="flex items-start gap-3">
              <PhoneIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary" />
              <a href="tel:+551147284729" className="hover:text-white">
                Central de Atendimento: (11) 4728-4729
              </a>
            </li>
          </ul>

          <h3 className="mt-8 text-sm font-bold tracking-[0.08em] text-white uppercase">
            Links Úteis
          </h3>
          <ul className="mt-5 flex flex-col gap-2.5 text-sm text-white/65">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold tracking-[0.08em] text-white uppercase">
            Solicite um Orçamento
          </h3>
          <p className="mt-3 text-sm text-white/60">
            Preencha o formulário e um de nossos consultores entrará em
            contato.
          </p>
          <div className="mt-5">
            <QuoteForm />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/45 sm:flex-row">
          <p>Grupo Dimensão Copyright © 2026. Todos os direitos reservados.</p>
          <a
            href="https://colaborador.dimensaogrupo.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/70"
          >
            Área do Colaborador
          </a>
        </div>
      </div>
    </>
  );

  // Always the fixed+spacer structure — branching to a different static
  // <footer> under prefers-reduced-motion (or, the same way, under mobile)
  // caused a hydration mismatch (useReducedMotion()/matchMedia can't
  // resolve identically on the server, which has no window, and the
  // client's first paint). useFooterReveal already renders this fully
  // revealed and static under reduced motion *and* on mobile via its own
  // transform-output branching, which is hydration-safe. The fixed
  // positioning itself is disabled below `md` with a plain responsive
  // class, since that's a static string either way — never JS-conditional.
  return (
    <>
      {/* Reserves the scroll room a fixed footer can't claim on its own
          (desktop only — mobile has no reveal, so no room to reserve), and
          is the real (in-flow) landing target for "#contato" links — the
          fixed footer below always sits at the viewport edge, so its own
          position can't be used for anchor scrolling. */}
      <div
        id="contato"
        ref={spacerRef}
        aria-hidden="true"
        className="md:h-(--footer-spacer-h)"
        style={{ ["--footer-spacer-h" as string]: `${spacerHeight}px` }}
      />
      <motion.footer
        ref={footerRef}
        style={{
          opacity: isFocusRevealed ? 1 : opacity,
          pointerEvents: isFocusRevealed ? "auto" : pointerEvents,
        }}
        className="bg-[#201a1a] text-white/80 md:fixed md:inset-x-0 md:bottom-0 md:z-0"
      >
        <motion.div style={{ y: isFocusRevealed ? 0 : y }}>
          {content}
        </motion.div>
      </motion.footer>
    </>
  );
}
