# Pravesh Pandey — Creative Developer Platform

This repository contains a production-ready React + Node.js stack for an immersive, multi-page personal website with a creative 3D hero, motion-rich storytelling, and a full project brief intake flow.

test commit
## Stack Overview
- **Frontend:** React 18, Vite, React Router, Framer Motion, @react-three/fiber/@drei for WebGL hero scenes.
- **Backend:** Express 4 with Helmet, CORS, Zod validation, and file-backed brief storage.
- **Styling:** Custom design system influenced by ten world-class creative studios (Resn, Active Theory, Locomotive, MST Agency, Garden Eight, Hello Monday, Adoratorio, Beyond, Kota, Stink Studios).

## Getting Started

### Prerequisites
- Node.js 18+

### Frontend
```bash
cd client
npm install
npm run dev
```
The Vite dev server runs on [http://localhost:5173](http://localhost:5173) and proxies `/api` to the backend.

### Backend
```bash
cd server
npm install
npm run dev
```
The Express server listens on [http://localhost:4000](http://localhost:4000) by default.

### Environment Variables
Duplicate `server/.env.example` to `server/.env` (if you create one) to override defaults:
```
PORT=4000
CLIENT_URL=http://localhost:5173
LOG_FORMAT=dev
```

Create `client/.env` to point the frontend at your API origin when needed:
```
VITE_API_BASE_URL=/api
```
Override the value with your hosted backend URL (for example, `https://portfolio-api.vercel.app/api`) once you deploy.

### Production Build
- Frontend: `npm run build` inside `client`, deploy `client/dist` to static hosting.
- Backend: `npm start` inside `server` after bundling/hosting.

## Continuous Integration
- `.github/workflows/ci.yml` runs on every push and pull request to `main`.
- The workflow installs dependencies for both apps, lints the code, and ensures the frontend build succeeds before merging.

## Deployment

### Frontend — GitHub Pages
1. Push to `main`; the `Deploy Client` workflow builds the Vite app and publishes `client/dist` to GitHub Pages.
2. In your repository settings, enable Pages and choose “GitHub Actions” as the source.
3. Set the repository secret `VITE_API_BASE_URL` to your live backend URL (including `/api`). The workflow injects it during the build so the SPA calls the correct API.

### Backend — Vercel
1. In Vercel, “Import Project” from this GitHub repo and choose the `server` directory as the root.
2. Use the default install command (`npm install`) and build command (`npm run lint` is optional; no build step is required).
3. Ensure the output directory is left blank so Vercel serves the Serverless function from `api/index.js`.
4. Add the environment variables you need (for example `CLIENT_URL=https://<github-username>.github.io/<repo>`).
5. Vercel will provision an endpoint at `https://<project>.vercel.app/api/brief`; copy this URL into the `VITE_API_BASE_URL` secret for GitHub Pages.

## API
`POST /api/brief`
```json
{
  "name": "Jane Doe",
  "email": "jane@company.com",
  "company": "ACME",
  "focus": "Search & personalization",
  "budget": "25k – 60k",
  "timeline": "Q2 2025",
  "overview": "Project summary...",
  "deliverables": "APIs, dashboards",
  "references": "Design system link",
  "consent": true
}
```

Responses:
- `201` `{ ok: true, id: "<generated>" }`
- `422` validation errors array
- `500` for unexpected issues

All submissions persist to `server/data/briefSubmissions.json` (ignored from git).

## Scripts & Tooling
- Lint frontend: `npm run lint` (inside `client`)
- Lint backend: `npm run lint` (inside `server`)

## Repository Setup
```bash
git init
git add .
git commit -m "Initial project snapshot"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```
Once pushed, GitHub Actions and Vercel (after the initial import) will take over deployments automatically.

## Next Steps
- Connect `/api/brief` to an email/SaaS notification pipeline (SES, Resend, etc.).
- Extend analytics/SEO (OpenGraph tags, structured data).
- Harden logging/monitoring for the Vercel deployment (Sentry, Logtail, etc.).

# Portfolio
