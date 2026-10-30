// Leaves alternate up a gently curving stem, longest at the base; angles are in degrees from the +x axis.
const LEAVES = [
  { x: 15.27, y: 29.48, angle: -141.6, length: 9 },
  { x: 14.07, y: 25.96, angle: -67.8, length: 8.5 },
  { x: 12.94, y: 22.14, angle: -135.2, length: 8.5 },
  { x: 11.96, y: 18.06, angle: -63.8, length: 7.5 },
  { x: 11.26, y: 14.05, angle: -125.8, length: 7 },
  { x: 10.88, y: 10.18, angle: -59.5, length: 5.5 },
  { x: 10.79, y: 6.93, angle: -88.8, length: 6 },
];

// Each olive hangs from a short pedicel in the gap between two leaves on the same side.
const OLIVES = [
  { x: 13.78, y: 25.03, cx: 11.87, cy: 23.26, angle: -137.2 },
  { x: 12.68, y: 21.14, cx: 13.63, cy: 18.72, angle: -68.4 },
  { x: 11.8, y: 17.27, cx: 10.16, cy: 15.25, angle: -129 },
];

// A pointed, slightly fuller-at-the-base leaf drawn along +x from the origin.
function leafPath(length: number) {
  const w = length * 0.14;
  const r = (n: number) => +n.toFixed(2);
  return `M0 0C${r(length * 0.3)} ${r(-w)} ${r(length * 0.7)} ${r(-w * 0.85)} ${length} 0C${r(length * 0.7)} ${r(w * 0.85)} ${r(length * 0.3)} ${r(w)} 0 0Z`;
}

function OliveMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 32" fill="currentColor" className={className}>
      <path d="M16 31.5C13.6 25 10.6 16 10.8 6.5" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />
      {LEAVES.map(({ x, y, angle, length }) => (
        <path key={`${x}-${y}`} d={leafPath(length)} transform={`translate(${x} ${y}) rotate(${angle})`} />
      ))}
      {OLIVES.map(({ x, y, cx, cy, angle }) => (
        <g key={`${cx}-${cy}`}>
          <path d={`M${x} ${y}L${cx} ${cy}`} stroke="currentColor" strokeWidth="0.55" />
          <ellipse cx={cx} cy={cy} rx="1.5" ry="1.1" transform={`rotate(${angle} ${cx} ${cy})`} />
        </g>
      ))}
    </svg>
  );
}

export function BrandLogo() {
  return (
    <span className="flex items-center gap-2 sm:gap-2.5">
      {/* Negative end margin cancels the tracking added after the last letter, keeping the gap to the mark even. */}
      <span className="-me-[0.16em] font-sans text-[0.8125rem] leading-none font-medium tracking-[0.16em] uppercase sm:-me-[0.28em] sm:text-base sm:tracking-[0.28em]">
        Olive Capital
      </span>
      <OliveMark className="h-7 w-5 shrink-0 text-brand-foreground sm:h-8 sm:w-6" />
    </span>
  );
}
