# Fix Plan: Authentication (Login/Register) Broken

## Root Cause Analysis

Login/register is completely broken. The API server crashes on startup, and even if it didn't, the session check would always fail. Here are the issues in severity order:

---

### BUG 1 (Critical): API server crashes — missing packages

**Files:** `apps/api/src/routes/search.ts:2`, `apps/api/src/routes/jobs.ts:3`

`search.ts` imports `@jigsaw/ingestion` and `jobs.ts` imports `@jigsaw/crawler`. Neither package exists in `packages/`. The API crashes with `ERR_MODULE_NOT_FOUND` on startup — no auth endpoints are reachable at all.

**Fix:** Remove the broken imports. Stub `searchKnowledgeBase` and `scheduleCrawl` as unimplemented endpoints that return 501. This unblocks the API server without requiring us to build entire packages.

---

### BUG 2 (Critical): `GET /api/auth/me` always returns 401

**File:** `apps/api/src/index.ts:25`

Auth router is mounted without `authMiddleware`:
```ts
app.use("/api/auth", authRateLimit, authRouter);
```

The `/me` endpoint checks `req.user`, but no middleware ever sets it. Session check always fails — users appear logged out even after successful login.

**Fix:** Apply `authMiddleware` specifically to the `/me` endpoint, or create a separate protected router for it.

---

### BUG 3 (High): Frontend error messages are swallowed

**File:** `apps/web/src/lib/api.ts:48-49`

```ts
const error = await response.json().catch(() => ({ message: "Request failed" }));
throw new Error(error.message || `HTTP ${response.status}`);
```

Backend returns `{ error: "Invalid email or password" }`, frontend reads `error.message` (undefined), falls back to `"Request failed"`. User sees a useless error toast.

**Fix:** Read `error.error` instead of `error.message`, or handle both keys.

---

### BUG 4 (Medium): Missing backend routes for settings/MCP pages

**Missing endpoints:**
- `POST /api/auth/profile` — profile update
- `POST /api/auth/change-password` — password change
- `DELETE /api/auth/account` — account deletion
- `GET /api/auth/api-keys` — list API keys
- `POST /api/auth/api-keys` — create API key
- `DELETE /api/auth/api-keys/:id` — revoke API key

Frontend `api.ts` calls these; backend doesn't have them. Settings and MCP pages will 404.

**Fix:** Implement these endpoints in `routes/auth.ts`.

---

### BUG 5 (Medium): API key auth sets fake user identity

**File:** `apps/api/src/middleware/auth.ts:38`

When API key is present, `authMiddleware` sets:
```ts
req.user = { id: "api-key-user", email: "api@jigsaw.local", name: "API" };
```

But `apiKeyMiddleware` already set `req.apiKeyUserId` with the real user ID. Routes using `req.user.id` for data scoping get the hardcoded fake ID, not the actual user.

**Fix:** In `authMiddleware`, when API key is present, look up the real user from `req.apiKeyUserId` and set `req.user` properly.

---

## Implementation Plan

### Phase 1: Unbreak the API server (BUG 1)

1. **Stub `search.ts`** — Remove `@jigsaw/ingestion` import. Replace `searchKnowledgeBase` call with a 501 response ("Search not yet implemented").
2. **Stub `jobs.ts`** — Remove `@jigsaw/crawler` import. Replace `scheduleCrawl` call with a 501 response ("Crawl scheduling not yet implemented"). Keep the DB read endpoints working.
3. **Verify** — API starts without crashes.

### Phase 2: Fix session check (BUG 2)

1. In `apps/api/src/index.ts`, create a protected auth sub-router for `/me`:
   ```ts
   // Protected auth routes (require valid JWT session)
   app.use("/api/auth/me", authRateLimit, authMiddleware, (req, res) => {
     // forward to authRouter's /me handler
   });
   ```
   Or simpler: apply `authMiddleware` directly to the `/me` route inside `routes/auth.ts` by exporting it separately and mounting it with middleware in `index.ts`.

2. **Approach:** Export the `/me` handler as a standalone route, mount it in `index.ts` with `authMiddleware`:
   ```ts
   app.use("/api/auth", authRateLimit, authRouter);           // public: register, login, logout
   app.use("/api/auth", authRateLimit, authMiddleware, authProtectedRouter); // protected: /me
   ```

### Phase 3: Fix error messages (BUG 3)

1. In `apps/web/src/lib/api.ts`, change line 48-49:
   ```ts
   throw new Error(error.error || error.message || `HTTP ${response.status}`);
   ```

### Phase 4: Implement missing auth routes (BUG 4)

Add to `apps/api/src/routes/auth.ts`:

1. **`POST /api/auth/profile`** — Update user name. Protected.
2. **`POST /api/auth/change-password`** — Verify current password, update hash. Protected.
3. **`DELETE /api/auth/account`** — Delete user and cascade. Protected.
4. **`GET /api/auth/api-keys`** — List user's API keys (name, lastUsedAt, createdAt). Protected.
5. **`POST /api/auth/api-keys`** — Generate new API key (return plaintext once). Protected.
6. **`DELETE /api/auth/api-keys/:id`** — Revoke API key. Protected.

All protected routes need to be on the `authProtectedRouter` that gets `authMiddleware`.

### Phase 5: Fix API key auth identity (BUG 5)

In `apps/api/src/middleware/auth.ts`, when `req.apiKeyUserId` is set by `apiKeyMiddleware`, look up the real user:

```ts
if (req.apiKeyUserId) {
  const rows = await db.select({ id: users.id, email: users.email, name: users.name })
    .from(users).where(eq(users.id, req.apiKeyUserId)).limit(1);
  if (rows.length === 0) {
    res.status(401).json({ error: "API key user not found" });
    return;
  }
  req.user = rows[0];
  next();
  return;
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `apps/api/src/routes/search.ts` | Stub out `@jigsaw/ingestion` import |
| `apps/api/src/routes/jobs.ts` | Stub out `@jigsaw/crawler` import |
| `apps/api/src/index.ts` | Mount protected auth routes with `authMiddleware` |
| `apps/api/src/routes/auth.ts` | Add profile, change-password, delete-account, api-keys endpoints |
| `apps/api/src/middleware/auth.ts` | Fix API key → real user identity resolution |
| `apps/web/src/lib/api.ts` | Fix error message extraction |

## Verification

1. API starts without crashes (`bun run dev` → no `ERR_MODULE_NOT_FOUND`)
2. `POST /api/auth/register` → creates user, sets cookie, returns user object
3. `POST /api/auth/login` → validates credentials, sets cookie, returns user object
4. `GET /api/auth/me` (with cookie) → returns user object (not 401)
5. `GET /api/auth/me` (without cookie) → returns 401
6. Page refresh after login → stays logged in
7. Frontend shows actual error messages (not "Request failed")
8. Settings page endpoints return data (not 404)
