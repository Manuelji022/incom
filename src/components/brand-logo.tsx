const LEAVES = [
  { y: 9, length: 7 },
  { y: 15, length: 9 },
  { y: 21, length: 10.5 },
  { y: 27, length: 12 },
];

// Leaves grow out from the stem at 50° from vertical, so each centre sits half a leaf away along that line.
const SIN = Math.sin((50 * Math.PI) / 180);
const COS = Math.cos((50 * Math.PI) / 180);

function OliveMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 32" fill="currentColor" className={className}>
      <rect x="11.4" y="5" width="1.2" height="27" rx="0.6" />
      <ellipse cx="12" cy="4" rx="1.7" ry="3.6" />
      {LEAVES.map(({ y, length }) => {
        const dx = (length / 2) * SIN;
        const cy = y - (length / 2) * COS;
        const ry = length / 5.5;
        return (
          <g key={y}>
            <ellipse cx={12 - dx} cy={cy} rx={length / 2} ry={ry} transform={`rotate(40 ${12 - dx} ${cy})`} />
            <ellipse cx={12 + dx} cy={cy} rx={length / 2} ry={ry} transform={`rotate(-40 ${12 + dx} ${cy})`} />
          </g>
        );
      })}
    </svg>
  );
}

export function BrandLogo() {
  return (
    <span className="flex items-center gap-2 sm:gap-2.5">
      <OliveMark className="h-7 w-5 shrink-0 text-brand-foreground sm:h-8 sm:w-6" />
      <span className="font-sans text-[0.8125rem] leading-none font-medium tracking-[0.16em] uppercase sm:text-base sm:tracking-[0.28em]">
        Olive Capital
      </span>
    </span>
  );
}
