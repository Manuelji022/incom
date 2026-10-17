import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Locale } from "@/lib/locales";

type HeaderProps = {
  locale: Locale;
  languageLabel: string;
  themeLabel: string;
};

export function Header({ locale, languageLabel, themeLabel }: HeaderProps) {
  return (
    <header className="flex min-h-16 w-full flex-wrap items-center justify-between gap-3 border-b border-border-subtle bg-page px-4 py-3 text-primary-foreground sm:min-h-[72px] sm:px-6">
      <span className="font-sans text-[15px] leading-none font-bold tracking-[-0.045em]">
        COMPOUNDING
      </span>
      <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
        <LanguageSwitcher locale={locale} label={languageLabel} />
        <ThemeToggle label={themeLabel} />
      </div>
    </header>
  );
}
