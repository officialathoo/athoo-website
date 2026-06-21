# Athoo Final Admin, SEO, Performance Fix Report

This package fixes the areas reported after PageSpeed/admin testing.

## Admin panel fixes
- Fixed Email Template update button by adding backend PATCH `/api/admin/templates/:id`.
- Fixed Email Template save/delete flow to wait for API success and show errors if backend fails.
- Added delete button for templates.
- Kept admin API base locked to Render fallback: `https://thoo-api.onrender.com`.
- Settings values are now parsed robustly whether Neon returns JSONB objects or JSON strings.
- Maintenance mode save/read flow is connected through `app_settings.maintenance_mode` and `/api/public/settings`.

## Publish/apply-to-website fixes
- Blog list and blog detail pages now use the shared API resolver instead of an empty env URL.
- Published blog posts from admin are fetched from `/api/public/blog/posts` and `/api/public/blog/posts/:slug`.
- Home hero now reads public CMS settings from `/api/public/cms`, so CMS hero title/subtitle/badge changes apply without rebuilding.

## SEO fixes
- Rebuilt clean `sitemap.xml` with core pages and blog URLs.
- Rebuilt `robots.txt` with sitemap, admin/API disallow, and AI/search crawler allowances.
- Added Vercel cache headers for assets, images, sitemap and robots.
- Added clean static route rewrites so `sitemap.xml`, `robots.txt`, images and verification files are not redirected to SPA HTML.

## Performance fixes
- Removed duplicate external Google font loading and switched to system font stack.
- Added optimized `athoo-logo.webp` and replaced public logo references.
- Added explicit width/height/decoding/fetchPriority/lazy loading to key images.
- Added mobile CSS performance reductions for expensive blur/backdrop effects.
- Kept app screenshots as WebP and prevented old PNG references in frontend code.

## Required Render env for email
SMTP emails will only send if Render has real SMTP credentials:

SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=official@athoo.pk
SMTP_PASS=YOUR_ZOHO_APP_PASSWORD
SMTP_FROM=official@athoo.pk
SMTP_FROM_NAME=Athoo
ADMIN_NOTIFICATION_EMAIL=official@athoo.pk
SUPPORT_EMAIL=official@athoo.pk
CORS_ORIGIN=https://athoo.pk,https://www.athoo.pk,https://admin.athoo.pk,https://thoo-api.onrender.com

After deploy, test:
- https://thoo-api.onrender.com/api/healthz
- Admin > Site Settings > Maintenance toggle
- Admin > Email Templates > Save/Edit/Delete
- Admin > Bulk Email > Send selected
- Public `/blogs` after publishing a post
