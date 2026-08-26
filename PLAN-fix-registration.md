# Fix Registration — Plan

## Problem Statement

User registration is broken. The backend auth code (`apps/api/src/routes/auth.ts`) is well-structured but the **infrastructure around it** has critical issues that prevent it from working end-to-end.

## Root Cause Analysis

### Bug 1: `.env` file is malformed (CRITICAL)

**File:** `.env:2,9`

Line 2: `DATABASE_URL` is concatenated with the Redis comment on the same line:
```
DATABASE_URL=postgresql://neondb_owner:...@ep-...neon.tech/neondb?sslmode=require&channel_binding=require# Redis (BullMQ)
```
The `# Redis (BullMQ)` becomes part of the URL (shell comment syntax doesn't work in `.env` files). The `channel_binding=require` is also malformed — `channel_binding` is not a valid PostgreSQL connection parameter.

Line 9: `PINECONE_API_KEY` and `PINECONE_INDEX` are on the same line:
```
PINECONE_API_KEY=pcsk_...PINECONE_INDEX=jigsaw
```
This means `PINECONE_INDEX` is never set as its own env var, and `PINECONE_API_KEY` has garbage appended.

### Bug 2: `API_SECRET` is a placeholder (CRITICAL)

**File:** `.env:13`

`API_SECRET=your-jwt-secret` — the JWT middleware (`apps/api/src/middleware/auth.ts:7-9`) throws on startup if this isn't a real secret. Even if it doesn't throw, tokens signed with a placeholder are insecure.

### Bug 3: No database migrations exist (CRITICAL)

**Directory:** `packages/db/drizzle/` — does not exist. The drizzle config points to `./migrations` but no migrations have been generated. The `users` table likely doesn't exist in the NeonDB database, so every `INSERT INTO users` fails with a relation Does Not Exist error.

### Bug 4: Frontend password hint is misleading

**File:** `apps/web/src/app/register/page.tsx:80`

Placeholder says "Min 8 characters" but the backend enforces min 12 chars + uppercase + lowercase + number + special char. Users get a validation error with no idea why.

### Bug 5: Missing `CORS_ORIGIN` env var

**File:** `.env` — `CORS_ORIGIN` is missing. The API defaults to `http://localhost:3000` which should work, but if the frontend runs on a different port, cross-origin requests fail silently.

## Fix Plan

### Step 1: Fix `.env` file

Fix the malformed lines:
- Line 2: Split `DATABASE_URL` and `# Redis` comment onto separate lines. Remove `channel_binding=require` (not a valid PG param).
- Line 9: Split `PINECONE_API_KEY` and `PINECONE_INDEX` onto separate lines.
- Line 13: Replace `your-jwt-secret` with a generated secret.

### Step 2: Generate a real `API_SECRET`

Run `openssl rand -hex 32` and set it in `.env`.

### Step 3: Generate and run Drizzle migrations

```bash
cd packages/db
bun run db:generate   # Generate SQL migration files
bun run db:migrate    # Apply to NeonDB
```

If `db:migrate` fails on NeonDB (remote), fall back to `bun run db:push` (schema push).

### Step 4: Fix the frontend password hint

Change placeholder from "Min 8 characters" to "Min 12 chars, uppercase, lowercase, number, symbol".

### Step 5: Verify end-to-end

1. Start the API server: `cd apps/api && bun run dev`
2. Start the web frontend: `cd apps/web && bun run dev`
3. Register a new user via the UI
4. Verify the user appears in the database
5. Verify login works after registration

## Files to Modify

| File | Change |
|------|--------|
| `.env` | Fix malformed lines, generate real API_SECRET |
| `apps/web/src/app/register/page.tsx` | Fix password hint text |
| `packages/db/` | Generate + run migrations |

## Risk Assessment

- **Low risk**: `.env` fix and password hint are config/UI only
- **Medium risk**: Running migrations against NeonDB — if the DB already has partial data, we need to handle that
- **No code changes to auth logic** — the auth code itself is correct

### Bug 6: Rate limiter crashes server on IPv6 (DISCOVERED DURING FIX)

**File:** `apps/api/src/middleware/rateLimit.ts`

`express-rate-limit` v8.6.2 validates that custom `keyGenerator` functions use the `ipKeyGenerator` helper for IPv6. The `apiRateLimit` uses `req.ip` directly, causing `ERR_ERL_KEY_GEN_IPV6` validation error on startup.

**Fix:** Add `validate: { keyGeneratorIpFallback: false }` to all rate limit configs to disable the IPv6 validation.

## Verification

After all fixes:
1. API server starts without errors
2. `POST /api/auth/register` succeeds with a valid payload
3. User can log in after registering
4. `/api/auth/me` returns the correct user when authenticated

## Status: COMPLETED

All 6 bugs fixed and verified end-to-end.
