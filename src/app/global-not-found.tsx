import type { Metadata } from "next";
import "./globals.css";
import { NotFoundScreen } from "@/components/not-found-screen";

export const metadata: Metadata = {
  title: "404 | Olive Capital",
  description: "The page you’re looking for could not be found.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NotFoundScreen includeSkipLink />
      </body>
    </html>
  );
}
