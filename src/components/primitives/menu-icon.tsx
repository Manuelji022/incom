/** Hamburger that morphs into a close cross when its button is expanded or its dialog is open; styled by `.menu-icon` in globals.css. */
export function MenuIcon() {
  return (
    <svg aria-hidden="true" className="menu-icon" viewBox="-10 -10 120 120" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
      <path className="line" d="m 20 40 h 60 a 1 1 0 0 1 0 20 h -60 a 1 1 0 0 1 0 -40 h 30 v 70" />
    </svg>
  );
}
