import Link from "next/link";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    title: "Web Scraping",
    description: "Automated crawling with Playwright. Handles JavaScript-rendered pages, SPAs, and extracts clean, structured content.",
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "AI Embeddings",
    description: "Generate vector embeddings with OpenAI. Store in Pinecone for lightning-fast semantic search across millions of documents.",
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: "Semantic Search",
    description: "Search by meaning, not just keywords. Find relevant content across all your crawled sources with sub-second response times.",
    color: "from-primary/20 to-secondary/20",
    iconColor: "text-primary-light",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    title: "MCP Integration",
    description: "Connect AI assistants via Model Context Protocol. Let Claude, ChatGPT, and more access your knowledge base programmatically.",
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    title: "Vector Database",
    description: "Pinecone-powered storage for millions of embeddings. Scale from thousands to millions of documents without performance degradation.",
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Job Scheduling",
    description: "BullMQ-powered job queue. Schedule recurring crawls, monitor job status in real-time, and handle failures with automatic retries.",
    color: "from-rose-500/20 to-red-500/20",
    iconColor: "text-rose-400",
  },
];

const steps = [
  {
    step: "01",
    title: "Add Sources",
    description: "Enter the URLs you want to crawl. JigSaw supports any public website, including JavaScript-rendered pages.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Crawl & Extract",
    description: "Our Playwright-powered crawler visits your sources, extracts clean content, and strips away noise like navigation and ads.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Index & Embed",
    description: "Content is chunked, converted into vector embeddings using OpenAI, and stored in Pinecone for semantic search.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    step: "04",
    title: "Search & Discover",
    description: "Search your knowledge base with natural language. Results include source attribution, relevance scores, and context.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
];

const stats = [
  { value: "10x", label: "Faster Search", description: "vs traditional keyword search" },
  { value: "99.9%", label: "Uptime", description: "enterprise-grade reliability" },
  { value: "100K+", label: "Pages Crawled", description: "and growing every day" },
  { value: "<200ms", label: "Query Time", description: "semantic search latency" },
];

const techStack = [
  { name: "Playwright", role: "Browser Automation" },
  { name: "OpenAI", role: "Embeddings" },
  { name: "Pinecone", role: "Vector Database" },
  { name: "PostgreSQL", role: "Relational Data" },
  { name: "Redis", role: "Job Queue" },
  { name: "Next.js", role: "Frontend" },
];

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24">
          <div className="mb-8 inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-sm animate-fade-in">
            <span className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse" />
            Powered by AI &bull; MCP Ready
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-balance animate-slide-up">
            <span className="gradient-text">Transform</span> the Web Into
            <br />
            <span className="gradient-text">Searchable Knowledge</span>
          </h1>

          <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto mb-10 text-balance animate-slide-up stagger-1">
            JigSaw crawls websites, generates AI embeddings, and creates a
            semantic knowledge base you can search — or connect to your favorite
            AI assistant via MCP.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up stagger-2">
            <Link href="/search" className="btn-primary text-lg !px-8 !py-4">
              Start Searching
              <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/sources" className="btn-secondary text-lg !px-8 !py-4">
              Add Sources
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-slide-up stagger-3">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card rounded-2xl p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-text-primary font-medium text-sm">{stat.label}</div>
                <div className="text-text-muted text-xs mt-1">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary-light text-sm font-medium mb-4">
              How It Works
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">
              From Web Pages to <span className="gradient-text">Intelligent Search</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Four simple steps to transform any website into a searchable knowledge base.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.step} className="relative group">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-primary/30 to-transparent" />
                )}
                <div className="glass-card rounded-2xl p-6 h-full group-hover:border-primary/40 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary-light group-hover:scale-110 transition-transform">
                      {step.icon}
                    </div>
                    <span className="text-4xl font-bold text-primary/20">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary-light text-sm font-medium mb-4">
              Features
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">
              Everything You Need to <span className="gradient-text">Build Knowledge</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              From raw web pages to intelligent, searchable knowledge bases —
              JigSaw handles the entire pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card rounded-2xl p-6 group hover:border-primary/40 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center ${feature.iconColor} mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary-light text-sm font-medium mb-4">
              Built With
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Modern <span className="gradient-text">Tech Stack</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Built on battle-tested technologies for performance, reliability, and scalability.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="glass-card rounded-xl p-6 text-center group hover:border-primary/40 transition-all duration-300"
              >
                <div className="text-lg font-bold mb-1 group-hover:text-primary-light transition-colors">{tech.name}</div>
                <div className="text-text-muted text-xs">{tech.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
                Ready to Build Your Knowledge Base?
              </h2>
              <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
                Start crawling websites, generating embeddings, and searching your
                knowledge base in minutes. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/sources" className="btn-primary text-lg !px-8 !py-4">
                  Add Your First Source
                  <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a href="#" className="btn-ghost text-lg">
                  View Documentation
                  <svg className="w-5 h-5 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
