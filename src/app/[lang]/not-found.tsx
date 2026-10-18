"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { NotFoundScreen } from "@/components/not-found-screen";

export default function LocaleNotFound() {
  const locale = usePathname()?.split("/")[1] === "es" ? "es" : "en";
  const footerLabel = locale === "es" ? "Diseñado por" : "Designed by";

  return <NotFoundScreen footer={<Footer label={footerLabel} />} />;
}
