"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { calculatorModeSessionKey, type CalculatorMode } from "@/features/compound-calculator/lib/calculator-mode";
import type { Locale } from "@/lib/locales";

function MenuIcon() {
  return (
    <svg aria-hidden="true" className="menu-icon" viewBox="-10 -10 120 120" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
      <path className="line" d="m 20 40 h 60 a 1 1 0 0 1 0 20 h -60 a 1 1 0 0 1 0 -40 h 30 v 70" />
    </svg>
  );
}

function CalculatorIcon() {
  return (
    <svg aria-hidden="true" className="shrink-0" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" />
    </svg>
  );
}

function AllocationIcon() {
  return (
    <svg aria-hidden="true" className="shrink-0" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a9 9 0 1 0 9 9h-9Z" />
      <path d="M15 3.5A9 9 0 0 1 20.5 9H15Z" />
    </svg>
  );
}

// Resolve the current destination the same way the pages do: the calculator
// falls back to the mode saved for this tab when the URL doesn't name one.
function getCurrentHref(locale: Locale) {
  const { pathname, search } = window.location;
  if (pathname === `/${locale}/portfolio`) return pathname;
  if (pathname !== `/${locale}`) return null;
  const requestedMode = new URLSearchParams(search).get("mode");
  let mode: CalculatorMode = "projection";
  if (requestedMode === "projection" || requestedMode === "target") mode = requestedMode;
  else {
    try { if (sessionStorage.getItem(calculatorModeSessionKey) === "target") mode = "target"; } catch { /* Default to projection. */ }
  }
  return `/${locale}?mode=${mode}`;
}

export function NavigationMenu({ locale }: { locale: Locale }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentHref, setCurrentHref] = useState<string | null>(null);
  const menuRef = useRef<HTMLDialogElement>(null);
  const menuId = useId();
  const text = locale === "es"
    ? { menu: "Menú", open: "Abrir menú", close: "Cerrar menú", calculators: "Calculadoras", projection: "Proyección", projectionDetail: "Planifica tu objetivo de inversión", compound: "Interés compuesto", compoundDetail: "Descubre cómo crece tu inversión", portfolio: "Cartera", balancing: "Equilibrio de cartera", balancingDetail: "Revisa y ajusta tu distribución" }
    : { menu: "Menu", open: "Open menu", close: "Close menu", calculators: "Calculators", projection: "Projection", projectionDetail: "Plan your investment target", compound: "Compound interest", compoundDetail: "See how your investment could grow", portfolio: "Portfolio", balancing: "Portfolio balancing", balancingDetail: "Review and rebalance your allocation" };
  const cards = [
    { title: text.calculators, icon: <CalculatorIcon />, links: [
      { label: text.projection, detail: text.projectionDetail, href: `/${locale}?mode=target` },
      { label: text.compound, detail: text.compoundDetail, href: `/${locale}?mode=projection` },
    ] },
    { title: text.portfolio, icon: <AllocationIcon />, links: [
      { label: text.balancing, detail: text.balancingDetail, href: `/${locale}/portfolio` },
    ] },
  ];

  useEffect(() => {
    if (!menuOpen) return;
    const root = document.documentElement;
    const previousOverflow = document.body.style.overflow;
    const previousGutter = root.style.scrollbarGutter;
    // Hiding overflow removes the page scrollbar; keep its gutter so the
    // content doesn't shift sideways when the menu opens and closes.
    if (window.innerWidth > root.clientWidth) root.style.scrollbarGutter = "stable";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      root.style.scrollbarGutter = previousGutter;
    };
  }, [menuOpen]);

  const closeMenu = () => menuRef.current?.close();

  return (
    <>
      <button
        type="button"
        aria-label={text.open}
        aria-expanded={menuOpen}
        aria-controls={menuId}
        aria-haspopup="dialog"
        className="navigation-trigger inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border-focus"
        onClick={() => {
          setCurrentHref(getCurrentHref(locale));
          menuRef.current?.showModal();
          setMenuOpen(true);
        }}
      >
        <MenuIcon />
      </button>
      <dialog
        ref={menuRef}
        id={menuId}
        aria-label={text.menu}
        className="navigation-dialog fixed inset-y-0 end-0 start-auto m-0 h-dvh max-h-none w-full max-w-[30rem] overflow-x-hidden overflow-y-auto overscroll-contain border-0 bg-transparent p-0 text-primary-foreground shadow-none"
        onClose={() => setMenuOpen(false)}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeMenu();
        }}
      >
        <div className="flex min-h-full flex-col">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:min-h-[72px] sm:px-6">
            <span aria-hidden="true" />
            <button type="button" aria-label={text.close} onClick={closeMenu} className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border-focus">
              <MenuIcon />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
            {cards.map((card, index) => (
              <section key={card.title} aria-labelledby={`${menuId}-card-${index}`} style={{ "--i": index } as CSSProperties} className="navigation-card rounded-xl border border-border-default bg-container p-5 sm:p-6">
                <div className="mb-8 flex items-start justify-between gap-4">
                  <h3 id={`${menuId}-card-${index}`} className="text-[clamp(1.75rem,7vw,2.5rem)] leading-tight font-medium tracking-tight">{card.title}</h3>
                  <span className="mt-1 text-tertiary-foreground">{card.icon}</span>
                </div>
                <ul>
                  {card.links.map((link) => {
                    const current = link.href === currentHref;
                    return (
                      <li key={link.href} className="border-t border-current/20">
                        <Link
                          href={link.href}
                          onNavigate={closeMenu}
                          aria-current={current ? "page" : undefined}
                          className={`group flex min-h-20 items-center justify-between gap-4 rounded-xs py-4 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border-focus ${current ? "" : "hover:underline"}`}
                        >
                          <span>
                            <span className="flex items-center gap-2.5 text-xl leading-tight font-medium tracking-tight sm:text-2xl">
                              {current ? <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-brand-solid" /> : null}
                              {link.label}
                            </span>
                            <span className="mt-2 block text-sm leading-relaxed">{link.detail}</span>
                          </span>
                          <svg aria-hidden="true" className={`shrink-0 transition-[translate] duration-200 ease-out motion-reduce:transition-none ${current ? "text-brand-foreground" : "group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5"}`} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={current ? 2 : 1.5}>
                            <path d="M5 19 19 5M5 5h14v14" />
                          </svg>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </nav>
        </div>
      </dialog>
    </>
  );
}
