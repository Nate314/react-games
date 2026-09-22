# syntax=docker/dockerfile:1

# Runs the Playwright suite against the `web` service, with no local Node/Playwright install needed.
# Needs the full repo (not just e2e/), since support.ts reads src/games/registry.ts off disk.
FROM mcr.microsoft.com/playwright:v1.63.0-jammy
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

CMD ["npx", "playwright", "test"]
