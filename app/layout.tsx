import type { Metadata } from "next";
import { ThemeProvider } from "../design-system/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "Elite Listing AI - AI-Powered Etsy Listing Optimizer",
    template: "%s | Elite Listing AI"
  },
  description: "Optimize your Etsy listings with AI. Generate high-converting titles, descriptions, and tags powered by GPT-4. Trusted by thousands of Etsy sellers.",
  keywords: ["Etsy", "listing optimizer", "AI", "GPT-4", "SEO", "e-commerce", "Etsy seller tools"],
  authors: [{ name: "Elite Listing AI" }],
  creator: "Elite Listing AI",
  publisher: "Elite Listing AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://elite-listing-ai.vercel.app",
    title: "Elite Listing AI - AI-Powered Etsy Listing Optimizer",
    description: "Optimize your Etsy listings with AI. Generate high-converting titles, descriptions, and tags powered by GPT-4.",
    siteName: "Elite Listing AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elite Listing AI - AI-Powered Etsy Listing Optimizer",
    description: "Optimize your Etsy listings with AI. Generate high-converting titles, descriptions, and tags powered by GPT-4.",
    creator: "@elitelistingai",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
