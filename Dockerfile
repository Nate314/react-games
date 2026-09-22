# syntax=docker/dockerfile:1

# --- Stage 1: build the Vite app fresh from source ---
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy the source (docs/ is excluded by .dockerignore) and build
COPY . .
RUN npm run build

# --- Stage 2: serve the built app with nginx ---
FROM nginxinc/nginx-unprivileged:alpine AS runtime

# Vite's outDir is docs/, so that is what gets served.
COPY --from=build --chown=101:101 /app/docs /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
USER 101
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO /dev/null http://127.0.0.1:8080/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
