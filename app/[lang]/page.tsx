import { Header } from "@/components/header";
import { CompoundInputSidebar } from "@/components/compound-input-sidebar";
import { Footer } from "@/components/footer";
import { ProjectionScenarioView } from "@/components/projection-scenario-view";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { hasLocale } from "@/lib/locales";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const text = getDictionary(lang);
  return (
    <div className="flex min-h-svh flex-col bg-page">
      <Header
        locale={lang}
        languageLabel={text.language}
        themeLabel={text.theme}
      />
      <main className="grid flex-1 grid-cols-1 lg:min-h-[65.125rem] lg:grid-cols-[18.25rem_minmax(0,1fr)_19.5rem]">
        <CompoundInputSidebar text={text.sidebar} locale={lang} />
        <ProjectionScenarioView
          locale={lang}
          text={{
            header: text.header,
            chart: text.chart,
            summary: text.summary,
            composition: text.composition,
            scenarios: text.scenarios,
          }}
        />
      </main>
      <Footer label={text.footer} />
    </div>
  );
}
