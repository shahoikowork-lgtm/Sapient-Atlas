import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Editorial serif for headlines and the considered "read" voice.
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
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
