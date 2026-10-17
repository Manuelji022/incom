"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { Locale } from "@/lib/locales";

type LanguageSwitcherProps = {
  locale: Locale;
  label: string;
};

function isLocale(value: string): value is Locale {
  return value === "en" || value === "es";
}

export function LanguageSwitcher({ locale, label }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const shouldFocusMain = useRef(false);

  useEffect(() => {
    if (!shouldFocusMain.current) return;
    shouldFocusMain.current = false;
    document.getElementById("main-content")?.focus();
  }, [pathname]);

  function changeLanguage(nextLocale: Locale) {
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
    <label className="flex items-center gap-2 text-sm text-secondary-foreground">
      <span className="sr-only sm:not-sr-only">{label}</span>
      <select
        aria-label={label}
        value={locale}
        onChange={(event) => handleChange(event.currentTarget.value)}
        className="min-h-10 rounded border border-control-border bg-container px-2 py-1 text-base text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border-focus"
      >
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </label>
  );
}
