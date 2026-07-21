import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit, Great_Vibes } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { brand } from "@/config/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${brand.name} | Bold Statement Jewelry`,
    template: `%s | ${brand.shortName}`,
  },
  description:
    "Eye-popping jewelry that commands attention. Shop rings, earrings, necklaces and statement pieces from Dazzle Glam Jewelry Collection.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  icons: {
    icon: [
      { url: "/brand/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/brand/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: brand.name,
    title: brand.name,
    description:
      "Sophisticated style. High-glam designs. Jewelry created to amplify your character.",
    images: [{ url: "/brand/logo.png", alt: brand.name }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${outfit.variable} ${greatVibes.variable}`}
    >
      <body className="font-body">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
