# Athoo SEO, Mobile Performance, Images, and Frontend/API Fix Report

Applied in this package:

- Frontend form helper now sends first to the working Render API: https://thoo-api.onrender.com.
- Admin panel API fallback now uses Render instead of the unready api.athoo.pk subdomain.
- Sitemap regenerated with current URLs, blog URLs, lastmod dates, and image sitemap entries.
- robots.txt updated to allow crawling while excluding /admin.
- SEO component improved with canonical URL, absolute OG/Twitter images, robots meta, and secure image URL.
- Removed fake GA placeholder script from index.html to avoid unnecessary external request and PageSpeed warning.
- Added preload for app preview / social image.
- Converted large blog/hero PNG images to WebP and pointed static blog posts to local WebP assets instead of remote Unsplash images.
- Changed Framer Motion viewport animations from once-only to repeat on scroll (`once: false`) across the website.
- Added mobile CSS performance safeguards for heavy shadows/backdrop blur and image stability.
- Existing CORS API configuration allows athoo.pk, www.athoo.pk, admin.athoo.pk, Render, local dev, Vercel preview and Render preview domains.

Important deployment settings:

Website/Vercel/Render static env:
VITE_API_BASE_URL=https://thoo-api.onrender.com

Render API env:
CORS_ORIGIN=https://athoo.pk,https://www.athoo.pk,https://admin.athoo.pk,https://thoo-api.onrender.com,http://localhost:5173

SMTP env must be real Zoho/app password values for emails to send:
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_USER=official@athoo.pk
SMTP_PASS=YOUR_ZOHO_APP_PASSWORD
SMTP_FROM=official@athoo.pk
ADMIN_NOTIFICATION_EMAIL=official@athoo.pk
SUPPORT_EMAIL=official@athoo.pk
