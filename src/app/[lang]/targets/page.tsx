import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { TargetPlanner } from "@/features/compound-calculator/components/target-planner";
import { getDictionary } from "@/lib/i18n";
import { getTargetText } from "@/features/compound-calculator/lib/target-i18n";
import { hasLocale } from "@/lib/locales";

export default async function Targets({ params }: PageProps<"/[lang]/targets">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const text = getDictionary(lang);
  return <div className="flex min-h-svh flex-col bg-page">
    <TargetPlanner locale={lang} text={text} targetText={getTargetText(lang)} />
    <Footer label={text.footer} />
  </div>;
}
