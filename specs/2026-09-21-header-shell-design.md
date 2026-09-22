# Shared header, navigation and maximize design

Extends `2026-09-21-modernization-design.md`. Approved by the user in chat.

## Goals
- One shared header on every page (home, five games, 404), modeled on Nate314/site.
- Theme toggle reachable from every page.
- Back navigation: game pages go to the menu; the home page goes to https://nathangawith.com (which links to games.nathangawith.com).
- Game pages have a maximize button that hides the header; games re-layout live, without restarting.

## Header
- Title is an h1: `Nathan Gawith | <page>`. Pages: `Games` (home), the game title (e.g. `Snake`), `Not Found`. The `Nathan Gawith |` prefix is hidden on narrow screens (max-width 600px), as on the site.
- Left: back control. Home: external link to `https://nathangawith.com`. Game pages and 404: internal link to `/` labelled `Games`.
- Right: maximize button (game pages only) and the existing emoji theme toggle (all pages).
- Maximize state is component state in the shell: not persisted, reset on navigation. While maximized the header is not rendered; a small translucent restore button stays in the top-right corner. Esc is not used (games use it to pause).

## Stage
- The shell renders `header` above a `main.stage` (fills the remaining viewport height). Game routes are wrapped so the game receives its size as a prop: `stage: { width: number; height: number }`, measured from the stage element (ResizeObserver, window resize as fallback). Games never read `window.innerWidth/innerHeight` (dependency inversion, testable).
- Menu and 404 keep normal page scrolling inside the stage.
- Board games (Snake, GameOfLife, Tetris) already recompute square size on each render, now from `props.stage`; they re-render when the stage prop changes, so maximize resizes them live. GameOfLife grid dimensions stay as computed at load.
- FlappyFinch: on stage change, scale bird y and pipe y proportionally (pure `rescale` in logic, tested); the nomnom in each pipe re-rolls inside its gap. CSS uses stage-relative sizes instead of vw/vh.
- FloatyStars: on stage change, scale star locations proportionally (pure `rescaleStars`, tested). CSS stage-relative.

## YAGNI
No persistence of maximize, no fullscreen API, no router-level layout library, no keyboard shortcut for maximize.

## Testing
Unit: header titles per route, back targets, maximize hides and restores, toggle on every page, `useStageSize`, `fitSquareSize` with a stage, rescale functions. E2E: header and toggle on every page, back navigation, external link target, maximize grows the stage and restores, FlappyFinch and FloatyStars keep their state across maximize, axe in both themes, no console errors. Chrome check at 1280 wide.
