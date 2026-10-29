import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { fontVariables } from "@/lib/fonts";
import { getDictionary } from "@/lib/i18n";
import { hasLocale, locales } from "@/lib/locales";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}
export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const text = getDictionary(lang);
  return {
    title: text.metadata.title,
    description: text.metadata.description,
    alternates: { languages: { en: "/en", es: "/es" } },
  };
}
export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <html lang={lang} className={fontVariables} suppressHydrationWarning>
      <body>
        <a className="sr-only fixed start-4 top-4 z-50 rounded-md bg-container px-4 py-3 text-base text-primary-foreground focus:not-sr-only focus:outline-2 focus:outline-offset-2 focus:outline-brand-border-focus" href="#main-content">
          {lang === "es" ? "Saltar al contenido principal" : "Skip to main content"}
        </a>
        {children}
        <Script
          id="incom-theme-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var theme=localStorage.getItem("incom-theme");if(theme==="light"||theme==="dark"){document.documentElement.classList.add(theme)}}catch{}`,
          }}
        />
      </body>
    </html>
  );
}
