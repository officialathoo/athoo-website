# Athoo Admin / Email / Maintenance Fix Report

Fixed in this package:

1. Maintenance mode
   - Admin settings now save to the correct database keys used by the public website:
     - `maintenance_mode`
     - `support_email`
     - `support_phone`
   - Public website now reads maintenance mode from the API and shows a full maintenance screen.
   - Admin panel is excluded from maintenance mode so you can still login and turn it off.

2. Lead emails and form emails
   - SMTP env aliases expanded for Render: `SMTP_*`, `ZOHO_SMTP_*`, `MAIL_*`, and `EMAIL_*`.
   - Auto form emails now log every admin/customer email attempt into `athoo_email_logs`.
   - User confirmation email and admin notification email are sent independently.
   - A failed admin email no longer prevents customer email attempt.

3. Admin panel email tools
   - Bulk email response now returns sent/failed/skipped counts and SMTP status.
   - Added backend endpoints:
     - `GET /api/admin/smtp-status`
     - `POST /api/admin/test-email`
   - Existing email logs continue to show sent/failed/skipped attempts.

4. Admin permissions
   - Old stored permission keys like `leads`, `email`, `settings`, `blogs`, `media`, `seo` now map to the newer permissions such as `view_leads`, `send_email`, and `manage_settings`.
   - Seeded default admin/manager roles include both old and new permission keys.

Required Render environment variables for email:

SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-real-zoho-email@athoo.pk
SMTP_PASS=your-zoho-app-password
SMTP_FROM=your-real-zoho-email@athoo.pk
ADMIN_NOTIFICATION_EMAIL=official@athoo.pk
SUPPORT_EMAIL=official@athoo.pk

Important: Zoho usually requires an app password, not your normal inbox password.
