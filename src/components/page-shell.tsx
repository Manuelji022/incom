import type { ReactNode } from "react";

/** Shared page frame: full-width page background, content capped and centered so every page has the same margins. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-page text-primary-foreground">
      <div className="mx-auto flex w-full max-w-[75rem] flex-1 flex-col">{children}</div>
    </div>
  );
}
