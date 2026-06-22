-- Athoo required Neon tables for the current API build
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type text NOT NULL,
  name text,
  email text,
  phone text,
  subject text,
  message text,
  service text,
  city text,
  experience text,
  source text,
  status text DEFAULT 'new',
  priority text DEFAULT 'normal',
  assigned_to text,
  admin_notes text,
  last_contacted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid,
  recipient text,
  subject text,
  status text DEFAULT 'queued',
  error text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text DEFAULT 'Admin',
  role text DEFAULT 'super_admin',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

INSERT INTO site_settings (key, value)
VALUES
  ('maintenance', '{"enabled": false, "message": "Athoo is currently under maintenance. Please check back soon."}'::jsonb),
  ('cms', '{}'::jsonb)
ON CONFLICT (key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_form_type ON leads(form_type);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
