# Athoo mobile animation and section differentiation fix

Changed files:
- artifacts/athoo-website/src/components/home/Services3DGallery.tsx
- artifacts/athoo-website/src/components/home/VirtualShowroom.tsx

What changed:
- Mobile now has animated moving galleries instead of static cards.
- Services section uses warm orange/red gallery styling.
- Provider section uses blue/green verified-provider styling.
- Desktop rotations are slower, wider, and more readable.
- Cards keep readable opacity and do not disappear on the back side.
- Animations use transform only for better mobile performance.
- Added ATHOO_NEON_REQUIRED_TABLES.sql for current missing Neon tables: leads, site_settings, email_logs, admin_users.

After replacing:
1. Run `pnpm install`.
2. Run `pnpm run build`.
3. Commit and push.
4. Run ATHOO_NEON_REQUIRED_TABLES.sql in Neon before testing forms/admin settings.
5. Redeploy Vercel and Render.
6. Purge Cloudflare cache.
