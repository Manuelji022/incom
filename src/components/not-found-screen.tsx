"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

const copy = {
  en: {
    language: "Language",
    theme: "Toggle light and dark theme",
    skip: "Skip to main content",
    handoffPending: "Wait for the calculation to finish before changing language.",
    handoffStorage: "Your changes could not be saved. Please try again.",
    eyebrow: "Error 404 · Route not found",
    title: "Page not found.",
    description:
      "We couldn’t find the page you’re looking for. Let’s get you back to your projection.",
    action: "Return to calculator",
    chartTitle: "Projection status",
    chartStatus: "No route",
    chartDescription: "The path ends here",
    footer: "Designed by",
  },
  es: {
    language: "Idioma",
    theme: "Cambiar entre tema claro y oscuro",
    skip: "Saltar al contenido principal",
    handoffPending: "Espera a que termine el cálculo antes de cambiar el idioma.",
    handoffStorage: "No se pudieron conservar los cambios. Inténtalo de nuevo.",
    eyebrow: "Error 404 · Ruta no encontrada",
    title: "Página no encontrada.",
    description:
      "No encontramos la página que buscas. Volvamos a tu proyección.",
    action: "Volver a la calculadora",
    chartTitle: "Estado de la proyección",
    chartStatus: "Sin ruta",
    chartDescription: "El camino termina aquí",
    footer: "Diseñado por",
  },
} as const;

export function NotFoundScreen({ includeSkipLink = false }: { includeSkipLink?: boolean }) {
  const pathname = usePathname() ?? "";
  const locale = pathname.split("/")[1] === "es" ? "es" : "en";
  const text = copy[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <div className="flex min-h-svh flex-col bg-page text-primary-foreground">
      {includeSkipLink ? (
        <a
          className="sr-only fixed start-4 top-4 z-50 rounded-md bg-container px-4 py-3 text-base text-primary-foreground focus:not-sr-only focus:outline-2 focus:outline-offset-2 focus:outline-brand-border-focus"
          href="#main-content"
        >
          {text.skip}
        </a>
      ) : null}
      <Header
        locale={locale}
        languageLabel={text.language}
        themeLabel={text.theme}
        stale={false}
        staleText=""
        onBeforeLanguageChange={() => ({ status: "saved" })}
        submitting={false}
        languageHandoffText={{
          pending: text.handoffPending,
          storage: text.handoffStorage,
        }}
      />

      <main
        className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-5 py-12 sm:px-8 md:py-16 lg:grid-cols-[1fr_0.95fr] lg:gap-20 lg:px-12"
        id="main-content"
        tabIndex={-1}
      >
        <section className="max-w-2xl">
          <p className="mb-4 font-mono text-code-sm font-medium tracking-[0.12em] text-brand-foreground uppercase">
            {text.eyebrow}
          </p>
          <span
            aria-hidden="true"
            className="block font-sans text-[clamp(7rem,24vw,17rem)] leading-[0.78] font-bold tracking-[-0.095em] text-primary-foreground"
          >
            404
          </span>
          <h1 className="mt-8 text-heading-3 font-semibold tracking-[-0.04em] sm:text-heading-2">
            {text.title}
          </h1>
          <p className="mt-4 max-w-lg text-body-sm text-secondary-foreground sm:text-body">
            {text.description}
          </p>
          <Link
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-md border border-transparent bg-brand-solid px-5 py-3 text-sm font-semibold text-on-brand-solid-foreground transition-colors hover:bg-brand-solid-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border-focus"
            href={`/${locale}`}
          >
            {text.action}
            <svg
              aria-hidden="true"
              className="size-4"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                d="M3.5 10h12m-5-5 5 5-5 5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>
          </Link>
        </section>

        <section
          aria-label={text.chartTitle}
          className="w-full overflow-hidden rounded-xl border border-border-default bg-container p-4 shadow-default sm:p-6"
        >
          <div className="flex items-start justify-between gap-3 border-b border-border-subtle pb-4">
            <h2 className="text-sm font-semibold">{text.chartTitle}</h2>
            <span className="rounded-sm bg-brand-subtle px-2 py-1 font-mono text-code-xs font-medium text-brand-foreground uppercase">
              404
            </span>
          </div>
          <div className="py-5 sm:py-8">
            <svg
              aria-hidden="true"
              className="h-auto w-full text-tertiary-foreground"
              fill="none"
              viewBox="0 0 440 250"
            >
              <path
                d="M36 20v190h380"
                stroke="currentColor"
                strokeOpacity=".22"
              />
              <path
                d="M36 164h380M36 116h380M36 68h380"
                stroke="currentColor"
                strokeOpacity=".12"
                strokeDasharray="3 7"
              />
              <path
                d="M38 185c35-2 38-30 70-31s36 15 67 5 41-57 72-54 42 30 68 5 30-40 47-47"
                stroke="var(--chart-balance)"
                strokeLinecap="round"
                strokeWidth="3"
              />
              <path
                d="m363 63 44-30"
                stroke="var(--chart-balance)"
                strokeDasharray="5 7"
                strokeLinecap="round"
                strokeWidth="3"
              />
              <circle cx="362" cy="63" r="6" fill="var(--chart-balance)" />
              <circle
                cx="408"
                cy="32"
                r="6"
                fill="var(--container)"
                stroke="var(--chart-balance)"
                strokeDasharray="2 3"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
            <span className="flex items-center gap-2 text-sm text-secondary-foreground">
              <span aria-hidden="true" className="size-2 rounded-full bg-brand-solid" />
              {text.chartDescription}
            </span>
            <span className="font-mono text-code-sm font-medium text-brand-foreground uppercase">
              {text.chartStatus}
            </span>
          </div>
        </section>
      </main>

      <Footer label={text.footer} />
    </div>
  );
}
