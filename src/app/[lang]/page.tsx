import { Footer } from "@/components/footer";
import { PageShell } from "@/components/page-shell";
import { ProjectionScenarioView } from "@/features/compound-calculator";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { hasLocale } from "@/lib/locales";
import { getTargetText } from "@/features/compound-calculator/lib/target-i18n";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const text = getDictionary(lang);
  return (
    <PageShell>
      <ProjectionScenarioView
        locale={lang}
        languageLabel={text.language}
        themeLabel={text.theme}
        text={{
          sidebar: text.sidebar,
          header: text.header,
          chart: text.chart,
          summary: text.summary,
          scenarios: text.scenarios,
          unavailable: text.unavailable,
          rateLimited: text.rateLimited,
          invalidInputs: text.invalidInputs,
          staleResults: text.staleResults,
          retry: text.retry,
          validation: text.validation,
          resultsReady: text.resultsReady,
          validationMessages: text.validationMessages,
          sampleData: text.sampleData,
          languageHandoffPending: text.languageHandoffPending,
          languageHandoffStorage: text.languageHandoffStorage,
        }}
        targetText={getTargetText(lang)}
        dictionary={text}
      />
      <Footer label={text.footer} />
    </PageShell>
  );
}
