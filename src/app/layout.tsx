import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { CurrencyProvider, type Currency } from "@/lib/currency";
import { ThemeProvider } from "@/lib/theme";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { getAlerts, type AppAlert } from "@/lib/alerts";
import { eq } from "drizzle-orm";
import AppHeader from "@/components/AppHeader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.slgestiondesuivie.com"),
  title: "SL GESTION DE SUIVIE — Tableau de bord",
  description:
    "SL Gestion de Suivie : tableau de bord de suivi de l'activité commerciale. Versements, chiffre d'affaires, charges, bilan mensuel, objectifs de fin d'année.",
  keywords: ["SL Gestion de Suivie", "tableau de bord", "gestion de suivi"],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "SL Suivie", statusBarStyle: "black-translucent" },
  icons: {
    icon: [
      { url: "/icons/spl-app-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/spl-app-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/spl-app-192.png", sizes: "192x192", type: "image/png" }],
  },
  openGraph: {
    title: "SL GESTION DE SUIVIE",
    description: "Votre activité. Vos chiffres. Votre succès.",
    url: "https://www.slgestiondesuivie.com",
    siteName: "SL GESTION DE SUIVIE",
    locale: "fr_FR",
    type: "website",
    images: [{ url: "/images/hero-yacht.jpg", width: 1200, height: 630, alt: "SL Gestion de Suivie" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SL GESTION DE SUIVIE",
    description: "Votre activité. Vos chiffres. Votre succès.",
    images: ["/images/hero-yacht.jpg"],
  },
};

export const viewport: Viewport = { themeColor: "#05070c", colorScheme: "dark light" };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SL Gestion de Suivie",
  url: "https://www.slgestiondesuivie.com",
  applicationCategory: "BusinessApplication",
  description: "Cockpit de gestion commerciale et de suivi.",
  inLanguage: "fr-FR",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  let initial: Currency = "EUR";
  let alerts: AppAlert[] = [];
  try {
    const rows = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
    const c = rows[0]?.defaultCurrency;
    if (c === "USD" || c === "XOF") initial = c;
  } catch {
    /* base non prête */
  }
  try {
    alerts = await getAlerts(1);
  } catch {
    alerts = [];
  }
  return (
    <html lang="fr">
      <body className="bg-[#05070c] text-slate-100 antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <ThemeProvider>
          <CurrencyProvider initial={initial}>
            <AppHeader alerts={alerts} />
            {children}
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
