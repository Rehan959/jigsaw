# JigSaw: SaaS Website Plan

**Date:** 2026-08-16
**Branch:** main
**Goal:** Build a multi-user SaaS website as the display + management layer for data collected via MCP. Auth, API keys, ownership scoping, dashboard.

**Design doc:** `~/.gstack/projects/jigsaw/ceo-plans/jigsaw-display-layer-design.md`

---

## Current State

**What works:**
- 4 pages: Landing (`/`), Search (`/search`), Sources (`/sources`), Jobs (`/jobs`)
- API: 8 REST endpoints (all open, no auth)
- MCP Server: 4 tools (search_knowledge_base, list_sources, add_source, crawl_status)
- DB: 3 tables (users, sources, crawl_jobs) — users table exists but is unwired
- UI: 10 reusable components, dark mode, Framer Motion
- ApiClient class at `apps/web/src/lib/api.ts` (typed, unused by pages)

**What's broken:**
- No auth anywhere
- API hardcodes userId to all-zeros UUID
- MCP server uses hardcoded user IDs AND talks directly to DB (bypasses API)
- No dashboard page
- Crawler/ingestion packages have no source (only dist)

**What we're NOT building:**
- Crawler/ingestion packages (MCP handles data collection)
- Background jobs (MCP triggers crawls directly)
- Billing/subscription (SaaS, but free tier for now)

---

## Phase 1: Auth System (Backend)

### 1.1 Type augmentation
**File:** `apps/api/src/types/express.d.ts`
- Extend `Express.Request` with `{ user: { id: string; email: string } }`
- Required for TypeScript strict mode

### 1.2 Auth middleware
**File:** `apps/api/src/middleware/auth.ts`
- JWT verification using `API_SECRET` from env
- Extract user from token, attach to `req.user`
- Public routes: `GET /health`, `POST /api/auth/*`

### 1.3 Wire middleware into Express app
**File:** `apps/api/src/index.ts`
- Add `app.use("/api", authMiddleware)` AFTER `app.use(express.json())`
- Auth routes (`/api/auth/*`) are public, registered BEFORE the middleware
- All other `/api/*` routes are protected

### 1.4 Auth routes
**File:** `apps/api/src/routes/auth.ts`
- `POST /api/auth/register` — Zod validation (email format, password min 8, name max 255) → bcrypt → store → set httpOnly cookie with JWT → return user
- `POST /api/auth/login` — Zod validation → verify password → set httpOnly cookie → return user
- `GET /api/auth/me` — return current user (requires auth)
- `POST /api/auth/logout` — clear httpOnly cookie

### 1.5 Error response contract
All auth endpoints return:
```json
{ "error": "string", "code": "VALIDATION_ERROR | INVALID_CREDENTIALS | EMAIL_TAKEN" }
```

### 1.6 Dependencies
- `bcryptjs` for password hashing
- `jsonwebtoken` for JWT
- `cookie` for httpOnly cookie handling

---

## Phase 2: Auth System (Frontend)

### 2.1 Auth context
**File:** `apps/web/src/lib/auth.tsx`
- AuthProvider with user state, login/register/logout methods
- JWT stored in httpOnly cookie (set by API, sent automatically by browser)
- Protected route wrapper

### 2.2 Login page
**File:** `apps/web/src/app/login/page.tsx`
- Email + password form
- Link to register
- Error handling with inline validation (show `code` from API)
- Redirect to `/dashboard` on success

### 2.3 Register page
**File:** `apps/web/src/app/register/page.tsx`
- Email + password + name form
- Link to login
- Redirect to `/dashboard` on success

### 2.4 Update Navigation
**File:** `apps/web/src/components/Navigation.tsx`
- Show login/register links when logged out
- Show user email + logout when logged in

### 2.5 Protected route wrapper
**File:** `apps/web/src/components/ProtectedRoute.tsx`
- Redirect to `/login` if not authenticated
- Wrap Dashboard, Sources, Search, MCP, Settings pages

### 2.6 Update ApiClient
**File:** `apps/web/src/lib/api.ts`
- Add `credentials: "include"` to all fetch calls (sends httpOnly cookie)
- Add auth error handling (401 → redirect to login)

---

## Phase 3: Database Changes

### 3.1 Update Drizzle schema
**File:** `packages/db/src/schema/sources.ts`
- Add `visibility: varchar("visibility", { length: 20 }).default("private")`

### 3.2 New table: `api_keys`
**File:** `packages/db/src/schema/api-keys.ts`
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.3 Data migration
- Delete sources with dummy userId (`00000000-0000-0000-0000-000000000000`)
- Clean slate for auth launch

### 3.4 Generate + apply migration
- Run `bun run db:generate` to create migration
- Run `bun run db:migrate` to apply

---

## Phase 4: DX Checkpoint (before route changes)

**Run BEFORE modifying any existing routes:**
1. Run existing tests (`bun run test`)
2. Document API changes in changelog
3. Update ApiClient in `apps/web/src/lib/api.ts` to match new routes
4. Verify backward compatibility

---

## Phase 5: Dashboard Page

### 5.1 Dashboard page
**File:** `apps/web/src/app/dashboard/page.tsx`
**Content:**
- Stats cards: total sources, public sources, private sources (single aggregate query)
- Recent activity: last 5 sources added
- Quick actions: Add source, Search, View all sources
- MCP connection status

**UX pattern:** Data-dense dark dashboard (from ui-ux-pro-max)

### 5.2 Dashboard API route
**File:** `apps/api/src/routes/dashboard.ts`
- `GET /api/dashboard/stats` — single Drizzle aggregate query: count sources, count by visibility, fetch last 5
- Protected route (requires auth)

---

## Phase 6: Enhance Existing Pages

### 6.1 Sources page enhancement
**File:** `apps/web/src/app/sources/page.tsx`
**Changes:**
- Scope to logged-in user's sources
- Add public/private toggle per source
- Show who added each source (for public sources)
- Add manual source entry (paste URL or content)
- Add pagination (limit/offset)
- Keep existing: list, add modal, delete, stats

### 6.2 Search page enhancement
**File:** `apps/web/src/app/search/page.tsx`
**Changes:**
- Scope search to user's sources + public sources
- Add filter: my sources only / public sources / all
- Show source name in results
- Keep existing: search form, suggested queries, results with scores

### 6.3 Update existing API routes
**Files:** `apps/api/src/routes/sources.ts`, `apps/api/src/routes/search.ts`
- Replace hardcoded userId with `req.user.id`
- Add visibility filter (private sources only visible to owner)
- Add ownership verification on delete
- Add pagination to `GET /api/sources` (limit/offset params)
- Inline search logic (replace `@jigsaw/ingestion` import)
- Add Pinecone metadata filter for user scoping

### 6.4 Remove jobs routes
**Files:** `apps/api/src/routes/jobs.ts`, `apps/web/src/app/jobs/page.tsx`
- Remove `/api/jobs` routes (MCP handles crawling)
- Remove Jobs page from frontend
- Update Navigation to remove Jobs link

---

## Phase 7: MCP Integration Page

### 7.1 MCP page
**File:** `apps/web/src/app/mcp/page.tsx`
**Content:**
- API key management: generate, list, revoke keys
- Connection instructions per AI assistant (Claude Desktop, Cursor)
- Code snippets for MCP config
- Available tools explanation

**UX pattern:** Quick Start + Interactive Docs (from ui-ux-pro-max)

### 7.2 API key routes
**File:** `apps/api/src/routes/keys.ts`
- `POST /api/mcp/keys` — generate new API key (hash with SHA-256, store in api_keys)
- `GET /api/mcp/keys` — list user's API keys (show last 4 chars only)
- `DELETE /api/mcp/keys/:id` — revoke API key
- All protected routes

---

## Phase 8: MCP Server Updates

### 8.1 Route through Express API
**File:** `packages/mcp-server/src/`
- Remove direct `@jigsaw/db` imports
- All DB and search calls go through Express API endpoints via HTTP
- Send `X-API-Key` header on all requests

### 8.2 Add API key support
**File:** `packages/mcp-server/src/index.ts`
- Accept `JIGSAW_API_KEY` env var
- Accept `JIGSAW_API_URL` env var (default: http://localhost:3001)
- Send key in `X-API-Key` header on all API calls

### 8.3 Scope MCP tools to user
**File:** `packages/mcp-server/src/tools/`
- `search_knowledge_base` — call `POST /api/search` with API key
- `list_sources` — call `GET /api/sources` with API key
- `add_source` — call `POST /api/sources` with API key
- `crawl_status` — call `GET /api/jobs` with API key (if jobs routes kept)

---

## Phase 9: Settings Page

### 9.1 Settings page
**File:** `apps/web/src/app/settings/page.tsx`
**Content:**
- Profile: name, email, change password
- Account deletion
- Notification preferences (future)

### 9.2 Settings routes
**File:** `apps/api/src/routes/settings.ts`
- `PATCH /api/settings/profile` — update name/email
- `POST /api/settings/password` — change password
- `DELETE /api/settings/account` — delete account
- All protected routes

---

## Implementation Order

1. **Phase 1-2** — Auth system (backend + frontend)
2. **Phase 3** — Database changes (api_keys table, sources.visibility, data migration)
3. **Phase 4** — DX checkpoint (tests, docs, ApiClient update)
4. **Phase 5** — Dashboard page
5. **Phase 6** — Enhance existing pages (sources, search) + remove jobs
6. **Phase 7** — MCP Integration page
7. **Phase 8** — MCP server updates (route through API)
8. **Phase 9** — Settings page

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth method | JWT in httpOnly cookie | Secure, XSS-resistant, browser handles automatically |
| Password hashing | bcryptjs | Battle-tested, good perf |
| API key for MCP | Hashed (SHA-256), stored in DB | MCP can't use JWT; API key is standard |
| Frontend state | React Context | Simple, no extra deps |
| Route protection | Global middleware in index.ts | DRY, no per-route repetition |
| Visibility | Public/private toggle | Users can share or isolate sources |
| Dashboard style | Data-dense dark | Matches existing aesthetic |
| MCP auth | API key per user, routed through Express API | MCP must go through API for auth to work |
| Search scoping | Pinecone metadata filter | Efficient, no post-filtering |
| Pagination | limit/offset on sources list | Standard, handles growth |

---

## What's NOT in scope

- Crawler/ingestion packages (MCP handles this)
- Background jobs (MCP triggers crawls directly)
- Billing/subscription (free tier for now)
- Password reset (add later)
- Email verification (add later)
- OAuth/SSO (add later)
- Rate limiting (add later)
- Analytics/tracking (add later)
- Mobile app (web only)

---

## Implementation Tasks

- [ ] **T1 (P1, human: ~2h / CC: ~15min)** — Auth backend — Wire auth middleware into Express app, create auth routes with Zod validation, httpOnly cookie JWT
  - Files: `apps/api/src/types/express.d.ts`, `apps/api/src/middleware/auth.ts`, `apps/api/src/routes/auth.ts`, `apps/api/src/index.ts`
  - Verify: `bun run test` passes, manual test register/login/me

- [ ] **T2 (P1, human: ~2h / CC: ~15min)** — Auth frontend — AuthProvider, login/register pages, protected route wrapper, Navigation update
  - Files: `apps/web/src/lib/auth.tsx`, `apps/web/src/app/login/page.tsx`, `apps/web/src/app/register/page.tsx`, `apps/web/src/components/ProtectedRoute.tsx`, `apps/web/src/components/Navigation.tsx`
  - Verify: Can register, login, see protected pages

- [ ] **T3 (P1, human: ~1h / CC: ~10min)** — Database changes — Update Drizzle schema for visibility, create api_keys table, data migration
  - Files: `packages/db/src/schema/sources.ts`, `packages/db/src/schema/api-keys.ts`, migration files
  - Verify: `bun run db:generate && bun run db:migrate` succeeds

- [ ] **T4 (P1, human: ~30min / CC: ~5min)** — DX checkpoint — Run tests, update ApiClient, document API changes
  - Files: `apps/web/src/lib/api.ts`
  - Verify: `bun run test` passes, ApiClient compiles

- [ ] **T5 (P1, human: ~2h / CC: ~15min)** — Dashboard — Dashboard page with stats, dashboard API route with aggregate query
  - Files: `apps/web/src/app/dashboard/page.tsx`, `apps/api/src/routes/dashboard.ts`
  - Verify: Dashboard shows correct stats

- [ ] **T6 (P1, human: ~3h / CC: ~20min)** — Sources + Search enhancement — User scoping, visibility toggle, pagination, inline search, Pinecone metadata filter
  - Files: `apps/web/src/app/sources/page.tsx`, `apps/web/src/app/search/page.tsx`, `apps/api/src/routes/sources.ts`, `apps/api/src/routes/search.ts`
  - Verify: Sources scoped to user, search returns correct results

- [ ] **T7 (P2, human: ~2h / CC: ~15min)** — MCP Integration page — API key management, connection instructions, code snippets
  - Files: `apps/web/src/app/mcp/page.tsx`, `apps/api/src/routes/keys.ts`
  - Verify: Can generate/revoke API keys

- [ ] **T8 (P2, human: ~3h / CC: ~20min)** — MCP server rewrite — Route through Express API, add API key support
  - Files: `packages/mcp-server/src/` (all tool files)
  - Verify: MCP tools work with API key auth

- [ ] **T9 (P3, human: ~1h / CC: ~10min)** — Settings page — Profile, password change, account deletion
  - Files: `apps/web/src/app/settings/page.tsx`, `apps/api/src/routes/settings.ts`
  - Verify: Can update profile, change password

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR | 9 issues, all resolved |
| Outside Voice | Claude subagent | Independent 2nd opinion | 1 | CLEAR | 12 findings, all resolved |

- **CODEX:** Not available (package manager conflict)
- **CROSS-MODEL:** Outside voice found 5 issues the review missed (middleware wiring, Drizzle schema, MCP architecture, Zod validation, Express types). All folded into the plan.
- **VERDICT:** ENG CLEARED — ready to implement

NO UNRESOLVED DECISIONS
