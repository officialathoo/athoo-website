# Athoo Platform

Pakistan's Smart Home Services enterprise platform — pre-launch marketing website + full enterprise CRM, Admin Panel, Analytics, Email Marketing, CMS, and RBAC.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/athoo run dev` — run the frontend (port varies, proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-server run build` — build API server only
- `pnpm --filter @workspace/db run push` — push Drizzle schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19, Vite, TailwindCSS v4, Framer Motion, wouter, react-helmet-async, recharts, shadcn/ui
- API: Express 5
- DB: PostgreSQL + raw SQL (dbInit.ts) + Drizzle ORM (lib/db)
- Auth: JWT (HMAC-SHA256) + PBKDF2 password hashing (no bcrypt)
- Email: Resend (optional — set `RESEND_API_KEY`)
- Validation: Zod (frontend), raw SQL params (backend)
- Build: esbuild (CJS bundle for API server)

## Where things live

- `artifacts/athoo/src/pages/admin.tsx` — complete enterprise admin panel (single file, all 7 tabs)
- `artifacts/athoo/src/pages/home.tsx` — main homepage (existing Athoo design, unchanged)
- `artifacts/api-server/src/routes/admin-panel.ts` — all admin API routes
- `artifacts/api-server/src/routes/submit.ts` — public form submission routes
- `artifacts/api-server/src/lib/dbInit.ts` — auto-creates all DB tables on startup
- `artifacts/api-server/src/routes/index.ts` — route registration

## Database Tables

All tables are raw SQL (auto-created by `ensureSchema()` on startup):

- `website_leads` — form submissions (Contact, Waitlist, Provider Waitlist)
- `lead_notes` — admin notes per lead
- `athoo_admin_users` — admin users with RBAC roles/permissions
- `admin_activity_logs` — full audit trail of all admin actions
- `app_settings` — key-value store for CMS content, maintenance mode, settings
- `athoo_email_logs` — email sending history
- `athoo_email_templates` — reusable email templates (unique name constraint)

## Admin Panel Features

Navigate to `/admin` to access the full enterprise dashboard:

1. **Dashboard** — KPI cards (total/today/week/month/new leads), line chart (daily trends), bar charts (city/status distribution), pie chart (form types), weekly bar chart
2. **Leads CRM** — paginated table (50/page), search+filter (form type/status/priority/city/date), bulk status/priority updates, assign manager, add notes per lead
3. **Email** — compose with variable substitution (`{{name}}`, `{{service}}`, `{{city}}`), 5 built-in templates, email delivery logs
4. **CMS** — edit hero title/subtitle/CTAs, about section, contact info, SEO meta, social links — all saved to DB without code changes
5. **Admins** — create/edit/delete admin users, 6 roles (super_admin/admin/manager/marketing/support/custom), custom permission system per-user
6. **Settings** — maintenance mode toggle with custom message, support email/phone
7. **Audit Log** — full activity log of all admin actions with IP tracking

## API Routes

Public:
- `POST /api/submit` — form submissions (Contact, Waitlist, Provider)
- `GET /api/public/cms` — public CMS content (hero, contact, SEO, social links)
- `GET /api/healthz` — health check

Admin (requires JWT Bearer token):
- `POST /api/admin/login` — login (email optional, password required)
- `GET /api/admin/leads` — CRM leads with filters + stats + pagination
- `POST /api/admin/lead-update` — bulk update status/priority/assigned
- `GET /api/admin/export` — CSV export
- `POST /api/admin/bulk-email` — bulk email with template support
- `GET/POST /api/admin/cms` — CMS content management
- `GET/POST/DELETE /api/admin/templates/:id` — email templates CRUD
- `GET /api/admin/email-logs` — email sending history
- `GET/POST /api/admin/lead-notes/:leadId`, `POST /api/admin/lead-note` — lead notes
- `GET/POST /api/admin/admins`, `DELETE /api/admin/admins/:id` — admin CRUD
- `GET/POST /api/admin/settings` — site settings
- `GET /api/admin/analytics` — analytics data (daily/weekly trends, breakdowns)
- `GET /api/admin/activity` — audit logs

## Admin Login

- Default password: `athoo-admin-change-me`
- Default email: `official.athoo@gmail.com`
- Change password via Admins tab → edit Super Admin

## Environment Variables

Required:
- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — JWT signing secret (falls back to ADMIN_PASSWORD if not set)

Optional:
- `ADMIN_EMAIL` — initial super admin email (default: official.athoo@gmail.com)
- `ADMIN_PASSWORD` — initial admin password (default: athoo-admin-change-me — CHANGE IN PRODUCTION)
- `RESEND_API_KEY` — enables real email delivery (without this, emails are logged but not sent)
- `LEAD_NOTIFY_TO` — email address for new lead notifications
- `LEAD_EMAIL_FROM` — sender address for bulk emails

## Architecture Decisions

- Admin panel is a single large React component (`admin.tsx`) with all tabs inline — keeps it simple and avoids complex routing for an internal tool
- All admin routes use a custom JWT (HMAC-SHA256 + PBKDF2, no external auth deps) to avoid adding dependencies
- DB schema is managed via raw SQL in `dbInit.ts` (not Drizzle migrations) because the schema is append-only and needs to be self-healing on startup
- CMS content stored in `app_settings` table as JSONB key-value — no separate CMS tables needed
- Email templates have a UNIQUE constraint on `name` so re-seeds are idempotent

## Gotchas

- **DB schema auto-creates on startup** — `ensureSchema()` is called in `src/index.ts` before routes are registered
- **Template seeds use `ON CONFLICT (name) DO NOTHING`** — safe to run multiple times
- **RESEND_API_KEY not set** → emails are logged with status `skipped_no_resend_key` but not actually sent
- **JWT expires in 12 hours** — users need to re-login
- The `artifacts/api-server` build uses esbuild (not tsc) — `pnpm run build` runs `node ./build.mjs`
- Do NOT run `pnpm run dev` at workspace root — use individual artifact workflows

## User Preferences

- Keep existing Athoo website design exactly as-is — no redesign, no layout changes
- Do not remove animations or change brand colors (#081120, #0057FF, #FF8A00)
- Do not ask questions or pause — complete all features without stopping
- After finishing, only provide: what was completed, files changed, database changes, build status
