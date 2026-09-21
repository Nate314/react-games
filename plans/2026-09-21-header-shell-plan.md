# Header Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox syntax.

**Goal:** Shared header (title, back, maximize, theme toggle) on every page, with games re-laying out live when the header is hidden.

**Architecture:** `AppShell` renders `AppHeader` plus `main.stage`. Game routes are wrapped by `StageHost`, which measures the stage and passes `stage` as a prop. Games use the prop instead of `window` sizes.

**Tech Stack:** React 19, react-router-dom 7, Vitest, Playwright (existing).

**Spec:** `specs/2026-09-21-header-shell-design.md`

## Global Constraints

- Branch `modernize/vite-react19-docker`. Commit only your own paths (`git add <paths>`), retry on index.lock.
- No em-dashes anywhere. Commit messages end with `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.
- SOLID/DRY/YAGNI. No new dependencies. No test-only code in app source. Game rules and controls must not change.
- Files use CRLF line endings: edit with tools that preserve them (single-line replacements or the Edit tool); do not use multi-line Python string replaces without checking.
- Do not leave dev servers running: start on your assigned port, stop the actual listening process at the end.
- Browser checks: the Chrome extension may be unavailable to subagents; use headless system Chrome via the repo's `playwright-core` (`channel: 'chrome'`) and say so in the report.

---

### Task 1: Shell, header and stage (first, alone)

**Files:** Create `src/stage.ts`, `src/components/AppHeader.tsx`, `src/components/AppShell.tsx`, `src/components/StageHost.tsx`, tests beside each (`stage.test.tsx`, `AppHeader.test.tsx`, `AppShell.test.tsx`); Modify `src/App.tsx`, `src/components/Layout.tsx` (remove the header and toggle: it now only wraps menu and 404 content), `src/components/NotFound.tsx` if needed, `src/games/registry.ts` (add `routeTitle`), `src/styles/app.css` (header, stage, restore button, narrow-screen prefix hiding), `src/App.test.tsx` (update), `src/components/ThemeToggle.tsx` (unchanged behavior).

**Interfaces (Produces):**
- `src/stage.ts`: `export interface StageSize { width: number; height: number }`; `export interface GameProps { stage: StageSize }`; `export function useStageSize(ref: RefObject<HTMLElement | null>): StageSize` (ResizeObserver on the element; initial value from its client size, falling back to `window.innerWidth/innerHeight` when it has none, e.g. jsdom).
- `AppHeader({ pageName: string; back: { label: string; to: string; external?: boolean }; onMaximize?: () => void })`: renders `<header>` with `<h1><span class="app-header__brand">Nathan Gawith | </span>{pageName}</h1>`, the back link (`<a href>` when `external`, else react-router `<Link>`), a maximize button (`aria-label="Maximize"`, only when `onMaximize` is given), and `<ThemeToggle />`.
- `AppShell`: uses `useLocation`; computes page name and back target (`/` -> `Games`, back `{label:'nathangawith.com', to:'https://nathangawith.com', external:true}`; game route -> game title, back `{label:'Games', to:'/'}`, maximize enabled; other -> `Not Found`, back to `/`). `maximized` state resets when the pathname changes. When maximized: no header; render a fixed top-right `<button aria-label="Restore header">`. Game routes render inside `StageHost` which renders `<div class="stage-host">` and passes `stage` to the game element via `cloneElement`/render prop.
- `registry.ts`: `export const routeTitle = (pathname: string): string | null` returning the game title for `/${id}`, else null (shell handles `/` and 404).
- All game components already accept `props: any`; they ignore `stage` until Tasks 2a to 2c.

- [ ] Write failing tests: header text per route (`Nathan Gawith | Games`, `Nathan Gawith | Snake`, `Nathan Gawith | Not Found`); back link href/targets (external on home); maximize button only on game routes; clicking Maximize removes the header and shows Restore; Restore brings it back; navigating resets maximize; ThemeToggle present on every route; `useStageSize` with a stubbed ResizeObserver reports the observed size and updates on callback
- [ ] Implement until green; `npx tsc --noEmit` and `npm test` pass
- [ ] Keep visuals consistent with existing tokens (surface, border, accent); header is a slim bar with a bottom border; buttons are 44px round (emoji) or text link style; prefix hidden under 600px
- [ ] Verify in headless Chrome at 1280x800 (light and dark): every route shows the header, no overlap, stage fills the rest, menu still scrolls
- [ ] Commit: `feat: shared app header, stage and maximize`

### Task 2a: Board games use the stage (parallel after Task 1)

**Files:** Modify `src/games/boardSize.ts`, `boardSize.test.ts`, `Snake.tsx`, `GameOfLife.tsx`, `Tetris.tsx`.

**Interfaces:** `fitSquareSize(columns: number, rows: number, stage: StageSize): number` (same reserves as today, using `stage` instead of `window`). Each game reads `this.props.stage` (typed `GameProps`) in `render` and passes it down to its `Board`; no `window.innerWidth/innerHeight` reads remain in these files except GameOfLife's load-time grid dimensions (leave those).

- [ ] Update `boardSize.test.ts` first (stage-based), then implement
- [ ] Verify live resize in headless Chrome: change the stage size (resize the viewport) and confirm the board and HUD resize and stay aligned, with the game state preserved
- [ ] Commit: `refactor: board games size from the stage`

### Task 2b: FlappyFinch live re-layout (parallel after Task 1)

**Files:** Modify `src/games/FlappyFinch.tsx`, `FlappyFinch.logic.ts`, `FlappyFinch.logic.test.ts`, `FlappyFinch.css`.

**Interfaces:** `export const rescale = (state: FlappyFinchGameState, from: StageSize, to: StageSize): void` scales bird y and every pipe y by `to.height / from.height` (x values unchanged); no-op if sizes are equal or `from.height` is 0. The component reads `this.props.stage`, tracks the last stage used, calls `rescale` when it changes, and re-rolls each pipe's nomnom (e.g. include the stage height in the Pipe `key`). CSS: replace `100vh`, `100vw`, `50vw` sizes with stage-relative (`100%`) inside a positioned container (`.stage-host` is `position: relative; height: 100%`).

- [ ] Write failing tests for `rescale` (scales bird and pipe y, leaves x, no-op cases), implement
- [ ] Replace all `window.innerWidth/innerHeight` uses with `this.props.stage`
- [ ] Verify in headless Chrome: play a few seconds, change the viewport height, confirm the game keeps running (bird, pipes, score intact), no console errors
- [ ] Commit: `feat(flappyfinch): re-layout live from the stage`

### Task 2c: FloatyStars live re-layout (parallel after Task 1)

**Files:** Modify `src/games/FloatyStars.tsx`, `FloatyStars.logic.ts`, `FloatyStars.logic.test.ts`, `FloatyStars.css`.

**Interfaces:** `export const rescaleStars = (locations: number[][], from: StageSize, to: StageSize): number[][]` scales x by width ratio and y by height ratio (returns a new array; identity when sizes equal or from is 0). The component reads `this.props.stage`, tracks the last stage, and applies `rescaleStars` on change. CSS stage-relative as in Task 2b.

- [ ] Write failing tests, implement; replace `window` size reads with `this.props.stage`
- [ ] Verify in headless Chrome: stars keep drifting after a viewport size change, count unchanged, no console errors
- [ ] Commit: `feat(floatystars): re-layout live from the stage`

### Task 3: E2E, docs and delivery (after all above; main agent)

- [ ] Update/add e2e: header and title on every page, theme toggle on a game page, back to menu, home back link `href` is `https://nathangawith.com` (assert attribute, do not navigate), maximize hides the header and the stage grows, restore, FlappyFinch and FloatyStars keep state across maximize, axe light and dark
- [ ] README: mention the header, back link and maximize; `./run.sh`, `npm ci && npm run build`, `npm test`, `npm audit`, full e2e against the container
- [ ] Chrome pass at 1280 wide (interactive tool); state that 390 wide was not checked interactively
- [ ] Rebuild docs, commit, push, update PR #33 body
