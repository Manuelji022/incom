import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Locale } from "@/lib/locales";

type HeaderProps = {
  locale: Locale;
  languageLabel: string;
  themeLabel: string;
  stale: boolean;
  staleText: string;
  onBeforeLanguageChange: (nextLocale: Locale) => boolean;
  submitting: boolean;
};

export function Header({ locale, languageLabel, themeLabel, stale, staleText, onBeforeLanguageChange, submitting }: HeaderProps) {
  return (
    <header className="grid min-h-16 w-full grid-cols-[1fr_auto] items-center gap-3 border-b border-border-subtle bg-page px-4 py-3 text-primary-foreground sm:min-h-[72px] sm:grid-cols-[1fr_auto_1fr] sm:px-6">
      <span className="font-sans text-[15px] leading-none font-bold tracking-[-0.045em]">
        COMPOUNDING
      </span>
      <p role={stale ? "status" : undefined} className={`col-span-2 row-start-2 text-center text-xs text-secondary-foreground sm:col-span-1 sm:col-start-2 sm:row-start-1 ${stale ? "" : "hidden"}`}>
        {staleText}
      </p>
      <div className="flex min-w-0 flex-wrap items-center gap-2 sm:col-start-3 sm:justify-self-end sm:gap-3">
        <LanguageSwitcher locale={locale} label={languageLabel} onBeforeLanguageChange={onBeforeLanguageChange} submitting={submitting} />
        <ThemeToggle label={themeLabel} />
      </div>
    </header>
  );
}
