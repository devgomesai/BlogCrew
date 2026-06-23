import type { ReactNode } from "react";
import { Newsreader } from "next/font/google";
import "./blog.css";

// Fraunces (--font-fraunces) and IBM Plex Mono (--font-plex-mono) are loaded
// in the root layout and inherited here; only the reading serif is local.
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  display: "swap",
});

export default function BlogsLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`blog-shell ${newsreader.variable}`}>{children}</div>
  );
}
