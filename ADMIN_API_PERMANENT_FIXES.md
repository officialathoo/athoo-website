# Athoo Permanent Admin/API Fixes Applied

This package removes the old TypeScript/ESM Vercel handler problems and uses one standalone CommonJS Vercel API file:

- `api/[...path].js`

It permanently handles the admin panel routes used by the frontend:

- `POST /api/admin/login`
- `GET /api/admin/leads`
- `GET /api/admin/analytics`
- `GET /api/admin/settings`
- `POST /api/admin/settings`
- `GET /api/admin/cms`
- `POST /api/admin/cms`
- `GET /api/admin/admins`
- `POST /api/admin/admins`
- `DELETE /api/admin/admins/:id`
- `POST /api/admin/lead-update`
- `GET /api/admin/export`
- `POST /api/admin/bulk-email`
- `GET /api/admin/email-logs`
- `GET /api/admin/lead-notes/:leadId`
- `POST /api/admin/lead-note`
- `GET /api/admin/templates`
- `POST /api/admin/templates`
- `DELETE /api/admin/templates/:id`
- `GET /api/admin/activity`
- `POST /api/submit`
- `POST /api/public/waitlist`
- `POST /api/public/contact`
- `GET /api/public/settings`
- `GET /api/public/cms`

Database schema is created/updated automatically on cold start with safe `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE IF NOT EXISTS` operations.

Logo/favicon fixes applied:

- Real Athoo logo is now used as browser favicon.
- `favicon.ico` and `apple-touch-icon.png` generated.
- Admin panel logo path remains `/athoo-logo.png`.

Important Vercel env variables:

- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `AUTH_SECRET`
- `LEAD_NOTIFY_TO`
- `LEAD_EMAIL_FROM`
- `RESEND_API_KEY` optional for real email sending

Deploy steps:

1. Replace project files with this package.
2. Run `pnpm install` from root.
3. Commit and push.
4. Redeploy on Vercel without cache.
5. Login at `/admin` with email blank or `official.athoo@gmail.com` and your `ADMIN_PASSWORD`.
