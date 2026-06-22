-- Athoo required Neon tables and admin seed
-- Run this once in Neon SQL Editor before testing admin/forms.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS leads (
  id serial PRIMARY KEY,
  form_type varchar(100) NOT NULL,
  name text,
  email text,
  phone varchar(50),
  subject text,
  message text,
  service text,
  city text,
  experience text,
  source text,
  status varchar(50) NOT NULL DEFAULT 'new',
  priority varchar(50) DEFAULT 'normal',
  assigned_to text,
  admin_notes text,
  last_contacted_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value jsonb,
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id serial PRIMARY KEY,
  name text NOT NULL DEFAULT 'Athoo Admin',
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role varchar(50) NOT NULL DEFAULT 'super_admin',
  is_active boolean NOT NULL DEFAULT true,
  permissions json,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_templates (
  id serial PRIMARY KEY,
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  category varchar(100) DEFAULT 'general',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_logs (
  id serial PRIMARY KEY,
  recipient text NOT NULL,
  subject text NOT NULL,
  status varchar(50) NOT NULL DEFAULT 'sent',
  sent_by text,
  created_at timestamp NOT NULL DEFAULT now()
);

INSERT INTO site_settings (key, value)
VALUES
  ('maintenance_mode', '{"enabled": false, "message": "Athoo website is under maintenance. Please check back soon."}'::jsonb),
  ('support_email', '"official@athoo.pk"'::jsonb),
  ('support_phone', '"+92 339 0051068"'::jsonb),
  ('cms', '{}'::jsonb)
ON CONFLICT (key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_form_type ON leads(form_type);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
