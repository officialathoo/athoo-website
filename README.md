# Athoo Website

Athoo marketing website built with Vite + React, now including a secure serverless lead backend, Neon database storage, admin dashboard, and optional Resend email notifications.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Build

```bash
npm run build
```

## Admin dashboard

After deployment, open:

```txt
/admin
```

Login using the `ADMIN_PASSWORD` environment variable.

## Required deployment environment variables

Add these in Vercel Project Settings → Environment Variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require"
ADMIN_PASSWORD="your-strong-admin-password"
AUTH_SECRET="your-long-random-secret"
```

Optional but recommended for automatic lead emails:

```env
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxx"
LEAD_NOTIFY_TO="official.athoo@gmail.com"
LEAD_EMAIL_FROM="Athoo Website <onboarding@resend.dev>"
RATE_LIMIT_PER_MINUTE="10"
```

## Database

The serverless API automatically creates the required `website_leads` table and indexes. Manual SQL is available at:

```txt
database/schema.sql
```

## Features added

- Form submissions save to PostgreSQL.
- Admin dashboard at `/admin`.
- Search and filter leads.
- CSV export.
- Automatic email notification support via Resend.
- Server-side validation and sanitization.
- Basic rate limiting.
- Security headers.
