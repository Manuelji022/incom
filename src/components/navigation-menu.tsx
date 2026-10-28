"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { Locale } from "@/lib/locales";

function MenuIcon() {
  return (
    <svg aria-hidden="true" className="menu-icon" viewBox="-10 -10 120 120" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
      <path className="line" d="m 20 40 h 60 a 1 1 0 0 1 0 20 h -60 a 1 1 0 0 1 0 -40 h 30 v 70" />
    </svg>
  );
}

export function NavigationMenu({ locale }: { locale: Locale }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);
  const menuId = useId();
  const text = locale === "es"
    ? { open: "Abrir menú", close: "Cerrar menú", calculators: "Calculadoras", projection: "Proyección", projectionDetail: "Planifica tu objetivo de inversión", compound: "Interés compuesto", compoundDetail: "Descubre cómo crece tu inversión", portfolio: "Cartera", balancing: "Equilibrio de cartera", balancingDetail: "Revisa y ajusta tu distribución" }
    : { open: "Open menu", close: "Close menu", calculators: "Calculators", projection: "Projection", projectionDetail: "Plan your investment target", compound: "Compound interest", compoundDetail: "See how your investment could grow", portfolio: "Portfolio", balancing: "Portfolio balancing", balancingDetail: "Review and rebalance your allocation" };
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
    <>
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
        <MenuIcon />
      </button>
      <dialog
        ref={menuRef}
        id={menuId}
        className="navigation-dialog fixed inset-y-0 end-0 start-auto m-0 h-dvh max-h-none w-full max-w-[30rem] overflow-y-auto overscroll-contain border-0 bg-transparent p-0 text-primary-foreground shadow-none backdrop:bg-black/40"
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
            <button type="button" aria-label={text.close} onClick={closeMenu} className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-transparent-hover">
              <MenuIcon />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
            {cards.map((card, index) => (
              <section key={card.title} aria-labelledby={`${menuId}-card-${index}`} className="rounded-xl border border-border-default bg-container p-5 sm:p-6">
                <div className="mb-8 flex items-start justify-between gap-4">
                  <h3 id={`${menuId}-card-${index}`} className="text-[clamp(1.75rem,7vw,2.5rem)] leading-tight font-medium tracking-tight">{card.title}</h3>
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
    </>
  );
}
