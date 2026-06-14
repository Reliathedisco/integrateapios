import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SITE_URL, GITHUB_URL, X_URL } from "@/lib/links";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://integrateapios.com"),
  title: {
    default: "IntegrateAPI OS — the AI integration console that keeps your code yours",
    template: "%s · IntegrateAPI OS",
  },
  description:
    "The local-first AI integration console for developers. Connect Stripe, Clerk, Resend, Supabase and more — without uploading your code or surrendering your keys.",
  openGraph: {
    title: "IntegrateAPI OS",
    description:
      "The local-first AI integration console for developers. Your code stays yours.",
    url: "https://integrateapios.com",
    siteName: "IntegrateAPI OS",
    type: "website",
    images: [
      {
        url: "/wordmark.png",
        width: 890,
        height: 115,
        alt: "IntegrateAPI OS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Integrateapi",
    creator: "@Integrateapi",
    title: "IntegrateAPI OS",
    description:
      "The local-first AI integration console for developers. Your code stays yours.",
    images: ["/wordmark.png"],
  },
  robots: { index: true, follow: true },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "IntegrateAPI OS",
      url: SITE_URL,
      logo: `${SITE_URL}/wordmark.png`,
      sameAs: [GITHUB_URL, X_URL],
      founder: {
        "@type": "Person",
        name: "Reli",
      },
      parentOrganization: {
        "@type": "Organization",
        name: "Reli Music LLC",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#site`,
      url: SITE_URL,
      name: "IntegrateAPI OS",
      description:
        "The local-first AI integration console for developers. Your code stays yours.",
      publisher: { "@id": `${SITE_URL}/#org` },
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#app`,
      name: "IntegrateAPI OS",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "macOS, Windows, Linux",
      description:
        "Local-first AI integration console for developers. Plan and connect Stripe, Clerk, Resend, Supabase, and hundreds of other APIs using your own AI provider key — without uploading your code, storing your prompts, or training on your data.",
      url: SITE_URL,
      image: `${SITE_URL}/wordmark.png`,
      publisher: { "@id": `${SITE_URL}/#org` },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/PreOrder",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        {children}
      </body>
    </html>
  );
}
