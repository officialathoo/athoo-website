# Athoo Website Cleanup Audit Report

## Scope
This package is the website-only production project with the website app, website API, shared packages, Vercel configuration, Render API configuration, Neon/PostgreSQL support, Zoho/SMTP support, SEO assets, and responsive frontend source.

## Removed
- `apps/mobile/` placeholder skeleton because this package is website-only.
- `apps/admin/` placeholder skeleton because the website admin dashboard lives inside `apps/website/src/pages/admin.tsx`.
- Duplicate public assets: `app-interface.png`, `app-interface.webp`, `logo.png`. The canonical files remain `app-interface-clean.webp`, `app-interface-clean.png`, and `athoo-logo.png`.
- Temporary merge report file.

## Fixed
- Updated TypeScript project references from old `lib/*` paths to current `packages/*` paths.
- Updated Orval/codegen paths from old `lib/api-client-react` and `lib/api-zod` paths to `packages/api-client` and `packages/validation`.
- Added `render.yaml` for API deployment on Render without affecting Vercel website deployment.
- Kept Vercel output compatibility: `artifacts/athoo/dist/public`.
- Kept Neon/PostgreSQL environment compatibility through `DATABASE_URL`.
- Kept Zoho/SMTP environment compatibility through `SMTP_*` variables.

## Static verification
- No `node_modules`, `dist`, `.git`, `.replit`, `.expo`, Android build cache, or local `.env` files are included.
- Website source exists under `apps/website/src`.
- Website public assets exist under `apps/website/public`.
- API source exists under `services/api/src`.
- Shared packages exist under `packages/*`.
- Vercel config exists at `vercel.json`.
- Render config exists at `render.yaml`.

## Commands to verify locally
```bash
pnpm install --frozen-lockfile=false
pnpm run build:web
pnpm run build:api
pnpm run typecheck
```

## Deployment notes
- Vercel website: use `pnpm run build:web` and output `artifacts/athoo/dist/public`.
- Render API: use `render.yaml` or manually set build `pnpm run build:api` and start `pnpm run start:api`.
- Neon: keep using your existing `DATABASE_URL`.
- Domain: keep pointing `athoo.pk` to Vercel and API/domain routes according to your current setup.

## Additional cleanup pass
- Removed standalone `apps/admin` deployment references from VPS script and nginx because this package uses website `/admin` route.
- Fixed nginx `limit_req_zone` placement so `api.athoo.pk.conf` is valid when included under nginx `http` context.

## TypeScript consistency
- Added/fixed workspace TypeScript config for provider packages and API types so workspace checks do not point to old paths.
