import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const outDir = 'docs';

// GitHub Pages serves 404.html for unknown paths; reuse index.html so deep links load the SPA.
const spaFallback = (): Plugin => ({
    name: 'spa-404-fallback',
    apply: 'build',
    closeBundle() {
        copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, '404.html'));
    }
});

export default defineConfig({
    base: '/',
    plugins: [react(), spaFallback()],
    build: { outDir, emptyOutDir: true },
    test: { environment: 'jsdom', globals: true }
});
