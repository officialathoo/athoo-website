# Athoo Cleaned Project - Windows Setup

## 1) Install
```powershell
pm install -g pnpm
pnpm install --frozen-lockfile=false
```

## 2) Environment
Copy `.env.example` to `.env.local` and also add the same values to Vercel.

Required:
- DATABASE_URL
- ADMIN_EMAIL
- ADMIN_PASSWORD
- SESSION_SECRET

Optional email:
- RESEND_API_KEY
- LEAD_NOTIFY_TO
- LEAD_EMAIL_FROM

## 3) Local run
Open two terminals.

Terminal 1:
```powershell
pnpm run dev:api
```

Terminal 2:
```powershell
pnpm run dev:web
```

Open: http://localhost:5173
Admin: http://localhost:5173/admin

## 4) Test before deployment
```powershell
pnpm run typecheck
pnpm run build
```

## 5) Vercel
Add env variables in Vercel, then deploy. This package includes `vercel.json` and `/api/[...path].ts` for API routing.

## 6) Neon
The server auto-creates tables on startup. If needed, run `database/schema.sql` manually in Neon SQL Editor.
