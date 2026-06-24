import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, IBM_Plex_Mono, Newsreader } from "next/font/google";
import "./globals.css";

// The Atlas voice: a clean, modern grotesk for UI + headlines (owned, not a starter default).
const hankenSans = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

// The instrument readout: a precise technical mono, used only for small tracked labels.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// The human voice: an editorial serif for the user's own work and considered statements.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const TITLE = "Sapient Atlas: The Art of Becoming Harder to Replace";
const DESCRIPTION =
  "Show Atlas a real piece of your work. It finds the single thing holding it back, shows you the evidence, and tells you whether a 30-day Sprint can fix it.";

export const metadata: Metadata = {
  metadataBase: new URL("https://sapientatlas.com"),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Sapient Atlas",
    type: "website",
  },
};

// Tints the mobile browser UI to the brand indigo (instrument register).
export const viewport: Viewport = {
  themeColor: "#1e2950",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hankenSans.variable} ${plexMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
