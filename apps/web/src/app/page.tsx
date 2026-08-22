"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Globe, Lightbulb, Search, Code, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Web Scraping",
    description: "Automated crawling with Playwright. Handles JavaScript-rendered pages, SPAs, and extracts clean, structured content.",
  },
  {
    icon: <Lightbulb className="h-6 w-6" />,
    title: "AI Embeddings",
    description: "Generate vector embeddings with OpenAI. Store in Pinecone for lightning-fast semantic search.",
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: "Semantic Search",
    description: "Search by meaning, not just keywords. Find relevant content across all your crawled sources.",
  },
  {
    icon: <Code className="h-6 w-6" />,
    title: "MCP Integration",
    description: "Connect AI assistants via Model Context Protocol. Let Claude, ChatGPT, and more access your knowledge base.",
  },
];

const steps = [
  {
    step: "01",
    title: "Add Sources",
    description: "Enter the URLs you want to crawl. JigSaw supports any public website, including JavaScript-rendered pages.",
  },
  {
    step: "02",
    title: "Crawl & Extract",
    description: "Our Playwright-powered crawler visits your sources, extracts clean content, and strips away noise.",
  },
  {
    step: "03",
    title: "Index & Embed",
    description: "Content is chunked, converted into vector embeddings using OpenAI, and stored in Pinecone.",
  },
  {
    step: "04",
    title: "Search & Discover",
    description: "Search your knowledge base with natural language. Results include source attribution and relevance scores.",
  },
];

const stats = [
  { value: "10x", label: "Faster Search" },
  { value: "99.9%", label: "Uptime" },
  { value: "100K+", label: "Pages Crawled" },
  { value: "<200ms", label: "Query Time" },
];

const techCategories = [
  {
    label: "Crawling & Data",
    items: ["Playwright", "BullMQ", "Redis"],
  },
  {
    label: "AI & Search",
    items: ["OpenAI", "Pinecone"],
  },
  {
    label: "Infrastructure",
    items: ["PostgreSQL", "Next.js", "Express"],
  },
];

export default function Home() {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
        delayChildren: 0,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <main className="min-h-screen w-full overflow-hidden relative">
      <div className="min-h-screen w-full max-w-[2000px] mx-auto border-x border-border overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden p-4 lg:p-[60px]">
          <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.08)_0%,transparent_70%)]" />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-20 w-full max-w-4xl mx-auto text-center space-y-6"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <Badge variant="secondary" className="gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                Powered by AI &bull; MCP Ready
              </Badge>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-[5.5rem] font-semibold tracking-tighter leading-[1.1]"
            >
              Transform the Web Into
              <br />
              <span className="text-primary">Searchable Knowledge</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20, filter: prefersReducedMotion ? "blur(0px)" : "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.8, ease: "easeOut", delay: 0.1 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-balance font-light"
            >
              JigSaw crawls websites, generates AI embeddings, and creates a
              semantic knowledge base you can search via web or MCP.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: "easeOut", delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Button asChild size="lg" className="text-base px-8">
                <Link href="/search">
                  <Search className="h-5 w-5" />
                  Start Searching
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8">
                <Link href="/sources">Add Sources</Link>
              </Button>
            </motion.div>
          </motion.div>

          <div className="pointer-events-none absolute h-[50%] w-full bg-gradient-to-t from-background via-transparent to-transparent bottom-0 left-1/2 -translate-x-1/2" />
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-muted-foreground text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">Features</Badge>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter mb-4">
                Everything You Need to <span className="text-primary">Build Knowledge</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-light">
                From raw web pages to intelligent, searchable knowledge bases.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {features.map((feature) => (
                <Card key={feature.title} className="group cursor-pointer transition-colors hover:bg-accent/50 h-full">
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-200">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-semibold tracking-tight mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">How It Works</Badge>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter mb-4">
                From Web Pages to <span className="text-primary">Intelligent Search</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-light">
                Four simple steps to transform any website into a searchable knowledge base.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, index) => (
                <div key={step.step} className="relative">
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-border to-transparent" />
                  )}
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-200">
                          <span className="text-2xl font-bold">{step.step}</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold tracking-tight mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="py-24 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">Built With</Badge>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter">
                Modern <span className="text-primary">Tech Stack</span>
              </h2>
            </div>

            <div className="space-y-6 max-w-3xl mx-auto">
              {techCategories.map((category) => (
                <div key={category.label} className="text-center">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">
                    {category.label}
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {category.items.map((tech) => (
                      <div
                        key={tech}
                        className="px-5 py-2.5 rounded-xl bg-secondary/50 border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200 font-medium cursor-default"
                      >
                        {tech}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* CTA Section */}
      <section className="py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden p-12 lg:p-16 text-center border border-border bg-card">
            <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.5)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.5)_1px,transparent_1px)] bg-[size:32px_32px]" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter mb-4 text-balance">
                Ready to Build Your Knowledge Base?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto font-light">
                Start crawling websites, generating embeddings, and searching your
                knowledge base in minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="text-base px-8">
                  <Link href="/sources">
                    <Plus className="h-5 w-5" />
                    Add Your First Source
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base px-8">
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                    View Documentation
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
