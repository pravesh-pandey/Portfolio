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
- **Key libraries**: Framer Motion (animations), `@react-three/fiber`/`@drei` + Three.js (3D background), `@studio-freight/react-lenis` (smooth scroll).
- **Path aliases**: `@`, `@components`, `@pages`, `@styles`, `@data`, `@layout`, `@hooks` — all resolve under `src/`.
- **Layout**: `AppLayout` wraps every page with `SiteHeader`, `SiteFooter`, `ScrollProgress`, and `CreativeBackground`.
- **Routes** (`router.jsx`): `/`, `/about`, `/experience`, `/projects`, `/contact`, `/skills`, `/achievements`, `/process`, `/brief`.
- **Dev proxy**: Vite proxies `/api` → `http://localhost:4000` so the client hits the local server without CORS issues in dev.
- **Static data**: `src/data/` holds profile and navigation data used across pages.

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
