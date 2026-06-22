# Athoo final patch notes

Fixed in this package:

- Vercel routing: added explicit `/admin` and route rewrites so direct admin opens do not return Vercel 404.
- Mobile animations: replaced static/non-interactive mobile grids with touch-swipe galaxy galleries for services and providers.
- Galaxy effects: added mobile and desktop galaxy/orb/ring animation layers in the hero and gallery sections.
- Accessibility: fixed WhatsApp SVG alternative text issue.
- AI/SEO: updated `llms.txt` with explicit Markdown links and cleaned sitemap/robots.
- Security: removed `.env` and `.env.local` from the export. Use Render/Vercel environment variables.

Required deployment reminders:

1. Run `ATHOO_NEON_REQUIRED_TABLES.sql` in Neon if tables are missing.
2. Deploy Render API after setting SMTP and DATABASE_URL variables.
3. Deploy Vercel without cache.
4. Purge Cloudflare cache.
