"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Locale } from "@/lib/locales";
import type { LanguageChangeResult } from "@/components/language-switcher";

type HeaderProps = {
  locale: Locale;
  languageLabel: string;
  themeLabel: string;
  stale: boolean;
  staleText: string;
  onBeforeLanguageChange: (nextLocale: Locale) => LanguageChangeResult;
  submitting: boolean;
  languageHandoffText: { pending: string; storage: string };
};

export function Header({
  locale,
  languageLabel,
  themeLabel,
  stale,
  staleText,
  onBeforeLanguageChange,
  submitting,
  languageHandoffText,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);
  const menuId = useId();
  const text = locale === "es"
    ? { open: "Abrir menú", close: "Cerrar menú", navigation: "Navegación", calculators: "Calculadoras", projection: "Proyección", projectionDetail: "Planifica tu objetivo de inversión", compound: "Interés compuesto", compoundDetail: "Descubre cómo crece tu inversión", portfolio: "Cartera", balancing: "Equilibrio de cartera", balancingDetail: "Revisa y ajusta tu distribución" }
    : { open: "Open menu", close: "Close menu", navigation: "Navigation", calculators: "Calculators", projection: "Projection", projectionDetail: "Plan your investment target", compound: "Compound interest", compoundDetail: "See how your investment could grow", portfolio: "Portfolio", balancing: "Portfolio balancing", balancingDetail: "Review and rebalance your allocation" };
  const cards = [
    { title: text.calculators, links: [
      { label: text.projection, detail: text.projectionDetail, href: `/${locale}?mode=target` },
      { label: text.compound, detail: text.compoundDetail, href: `/${locale}?mode=projection` },
    ] },
    { title: text.portfolio, links: [
      { label: text.balancing, detail: text.balancingDetail, href: `/${locale}/portfolio` },
    ] },
  ];

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [menuOpen]);

  const closeMenu = () => menuRef.current?.close();

  return (
    <header className="grid min-h-16 w-full grid-cols-[1fr_auto] items-center gap-3 border-b border-border-subtle bg-page px-4 py-3 text-primary-foreground sm:min-h-[72px] sm:grid-cols-[1fr_auto_1fr] sm:px-6">
      <Link
        className="rounded-xs font-sans text-[15px] leading-none font-bold tracking-[-0.045em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-border-focus"
        href={`/${locale}`}
      >
        INCOM
      </Link>
      {stale ? (
        <p
          role="status"
          className="col-span-2 row-start-2 text-center text-xs text-secondary-foreground sm:col-span-1 sm:col-start-2 sm:row-start-1"
        >
          {staleText}
        </p>
      ) : null}
      <div className="flex min-w-0 items-center gap-2 sm:col-start-3 sm:justify-self-end sm:gap-3">
        <LanguageSwitcher
          locale={locale}
          label={languageLabel}
          onBeforeLanguageChange={onBeforeLanguageChange}
          submitting={submitting}
          handoffText={languageHandoffText}
        />
        <ThemeToggle label={themeLabel} />
        <button
          type="button"
          aria-label={text.open}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-haspopup="dialog"
          className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-transparent-hover"
          onClick={() => {
            menuRef.current?.showModal();
            setMenuOpen(true);
          }}
        >
          <span aria-hidden="true" className="size-6 bg-current mask-[url('/assets/svgs/hamburger.svg')] mask-contain mask-center mask-no-repeat" />
        </button>
      </div>
      <dialog
        ref={menuRef}
        id={menuId}
        aria-labelledby={`${menuId}-title`}
        className="fixed inset-y-0 end-0 start-auto m-0 h-dvh max-h-none w-full max-w-[30rem] overflow-y-auto overscroll-contain border-s border-border-default bg-page p-0 text-primary-foreground shadow-extra-large backdrop:bg-black/40"
        onClose={() => setMenuOpen(false)}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeMenu();
        }}
      >
        <div className="flex min-h-full flex-col">
          <div className="flex min-h-[72px] items-center justify-between gap-4 border-b border-border-subtle px-5 py-3 sm:px-6">
            <h2 id={`${menuId}-title`} className="font-mono text-xs uppercase tracking-widest">{text.navigation}</h2>
            <button type="button" onClick={closeMenu} className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-transparent-hover">
              {text.close}
              <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="m6 6 12 12M6 18 18 6" />
              </svg>
            </button>
          </div>
          <nav aria-label={text.navigation} className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
            {cards.map((card, index) => (
              <section key={card.title} aria-labelledby={`${menuId}-card-${index}`} className={`rounded-xl border p-5 sm:p-6 ${index === 0 ? "border-border-default bg-container" : "border-transparent bg-brand-solid text-on-brand-solid-foreground"}`}>
                <div className="mb-8 flex items-start justify-between gap-4">
                  <h3 id={`${menuId}-card-${index}`} className="text-[clamp(1.75rem,7vw,2.5rem)] leading-tight font-medium tracking-tight">{card.title}</h3>
                  <span aria-hidden="true" className="pt-2 font-mono text-xs">0{index + 1}</span>
                </div>
                <ul>
                  {card.links.map((link) => (
                    <li key={link.href} className="border-t border-current/20">
                      <Link href={link.href} onNavigate={closeMenu} className="flex min-h-20 items-center justify-between gap-4 rounded-xs py-4 underline-offset-4 hover:underline">
                        <span>
                          <span className="block text-xl leading-tight font-medium tracking-tight sm:text-2xl">{link.label}</span>
                          <span className="mt-2 block text-sm leading-relaxed">{link.detail}</span>
                        </span>
                        <svg aria-hidden="true" className="shrink-0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M5 19 19 5M5 5h14v14" />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </div>
      </dialog>
    </header>
  );
}
