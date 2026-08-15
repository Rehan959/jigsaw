# Testing

## Philosophy

Tests make fast iteration safe. With good coverage, you can move quickly and trust your instincts instead of second-guessing every change.

## Framework

- **Vitest** — Fast, Vite-native test runner with Jest-compatible API
- **@testing-library/react** — Component testing for React
- **@testing-library/jest-dom** — Custom DOM matchers

## Running Tests

```bash
bun run test          # Run all tests once
bun run test:watch    # Run tests in watch mode
```

## Test Layers

| Layer | What | Where | When |
|-------|------|-------|------|
| Unit | Pure functions, utilities | `**/__tests__/*.test.ts` | Every PR |
| Integration | Component rendering, API calls | `**/__tests__/*.test.tsx` | Every PR |
| E2E | Full user flows | Playwright (planned) | Before deploy |

## Conventions

- Test files: `*.test.ts` or `*.test.tsx` co-located with source in `__tests__/` dirs
- Use `describe` blocks for grouping, `it` for individual cases
- Test behavior, not implementation details
- Mock external dependencies (API calls, database)
- Never import secrets or credentials in test files
