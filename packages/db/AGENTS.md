# @jigsaw/db

Database schema and connection for JigSaw using Drizzle ORM + PostgreSQL.

## Purpose

Defines the relational database schema (users, sources, crawl jobs) and exports a configured Drizzle client.

## Architecture

- `schema/users.ts` — User accounts (id, email, name, password hash)
- `schema/sources.ts` — Crawl sources (url, name, frequency, linked to user)
- `schema/crawl-jobs.ts` — Job tracking (status, timestamps, errors, linked to source)
- `index.ts` — DB connection + re-exports

## Dependencies

- `@jigsaw/shared` — Shared types
- `drizzle-orm` — ORM
- `postgres` — PostgreSQL driver

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string

## Common Tasks

- Add a new table: create in `schema/`, export from `schema/index.ts`
- Run migrations: `bun run db:generate` then `bun run db:migrate`
- Push schema directly: `bun run db:push`
- Open Studio: `bun run db:studio`
