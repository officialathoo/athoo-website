# Athoo final audit patch

Fixed in this ZIP:
- TypeScript build error from `motion.a` anchor props.
- Vercel catch-all SPA rewrites for `/admin`, `/become-provider`, and all direct page refreshes.
- Mobile service/provider orbit readability: one active card remains readable; side cards are only previews.
- Mobile orbit still auto-rotates and supports touch drag/swipe.
- Removed internal helper copy such as “drag/swipe orbit” text.
- Hero background nebula animation added for mobile and desktop.
- Removed CSS that disabled mobile perspective/orbit effects.
- Admin login can auto-create first admin from `ADMIN_EMAIL` + `ADMIN_PASSWORD` if the database has no admin user.
- Added Neon schema SQL matching current serial-id Drizzle schema.

Required after deploy:
1. Run `ATHOO_NEON_REQUIRED_TABLES.sql` in Neon.
2. Set Render env vars `ADMIN_EMAIL` and `ADMIN_PASSWORD` before first admin login if no admin exists.
3. Redeploy Vercel without cache and purge Cloudflare.

Admin login note:
- Run the SQL file in Neon. It creates/updates `official@athoo.pk` as a super admin.
- The included seeded password hash matches the password you previously provided in the chat.
- Change the password immediately after successful login.
