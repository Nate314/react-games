# react-games

A small static site of five browser games built with React 19, TypeScript and Vite: Flappy Finch, Floaty Stars, Game of Life, Snake and Tetris. It is served with GitHub Pages from the `docs/` folder.

## Quick start

With Docker (no local Node install needed):

```shell
docker compose up
```

Or use the launcher, which picks a free port and writes `.env`:

```
./run.sh          # macOS, Linux, Git Bash
.\run.ps1         # Windows PowerShell
```

Any arguments are passed on to `docker compose`, for example `./run.sh down`.

## Development

```shell
npm ci
npm run dev
```

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with hot reload |
| `npm run build` | Type-check with `tsc`, then build to `docs/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Unit tests (Vitest, Testing Library) |
| `npm run test:e2e` | End-to-end tests (Playwright, includes axe accessibility checks) |

## Build output

`npm run build` writes to `docs/` (emptying it first), which GitHub Pages serves. The build also copies `index.html` to `404.html` so deep links load the single page app. Commit the rebuilt `docs/` when you change the app. See `hosting-options.md` for alternatives.

## Dependencies

Dependabot checks npm, Docker and GitHub Actions weekly. `npm audit` currently reports 0 vulnerabilities.
