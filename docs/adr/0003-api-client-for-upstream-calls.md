# ADR 0003: Use `apiClient` for upstream HTTP calls

- Status: Accepted
- Date: 2026-06-15

## Context

Services call the kitchen API through `fetchJson`, a thin wrapper around
`fetch`. During the summer rush the kitchen API was slow and occasionally
returned 503s; `fetchJson` has no timeout or retry, and every caller had to
remember pagination. Two production bugs came from callers reading only the
first page.

## Decision

All new upstream calls go through `createApiClient()` (`src/lib/apiClient.js`):
timeouts, retries on 502/503/504, and `getAllPages()` for paginated lists.

`fetchJson` is deprecated. Existing callers (`ingredientService`,
`shopService`) will be migrated when they're next touched.

## Consequences

- One place for upstream resilience.
- Until the migration is done, both helpers exist in the codebase.
