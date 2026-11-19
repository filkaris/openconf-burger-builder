# ADR 0001: No runtime dependencies

- Status: Accepted
- Date: 2026-03-02

## Context

The burger builder is small, is embedded in someone else's delivery app, and
gets touched by a different contractor every few months.

## Decision

Use Node's standard library only: `node:http` for the server, `node:test` for
tests, vanilla JS modules for the frontend. No build step, no TypeScript.

## Consequences

- `git clone && npm start` works offline.
- We maintain a tiny router (`src/lib/router.js`) ourselves.
- If something really needs a library, write a new ADR first.
