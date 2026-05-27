-- Athoo website/admin schema. Safe to run multiple times.
CREATE TABLE IF NOT EXISTS website_leads (
  id BIGSERIAL PRIMARY KEY,
  form_type TEXT NOT NULL,
  name TEXT, email TEXT, phone TEXT, subject TEXT, message TEXT, service TEXT, city TEXT, experience TEXT,
  source TEXT, ip_address TEXT, user_agent TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'new', priority TEXT NOT NULL DEFAULT 'normal', assigned_to TEXT, admin_notes TEXT,
  last_contacted_at TIMESTAMPTZ, tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal';
ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;
ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS website_leads_created_at_idx ON website_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS website_leads_status_idx ON website_leads (status);
CREATE INDEX IF NOT EXISTS website_leads_form_type_idx ON website_leads (form_type);
CREATE INDEX IF NOT EXISTS website_leads_email_idx ON website_leads (email);

CREATE TABLE IF NOT EXISTS lead_notes (id BIGSERIAL PRIMARY KEY, lead_id BIGINT NOT NULL REFERENCES website_leads(id) ON DELETE CASCADE, admin_email TEXT NOT NULL, note TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX IF NOT EXISTS lead_notes_lead_id_idx ON lead_notes (lead_id);

CREATE TABLE IF NOT EXISTS athoo_admin_users (id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT, role TEXT NOT NULL DEFAULT 'manager', permissions JSONB NOT NULL DEFAULT '{}'::jsonb, is_active BOOLEAN NOT NULL DEFAULT TRUE, last_login_at TIMESTAMPTZ, login_count INT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE athoo_admin_users ADD COLUMN IF NOT EXISTS login_count INT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS admin_activity_logs (id BIGSERIAL PRIMARY KEY, admin_email TEXT, action TEXT NOT NULL, target_type TEXT, target_id TEXT, details JSONB NOT NULL DEFAULT '{}'::jsonb, ip_address TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON admin_activity_logs (created_at DESC);

CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());

CREATE TABLE IF NOT EXISTS athoo_email_logs (id BIGSERIAL PRIMARY KEY, lead_id BIGINT, recipient TEXT NOT NULL, subject TEXT NOT NULL, body TEXT, status TEXT NOT NULL DEFAULT 'pending', sent_by TEXT, provider_response JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE athoo_email_logs ADD COLUMN IF NOT EXISTS sent_by TEXT;

CREATE TABLE IF NOT EXISTS athoo_email_templates (id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE, subject TEXT NOT NULL, body TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'general', created_by TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE UNIQUE INDEX IF NOT EXISTS athoo_email_templates_name_idx ON athoo_email_templates (name);
