"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/locales";

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

function isLocale(value: string): value is Locale {
  return value === "en" || value === "es";
}

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
    const result = onBeforeLanguageChange(nextLocale);
    if (result.status !== "saved") {
      setHandoffError(result.status);
      return;
    }
    setHandoffError(null);
    shouldFocusMain.current = true;
    const secureAttribute = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `incom-locale=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax${secureAttribute}`;

    const suffix = pathname.replace(/^\/(en|es)(?=\/|$)/, "") || "/";
    const query = window.location.search;
    router.push(`/${nextLocale}${suffix}${query}${location.hash}`);
  }

  function handleChange(value: string) {
    if (isLocale(value)) changeLanguage(value);
  }

  return (
    <div className="relative flex items-center gap-2 text-sm text-secondary-foreground">
      <span className="sr-only sm:not-sr-only">{label}</span>
      <select
        aria-label={label}
        value={locale}
        onChange={(event) => handleChange(event.currentTarget.value)}
        className="min-h-10 appearance-none rounded border border-control-border bg-container py-1 pe-7 ps-2 sm:pe-9 text-base text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border-focus"
      >
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute end-2 top-1/2 size-4 -translate-y-1/2 bg-current text-secondary-foreground [mask-image:url('/assets/svgs/chevron-down.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] sm:end-3"
      />
      {handoffError === "storage" || (handoffError === "pending" && submitting) ? <span role="alert" className="absolute end-0 top-full z-30 mt-1 w-64 rounded border border-danger-border-default bg-container p-2 text-xs text-danger-foreground">{handoffError === "pending" ? handoffText.pending : handoffText.storage}</span> : null}
    </div>
  );
}
