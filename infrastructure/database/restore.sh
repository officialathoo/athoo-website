#!/bin/bash
# Athoo PostgreSQL restore script
# Usage: ./restore.sh /var/backups/athoo/postgres/athoo_db_20240101_030000.sql.gz
set -euo pipefail

BACKUP_FILE="${1:-}"
DB_NAME="${POSTGRES_DB:-athoo_db}"
DB_USER="${POSTGRES_USER:-athoo_user}"

[ -z "$BACKUP_FILE" ] && echo "Usage: $0 <backup_file.sql.gz>" && exit 1
[ -f "$BACKUP_FILE" ] || { echo "File not found: $BACKUP_FILE"; exit 1; }

echo "WARNING: This will DROP and recreate the $DB_NAME database."
read -rp "Type 'yes' to continue: " confirm
[ "$confirm" = "yes" ] || { echo "Aborted."; exit 1; }

echo "[$(date)] Restoring from: $BACKUP_FILE"
gunzip -c "$BACKUP_FILE" | psql -U "$DB_USER" -h 127.0.0.1 "$DB_NAME"
echo "[$(date)] Restore complete."
