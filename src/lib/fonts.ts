import localFont from "next/font/local";

const geist = localFont({
  src: "../app/fonts/Geist-VariableFont.woff2",
  variable: "--font-geist",
  weight: "100 900",
  display: "swap",
});

// Static Regular and Italic cuts: only weight 400 exists, so don't use font-display with other weights.
const newsreader = localFont({
  src: [
    { path: "../app/fonts/newsreader.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/newsreader-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-newsreader",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

export const fontVariables = `${geist.variable} ${newsreader.variable}`;
