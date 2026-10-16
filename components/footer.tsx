export function Footer() {
  return (
    <footer className="flex h-[67px] w-full shrink-0 items-center justify-center bg-page text-primary-foreground">
      <p className="m-0 font-mono text-code">
        Designed by{" "}
        <a
          className="rounded-xs underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-border-focus"
          href="https://manuelji.dev/"
        >
          Manuelji
        </a>
      </p>
    </footer>
  );
}
