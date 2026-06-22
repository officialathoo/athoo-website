-- Athoo required Neon schema for the current deployed API
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  form_type VARCHAR(100) NOT NULL,
  name TEXT,
  email TEXT,
  phone VARCHAR(50),
  subject TEXT,
  message TEXT,
  service TEXT,
  city TEXT,
  experience TEXT,
  source TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  priority VARCHAR(50) DEFAULT 'normal',
  assigned_to TEXT,
  admin_notes TEXT,
  last_contacted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'manager',
  is_active BOOLEAN NOT NULL DEFAULT true,
  permissions JSON,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'general',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'sent',
  sent_by TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (key, value) VALUES
('maintenance', '{"maintenanceMode":false,"maintenanceMessage":"Athoo website is under maintenance.","contactEmail":"official@athoo.pk","contactPhone":"+92 339 0051068"}'::jsonb),
('cms', '{}'::jsonb)
ON CONFLICT (key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_form_type ON leads(form_type);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- Optional: seed/update the official Athoo super admin login.
-- Login email: official@athoo.pk
-- Default password used for this hash: @MALIK26436@@..
-- Change this password from the admin panel after first successful login.
INSERT INTO admin_users (name, email, password_hash, role, is_active)
VALUES ('Athoo Admin', 'official@athoo.pk', 'de7efdbdbc9ccdcda609c4e1533c81e0:637bb4aa44a93b2ea0e7318859688979e3136464924dc109f9bc0075338c371fd78797ecaf36880c2af59345834d89f82846299c9b91b57b5aa6506c16ce2b36', 'super_admin', true)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'super_admin',
  is_active = true;
