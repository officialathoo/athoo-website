ATHOO FINAL PATCH NOTES

Fixed in this package:
- Mobile service gallery now uses readable 3D carousel with auto-rotation + finger drag/swipe.
- Mobile provider gallery now uses readable 3D carousel with auto-rotation + finger drag/swipe.
- Hero galaxy canvas now renders particle glow on mobile and fixes resize scaling.
- Waitlist navigation now scrolls to the actual form section with sticky-header offset instead of stopping early.
- Admin login route now auto-creates/updates env admin and creates admin_users table if missing.
- Form submit route now creates missing lead/email tables and never fails just because email logging fails.
- Vercel SPA rewrite retained for /admin, /become-provider and all React routes.
- Added ATHOO_NEON_REQUIRED_TABLES.sql.

Required Render env:
DATABASE_URL=...
ADMIN_EMAIL=official@athoo.pk
ADMIN_PASSWORD=your-current-password
SESSION_SECRET=random-long-secret
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=official@athoo.pk
SMTP_PASS=zoho-app-password
SMTP_FROM=Athoo <official@athoo.pk>

Deploy:
pnpm install
pnpm run build
git add .
git commit -m "final admin forms and mobile animation fixes"
git push origin main
Then redeploy Vercel without cache and Render.
