# @jigsaw/web

Next.js 14 frontend for the JigSaw AI knowledge retrieval platform.

## Purpose

User-facing web app for searching the knowledge base, managing web sources, and monitoring crawl job status. Dark-mode-first flat design with purple primary branding and glassmorphism accents.

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | ^14.2.0 |
| UI Library | React | ^18.3.0 |
| Language | TypeScript (strict) | ^5.5.0 |
| Styling | Tailwind CSS 3 | 3.x |
| Animations | Framer Motion | ^13.1.0 |
| Package Manager | Bun (monorepo) | — |
| Monorepo | Turborepo | workspace: `@jigsaw/web` |

## Design Principles

- **Dark-mode-first** — Near-black backgrounds with high-contrast text
- **Flat design** — Clean lines, no excessive shadows, typography-focused hierarchy
- **Glassmorphism accents** — Semi-transparent cards with backdrop blur for depth
- **Purple primary** — `#5519f7` as the dominant brand color across CTAs and highlights
- **Minimal motion** — Subtle 150-200ms transitions, no heavy animations

## Architecture

```
src/
├── app/
│   ├── globals.css          # Design system, component classes, animations
│   ├── layout.tsx           # Root layout: <html dark>, Navigation, Footer, fonts, metadata
│   ├── page.tsx             # Landing page (hero, features, how-it-works, tech stack, CTA)
│   ├── search/page.tsx      # Semantic search with results display
│   ├── sources/page.tsx     # CRUD for web sources (list, add, delete, trigger crawl)
│   └── jobs/page.tsx        # Crawl job monitor with 5s auto-refresh
├── components/
│   ├── Navigation.tsx       # Scroll-aware floating pill navbar
│   ├── Footer.tsx           # Multi-column footer with social links
│   └── ui/                  # Reusable component library
│       ├── index.ts         # Barrel export
│       ├── Button.tsx       # Multi-variant button (forwardRef)
│       ├── Card.tsx         # Glassmorphism card container (forwardRef)
│       ├── Badge.tsx        # Status indicator pill (forwardRef)
│       ├── Input.tsx        # Form input with label/error/hint (forwardRef)
│       └── Modal.tsx        # Overlay modal with backdrop (forwardRef)
└── lib/
    └── api.ts               # Typed ApiClient class wrapping fetch
```

## Pages

| Route | File | Rendering | Purpose |
|---|---|---|---|
| `/` | `src/app/page.tsx` | Client | Marketing landing page |
| `/search` | `src/app/search/page.tsx` | Client | Semantic search interface |
| `/sources` | `src/app/sources/page.tsx` | Client | Source management (CRUD) |
| `/jobs` | `src/app/jobs/page.tsx` | Client | Crawl job monitor |

## API Communication

The frontend connects to the Express backend via `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`).

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/search` | Semantic search |
| `GET` | `/api/sources` | List sources |
| `POST` | `/api/sources` | Create source |
| `DELETE` | `/api/sources/:id` | Delete source |
| `POST` | `/api/jobs/crawl/:id` | Trigger crawl |
| `GET` | `/api/jobs` | List crawl jobs |
| `GET` | `/api/jobs/:id` | Get specific job |
| `GET` | `/health` | Health check |

**Note:** Pages currently use inline `fetch()` calls. The typed `ApiClient` in `src/lib/api.ts` is available but not yet used by page components.

## Dependencies

- `@jigsaw/shared` — Shared types & utilities (workspace)
- `next` — React framework
- `react` / `react-dom` — UI library
- `framer-motion` — Page and component animations

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Backend API URL (exposed to browser) |

## Scripts

```bash
bun run dev          # Next.js dev server on port 3000
bun run build        # Production build
bun run start        # Start production server
bun run lint         # ESLint (TypeScript)
bun run check-types  # TypeScript type check (tsc --noEmit)
```

## Common Tasks

- **Add a page:** Create `src/app/<route>/page.tsx` with `"use client"` if using state
- **Add a component:** Create in `src/components/ui/`, use `forwardRef`, export from `index.ts`
- **Add a layout component:** Create in `src/components/` (e.g., Navigation, Footer)
- **API calls:** Use fetch to backend at `NEXT_PUBLIC_API_URL`, or import `api` from `@/lib/api`
- **Styling:** Use Tailwind tokens from `tailwind.config.cjs` — never hardcode hex colors
- **Icons:** Use inline SVGs (no icon library). Consistent sizing: `w-4 h-4` / `w-5 h-5` / `w-6 h-6`
