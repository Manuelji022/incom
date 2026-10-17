export function Footer({ label }: { label: string }) {
  return (
    <footer className="flex min-h-[67px] w-full shrink-0 items-center justify-center bg-page px-4 py-4 text-center text-primary-foreground">
      <p className="m-0 font-mono text-code">
        {label}{" "}
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
