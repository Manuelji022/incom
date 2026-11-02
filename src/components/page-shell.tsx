import type { ReactNode } from "react";

/** Shared page frame: full-width column. Bands pad themselves with `page-frame` so borders run edge to edge while content shares one capped, centered margin. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-page text-primary-foreground">
      {children}
    </div>
  );
}
