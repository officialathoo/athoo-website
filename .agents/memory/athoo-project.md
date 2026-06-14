---
name: Athoo Website Project
description: Key facts, decisions, and env requirements for the Athoo home services website build
---

# Athoo Website — Durable Notes

## Domain & Brand
- Domain: `athoo.pk` — all canonical URLs, sitemap, robots.txt, OG tags use this
- Brand name: Athoo (with double-o); app handle @athoo.pk on social
- Emails: `official@athoo.pk`, `support@athoo.pk`, `info@athoo.pk`
- Phone/WhatsApp: +92 339 0051068 / https://wa.me/923390051068

## Social Links (confirmed)
- TikTok: https://www.tiktok.com/@athoo.pk
- Facebook: https://www.facebook.com/Athoo.Services/ (WITH www)
- Instagram: https://www.instagram.com/athoo_services
- LinkedIn: https://www.linkedin.com/company/123424195

## Architecture
- Artifact: `artifacts/athoo-website` (React + Vite + Wouter + TailwindCSS + Framer Motion + react-icons + react-helmet-async)
- API: `artifacts/api-server` (Express 5, Drizzle ORM, pino logger)
- DB lib: `lib/db` — leadsTable is defined in `lib/db/src/schema/index.ts`; db export is nullable (returns null if DATABASE_URL not set)
- Form submissions: website posts to `/api/submit` → api-server `routes/submit.ts`

## Required env vars on the server (NOT in Replit)
- `DATABASE_URL` — Neon PostgreSQL connection string
- `RESEND_API_KEY` — for auto-response emails AND admin notifications
- `LEAD_NOTIFY_TO` — admin notification email (default: official@athoo.pk)
- `LEAD_EMAIL_FROM` — from address (default: Athoo <onboarding@resend.dev>)
- `SESSION_SECRET` — already set in Replit secrets
- `RATE_LIMIT_PER_MINUTE` — default 10

## Auto-response emails (via Resend)
Three form types trigger different auto-responses:
- "Waitlist Signup" → welcome email (blue theme)
- "Provider Waitlist" → provider acknowledgment email (green theme)
- "Contact Form" → thank-you email (purple theme)
All in `artifacts/api-server/src/routes/submit.ts`

## GA4
Added to `artifacts/athoo-website/index.html` with placeholder `G-XXXXXXXXXX`
**Why:** User needs to replace with their actual Measurement ID from analytics.google.com

## Launch countdown
- Component: `artifacts/athoo-website/src/components/home/CountdownTimer.tsx`
- Target date: September 1, 2026 (PKT timezone)
- Placed between CompleteInfoSection and BlogPreview on home.tsx

## Blog posts (7 total)
1. why-finding-reliable-home-service-professionals-is-difficult-in-pakistan
2. how-athoo-is-improving-home-services-in-rawalpindi-and-islamabad
3. what-customers-should-check-before-hiring-a-home-service-professional
4. why-verified-service-providers-matter
5. ac-maintenance-tips-before-summer-rawalpindi-islamabad
6. how-to-spot-a-bad-contractor-before-hiring
7. electrician-safety-tips-for-homeowners-pakistan

## DB schema note
- `lib/db/src/schema/index.ts` was a skeleton — added leadsTable for form submissions
- `lib/db/src/index.ts` uses lazy init (returns null if DATABASE_URL unset) so api-server starts without DB in dev
- Run `pnpm --filter @workspace/db run push` on the production server to create the leads table

## User constraints (strict)
- Do NOT restructure the project folder layout
- Do NOT rename folders or move files
- Do NOT replace package.json, tsconfig, vite.config
- Extend existing pages and components only
- User is self-hosting (NOT deploying on Replit)
