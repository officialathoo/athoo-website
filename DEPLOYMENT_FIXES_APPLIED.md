# Athoo Deployment Fixes Applied

This cleaned package is prepared for GitHub + Vercel + Neon deployment.

## Key fixes

- Removed local `node_modules`, stale build output, `.env.local`, and lock-file conflicts.
- Kept `pnpm-lock.yaml` only.
- Fixed Vercel catch-all API handler.
- Added safe one-time database schema initialization for Vercel serverless cold starts.
- Fixed API route mounting so these work correctly:
  - `/api/health`
  - `/api/submit`
  - `/api/admin/login`
  - `/api/admin/leads`
  - `/api/admin/export`
  - `/api/admin/bulk-email`
  - `/api/public/waitlist`
  - `/api/public/contact`
  - `/api/public/cms`
  - `/api/public/settings`
- Fixed TypeScript ESM imports in the DB package.
- Added DB schema aggregate export for NodeNext/Vercel compatibility.
- Added `admin_notifications` table support.
- Limited API-server typecheck to active deployment files to avoid old Replit-only route type errors.
- Removed secrets from the ZIP.

## Required Vercel environment variables

Add these in Vercel Project Settings → Environment Variables:

```env
DATABASE_URL=your_neon_pooled_connection_string
ADMIN_PASSWORD=your_admin_password
AUTH_SECRET=your_long_random_secret
SESSION_SECRET=your_long_random_secret
LEAD_NOTIFY_TO=official.athoo@gmail.com
RATE_LIMIT_PER_MINUTE=10
RESEND_API_KEY=
LEAD_EMAIL_FROM=Athoo Website <onboarding@resend.dev>
```

`RESEND_API_KEY` can stay empty until email sending is configured.

## Deploy commands

```powershell
pnpm install
pnpm run build:web
git add .
git commit -m "Deploy cleaned Athoo website"
git push
```

Then redeploy on Vercel without cache.

## Neon

The app now attempts to create/update required tables on API cold start. You can also manually run `database/schema.sql` in Neon SQL Editor.
