import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { absoluteUrl, site } from "@/config/site";

export const metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.nameEn,
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: site.keywords,
  category: "technology",
  authors: [{ name: site.nameEn, url: site.url }],
  creator: site.nameEn,
  publisher: site.nameEn,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", type: "image/png", sizes: "512x512" },
      { url: "/icon.png?v=3", type: "image/png", sizes: "512x512" },
      { url: "/icon.png?v=3", type: "image/png", sizes: "192x192" },
    ],
    shortcut: [{ url: "/favicon.ico?v=3", type: "image/png" }],
    apple: [{ url: "/apple-icon.png?v=3", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.nameEn,
    title: site.name,
    description: site.description,
    url: site.url,
    images: [
      {
        url: absoluteUrl(site.defaultOgImage),
        width: 1200,
        height: 630,
        alt: `${site.name} | ${site.nameEn}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: [absoluteUrl(site.defaultOgImage)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.nameEn,
  alternateName: site.name,
  url: site.url,
  logo: absoluteUrl(site.defaultOgImage),
  contactPoint: [
    {
      "@type": "ContactPoint",
      email: site.supportEmail,
      contactType: "customer support",
      availableLanguage: ["Arabic", "English"],
    },
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.nameEn,
  alternateName: site.name,
  url: site.url,
  inLanguage: site.language,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2700475642561219"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Navbar />
        <main className="min-h-screen pt-16">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}




