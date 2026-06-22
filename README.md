# Athoo — Pakistan's Smart Home Services Platform

Pre-launch website connecting customers with verified electricians, plumbers, AC technicians, cleaners, carpenters and painters in Rawalpindi & Islamabad.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS v4 |
| Routing | wouter |
| Animations | Framer Motion + CSS 3D |
| Backend API | Express 5 on [Render](https://render.com) |
| Database | PostgreSQL (Neon DB) + Drizzle ORM |
| Monorepo | pnpm workspaces |

## Project structure

```
artifacts/
  athoo-website/   — React/Vite frontend (SPA)
  api-server/      — Express 5 REST API
lib/
  api-spec/        — OpenAPI spec (source of truth for the contract)
  api-client-react/— Generated React Query hooks
  api-zod/         — Generated Zod schemas
  db/              — Drizzle ORM schema + migrations
scripts/           — Utility scripts
vercel.json        — Vercel deployment config (frontend)
```

## Getting started

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env template
cp .env.example .env
# Edit .env and fill DATABASE_URL + SESSION_SECRET

# 3. Push DB schema (first time)
pnpm --filter @workspace/db run push

# 4. Start everything
pnpm --filter @workspace/api-server run dev   # API on :5000
pnpm --filter @workspace/athoo-website run dev # Frontend on :5173
```

## Build

```bash
pnpm run build
```

Builds `artifacts/athoo-website` → `artifacts/athoo-website/dist/public`
and `artifacts/api-server` → `artifacts/api-server/dist/index.mjs`

## Deploy

### Frontend → Vercel

1. Import repo into Vercel
2. Set **Build Command**: `pnpm --filter @workspace/athoo-website run build`
3. Set **Output Directory**: `artifacts/athoo-website/dist/public`
4. Set **Install Command**: `pnpm install`
5. No env vars needed for the frontend — API calls proxy to Render via `vercel.json`

### API → Render

- Root directory: `artifacts/api-server`
- Build command: `pnpm install && pnpm run build`
- Start command: `node --enable-source-maps dist/index.mjs`
- Env vars: `DATABASE_URL`, `SESSION_SECRET`, `PORT`

## Admin panel

Navigate to `/admin` on the deployed frontend. Login with your admin credentials.

Features: Leads CRM · Bulk Email · Newsletter · Blog CMS · Media Library · FAQ · SEO · Social Links · Services Manager · CMS Controls · Maintenance Mode · Admin Users · Activity Logs · DB Stats · CSV Export

## API

- Public API base: `https://thoo-api.onrender.com`
- Form submissions: `POST /api/submit`
- Public settings: `GET /api/public/settings`
- Public CMS: `GET /api/public/cms`
- Admin: `POST /api/admin/login` → Bearer token → all `/api/admin/*` routes
