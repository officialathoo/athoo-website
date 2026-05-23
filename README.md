# Athoo Website

Clean, mobile-first, SEO-ready Vite/React website for Athoo — Pakistan's smart home services app launching soon.

## Vercel Settings

Use these settings when deploying:

- Framework Preset: `Vite`
- Root Directory: leave empty / repo root
- Install Command: `pnpm install --frozen-lockfile=false`
- Build Command: `pnpm run build`
- Output Directory: `dist/public`

## Email Forms

Forms submit to `/api/submit` and are configured for `official.athoo@gmail.com`.
For reliable production delivery, add these environment variables in Vercel:

```env
RESEND_API_KEY=your_resend_api_key
EMAIL_TO=official.athoo@gmail.com
EMAIL_FROM=Athoo Website <onboarding@resend.dev>
```

Without Resend, the website still accepts submissions and uses FormSubmit/mail fallback.

## Included SEO

- Optimized titles and descriptions
- Open Graph and Twitter cards
- Organization, Website, and MobileApplication schema
- Sitemap and robots.txt
- Clean URLs
- Mobile-first responsive layout
- Optimized WebP app preview assets
- Lazy-loaded below-fold home sections
- Reduced render-blocking external fonts

## Commands

```bash
pnpm install --frozen-lockfile=false
pnpm run build
pnpm run preview
```
