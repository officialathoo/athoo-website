# Athoo Website Fix Report

Updated areas:

1. API CORS handling
   - Added default allowed origins for athoo.pk, www.athoo.pk, admin.athoo.pk, api.athoo.pk, thoo-api.onrender.com, localhost.
   - Added robust OPTIONS/preflight handling for Express 5.
   - Set credentials false to match frontend `credentials: "omit"`.

2. Frontend form submission
   - `apps/website/src/lib/emailSubmit.ts` now uses Render API fallback `https://thoo-api.onrender.com`.
   - It treats `{ ok: true }` or a returned `id` as success.
   - It retries fallback API if the configured API URL is blocked or wrong.

3. Submit route stability
   - Submit route keeps saving leads even if email fails.
   - It returns `ok: true`, `id`, and `emailStatus` when DB insert succeeds.

4. SMTP/admin email reliability
   - `sendMail()` now returns true/false instead of silently pretending sent.
   - Admin bulk email now records `sent`, `failed`, and `skipped` correctly.

Required Render environment variables:

DATABASE_URL=your_neon_url
ADMIN_EMAIL=official@athoo.pk
ADMIN_PASSWORD=your_admin_password
CORS_ORIGIN=https://athoo.pk,https://www.athoo.pk,https://admin.athoo.pk,https://thoo-api.onrender.com,http://localhost:5173
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_USER=official@athoo.pk
SMTP_PASS=your_zoho_app_password
SMTP_FROM=official@athoo.pk
ADMIN_NOTIFICATION_EMAIL=official@athoo.pk
SUPPORT_EMAIL=official@athoo.pk

Required website env:

VITE_API_BASE_URL=https://thoo-api.onrender.com

After replacing code:

pnpm install
pnpm run build
git add .
git commit -m "fix website forms cors and admin email"
git push origin main

Then redeploy Render API and website.
