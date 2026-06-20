#!/bin/bash
# =============================================================================
# Athoo Website/API VPS Deployment Script
# Usage: ./deploy.sh [website|api|all]
# Requires: git, pnpm, node 20+, pm2 (for API), nginx
# =============================================================================
set -euo pipefail

APP=${1:-all}
DEPLOY_DIR="/var/www/athoo"
API_PORT=8080

log() { echo "[$(date +'%H:%M:%S')] $*"; }
fail() { echo "[ERROR] $*" >&2; exit 1; }

command -v pnpm >/dev/null || fail "pnpm not found. Install: npm install -g pnpm"
command -v node >/dev/null || fail "node not found"

log "=== Athoo Deploy: $APP ==="
cd "$DEPLOY_DIR" || fail "Deploy dir $DEPLOY_DIR not found"

log "Pulling latest changes..."
git pull --rebase origin main

log "Installing dependencies..."
pnpm install --frozen-lockfile=false

deploy_api() {
    log "Building API..."
    pnpm --filter @athoo/api run build
    log "Restarting API with PM2..."
    pm2 restart athoo-api 2>/dev/null || pm2 start "$DEPLOY_DIR/services/api/dist/index.mjs" \
        --name athoo-api \
        --env production \
        --max-memory-restart 512M
    pm2 save
    log "✓ API deployed on port $API_PORT"
}

deploy_website() {
    log "Building website..."
    pnpm run build:web
    log "✓ Website built at artifacts/athoo/dist/public"
}

case "$APP" in
    api)     deploy_api ;;
    website) deploy_website ;;
    all)
        deploy_api
        deploy_website
        nginx -t && nginx -s reload
        log "✓ Website and API deployed. Nginx reloaded."
        ;;
    *) fail "Unknown target: $APP. Use: api|website|all" ;;
esac

log "=== Deploy complete ==="
