# react-games Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox syntax.

**Goal:** Modernize react-games (Vite, React 19, TS 5, refreshed UI), add Docker, unit tests, e2e tests, and a security pass, without changing game behavior.

**Architecture:** Static SPA. Pure game logic in `src/games/<game>/logic.ts`; React components render and wire input/timers; a `games` registry drives the menu and routes. Built to `docs/` for GitHub Pages; also served by unprivileged nginx in Docker.

**Tech Stack:** Vite, React 19, TypeScript 5, react-router-dom, Vitest, Testing Library, Playwright, @axe-core/playwright, nginx, Docker.

**Spec:** `specs/2026-09-21-modernization-design.md`

## Global Constraints

- Work on branch `modernize/vite-react19-docker`; never commit to master.
- No em-dashes in any prose, README, docs, or commit messages.
- Commit messages end with `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.
- SOLID/DRY/YAGNI: no UI library, no state library, no abstractions used by fewer than 2 call sites, no test-only code in app source.
- Game behavior (rules, speeds, controls, scoring) must not change.
- Vite `outDir: docs`, `base: '/'`; `docs/CNAME` and `docs/404.html` must survive builds (source them from `public/`).
- Node via nvm; Windows with Git Bash + PowerShell (forward slashes).
- Parallel agents commit only their own paths (`git add <paths>`, never `-A`), retrying on index.lock.
- "Done" requires evidence: command output for tests/build/audit; Chrome verification at two window sizes for UI.
- Zero `npm audit` findings at the end.

---

### Task 1: Scaffold Vite + React 19 + TS 5 (must finish first)

**Files:** Modify `package.json`, `tsconfig.json`, `.gitignore`; Create `vite.config.ts`, root `index.html`, `tsconfig.node.json`, `src/main.tsx`; Delete `yarn.lock`, `src/serviceWorker.ts`, `src/react-app-env.d.ts`, `src/index.tsx` (after moving); `public/` holds `CNAME`, `404.html`, favicon, assets.

**Interfaces:**
- Produces: scripts `dev`, `build`, `preview`, `test` (vitest run), `test:e2e` (playwright test); all devDependencies for later tasks installed up front (vitest, jsdom, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, @playwright/test, @axe-core/playwright) so parallel tasks never edit package.json. Runtime deps: react, react-dom, react-router-dom only. Removes `@material-ui/core`.
- Consumes: existing `src/index.tsx`, games, `docs/` output.

- [ ] Remove react-scripts/MUI/old @types pins, install latest stable versions; `npm install`
- [ ] Port `src/index.tsx` to `src/main.tsx` with unchanged behavior except MUI replaced by plain elements (`<button>`, `<div class="card">`, `<h2>`/`<p>`); Task 2 restyles
- [ ] Vite config with `outDir: 'docs'`, `emptyOutDir: true`, `base: '/'`; verify `npm run build` yields `docs/index.html`, `docs/CNAME`, `docs/404.html`, assets
- [ ] Verify `npm run dev` serves the menu and every game route loads with no console errors (Chrome)
- [ ] Commit: `build: migrate to Vite, React 19, TypeScript 5`

### Task 2: Game registry + UI refresh (parallel after Task 1)

**Files:** Create `src/games/registry.ts`, `src/App.tsx`, `src/styles/tokens.css`, `src/styles/app.css`, `src/components/GameCard.tsx`, `src/components/Layout.tsx`, `src/components/NotFound.tsx`, `src/App.test.tsx`; Modify `src/main.tsx`; touch each game's `.css` only for theme-token adoption.

**Interfaces:**
- Produces: `export interface GameEntry { id: string; title: string; description: string; image: string; component: React.ComponentType }`; `export const games: GameEntry[]` (single source for menu cards and routes; route path `/${id}`).
- Consumes: the five game components as-is from Task 1.

- [ ] Write render tests: menu shows one card per registry entry; each card links to `/${id}`; unknown route shows NotFound
- [ ] Implement registry, App, GameCard, Layout, NotFound
- [ ] Visual refresh: CSS custom-property tokens, `prefers-color-scheme` dark/light, responsive grid, focus-visible styles, adequate contrast
- [ ] Chrome-verify menu and each game page at desktop (1280 wide) and mobile (390 wide): no overlap, blank rows, or misplaced controls
- [ ] Commit: `feat: game registry and refreshed UI`

### Task 3a: Extract and unit-test logic: Snake, GameOfLife, FloatyStars (parallel)
### Task 3b: Extract and unit-test logic: Tetris, FlappyFinch (parallel)

**Files (per game):** Create `logic.ts` and `logic.test.ts` beside the game component; modify the component to import from `logic.ts`. Do not move component files (Task 2 may be editing paths); check `git log` first.

**Interfaces:**
- Produces: per game, pure exported functions with explicit state types (no React, timers, DOM, or `Math.random` inside logic; inject `rng: () => number` where randomness exists). Each game exposes at least a step/update function taking state (+ input) and returning new state.
- Consumes: existing component code (read it to determine state shape and rules; preserve exactly).

- [ ] Write characterization tests for current rules first (movement, collision, scoring, game over, wrap, line clear, gravity, as applicable)
- [ ] Extract logic with no behavior change; the component keeps only rendering, input, and timer wiring
- [ ] Extract only what the tests need (YAGNI); add a shared `useGameLoop` hook only if 2+ components share the same pattern
- [ ] `npm test` green; Chrome-verify the game still plays identically
- [ ] Commit per game: `refactor(<game>): extract pure logic with tests`

### Task 4: Docker and launchers (parallel after Task 1)

**Files:** Create `Dockerfile`, `nginx.conf`, `.dockerignore`, `docker-compose.yml`, `.env.example`, `run.sh`, `run.ps1`. Model on `../EZPoll` and `../site` (same hardening, CSP, launcher behavior); read those first.

**Interfaces:**
- Produces: `docker compose up` serves the app at `http://localhost:${WEB_PORT:-8080}`; `run.sh`/`run.ps1` pick a free port, write `.env`, start compose. Container listens on 8080 (unprivileged).
- Consumes: `npm run build` output. The Vite build writes to `docs/`, so the Docker build stage copies from `/app/docs`.

- [ ] Multi-stage Dockerfile (node LTS build, `nginxinc/nginx-unprivileged` runtime), SPA fallback to `index.html`, security headers and CSP, gzip, long cache for hashed assets
- [ ] Compose with `cap_drop: ALL`, `no-new-privileges`, read-only rootfs plus tmpfs where nginx needs it, healthcheck
- [ ] Verify: `docker compose up -d --build`, `curl -I` shows headers, deep link (e.g. `/snake`) returns 200, `docker compose down`
- [ ] Verify launchers on Windows (PowerShell and Git Bash)
- [ ] Commit: `build: add Docker, compose, and launcher scripts`

### Task 5: Playwright e2e (after Tasks 2, 3, 4)

**Files:** Create root `playwright.config.ts`, `e2e/navigation.spec.ts`, `e2e/games.spec.ts`, `e2e/responsive.spec.ts`, `e2e/accessibility.spec.ts` (root-level config, single install: YAGNI).

**Interfaces:**
- Consumes: `games` registry ids/titles from `src/games/registry.ts`; base URL from `E2E_BASE_URL` (default `http://localhost:8080`, the compose stack).

- [ ] Navigation: menu lists every game, each card opens its route, back works, unknown path shows NotFound
- [ ] Per game: loads without console errors, keyboard input accepted, visible state changes (use `page.clock` for timing; no test-only app code)
- [ ] Responsive: desktop and mobile viewports, no horizontal overflow, controls visible
- [ ] Accessibility: axe scan of menu and each game, zero serious/critical violations (fix app issues, not the test)
- [ ] Run against the Docker stack; all pass; commit: `test: add Playwright e2e suite`

### Task 6: Docs, hosting note, Dependabot, security (parallel after Task 1)

**Files:** Modify `README.md`; Create `hosting-options.md` (repo root, outside `docs/`), `.github/dependabot.yml`.

- [ ] `hosting-options.md`: current choice (Vite outputs to `docs/`, Pages serves it) and alternatives: (2) GitHub Actions Pages deploy with `docs/` removed from git and Pages source switched in repo settings, (3) Docker-only, which would break the live site; trade-offs for each
- [ ] README: what it is, quick start (`run.sh`/`run.ps1`, `docker compose up`), dev, unit and e2e commands, build-to-`docs/` note; no em-dashes
- [ ] Dependabot for npm, docker, github-actions (weekly)
- [ ] `npm audit` reports 0; record output
- [ ] Commit: `docs: README, hosting options, dependabot`

### Task 7: Final verification and PR (last, main agent)

- [ ] Fresh check: `npm ci && npm run build && npm test`; `docker compose up` plus `npm run test:e2e` all green
- [ ] Chrome pass at two window sizes on menu and all five games
- [ ] Push branch, `gh pr create` (description ends with the Claude Code attribution line); ask the user before ticking issue #5 or editing the modernization-todo README

## Execution order and parallelism

Task 1 alone, then Tasks 2, 3a, 3b, 4, 6 in parallel (disjoint files), then Task 5, then Task 7.
