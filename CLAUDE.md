# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

Run both client and server together:
```bash
./start-dev.sh
```

Or separately:
```bash
# Frontend (http://localhost:5173)
cd client && npm run dev

# Backend (http://localhost:4000)
cd server && npm run dev
```

### Build & Lint
```bash
# Client
cd client && npm run build
cd client && npm run lint

# Server
cd server && npm run lint
```

### Local build test with production-like settings
```bash
cd client
VITE_API_BASE_URL=https://<vercel-project>.vercel.app/api BASE_PATH=/Portfolio/ npm run build
npx serve dist
```

## Architecture

This is a monorepo with a `client/` (React SPA) and `server/` (Express API).

### Client (`client/`)

- **Framework**: React 18 + Vite, with React Router v6 for routing.
- **Key libraries**: Framer Motion (short reveals and drawer motion). No Three.js and no Lenis; avoid adding runtime dependencies.
- **Look**: dark trading-terminal theme. Color, font and radius tokens live on `:root` in `src/styles/global.css`; older names (`--accent*`, `--surface*`, `--card`, `--text-dim`, `--font-body`, `--font-display`) alias the new tokens. JetBrains Mono for UI, headings and data; Inter for paragraphs. Red is for alerts only.
- **Path aliases**: `@`, `@components`, `@pages`, `@styles`, `@data`, `@layout`, `@hooks` — all resolve under `src/`. Pure modules imported by unit tests (`src/data/*`, `src/shell/commands.js`, `src/shell/hotkey.js`, `src/sim/*`) use relative imports only, because `node --test` doesn't resolve the aliases.
- **Layout**: `AppLayout` wraps every page with `SiteHeader`, `SiteFooter` and the fixed bottom `StatusBar`.
- **Routes** (`router.jsx`): `/`, `/trading`, `/case-studies/:slug`, `/projects`, `/work-with-me`. Old routes (`/about`, `/experience`, `/skills`, `/achievements`, `/contact`, `/process`, `/brief`) redirect.
- **Static data**: `src/data/profile.js` (projects with stable `slug`s, experience, skills, awards), `src/data/caseStudies.js` (case-study copy; trading entries must contain no numbers, enforced by `tests/caseStudies.test.js`), `src/data/links.js` (email, Upwork, social links).
- **Tests**: `npm test` runs `node --test` over `client/tests/`. `scripts/verify-redesign.mjs` is a Playwright smoke test against `vite preview` on port 4173; set `CHROME_PATH` to reuse an installed Chromium.
- **Dev proxy**: Vite proxies `/api` → `http://localhost:4000` so the client hits the local server without CORS issues in dev.

### Server (`server/`)

- **Framework**: Express with Helmet, CORS, Morgan, Zod validation.
- **Entry**: `src/index.js` → `src/app.js` (factory function `createApp()`).
- **Routes**: `POST /api/brief`, `POST /api/contact`, `GET /api/health`.
- **Storage**: `src/lib/briefStore.js` and `src/lib/contactStore.js` write to `data/*.json` locally. When `process.env.VERCEL` is set, they switch to in-memory arrays (Vercel read-only filesystem constraint).
- **Config**: `src/config/env.js` reads from `.env` — copy `server/.env.example` to `server/.env` for local dev.

### Deployment

- **Frontend**: GitHub Pages via `.github/workflows/deploy-client.yml`. Requires `VITE_API_BASE_URL` GitHub secret and `BASE_PATH=/Portfolio/` env at build time. `index.html` is copied to `404.html` for SPA fallback.
- **Backend**: Vercel serverless — root directory is `server/`, Vercel discovers `api/index.js`. Requires `CLIENT_URL` env var set to the GitHub Pages origin.
- **CI**: `.github/workflows/ci.yml` runs lint + build on both `client/` and `server/` for every push/PR to `main`.
