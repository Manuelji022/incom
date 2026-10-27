import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasLocale, type Locale } from "@/lib/locales";

function preferredLocale(header: string | null): Locale {
  const preferences = (header ?? "")
    .split(",")
    .flatMap((entry, index) => {
      const [tag = "", ...parameters] = entry.trim().split(";");
      const qualityParameter = parameters.find((part) =>
        part.trim().startsWith("q="),
      );
      const quality = qualityParameter
        ? Number(qualityParameter.trim().slice(2))
        : 1;
      return Number.isFinite(quality) && quality > 0 && quality <= 1
        ? [{ tag: tag.toLowerCase(), quality, index }]
        : [];
    })
    .sort((a, b) => b.quality - a.quality || a.index - b.index);
  for (const preference of preferences) {
    if (preference.tag === "*") continue;
    const language = preference.tag.split("-")[0];
    if (language === "en" || language === "es") return language;
  }
  return "en";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (hasLocale(pathname.split("/")[1] ?? ""))
    return NextResponse.next();
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  )
    return NextResponse.next();
  const cookieLocale = request.cookies.get("incom-locale")?.value;
  const locale =
    (cookieLocale && hasLocale(cookieLocale) ? cookieLocale : undefined) ??
    preferredLocale(request.headers.get("accept-language"));
  const destination = request.nextUrl.clone();
  destination.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(destination);
}

export const config = { matcher: ["/((?!_next|api).*)"] };
