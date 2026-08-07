"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import Logo from "./Logo";
import RollingText from "./RollingText";
import { useRollingHover } from "@/hooks/useRollingHover";
import { mainNav } from "@/lib/content";
import {
  ChevronDownIcon,
  MenuIcon,
  CloseIcon,
  PhoneIcon,
} from "./icons";

export default function Header() {
  const rootRef = useRef<HTMLElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const desktopCta = useRollingHover();
  const mobileCta = useRollingHover();
  // Height of everything above the mobile panel (topbar + logo row), so the
  // panel's own scroll area can be capped to whatever viewport space is
  // actually left — it changes with the topbar's scroll-away animation, so
  // it's measured live rather than assumed.
  const [chromeHeight, setChromeHeight] = useState(0);

  useEffect(() => {
    const header = rootRef.current;
    const panel = mobilePanelRef.current;
    if (!header || !panel) return undefined;

    const updateChromeHeight = () => {
      setChromeHeight(panel.getBoundingClientRect().top);
    };
    updateChromeHeight();

    const observer = new ResizeObserver(updateChromeHeight);
    observer.observe(header);
    window.addEventListener("orientationchange", updateChromeHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", updateChromeHeight);
    };
  }, []);

  // Lock background scroll while the mobile panel is open. `position: fixed`
  // (rather than just `overflow: hidden`) is what actually stops touch/
  // rubber-band scrolling on iOS Safari; the scroll position is preserved
  // via a negative `top` offset and restored on close so the page doesn't
  // jump.
  useEffect(() => {
    if (!mobileOpen) return undefined;

    const { body } = document;
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        mobileToggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ paused: true }).to(topBarRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        });

        ScrollTrigger.create({
          start: "top -90",
          onEnter: () => {
            rootRef.current?.classList.add("is-scrolled");
            tl.play();
          },
          onLeaveBack: () => {
            rootRef.current?.classList.remove("is-scrolled");
            tl.reverse();
          },
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  useGSAP(
    () => {
      if (!mobilePanelRef.current) return;
      if (mobileOpen) {
        gsap.fromTo(
          mobilePanelRef.current,
          { height: 0, opacity: 0 },
          { height: "auto", opacity: 1, duration: 0.35, ease: "power2.out" },
        );
      }
    },
    { dependencies: [mobileOpen], scope: rootRef },
  );

  return (
    <header
      ref={rootRef}
      className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-sm transition-shadow duration-300 [&.is-scrolled]:shadow-[0_4px_24px_rgba(32,26,26,0.08)]"
    >
      <div
        ref={topBarRef}
        className="hidden overflow-hidden border-b border-gray-light/60 bg-[#f7f6f6] md:block"
      >
        <div className="container-page flex h-9 items-center justify-between text-[13px] text-gray-medium">
          <a
            href="tel:+551147284729"
            className="inline-flex items-center gap-2 hover:text-primary"
          >
            <PhoneIcon className="h-3.5 w-3.5" />
            (11) 4728-4729 — Central de Atendimento 24h
          </a>
          <a
            href="https://colaborador.dimensaogrupo.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary"
          >
            Área do Colaborador
          </a>
        </div>
      </div>

      <div className="container-page flex items-center justify-between py-3.5">
        <Logo height={40} />

        <nav aria-label="Menu principal" className="hidden lg:block">
          <ul className="flex items-center gap-8 text-[15px] font-medium text-foreground">
            {mainNav.map((item) => (
              <li key={item.label} className="group relative">
                <a
                  href={item.href}
                  className="inline-flex items-center gap-1 py-2 transition-colors hover:text-primary"
                >
                  {item.label}
                  {item.children && (
                    <ChevronDownIcon className="h-3.5 w-3.5 text-gray-medium transition-transform duration-200 group-hover:rotate-180 group-hover:text-primary" />
                  )}
                </a>

                {item.children && (
                  <div className="invisible absolute left-1/2 top-full w-72 -translate-x-1/2 translate-y-1 rounded-lg border border-gray-light/70 bg-white p-2 opacity-0 shadow-[0_16px_40px_rgba(32,26,26,0.12)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <ul>
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <a
                            href={child.href}
                            className="block rounded-md px-3 py-2.5 text-sm text-foreground/90 transition-colors hover:bg-[#f7f6f6] hover:text-primary"
                          >
                            {child.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#contato"
            className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-primary-dark md:inline-block"
            {...desktopCta.handlers}
          >
            <RollingText text="Solicitar um Orçamento" active={desktopCta.active} />
          </a>
          <button
            ref={mobileToggleRef}
            type="button"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground lg:hidden"
          >
            {mobileOpen ? (
              <CloseIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      <div
        ref={mobilePanelRef}
        className="overflow-hidden border-t border-gray-light/60 bg-white lg:hidden"
        style={{ height: mobileOpen ? "auto" : 0 }}
      >
        <nav
          aria-label="Menu mobile"
          className="container-page max-h-(--mobile-nav-max-h) overflow-y-auto overscroll-contain py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          style={{
            ["--mobile-nav-max-h" as string]: `calc(100dvh - ${chromeHeight}px)`,
          }}
        >
          <ul className="flex flex-col gap-1">
            {mainNav.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-2 py-3 text-base font-medium text-foreground hover:bg-[#f7f6f6] hover:text-primary"
                >
                  {item.label}
                </a>
                {item.children && (
                  <ul className="ml-4 mb-2 border-l border-gray-light pl-3">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <a
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-md px-2 py-2 text-sm text-gray-medium hover:text-primary"
                        >
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li className="mt-2 flex flex-col gap-2 pt-2">
              <a
                href="#contato"
                onClick={() => setMobileOpen(false)}
                className="rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-white"
                {...mobileCta.handlers}
              >
                <RollingText text="Solicitar um Orçamento" active={mobileCta.active} />
              </a>
              <Link
                href="https://colaborador.dimensaogrupo.com.br"
                target="_blank"
                className="px-2 py-2 text-center text-sm text-gray-medium hover:text-primary"
              >
                Área do Colaborador
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
