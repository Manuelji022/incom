import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
