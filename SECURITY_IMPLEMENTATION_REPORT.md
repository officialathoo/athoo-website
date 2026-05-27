# Athoo Website Backend + Security Implementation Report

## What was added

- `/api/submit` serverless backend endpoint.
- Neon/PostgreSQL storage table for all website leads.
- `/admin` password-protected admin dashboard.
- Admin lead search, form filter, refresh, and CSV export.
- Resend auto-email notification support.
- Server-side validation and sanitization.
- Basic IP-based rate limiting for form submission and admin login.
- Secure response headers in `vercel.json`.
- Removed public FormSubmit dependency from frontend submissions.

## Important pages/endpoints

- Website: `/`
- Admin dashboard: `/admin`
- Form API: `/api/submit`
- Admin login API: `/api/admin/login`
- Admin leads API: `/api/admin/leads`
- CSV export API: `/api/admin/export`

## Required Vercel environment variables

Set these in Vercel Project Settings → Environment Variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require"
ADMIN_PASSWORD="your-strong-admin-password"
AUTH_SECRET="your-long-random-secret"
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxx"
LEAD_NOTIFY_TO="official.athoo@gmail.com"
LEAD_EMAIL_FROM="Athoo Website <onboarding@resend.dev>"
RATE_LIMIT_PER_MINUTE="10"
```

`RESEND_API_KEY` is optional for database saving, but required for automatic emails.

## Database setup

The API automatically creates the table and indexes on first form submission or admin load. You can also run the SQL manually from:

```txt
database/schema.sql
```

## Security notes

This implementation is production-ready for a landing website lead system, but for very high spam traffic you should add Cloudflare Turnstile or Google reCAPTCHA to the frontend form and verify it inside `/api/submit`.

## What was not changed

The public website design and page layout were kept the same. Only submission behavior and the new admin route were added.
