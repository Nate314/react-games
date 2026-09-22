# react-games modernization design

Tracking: Nate314/project-modernization-todo#5. Precedent: EZPoll PR #47.

## Goals
Vite + React 19 + TS 5, refreshed look, Docker, unit tests, e2e tests, security pass. Game behavior unchanged.

## Decisions
- Hosting: keep GitHub Pages serving `docs/` (Vite `outDir: docs`, `base: '/'`, keep CNAME and 404.html SPA fallback). Alternatives recorded in `hosting-options.md` (kept outside `docs/` because Vite empties it).
- UI: drop `@material-ui/core` (only Card, Button, Typography used); plain CSS with design tokens, light/dark via `prefers-color-scheme`, responsive. YAGNI: no UI library, no state library.
- Structure (SRP): pure game logic in `src/games/<game>/logic.ts` (no React, no timers, no DOM); component renders and wires input/timers. Shared `useGameLoop` hook only if 2+ games share the pattern (DRY). Menu driven by a single `games` registry (OCP: adding a game = one entry).
- No behavior changes or refactors beyond extraction needed for testing.

## Testing
- Unit (Vitest + Testing Library): logic modules; menu/router render.
- E2E (Playwright, `e2e/`): navigation + 404; per game loads, keyboard input, state change; mobile + desktop viewports; axe accessibility. Use Playwright clock control for timing, no test-only app code.

## Docker
Multi-stage (node build, unprivileged nginx, CSP + security headers). compose with `cap_drop: ALL`, `no-new-privileges`. `run.sh`/`run.ps1` pick free ports, write `.env` (as in EZPoll).

## Other
`npm audit` 0, README rewrite, Dependabot config, branch + PR, tick issue #5 checklist. Verify in Chrome at two window sizes before claiming done.
