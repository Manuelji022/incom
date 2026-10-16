import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-border-subtle bg-page px-4 text-primary-foreground sm:h-[72px] sm:px-6">
      <span className="font-sans text-[15px] leading-none font-bold tracking-[-0.045em]">
        COMPOUNDING
      </span>
      <ThemeToggle />
    </header>
  );
}
