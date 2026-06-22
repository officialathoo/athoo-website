# Athoo Website — Changelog

## Release: 2026-06-22 — 3D Virtual Showroom + Full Overhaul

### Phase 10: Futuristic 3D Design
- **NEW** `Hero3DScene.tsx` — Interactive 3D particle field on home hero using Canvas 2D API (mouse-reactive, 120 particle nodes with connecting lines, depth simulation)
- **NEW** `Services3DGallery.tsx` — CSS 3D orbital service showcase (10 service cards, drag to rotate, mobile grid fallback)
- **NEW** `VirtualShowroom.tsx` — Provider orbit showcase (6 provider cards on 3D orbit, drag to rotate, mobile grid fallback)
- **NEW** `Stats3D.tsx` — Dark-themed animated statistics section replacing `StatsSection` on home page
- **UPDATED** `HomeHero.tsx` — Now uses dark background (`#060d1c`) with 3D particle canvas background
- **UPDATED** `home.tsx` — Added `Services3DGallery`, `VirtualShowroom`, and `Stats3D` sections

### Phase 2: Routing
- All Vercel rewrites verified: `/admin`, `/about`, `/services`, `/contact`, `/blog/*`, `/blogs/*`, `/support`, `/privacy`, `/terms`, `/how-it-works`, `/faq`, `/cookie-policy`
- All direct URL opens work correctly after page refresh

### Phase 1 + 5: Navbar & Admin
- **FIXED** `Navbar.tsx` — Dark-capable variant: transparent + white text when on home page (over 3D hero), switches to light style on scroll or other pages
- Mobile menu updated to dark glass theme

### Phase 4: Email System
- **IMPROVED** `mailer.ts` — Added `brandedEmail()` and `notificationRows()` helper functions for professional Athoo-branded HTML emails
- **IMPROVED** `submit.ts` — All admin notifications now use branded email wrapper with proper table layout, Athoo header/footer, reply-to wiring
- **IMPROVED** `submit.ts` — User confirmation emails (Waitlist, Provider) now use beautiful branded HTML templates
- **IMPROVED** `public.ts` — Contact form, Provider Waitlist admin + user emails all use new branded templates

### Phase 9: Animations
- **ADDED** `athoo-pulse` and `athoo-spin` CSS keyframes in `index.css` for VirtualShowroom orbit center
- All 3D animations are CSS/Canvas-based (no heavy library overhead, no WebGL required)
- Continuous smooth animations at 60fps
- Mobile: animations replaced with optimised static grids to prevent CPU waste

### Phase 11: Mobile Optimisation
- `Services3DGallery` and `VirtualShowroom` both auto-detect mobile (`< 768px`) and render clean 2-column card grids instead of CPU-heavy 3D orbits
- Reduced animation work on mobile (cancelled `requestAnimationFrame` loops)

### Phase 12: SEO
- **UPDATED** `sitemap.xml` — All `<lastmod>` dates updated to 2026-06-22
- **UPDATED** `llms.txt` — Comprehensive AI-discovery file with full service listing, contact info, and AI assistant instructions

### Phase 13: Security
- CORS, rate limiting, sanitisation, and input validation remain intact (no regression)
- All admin routes protected with HMAC-signed tokens

---

## Deployment Notes

### Vercel (Frontend)
```
buildCommand: pnpm run build:web
outputDirectory: artifacts/athoo/dist/public
installCommand: pnpm install --frozen-lockfile=false
```
The `build:web` script runs `pnpm --filter @athoo/website run build` then copies the dist to `artifacts/athoo/dist/public` via `scripts/copy-website-dist.mjs`.

Required env vars:
- `VITE_API_BASE_URL` — e.g. `https://thoo-api.onrender.com`

### Render (API)
```
buildCommand: pnpm install --frozen-lockfile=false && pnpm run build:api
startCommand: pnpm run start:api
```
Required env vars:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `ADMIN_PASSWORD` — Admin panel password
- `SESSION_SECRET` — JWT signing secret (min 32 chars)
- `SMTP_HOST` — e.g. `smtp.zoho.com`
- `SMTP_PORT` — e.g. `465`
- `SMTP_USER` — SMTP username/email
- `SMTP_PASS` — SMTP password
- `SMTP_FROM` — From address e.g. `noreply@athoo.pk`
- `ADMIN_EMAIL` — Admin notification email e.g. `official@athoo.pk`

### Neon PostgreSQL
Run `pnpm run db:schema` to push schema changes. Tables required:
- `website_leads`
- `app_settings`
- `blog_posts`
- `athoo_admin_users`
- `athoo_email_logs`
- `admin_activity_logs`
- `admin_notifications`

### Cloudflare DNS
- `athoo.pk` → Vercel (CNAME to `cname.vercel-dns.com`)
- `www.athoo.pk` → Vercel
- `thoo-api.onrender.com` → Render (no Cloudflare proxy needed for API)
