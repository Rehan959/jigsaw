# JigSaw Web — Pages

## Routes

| Route | File | Purpose | Client |
|---|---|---|---|
| `/` | `src/app/page.tsx` | Landing page | Yes (`"use client"`) |
| `/search` | `src/app/search/page.tsx` | Semantic search | Yes |
| `/sources` | `src/app/sources/page.tsx` | Source management | Yes |
| `/jobs` | `src/app/jobs/page.tsx` | Crawl job monitor | Yes |

---

## `/` — Landing Page

**File**: `src/app/page.tsx`

### Layout Structure

```
┌─────────────────────────────────────────────┐
│  Navigation (fixed, scroll-aware)           │
├─────────────────────────────────────────────┤
│  Hero                                       │
│  - Animated background (blobs + grid)       │
│  - Gradient text headline                   │
│  - Two CTAs + stats row                     │
├─────────────────────────────────────────────┤
│  How It Works                               │
│  - 4-step horizontal flow                   │
│  - Connected by line on desktop             │
├─────────────────────────────────────────────┤
│  Features                                   │
│  - 6-card bento grid                        │
│  - Unique color gradients per card          │
├─────────────────────────────────────────────┤
│  Tech Stack                                 │
│  - 6-item grid with hover reveal            │
├─────────────────────────────────────────────┤
│  CTA                                        │
│  - Full-width glass card                    │
│  - Gradient background + grid overlay       │
├─────────────────────────────────────────────┤
│  Footer                                     │
└─────────────────────────────────────────────┘
```

### Sections

1. **Hero** — Full-viewport animated background with floating purple/violet blobs, grid pattern overlay. Gradient text headline ("Transform the Web Into Searchable Knowledge"). Two CTAs: "Start Searching" (primary) and "Add Sources" (secondary). Stats row: 10x Faster Search, 99.9% Uptime, 100K+ Pages Crawled, <200ms Query Time.

2. **How It Works** — 4-step flow: Add Sources → Crawl & Extract → Index & Embed → Search & Discover. Each step has a gradient icon container, step number, title, and description. Connected by a horizontal line on desktop.

3. **Features** — 6-card bento grid: Web Scraping, AI Embeddings, Semantic Search, MCP Integration, Vector Database, Job Scheduling. Each card has a unique color gradient icon (blue, purple, primary, amber, emerald, rose).

4. **Tech Stack** — 6-item grid: Playwright, OpenAI, Pinecone, PostgreSQL, Redis, Next.js. Hover reveals role subtitle.

5. **CTA** — Full-width glass card with gradient background, grid pattern overlay. "Ready to Build Your Knowledge Base?" headline with two action buttons.

### Data

All content is hardcoded in `features`, `steps`, `stats`, and `techStack` arrays at the top of the file.

### Styling Pattern

- Hero uses `min-h-screen flex items-center justify-center`
- Sections use `py-24` with `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Feature cards use `glass-card rounded-2xl p-6` with hover `border-border-focus`
- Gradient text: `gradient-text` class on headings
- Staggered animations: `animate-slide-up stagger-N` on hero elements

---

## `/search` — Semantic Search

**File**: `src/app/search/page.tsx`

### Layout Structure

```
┌─────────────────────────────────────────────┐
│  Search Header                              │
│  - Badge + heading                          │
│  - Search input (glass-card)                │
│  - Suggested queries (before first search)  │
├─────────────────────────────────────────────┤
│  Results Area                               │
│  - Loading: dual-ring spinner               │
│  - Empty: suggested queries or no results   │
│  - Results: count + staggered cards         │
└─────────────────────────────────────────────┘
```

### Client Component

Uses `"use client"` directive. Manages: `query`, `results`, `loading`, `searched`, `searchTime`.

### API

```
POST /api/search
Body: { query: string, limit: number, sourceId?: string }
Response: { results: SearchResult[] }
```

### SearchResult Interface

```typescript
interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: {
    sourceId: string;
    url: string;
    title: string;
    chunkIndex: number;
    totalChunks: number;
  };
}
```

### Sections

1. **Search Header** — Gradient background, grid overlay. Badge ("Semantic Search"), heading ("Search Knowledge Base"), search form with glass-card styling. Input has search icon, clear button, and submit button.

2. **Suggested Queries** — Shown before first search. 4 suggestion chips: "How does web scraping work?", "What are vector embeddings?", "Explain semantic search", "Benefits of MCP integration". Click populates the search input.

3. **Results** — Three states:
   - **Loading**: Dual-ring spinner with "Searching your knowledge base..."
   - **No results**: Glass card with sad-face icon, "No results found" message
   - **Results list**: Count + timing header. Each result is a glass card with: title (linked), URL (linked), score badge (color-coded), content snippet (3-line clamp), chunk position indicator.

4. **Empty State** — Shown before any search. Large gradient icon, "Start searching" heading, explanation text.

### Score Badge Colors

| Score | Color | Tailwind |
|---|---|---|
| ≥ 80% | Green | `badge-success` |
| ≥ 60% | Purple | `badge-primary` |
| < 60% | Amber | `badge-warning` |

### Styling Pattern

- Search input: `glass-card rounded-2xl p-2` with flex layout
- Results: `glass-card rounded-xl p-6 hover:border-border-focus`
- Staggered entry: `animationDelay: ${index * 50}ms`

---

## `/sources` — Source Management

**File**: `src/app/sources/page.tsx`

### Layout Structure

```
┌─────────────────────────────────────────────┐
│  Header                                     │
│  - Badge + heading + description            │
│  - "Add Source" button (right)              │
├─────────────────────────────────────────────┤
│  Stats                                      │
│  - 3-column grid: Total, Crawled, Pending   │
├─────────────────────────────────────────────┤
│  Sources List                               │
│  - Loading: dual-ring spinner               │
│  - Empty: glass card with CTA               │
│  - Grid of source cards                     │
├─────────────────────────────────────────────┤
│  Add Source Modal                           │
│  - Overlay with backdrop blur               │
│  - Form: URL + name inputs                  │
└─────────────────────────────────────────────┘
```

### Client Component

Uses `"use client"`. Manages: `sources`, `loading`, `showAddModal`, `newSource`, `adding`, `crawling`.

### API

```
GET    /api/sources          → { sources: Source[] }
POST   /api/sources          → { url: string, name?: string }
DELETE /api/sources/:id      → 200
POST   /api/jobs/crawl/:id   → 200
```

### Source Interface

```typescript
interface Source {
  id: string;
  url: string;
  name: string;
  crawlFrequency: string | null;
  lastCrawledAt: string | null;
  createdAt: string;
}
```

### Sections

1. **Header** — Badge ("Sources"), heading ("Sources"), description ("Manage your web sources and crawling schedule"). Right side: "Add Source" button.

2. **Stats** — 3-column grid (shown when sources exist):
   - Total Sources (default text color)
   - Crawled (primary-light) — sources with `lastCrawledAt`
   - Pending (warning) — sources without `lastCrawledAt`

3. **Sources List** — Three states:
   - **Loading**: Dual-ring spinner
   - **Empty**: Glass card with gradient icon, "No sources yet" message, CTA button
   - **Sources**: Grid of source cards, each with:
     - Gradient icon container (globe icon)
     - Name (or extracted domain) + URL (linked)
     - Metadata: crawl frequency, last crawled date
     - Actions: "Crawl Now" (btn-success, shows spinner while crawling), "Delete" (btn-danger, with confirm dialog)

4. **Add Source Modal** — Overlay with backdrop blur. Form with:
   - Website URL input (required, type="url")
   - Name input (optional)
   - Cancel / Add Source buttons
   - Loading state on submit

### Styling Pattern

- Source cards: `glass-card rounded-xl p-6 hover:border-border-focus group`
- Icon hover: `group-hover:scale-110 transition-transform`
- Modal: `fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in`
- Modal content: `glass-card-static rounded-2xl p-8 animate-scale-in`

---

## `/jobs` — Crawl Job Monitor

**File**: `src/app/jobs/page.tsx`

### Layout Structure

```
┌─────────────────────────────────────────────┐
│  Header                                     │
│  - Badge + heading + description            │
├─────────────────────────────────────────────┤
│  Stats                                      │
│  - 5-column grid: Total, Running, Queued,   │
│    Completed, Failed                        │
├─────────────────────────────────────────────┤
│  Filters                                    │
│  - Horizontal pill buttons with counts      │
├─────────────────────────────────────────────┤
│  Jobs List                                  │
│  - Loading: dual-ring spinner               │
│  - Empty: glass card message                │
│  - List of job cards                        │
└─────────────────────────────────────────────┘
```

### Client Component

Uses `"use client"`. Manages: `jobs`, `loading`, `filter`. Auto-refreshes every 5 seconds via `setInterval`.

### API

```
GET /api/jobs → { jobs: CrawlJob[] }
```

### CrawlJob Interface

```typescript
interface CrawlJob {
  id: string;
  sourceId: string;
  status: "queued" | "running" | "completed" | "failed";
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  createdAt: string;
  source?: { name: string; url: string };
}
```

### Status Config

| Status | BG | Text | Label | Icon |
|---|---|---|---|---|
| queued | `warning-bg` | `warning-text` | Queued | Clock |
| running | `brand-purple/10` | `primary-light` | Running | Spinning loader |
| completed | `success-bg` | `success-text` | Completed | Checkmark |
| failed | `error-bg` | `error-text` | Failed | X mark |

### Sections

1. **Header** — Badge ("Job Monitor"), heading ("Crawl Jobs"), description.

2. **Stats** — 5-column grid: Total, Running (primary-light), Queued (warning), Completed (success), Failed (error).

3. **Filters** — Horizontal pill buttons: All, Running, Queued, Completed, Failed. Each shows count badge. Active filter: `bg-primary/20 text-primary-light`.

4. **Jobs List** — Three states:
   - **Loading**: Dual-ring spinner
   - **Empty**: Glass card with "No jobs found" message
   - **Jobs**: List of job cards, each with:
     - Status icon (color-coded background)
     - Status badge (pill with border)
     - Source name (if available)
     - Job ID (truncated), creation time, duration (if completed)
     - Error message (if failed, truncated with tooltip)

### Auto-Refresh

```typescript
useEffect(() => {
  fetchJobs();
  const interval = setInterval(fetchJobs, 5000);
  return () => clearInterval(interval);
}, []);
```

### Styling Pattern

- Job cards: `glass-card rounded-xl p-5 hover:border-border-focus group`
- Status icon: `w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center ${config.text}`
- Filter pills: `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200`

---

## Navigation

**File**: `src/components/Navigation.tsx`

```
┌─────────────────────────────────────────────┐
│  [Logo] Home  Search  Sources  Jobs   [CTA] │
└─────────────────────────────────────────────┘
```

- Fixed top, z-50
- Scroll-aware: transparent → `glass-card-static` with shadow after 20px scroll
- Logo: gradient icon (primary → secondary) + "JigSaw" gradient text
- Nav items: Home, Search, Sources, Jobs
- Active item: `text-primary-light` with `bg-primary/10` background
- Mobile: hamburger menu with slide-down animation
- Auth buttons: "Sign In" (btn-ghost) + "Get Started" (btn-primary)

---

## Footer

**File**: `src/components/Footer.tsx`

```
┌─────────────────────────────────────────────┐
│  Brand    Platform    Developers    Legal    │
│  desc     Links       Links         Links    │
│  socials                                        │
├─────────────────────────────────────────────┤
│  © 2026 JigSaw    Privacy  Terms  Cookies   │
└─────────────────────────────────────────────┘
```

- Border top: `border-t border-border bg-surface-card/30`
- 5-column grid on desktop: Brand (2 cols) + Platform + Developers + Legal
- Brand: logo + description + social icons (GitHub, X, Discord)
- Social icons: `w-10 h-10 rounded-xl bg-surface-elevated hover:bg-border`
- Bottom bar: copyright + Privacy Policy / Terms / Cookie Policy links
