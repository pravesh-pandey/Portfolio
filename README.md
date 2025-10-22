# Pravesh Pandey — Creative Developer Platform

This repository contains a production-ready React + Node.js stack for an immersive, multi-page personal website with a creative 3D hero, motion-rich storytelling, and a full project brief intake flow.

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

### Production Build
- Frontend: `npm run build` inside `client`, deploy `client/dist` to static hosting.
- Backend: `npm start` inside `server` after bundling/hosting.

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

## Next Steps
- Connect `/api/brief` to an email/SaaS notification pipeline (SES, Resend, etc.).
- Extend analytics/SEO (OpenGraph tags, structured data).
- Deploy to Vercel/Netlify (frontend) and Render/Fly.io/AWS (backend).

# Portfolio
