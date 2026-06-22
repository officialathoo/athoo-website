# Athoo Final Patch Notes

## Fixed in this ZIP

- Vercel SPA fallback for `/admin`, `/become-provider`, `/services`, `/blogs`, `/blog/*`, and every frontend route.
- Replaced fragile route matching with a safe catch-all rewrite to `/index.html` after API rewrite.
- Mobile services gallery now uses a rotating galaxy/orbit, not only horizontal movement.
- Mobile provider gallery now uses a rotating galaxy/orbit, not only horizontal movement.
- Cards can be dragged/swiped by hand on mobile and desktop.
- Desktop card rotation is slowed and cards remain readable.
- Services section and provider section have different color systems and motion styles.
- Home hero has a visible animated galaxy badge on desktop/tablet and animated canvas background.
- Included Neon SQL file for all required API/admin/form tables.

## Required after deployment

1. Run `ATHOO_NEON_REQUIRED_TABLES.sql` in Neon SQL Editor.
2. Vercel build command: `pnpm --filter @workspace/athoo-website run build`.
3. Vercel output directory: `artifacts/athoo-website/dist/public`.
4. Render build command: `pnpm install --frozen-lockfile=false && pnpm --filter @workspace/api-server run build`.
5. Render start command: `pnpm --filter @workspace/api-server run start`.
6. Redeploy Vercel without cache, redeploy Render, then purge Cloudflare cache.

## Important

Admin route 404 is a Vercel route rewrite issue. This ZIP contains the corrected root `vercel.json`.
Forms require Neon tables. If tables are missing, API returns 500 even if code is correct.
