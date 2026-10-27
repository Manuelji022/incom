import { notFound } from "next/navigation";
import { PortfolioTracker } from "@/features/portfolio-rebalancing/components/portfolio-tracker";
import { getDictionary } from "@/lib/i18n";
import { hasLocale } from "@/lib/locales";

export default async function PortfolioPage({ params }: PageProps<"/[lang]/portfolio">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const text = getDictionary(lang);
  return <PortfolioTracker locale={lang} copy={text.portfolio} languageLabel={text.language} themeLabel={text.theme} />;
}
