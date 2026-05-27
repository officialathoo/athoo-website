import { pool } from "@workspace/db";
import { logger } from "./logger.js";

export async function ensureSchema(): Promise<void> {
  const client = await pool.connect();
  try {
    // Leads table
    await client.query(`
      CREATE TABLE IF NOT EXISTS website_leads (
        id BIGSERIAL PRIMARY KEY,
        form_type TEXT NOT NULL,
        name TEXT, email TEXT, phone TEXT, subject TEXT,
        message TEXT, service TEXT, city TEXT, experience TEXT,
        source TEXT, ip_address TEXT, user_agent TEXT,
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        status TEXT NOT NULL DEFAULT 'new',
        priority TEXT NOT NULL DEFAULT 'normal',
        assigned_to TEXT, admin_notes TEXT,
        last_contacted_at TIMESTAMPTZ,
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`);
    await client.query(`ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal'`);
    await client.query(`ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS assigned_to TEXT`);
    await client.query(`ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS admin_notes TEXT`);
    await client.query(`ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ`);
    await client.query(`ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`);
    await client.query(`ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'`);
    await client.query(`CREATE INDEX IF NOT EXISTS website_leads_created_at_idx ON website_leads (created_at DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS website_leads_status_idx ON website_leads (status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS website_leads_form_type_idx ON website_leads (form_type)`);
    await client.query(`CREATE INDEX IF NOT EXISTS website_leads_email_idx ON website_leads (email)`);

    // Lead notes
    await client.query(`
      CREATE TABLE IF NOT EXISTS lead_notes (
        id BIGSERIAL PRIMARY KEY,
        lead_id BIGINT NOT NULL REFERENCES website_leads(id) ON DELETE CASCADE,
        admin_email TEXT NOT NULL,
        note TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`);
    await client.query(`CREATE INDEX IF NOT EXISTS lead_notes_lead_id_idx ON lead_notes (lead_id)`);

    // Admin users
    await client.query(`
      CREATE TABLE IF NOT EXISTS athoo_admin_users (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        role TEXT NOT NULL DEFAULT 'manager',
        permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        last_login_at TIMESTAMPTZ,
        login_count INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`);
    await client.query(`ALTER TABLE athoo_admin_users ADD COLUMN IF NOT EXISTS login_count INT NOT NULL DEFAULT 0`);

    // Activity logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_activity_logs (
        id BIGSERIAL PRIMARY KEY,
        admin_email TEXT,
        action TEXT NOT NULL,
        target_type TEXT,
        target_id TEXT,
        details JSONB NOT NULL DEFAULT '{}'::jsonb,
        ip_address TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`);
    await client.query(`CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON admin_activity_logs (created_at DESC)`);

    // Admin notifications
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_notifications (
        id BIGSERIAL PRIMARY KEY,
        admin_email TEXT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        link_to TEXT,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`);
    await client.query(`CREATE INDEX IF NOT EXISTS admin_notifications_created_at_idx ON admin_notifications (created_at DESC)`);

    // Settings
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`);

    // Email logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS athoo_email_logs (
        id BIGSERIAL PRIMARY KEY,
        lead_id BIGINT,
        recipient TEXT NOT NULL,
        subject TEXT NOT NULL,
        body TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        sent_by TEXT,
        provider_response JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`);
    await client.query(`ALTER TABLE athoo_email_logs ADD COLUMN IF NOT EXISTS sent_by TEXT`);

    // Email templates
    await client.query(`
      CREATE TABLE IF NOT EXISTS athoo_email_templates (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'general',
        created_by TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS athoo_email_templates_name_idx ON athoo_email_templates (name)`);

    // Seed default settings
    const adminEmail = process.env.ADMIN_EMAIL || process.env.LEAD_NOTIFY_TO || "official.athoo@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "athoo-admin-change-me";

    const defaultSettings: [string, unknown][] = [
      ["maintenance_mode", { enabled: false, message: "Athoo website is under maintenance. Please check back soon." }],
      ["support_email", adminEmail],
      ["support_phone", "+92 339 0051068"],
      ["site_title", "Athoo — Pakistan Smart Home Services"],
      ["site_description", "Athoo is an upcoming Pakistani home services app for customers and verified providers."],
      ["whatsapp_number", "923390051068"],
      ["social_instagram", "https://instagram.com/athoo.pk"],
      ["social_facebook", "https://facebook.com/athoo.pk"],
      ["social_linkedin", ""],
      ["cms_hero", { title: "Pakistan's Smart Home Services App", subtitle: "Athoo is preparing to connect customers with trusted local service providers across Pakistan. Join the waitlist and get launch updates first.", cta_customer: "Join Waitlist", cta_provider: "Become a Provider", badge: "App Launching Soon in Pakistan" }],
      ["cms_contact", { email: "official.athoo@gmail.com", phone: "+92 339 0051068", whatsapp: "923390051068", address: "Pakistan" }],
      ["cms_about", { headline: "Building Pakistan's Most Trusted Home Services Platform", description: "Athoo is a pre-launch Pakistani home services marketplace designed to connect homeowners with verified, trusted service professionals across 10+ categories." }],
    ];

    for (const [key, val] of defaultSettings) {
      await client.query(
        `INSERT INTO app_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
        [key, JSON.stringify(val)]
      );
    }

    // Seed default email templates
    await client.query(`
      INSERT INTO athoo_email_templates (name, subject, body, category) VALUES
        ('Waitlist Welcome', 'Welcome to Athoo Waitlist!', 'Hi {{name}},\n\nThank you for joining the Athoo waitlist! We''re excited to have you on board.\n\nWe''ll notify you as soon as we launch in your area.\n\nRegards,\nAthoo Team', 'waitlist'),
        ('Provider Onboarding', 'Athoo Provider Application Received', 'Hi {{name}},\n\nThank you for registering as a service provider on Athoo!\n\nOur team will review your application and contact you soon for document verification.\n\nService: {{service}}\nCity: {{city}}\n\nRegards,\nAthoo Team', 'provider'),
        ('Launch Update', 'Athoo is Launching Soon!', 'Hi {{name}},\n\nExciting news! Athoo is getting ready to launch in Pakistan.\n\nGet ready to book trusted home services right from your phone.\n\nStay tuned for the official launch date.\n\nRegards,\nAthoo Team', 'general')
      ON CONFLICT (name) DO NOTHING
    `);

    // Seed initial admin
    const crypto = await import("node:crypto");
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(adminPassword, salt, 120000, 32, "sha256").toString("hex");
    const passwordHash = `${salt}:${hash}`;

    await client.query(`
      INSERT INTO athoo_admin_users (name, email, role, permissions, password_hash, is_active)
      VALUES ('Super Admin', $1, 'super_admin', '{"all":true}'::jsonb, $2, true)
      ON CONFLICT (email) DO NOTHING
    `, [adminEmail, passwordHash]);

    logger.info("DB schema ready");
  } finally {
    client.release();
  }
}
