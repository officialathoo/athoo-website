# Athoo Website Production Project

Clean website-only production package for Athoo. This is not the full mobile app monorepo.

## Includes

- Public website: `apps/website`
- Website admin/lead dashboard: `apps/website/src/pages/admin.tsx`
- Website API: `services/api`
- Shared packages: `packages/*`
- Vercel config: `vercel.json`
- Render API config: `render.yaml`
- VPS reference configs: `infrastructure/*`

## Existing resource compatibility

Kept compatible with:

- Vercel website deployment
- Render API deployment
- Neon/PostgreSQL via `DATABASE_URL`
- Zoho/SMTP via `SMTP_*` env variables
- Existing `/api/*` route pattern
- Existing build output: `artifacts/athoo/dist/public`

## Local setup

```powershell
pnpm install --frozen-lockfile=false
copy .env.example .env
pnpm run dev:api
# second terminal
pnpm run dev:web
```

## Vercel settings

Install command:

```text
pnpm install --frozen-lockfile=false
```

Build command:

```text
pnpm run build:web
```

Output directory:

```text
artifacts/athoo/dist/public
```

## Render API settings

Use `render.yaml`, or manually set:

```text
Build command: pnpm install --frozen-lockfile=false && pnpm run build:api
Start command: pnpm run start:api
```

## Required environment variables

See `.env.example`. Never commit real secrets. Minimum production keys:

```text
DATABASE_URL
ADMIN_PASSWORD
AUTH_SECRET
SESSION_SECRET
SUPER_ADMIN_EMAIL
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM
RATE_LIMIT_PER_MINUTE
VITE_API_BASE_URL
VITE_SITE_URL
```

## Verification

```powershell
pnpm run build:web
pnpm run build:api
pnpm run typecheck
```

## Notes

- Website SEO assets are in `apps/website/public`.
- Blog/article source is in `apps/website/src/lib/blogData.ts` and website pages.
- Admin lead dashboard is inside the website app, not a separate admin app in this package.
- Mobile app is not included in this website package.
