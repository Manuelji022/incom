"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { locales, type Locale } from "@/lib/locales";

type LanguageSwitcherProps = {
  locale: Locale;
  label: string;
  onBeforeLanguageChange: (nextLocale: Locale) => LanguageChangeResult;
  submitting: boolean;
  handoffText: { pending: string; storage: string };
};

export type LanguageChangeResult =
  | { status: "saved" }
  | { status: "pending" }
  | { status: "storage" };

export function LanguageSwitcher({ locale, label, onBeforeLanguageChange, submitting, handoffText }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const shouldFocusMain = useRef(false);
  const [handoffError, setHandoffError] = useState<"pending" | "storage" | null>(null);

  useEffect(() => {
    if (!shouldFocusMain.current) return;
    shouldFocusMain.current = false;
    document.getElementById("main-content")?.focus();
  }, [pathname]);

  function changeLanguage(nextLocale: Locale) {
    if (nextLocale === locale) return;

    const result = onBeforeLanguageChange(nextLocale);
    if (result.status !== "saved") {
      setHandoffError(result.status);
      return;
    }
    setHandoffError(null);
    shouldFocusMain.current = true;
    const secureAttribute = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `incom-locale=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax${secureAttribute}`;

    const localePrefix = new RegExp(`^/(${locales.join("|")})(?=/|$)`);
    const suffix = pathname.replace(localePrefix, "") || "/";
    const query = window.location.search;
    router.push(`/${nextLocale}${suffix}${query}${location.hash}`);
  }

  return (
    <div className="relative">
      <div
        aria-label={label}
        className="flex items-center gap-1 font-mono text-code-sm"
        role="group"
      >
        <button
          aria-label="English"
          aria-pressed={locale === "en"}
          className={`min-h-10 min-w-10 rounded-sm px-2 py-2 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border-focus ${locale === "en" ? "text-primary-foreground" : "text-secondary-foreground"}`}
          onClick={() => changeLanguage("en")}
          type="button"
        >
          EN
        </button>
        <button
          aria-label="Español"
          aria-pressed={locale === "es"}
          className={`min-h-10 min-w-10 rounded-sm px-2 py-2 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border-focus ${locale === "es" ? "text-primary-foreground" : "text-secondary-foreground"}`}
          onClick={() => changeLanguage("es")}
          type="button"
        >
          ES
        </button>
      </div>
      {handoffError === "storage" || (handoffError === "pending" && submitting) ? (
        <span
          role="alert"
          className="absolute end-0 top-full z-30 mt-1 w-64 rounded border border-danger-border-default bg-container p-2 text-xs text-danger-foreground"
        >
          {handoffError === "pending" ? handoffText.pending : handoffText.storage}
        </span>
      ) : null}
    </div>
  );
}
