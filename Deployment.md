# Deployment Guide

This document records how the portfolio project is deployed end to end, including the CI pipelines, hosting targets, required secrets, and verification steps.

## Overview

- **Frontend**: React + Vite SPA hosted on **GitHub Pages** under `https://<username>.github.io/<repo>/`.
- **Backend**: Express server exposed as a serverless function on **Vercel** (`https://<project>.vercel.app/api`).
- **Automation**: GitHub Actions runs CI (lint + build) and deploys the frontend automatically on pushes to `main`.

## GitHub Repository Setup

1. Initialise the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial project snapshot"
   git branch -M main
   git remote add origin git@github.com:<username>/<repo>.git
   git push -u origin main
   ```
2. Ensure `.github/workflows/ci.yml` and `.github/workflows/deploy-client.yml` are present in the default branch.

## Environment Variables & Secrets

| Location                  | Name                   | Purpose                                                                 |
|---------------------------|------------------------|-------------------------------------------------------------------------|
| `client/.env` (local)     | `VITE_API_BASE_URL`    | Default `/api` during development so the SPA reaches the local server.  |
| GitHub repo secret        | `VITE_API_BASE_URL`    | Points to `https://<vercel-project>.vercel.app/api` for production builds. |
| Vercel Project Settings   | `CLIENT_URL`           | Whitelist the production frontend origin (`https://<username>.github.io/<repo>`). |
| (Optional) Vercel envs    | Other backend secrets  | E.g., keys for email services, databases, analytics, etc.               |

## Continuous Integration (`.github/workflows/ci.yml`)

Trigger: `push` and `pull_request` targeting `main`.

Jobs:
- **Client**: Installs dependencies, runs `npm run lint`, and `npm run build` in `client`.
- **Server**: Installs dependencies and runs `npm run lint` in `server`.

Use this workflow to gate changes before merging.

## Frontend Deployment (GitHub Pages)

Workflow file: `.github/workflows/deploy-client.yml`

1. Trigger: `push` (main) or manual `workflow_dispatch`.
2. Steps:
   - Checkout repo.
   - Install client dependencies with Node 20.
   - Build the Vite app, injecting `VITE_API_BASE_URL` secret and `BASE_PATH=/<repo>/` so assets + routes work under the Pages subpath.
   - Copy `index.html` to `404.html` for SPA fallback.
   - Upload `client/dist` as a Pages artifact and deploy using `actions/deploy-pages`.
3. Repository Settings → **Pages**: select “GitHub Actions” as the source.
4. Resulting URL: `https://<username>.github.io/<repo>/`.

### Local Build Test

```bash
cd client
VITE_API_BASE_URL=https://<vercel-project>.vercel.app/api BASE_PATH=/Portfolio/ npm run build
npx serve dist
```

## Backend Deployment (Vercel)

1. In Vercel, choose **Add New Project → Import Git Repository** and select this repo.
2. Configure project:
   - **Root directory**: `server`
   - **Framework preset**: Other (Node.js).
   - **Install command**: `npm install`
   - **Build command**: leave empty (optional lint only).
   - **Output directory**: leave empty (Vercel discovers `api/index.js`).
3. Add Environment Variable `CLIENT_URL=https://<username>.github.io/<repo>`.
4. Deploy; Vercel exposes the API at `https://<project>.vercel.app/api`.
5. Copy that URL (with `/api`) into the GitHub `VITE_API_BASE_URL` secret.

### Notes on Storage

- Vercel serverless functions have read-only filesystems. `server/src/lib/briefStore.js` detects the Vercel runtime (`process.env.VERCEL`) and stores submissions in memory per instance.
- For persistence, integrate a database, email service, or queue.

## Verification Checklist

1. **Backend health**: `curl https://<project>.vercel.app/api/health` returns `{"status":"ok"}`.
2. **Frontend deploy**: Visit `https://<username>.github.io/<repo>/` and ensure the SPA loads without 404s.
3. **Form submission**: Submit the project brief form; confirm a `201` comes back from the API (monitor Vercel logs if needed).
4. **CI status**: In GitHub → Actions, `CI` and `Deploy Client` workflows should be green after every push to `main`.

## Maintenance

- Update dependencies periodically using `npm update` or tooling like Renovate.
- Re-run the GitHub Pages deployment manually (`Deploy Client` workflow) if you change repository name or Pages configuration.
- Configure analytics/error tracking (Sentry, Logtail) to monitor both frontend and backend.
- Add persistence or notifications to the backend when ready for production-grade brief handling.

## Troubleshooting

| Symptom                                                 | Fix                                                                       |
|---------------------------------------------------------|---------------------------------------------------------------------------|
| GitHub Pages shows 404 on subroutes                     | Confirm `BASE_PATH` env is set via deploy workflow and cache cleared.     |
| Vercel endpoint returns “Route … not found”             | Ensure `/api` routes exist and latest commit deployed.                    |
| Form can’t reach API                                    | Check `VITE_API_BASE_URL` secret, CORS `CLIENT_URL`, and deploy status.   |
| Vercel deploy fails on write operations                 | Filesystem is read-only; use external storage or in-memory store.         |

