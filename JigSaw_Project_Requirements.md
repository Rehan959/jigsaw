# JigSaw — Project Requirements Document

## 1. Project Overview
JigSaw is a web-scraping and AI-powered knowledge retrieval platform. It crawls and scrapes websites, processes and converts the content into vector embeddings, and stores them in a vector database. Users can search this knowledge base through a web application. At the core of JigSaw is an MCP (Model Context Protocol) server that lets AI assistants and agents connect to JigSaw and retrieve relevant information directly.

## 2. Objectives
- Enable reliable, large-scale web scraping and crawling of target sources.
- Convert scraped content into a searchable, semantically indexed knowledge base.
- Provide a web application for users to search and browse this knowledge base.
- Expose the knowledge base to AI assistants/agents via a standardized MCP interface.

## 3. Core Components

| Component | Purpose |
|---|---|
| Scraper / Crawler | Fetches and extracts content from target websites |
| Ingestion Pipeline | Cleans, chunks, and converts content into embeddings |
| Vector Database | Stores embeddings for semantic search |
| MCP Server | Exposes the knowledge base to AI assistants/agents |
| Web Application | User-facing search and browsing interface |
| API Layer | Connects the frontend to backend services |

## 4. Functional Requirements

### 4.1 Scraping & Crawling
- Crawl and scrape target websites on demand and on a schedule.
- Extract clean, readable content from raw HTML (strip navigation, ads, boilerplate).
- Handle JavaScript-rendered pages.
- Support re-crawling to keep content fresh.
- Track crawl job status (queued, running, completed, failed).

### 4.2 Ingestion Pipeline
- Chunk extracted content into appropriately sized segments.
- Generate vector embeddings for each chunk.
- Store embeddings and associated metadata (source URL, title, timestamp) in the vector database.
- Support re-ingestion when source content changes.

### 4.3 Knowledge Retrieval (MCP Server)
- Allow AI assistants/agents to connect via the Model Context Protocol.
- Provide search/query tools that return relevant content from the knowledge base.
- Support standard MCP transports.

### 4.4 Web Application
- Allow users to search the knowledge base via keyword/semantic search.
- Display search results with source attribution (title, URL, snippet).
- Allow users to view crawl job status and manage tracked sources.
- User authentication and account management.

### 4.5 API Layer
- Provide endpoints for the frontend to trigger crawls, run searches, and check job status.
- Validate and sanitize all incoming requests.

## 5. Non-Functional Requirements
- **Scalability:** Support concurrent crawling of multiple sources without blocking.
- **Reliability:** Retry failed scrape/embedding requests; queue and track long-running jobs.
- **Performance:** Search queries should return results with low latency.
- **Security:** Authenticated access to the web app; secrets (API keys) managed via environment variables, never hardcoded.
- **Maintainability:** Modular codebase; documented environment setup for new contributors.
- **Observability:** Structured logging across scraper, ingestion, and API layers.

## 6. Technology Stack

| Layer | Technology |
|---|---|
| Web Scraping / Crawling | Playwright |
| MCP Server | Forked from Microsoft's `playwright-mcp`, Node.js/TypeScript, `@modelcontextprotocol/sdk` |
| Backend / API | Node.js, TypeScript, Express |
| Embeddings | OpenAI (or alternative provider, TBD) |
| Vector Database | Pinecone |
| Relational Database | PostgreSQL (metadata: users, crawl jobs, sources) |
| Job Queue | BullMQ + Redis (for crawl scheduling and async processing) |
| Frontend | Next.js |

> Note: The backend is being built as a unified Node.js/TypeScript codebase — the MCP server, crawler, embeddings pipeline, and API layer all live in one project (forked and extended from `playwright-mcp`).

## 7. Out of Scope (for initial phase)
- Multi-language content support (assume English-language sources initially, unless stated otherwise).
- Real-time collaborative features in the web app.
- Support for vector databases other than Pinecone.

## 8. Open Questions / Decisions Needed
- Final choice of embedding provider (OpenAI vs. alternatives).
- ORM choice for PostgreSQL (Drizzle vs. Prisma).
- Job queue setup: BullMQ + Redis vs. a simpler in-process queue for MVP.
- Target scale for initial launch (number of sources, expected query volume).
- Hosting/deployment environment (cloud provider, containerization strategy).

## 9. Suggested Milestones
1. **Foundation** — Repo setup, forked MCP server running, basic Playwright scraping working end-to-end.
2. **Ingestion Pipeline** — Content cleaning, chunking, embedding generation, Pinecone integration.
3. **MCP Integration** — MCP server exposes search/query tools backed by the knowledge base.
4. **Web Application MVP** — Search UI, source management, auth.
5. **Hardening** — Scheduled re-crawling, job monitoring, error handling, logging/observability.
6. **Launch Readiness** — Performance testing, security review, deployment pipeline.

## 10. Success Criteria
- Users can search the knowledge base and get accurate, relevant results with source attribution.
- AI assistants can connect via MCP and retrieve relevant content programmatically.
- Crawling and ingestion pipeline runs reliably on schedule without manual intervention.
