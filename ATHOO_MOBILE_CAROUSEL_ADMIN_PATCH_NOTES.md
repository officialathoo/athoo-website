# Athoo Mobile Carousel + Admin Patch Notes

Fixed in this package:

- Replaced unstable mobile 3D orbit with a 3-card mobile carousel for Services.
- Replaced unstable mobile 3D orbit with a 3-card mobile carousel for Providers.
- Mobile carousel supports auto-rotation and finger swipe/drag using pointer events.
- Desktop still keeps the orbit animation.
- Removed visitor-facing helper text about dragging/swiping.
- Fixed waitlist button to scroll to the form and focus the email input instead of stopping early.
- Hardened admin login so ADMIN_EMAIL/ADMIN_PASSWORD can log in even if the DB admin row needs repair.
- SESSION_SECRET now falls back to JWT_SECRET.
- Forms no longer fail just because email logging fails.

Required Render env vars:

ADMIN_EMAIL=official@athoo.pk
ADMIN_PASSWORD=your-admin-password
SESSION_SECRET=long-random-secret
DATABASE_URL=your-neon-url
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=official@athoo.pk
SMTP_PASS=your-zoho-app-password
SMTP_FROM=Athoo <official@athoo.pk>
