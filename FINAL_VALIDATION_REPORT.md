# Athoo Final Deployment Package

This package has been corrected to avoid the previous Vercel API failures.

## Critical fixes applied

- Removed `api/[...path].ts` to stop Vercel TypeScript/ESM compilation errors.
- Added a single CommonJS Vercel handler at `api/[...path].js`.
- Removed dependency on `@workspace/db` runtime imports inside the deployed API.
- API now uses direct `pg` connection from the root `pg` dependency.
- API auto-creates/repairs required Neon tables and columns on first request.
- Added permanent handlers for admin login, leads, analytics, settings, CMS, admin users, lead update, CSV export, bulk email, email logs, templates, lead notes, public CMS/settings, and form submit.
- Kept Athoo website/admin frontend structure and visual style unchanged.
- Removed `.env.local` from the ZIP.

## Local checks performed

- `node -c api/[...path].js` passed with zero syntax errors.
- Full Vercel build could not be executed in this sandbox because pnpm/corepack attempted to download pnpm from npm registry and internet access is unavailable in this environment.

## Required Vercel environment variables

- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `AUTH_SECRET`
- `LEAD_NOTIFY_TO`
- `LEAD_EMAIL_FROM`
- `RATE_LIMIT_PER_MINUTE`
- `RESEND_API_KEY` optional but required for real email sending

## Deploy steps

1. Replace your repository files with this package.
2. Commit and push.
3. In Vercel, redeploy without cache.
4. Login at `/admin` using either:
   - email: `official.athoo@gmail.com`
   - password: your `ADMIN_PASSWORD`

The API will create/repair database tables automatically on first request.
