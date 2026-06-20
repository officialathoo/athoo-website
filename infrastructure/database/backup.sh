#!/bin/bash
# Athoo PostgreSQL backup script
# Add to cron: 0 3 * * * /var/www/athoo/infrastructure/database/backup.sh
set -euo pipefail

BACKUP_DIR="/var/backups/athoo/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="${POSTGRES_DB:-athoo_db}"
DB_USER="${POSTGRES_USER:-athoo_user}"
KEEP_DAYS=7

mkdir -p "$BACKUP_DIR"
FILENAME="$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"

echo "[$(date)] Creating backup: $FILENAME"
pg_dump -U "$DB_USER" -h 127.0.0.1 "$DB_NAME" | gzip > "$FILENAME"
echo "[$(date)] Backup complete: $(du -sh "$FILENAME" | cut -f1)"

# Remove backups older than KEEP_DAYS
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +"$KEEP_DAYS" -delete
echo "[$(date)] Old backups cleaned (kept last $KEEP_DAYS days)"
