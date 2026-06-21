# Athoo Website Fix Notes

## Fixed in this package

1. API startup now loads `.env` files first and automatically runs `ensureSchema()` before listening.
   - This creates/updates Neon tables including `website_leads`, `athoo_admin_users`, email templates, settings, blogs, media, and logs.
   - This also seeds the super admin user.

2. Admin login is hardened/fixed.
   - Super admin email now uses `SUPER_ADMIN_EMAIL` first.
   - If the old seeded password does not match but `ADMIN_PASSWORD` is correct for `SUPER_ADMIN_EMAIL`, the API updates the stored hash and allows login.
   - Optional one-time reset supported with `SUPER_ADMIN_RESET_PASSWORD=true`.

3. Admin panel and form submissions now have a production API fallback.
   - If `VITE_API_BASE_URL` is missing on Vercel and the site is running on `athoo.pk`, `www.athoo.pk`, or `admin.athoo.pk`, frontend calls go to `https://api.athoo.pk` instead of silently posting to Vercel `/api`.

4. CORS is now controlled by `CORS_ORIGIN`.
   - Set: `https://athoo.pk,https://www.athoo.pk,https://admin.athoo.pk`

5. SMTP config supports both normal and Zoho alias variables.
   - `SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS`
   - or `ZOHO_SMTP_HOST/ZOHO_SMTP_PORT/ZOHO_SMTP_USER/ZOHO_SMTP_PASS`

## Required Render environment variables

DATABASE_URL=<postgresql://neondb_owner:npg_kSV6gx9pYltz@ep-calm-queen-an93a89s-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require>
PORT=8080
NODE_ENV=production
SUPER_ADMIN_EMAIL=official@athoo.pk
ADMIN_PASSWORD=<your strong admin password>
SESSION_SECRET=<long random secret>
CORS_ORIGIN=https://athoo.pk,https://www.athoo.pk,https://admin.athoo.pk
SMTP_HOST=smtppro.zoho.com
SMTP_PORT=587
SMTP_USER=official@athoo.pk
SMTP_PASS=<Zoho app password, not normal mailbox password>
SMTP_FROM=official@athoo.pk
ADMIN_NOTIFICATION_EMAIL=official@athoo.pk
SUPPORT_EMAIL=official@athoo.pk
INFO_EMAIL=official@athoo.pk

## Required Vercel environment variable

VITE_API_BASE_URL=https://api.athoo.pk
VITE_SITE_URL=https://athoo.pk

After changing Vercel env vars, redeploy the website because Vite env vars are build-time values.

## One-time admin password reset

If login still says invalid password after deployment:
1. Add this Render env var: `SUPER_ADMIN_RESET_PASSWORD=true`
2. Redeploy Render API.
3. Login with `SUPER_ADMIN_EMAIL` and `ADMIN_PASSWORD`.
4. Remove `SUPER_ADMIN_RESET_PASSWORD` or set it back to `false`.
5. Redeploy again.

## Quick live checks

- API health: `https://api.athoo.pk/api/health`
- Admin login route: `https://api.athoo.pk/api/admin/login`
- Submit route: `https://api.athoo.pk/api/submit`

