import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "JigSaw - AI Knowledge Retrieval Platform",
    template: "%s | JigSaw",
  },
  description: "Transform websites into searchable knowledge bases with AI-powered semantic search. Connect your data to AI assistants via MCP.",
  keywords: [
    "jigsaw", "JigSaw", "AI", "knowledge base", "web scraping",
    "semantic search", "embeddings", "MCP", "vector database",
    "Pinecone", "OpenAI", "Playwright",
  ],
  authors: [{ name: "JigSaw" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jigsaw.dev",
    siteName: "JigSaw",
    title: "JigSaw - AI Knowledge Retrieval Platform",
    description: "Transform websites into searchable knowledge bases with AI-powered semantic search.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "JigSaw product preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JigSaw - AI Knowledge Retrieval Platform",
    description: "Transform websites into searchable knowledge bases with AI-powered semantic search.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen bg-background font-sans antialiased`}>
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
