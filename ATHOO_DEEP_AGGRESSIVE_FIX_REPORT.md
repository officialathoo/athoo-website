# Athoo Deep Aggressive Fix Report

This package focuses on the deployment-breaking issues shown in the latest screenshots.

## Fixed

1. **Admin panel 404 on `/admin`**
   - Replaced invalid Vercel negative-lookahead rewrite with explicit safe SPA rewrites.
   - `/admin` and `/admin/*` now route to `index.html` without rewriting static assets.

2. **Blank screen React crash**
   - Simplified Vite manual chunking.
   - Removed separate `vendor-react` split that caused React runtime crash: `Cannot set properties of undefined (setting 'Children')`.

3. **Forms/settings CORS error**
   - Added `Cache-Control` and `Pragma` to Render API CORS allowed headers.
   - Removed frontend `Cache-Control` custom request headers where possible to avoid unnecessary preflights.
   - Replaced `cache: "no-store"` with timestamp query params for public CMS/settings requests.

4. **Maintenance mode**
   - Public settings request now calls `/api/public/settings?ts=...` without blocked cache headers.
   - Admin settings calls no longer send unnecessary `Cache-Control` header.

5. **Timer**
   - Restored one single countdown component.
   - Removed duplicate timer source.
   - Configured single countdown to the 72-day launch window target.

6. **Preload warnings**
   - Removed unused image preloads from `index.html`.

7. **SEO/static routing**
   - Kept clean sitemap, robots, and llms headers.
   - Avoided invalid Vercel regex source pattern.

## Important deploy steps

Run locally:

```powershell
pnpm install
pnpm run build
git add .
git commit -m "fix admin routing cors timer and react chunk crash"
git push origin main
```

Then:

1. Vercel: redeploy latest commit without cache.
2. Render API: redeploy latest commit.
3. Cloudflare: purge cache.

## Required Render env for email

```env
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=official@athoo.pk
SMTP_PASS=ZOHO_APP_PASSWORD
SMTP_FROM=official@athoo.pk
SMTP_FROM_NAME=Athoo
ADMIN_NOTIFICATION_EMAIL=official@athoo.pk
SUPPORT_EMAIL=official@athoo.pk
```
