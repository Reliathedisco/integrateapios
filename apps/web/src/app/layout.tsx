import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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
        width: 544,
        height: 182,
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
