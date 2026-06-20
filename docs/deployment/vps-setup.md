# VPS Setup Guide

## Server Requirements
- Ubuntu 22.04 LTS or Debian 12
- 2 vCPU, 4GB RAM minimum (8GB recommended for production)
- 50GB SSD
- Public IPv4 address

## Initial Server Setup

```bash
# 1. Update and install dependencies
apt update && apt upgrade -y
apt install -y nginx postgresql redis-server certbot python3-certbot-nginx

# 2. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
corepack enable && corepack prepare pnpm@latest --activate

# 3. Install PM2
npm install -g pm2

# 4. Clone your project
git clone https://github.com/your-org/athoo.git /var/www/athoo
cd /var/www/athoo

# 5. Set up environment
cp .env.production.example .env.production
nano .env.production   # Fill in all values

# 6. Install dependencies and build
pnpm install --frozen-lockfile=false
pnpm run build:api
pnpm run build:web

# 7. Copy Nginx configs
cp infrastructure/nginx/*.conf /etc/nginx/sites-available/
ln -s /etc/nginx/sites-available/athoo.pk.conf /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/api.athoo.pk.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 8. Start API with PM2
pm2 start services/api/dist/index.mjs --name athoo-api --env production
pm2 save && pm2 startup

# 9. Set up database
sudo -u postgres createuser athoo_user -P
sudo -u postgres createdb athoo_db -O athoo_user
psql -U athoo_user -d athoo_db -f infrastructure/database/schema.sql

# 10. Set up automated backups
echo "0 3 * * * root /var/www/athoo/infrastructure/database/backup.sh" > /etc/cron.d/athoo-backup
```
