"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { NavigationMenu } from "@/components/navigation-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Locale } from "@/lib/locales";
import type { LanguageChangeResult } from "@/components/language-switcher";

type HeaderProps = {
  locale: Locale;
  languageLabel: string;
  themeLabel: string;
  stale: boolean;
  staleText: string;
  onBeforeLanguageChange: (nextLocale: Locale) => LanguageChangeResult;
  submitting: boolean;
  languageHandoffText: { pending: string; storage: string };
};

export function Header({
  locale,
  languageLabel,
  themeLabel,
  stale,
  staleText,
  onBeforeLanguageChange,
  submitting,
  languageHandoffText,
}: HeaderProps) {
  return (
    <header className="grid min-h-16 w-full grid-cols-[1fr_auto] items-center gap-3 border-b border-border-subtle bg-page px-4 py-3 text-primary-foreground sm:min-h-[72px] sm:grid-cols-[1fr_auto_1fr] sm:px-6">
      <Link
        className="rounded-xs font-sans text-[15px] leading-none font-bold tracking-[-0.045em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-border-focus"
        href={`/${locale}`}
      >
        INCOM
      </Link>
      {stale ? (
        <p
          role="status"
          className="col-span-2 row-start-2 text-center text-xs text-secondary-foreground sm:col-span-1 sm:col-start-2 sm:row-start-1"
        >
          {staleText}
        </p>
      ) : null}
      <div className="flex min-w-0 items-center gap-2 sm:col-start-3 sm:justify-self-end sm:gap-3">
        <LanguageSwitcher
          locale={locale}
          label={languageLabel}
          onBeforeLanguageChange={onBeforeLanguageChange}
          submitting={submitting}
          handoffText={languageHandoffText}
        />
        <ThemeToggle label={themeLabel} />
        <NavigationMenu locale={locale} />
      </div>
    </header>
  );
}
