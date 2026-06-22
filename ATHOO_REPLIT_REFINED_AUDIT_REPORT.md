# Athoo Replit ZIP Replacement Audit

Status: Deployable after environment-secret rotation and normal build verification.

## Critical fixes applied in this refined ZIP

1. Removed committed real `.env` and `.env.local` files from the distributable ZIP.
2. Added `.env.local.example` with safe placeholders.
3. Fixed a broken TypeScript regex in `services/api/src/routes/public.ts` that could break API build/contact email HTML rendering.
4. Kept existing Vercel output path: `artifacts/athoo/dist/public`.
5. Kept Render API setup and CORS headers including `Cache-Control` and `Pragma`.

## Important security action required

The uploaded ZIP contained real Neon and SMTP/admin secrets. Rotate these before production use:

- Neon database password
- Admin password
- Session/Auth secrets
- Zoho SMTP app password

## Deploy commands

```powershell
pnpm install
pnpm run build
git add .
git commit -m "refine replit final build and remove secrets"
git push origin main
```

Then redeploy Vercel without cache and redeploy Render API.
