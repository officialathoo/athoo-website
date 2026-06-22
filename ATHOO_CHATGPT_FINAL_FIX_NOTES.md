# Athoo final fix notes

This ZIP was patched after the Replit export to address the live blank-screen/admin/forms issues.

## Fixed

- Removed Replit runtime Vite plugin usage from the website build.
- Removed Replit-only project files and mockup sandbox from the replace package.
- Removed unsafe Vite manual chunk splitting that caused the React `Children` runtime crash and blank screen.
- Replaced remaining direct `framer-motion` imports with the existing lightweight `motionLite` wrapper.
- Extended `motionLite` compatibility for `h1` and `AnimatePresence` props.
- Fixed Windows install blocker by removing the Linux-only `preinstall` script.
- Corrected Vercel config for this package structure:
  - build: `pnpm --filter @workspace/athoo-website run build`
  - output: `artifacts/athoo-website/dist/public`
- Hardened API CORS for Athoo domains, Vercel previews, Render, localhost, `Cache-Control`, and `Pragma` headers.
- Made API startup safer locally with default port `8080` if `PORT` is missing.
- Kept real email sender wiring with Nodemailer in the API.

## Required Render settings

Build command:

```bash
pnpm install --frozen-lockfile=false && pnpm --filter @workspace/api-server run build
```

Start command:

```bash
pnpm --filter @workspace/api-server run start
```

Root directory: repository root / blank.

## Required Vercel settings

Build command:

```bash
pnpm --filter @workspace/athoo-website run build
```

Install command:

```bash
pnpm install --frozen-lockfile=false
```

Output directory:

```text
artifacts/athoo-website/dist/public
```

## Required SMTP env vars on Render

```env
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=official@athoo.pk
SMTP_PASS=YOUR_ZOHO_APP_PASSWORD
SMTP_FROM=Athoo <official@athoo.pk>
ADMIN_EMAIL=official@athoo.pk
```

## Required deployment steps

1. Replace project files with this ZIP.
2. Run `pnpm install`.
3. Run `pnpm run build`.
4. Commit and push.
5. Redeploy Render API with clear cache.
6. Redeploy Vercel without cache.
7. Purge Cloudflare cache.
