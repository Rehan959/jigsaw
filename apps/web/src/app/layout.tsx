import type { Metadata, Viewport } from "next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "JigSaw - AI Knowledge Retrieval Platform",
    template: "%s | JigSaw",
  },
  description: "Transform websites into searchable knowledge bases with AI-powered semantic search. Connect your data to AI assistants via MCP.",
  keywords: ["web scraping", "semantic search", "AI", "knowledge base", "MCP", "embeddings"],
  authors: [{ name: "JigSaw" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jigsaw.dev",
    siteName: "JigSaw",
    title: "JigSaw - AI Knowledge Retrieval Platform",
    description: "Transform websites into searchable knowledge bases with AI-powered semantic search.",
  },
  twitter: {
    card: "summary_large_image",
    title: "JigSaw - AI Knowledge Retrieval Platform",
    description: "Transform websites into searchable knowledge bases with AI-powered semantic search.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col antialiased">
        <Navigation />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
