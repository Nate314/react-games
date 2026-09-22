# Hosting options

## Current: GitHub Pages serving `docs/`

Vite builds into `docs/` (`base: '/'`), Pages serves that folder, and `docs/CNAME` keeps the custom domain. `docs/404.html` is a copy of `index.html` so deep links work.

- Pros: no CI needed, works today, the live site is exactly what is committed.
- Cons: build output lives in git, so every change adds noisy diffs, and someone must remember to rebuild and commit `docs/`.

## Option 2: GitHub Actions deploy to Pages

Remove `docs/` from git, add a workflow that runs `npm ci && npm run build` and deploys the artifact, then switch the Pages source to "GitHub Actions" in the repository settings.

- Pros: clean history, the build is always fresh and reproducible.
- Cons: needs a workflow and a settings change, and the CNAME must be preserved (via the custom domain setting or a file in the build). The build output directory must also stop being committed.

## Option 3: Docker only

Run the nginx container somewhere else and drop Pages.

- Pros: same image locally and in production, with security headers and CSP.
- Cons: needs a host that runs containers, costs money or upkeep, and it would break the live site until DNS is moved.
