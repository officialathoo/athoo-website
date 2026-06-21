import { pool } from "@athoo/db";
import { logger } from "./logger.js";

export async function ensureSchema(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    logger.warn("DATABASE_URL not set — skipping schema init");
    return;
  }

  const client = await pool.connect();
  try {
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

    await client.query(`
      CREATE TABLE IF NOT EXISTS lead_notes (
        id BIGSERIAL PRIMARY KEY,
        lead_id BIGINT NOT NULL REFERENCES website_leads(id) ON DELETE CASCADE,
        admin_email TEXT NOT NULL,
        note TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`);
    await client.query(`CREATE INDEX IF NOT EXISTS lead_notes_lead_id_idx ON lead_notes (lead_id)`);

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

    await client.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`);

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

    // Blog posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        excerpt TEXT,
        content TEXT,
        category TEXT NOT NULL DEFAULT 'Insights',
        author TEXT NOT NULL DEFAULT 'Athoo Team',
        status TEXT NOT NULL DEFAULT 'draft',
        featured BOOLEAN NOT NULL DEFAULT FALSE,
        cover_image TEXT,
        read_time TEXT,
        meta_title TEXT,
        meta_description TEXT,
        published_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts (slug)`);
    await client.query(`CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON blog_posts (status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON blog_posts (published_at DESC NULLS LAST)`);
    await client.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cover_image TEXT`);
    await client.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS read_time TEXT`);
    await client.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_title TEXT`);
    await client.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_description TEXT`);
    await client.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS blog_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS blog_tags (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS blog_post_tags (
        post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
        tag_id INTEGER NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, tag_id)
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS blog_post_tags_post_idx ON blog_post_tags (post_id)`);

    const defaultCategories: [string, string][] = [
      ["Insights", "insights"], ["About Athoo", "about-athoo"], ["Customer Tips", "customer-tips"],
      ["Trust & Safety", "trust-and-safety"], ["Provider Tips", "provider-tips"], ["News", "news"],
    ];
    for (const [name, slug] of defaultCategories) {
      await client.query(
        `INSERT INTO blog_categories (name, slug) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
        [name, slug]
      );
    }

    // media_library table
    await client.query(`
      CREATE TABLE IF NOT EXISTS media_library (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        alt TEXT,
        caption TEXT,
        type TEXT NOT NULL DEFAULT 'image',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS media_library_type_idx ON media_library (type)`);

    // cms_pages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cms_pages (
        id SERIAL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        content JSONB NOT NULL DEFAULT '[]',
        status TEXT NOT NULL DEFAULT 'draft',
        meta_title TEXT,
        meta_description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // cms_sections table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cms_sections (
        id SERIAL PRIMARY KEY,
        page_id INTEGER REFERENCES cms_pages(id) ON DELETE CASCADE,
        section_key TEXT NOT NULL,
        content JSONB NOT NULL DEFAULT '{}',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // roles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        label TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // role_permissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id SERIAL PRIMARY KEY,
        role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission TEXT NOT NULL,
        UNIQUE (role_id, permission)
      )
    `);

    // Seed default roles
    const defaultRoles: [string, string, string, string[]][] = [
      ["super_admin", "Super Admin", "Full system access", ["all"]],
      ["admin", "Admin", "Full access except user management", ["leads", "blogs", "email", "settings", "media", "faq", "seo"]],
      ["manager", "Manager", "Manage leads and content", ["leads", "blogs", "media"]],
      ["custom", "Custom", "Custom permissions defined per user", []],
    ];
    for (const [rName, rLabel, rDesc, rPerms] of defaultRoles) {
      const rRow = await client.query(
        `INSERT INTO roles (name, label, description) VALUES ($1,$2,$3) ON CONFLICT (name) DO UPDATE SET label=$2, description=$3 RETURNING id`,
        [rName, rLabel, rDesc]
      );
      const roleId = rRow.rows[0].id;
      for (const perm of rPerms) {
        await client.query(
          `INSERT INTO role_permissions (role_id, permission) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [roleId, perm]
        );
      }
    }

    // updated_at trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$ language 'plpgsql'
    `);

    // Apply updated_at triggers
    for (const tbl of ["media_library", "cms_pages", "cms_sections", "blog_posts"]) {
      await client.query(`
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_trigger WHERE tgname = '${tbl}_updated_at'
          ) THEN
            CREATE TRIGGER ${tbl}_updated_at
              BEFORE UPDATE ON ${tbl}
              FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
          END IF;
        END $$
      `);
    }

    // tags column on blog_posts
    await client.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'`);

    const adminEmail = process.env.SUPER_ADMIN_EMAIL || process.env.ADMIN_EMAIL || process.env.LEAD_NOTIFY_TO || "official@athoo.pk";
    const adminPassword = process.env.ADMIN_PASSWORD || "athoo-admin-change-me";

    const defaultSettings: [string, unknown][] = [
      ["maintenance_mode", { enabled: false, message: "Athoo website is under maintenance. Please check back soon." }],
      ["support_email", adminEmail],
      ["support_phone", "+92 339 0051068"],
      ["site_title", "Athoo — Pakistan Smart Home Services"],
      ["site_description", "Athoo is an upcoming Pakistani home services app for customers and verified providers."],
      ["whatsapp_number", "923390051068"],
      ["social_instagram", "https://instagram.com/athoo_services"],
      ["social_facebook", "https://facebook.com/Athoo.Services/"],
      ["social_tiktok", "https://tiktok.com/@athoo.pk"],
      ["social_linkedin", "https://linkedin.com/company/123424195"],
      ["launch_date", "2026-09-01"],
      ["cms_hero", { title: "Pakistan's Smart Home Services App", subtitle: "Athoo is preparing to connect customers with trusted local service providers across Pakistan. Join the waitlist and get launch updates first.", cta_customer: "Join Waitlist", cta_provider: "Become a Provider", badge: "App Launching Soon in Pakistan" }],
      ["cms_contact", { email: "official@athoo.pk", phone: "+92 339 0051068", whatsapp: "923390051068", address: "Rawalpindi & Islamabad, Pakistan" }],
      ["cms_about", { headline: "Building Pakistan's Most Trusted Home Services Platform", description: "Athoo is a pre-launch Pakistani home services marketplace designed to connect homeowners with verified, trusted service professionals across 10+ categories." }],
    ];

    for (const [key, val] of defaultSettings) {
      await client.query(
        `INSERT INTO app_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
        [key, JSON.stringify(val)]
      );
    }

    await client.query(`
      INSERT INTO athoo_email_templates (name, subject, body, category) VALUES
        ('Waitlist Welcome', 'Welcome to Athoo Waitlist!', 'Hi {{name}},\n\nThank you for joining the Athoo waitlist! We will notify you as soon as we launch.\n\nRegards,\nAthoo Team', 'waitlist'),
        ('Provider Onboarding', 'Athoo Provider Application Received', 'Hi {{name}},\n\nThank you for registering as a service provider on Athoo!\n\nOur team will review your application and contact you soon.\n\nService: {{service}}\nCity: {{city}}\n\nRegards,\nAthoo Team', 'provider'),
        ('Launch Update', 'Athoo is Launching Soon!', 'Hi {{name}},\n\nExciting news! Athoo is getting ready to launch in Pakistan.\n\nStay tuned for the official launch date.\n\nRegards,\nAthoo Team', 'general')
      ON CONFLICT (name) DO NOTHING
    `);

    const crypto = await import("node:crypto");
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(adminPassword, salt, 120000, 32, "sha256").toString("hex");
    const passwordHash = `${salt}:${hash}`;

    await client.query(`
      INSERT INTO athoo_admin_users (name, email, role, permissions, password_hash, is_active)
      VALUES ('Super Admin', $1, 'super_admin', '{"all":true}'::jsonb, $2, true)
      ON CONFLICT (email) DO UPDATE SET
        role = 'super_admin',
        permissions = '{"all":true}'::jsonb,
        is_active = true,
        password_hash = CASE
          WHEN athoo_admin_users.password_hash IS NULL OR COALESCE($3, '') = 'true' THEN EXCLUDED.password_hash
          ELSE athoo_admin_users.password_hash
        END
    `, [adminEmail, passwordHash, process.env.SUPER_ADMIN_RESET_PASSWORD || ""]);

    logger.info("DB schema ready");
  } finally {
    client.release();
  }
}
