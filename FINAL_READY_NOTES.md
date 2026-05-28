# Athoo Final Ready Notes

This package has been patched to use a standalone Vercel API handler at `api/[...path].ts`.
It no longer imports the broken workspace API server at runtime.

## Required Vercel Environment Variables

DATABASE_URL=your Neon pooled PostgreSQL URL
ADMIN_PASSWORD=your admin password
AUTH_SECRET=any long random secret
LEAD_NOTIFY_TO=official.athoo@gmail.com
RATE_LIMIT_PER_MINUTE=10
RESEND_API_KEY=optional
LEAD_EMAIL_FROM=Athoo Website <onboarding@resend.dev>

## Deploy

1. Extract this ZIP.
2. Run `pnpm install` from project root.
3. Commit and push to GitHub.
4. Redeploy on Vercel without cache.

The API auto-creates required database tables on first request.
