#!/usr/bin/env bash
set -euo pipefail

# Backup harian PostgreSQL + folder uploads terenkripsi ke Google Drive (PRD Bagian 12.2)
BACKUP_DIR="/tmp/diginomic-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

docker compose -f /opt/digiconomic/deploy/docker-compose.yml exec -T db \
  pg_dump -U app -Fc digiconomic > "$BACKUP_DIR/digiconomic.dump"

tar -czf "$BACKUP_DIR/uploads.tar.gz" -C /opt/digiconomic/deploy/data uploads

if command -v rclone >/dev/null 2>&1; then
  rclone copy "$BACKUP_DIR" gdrive-crypt:digiconomic-backups/$(date +%Y%m%d)
  rclone delete --min-age 7d gdrive-crypt:digiconomic-backups
fi

rm -rf "$BACKUP_DIR"
echo "Backup selesai pada $(date -u +%Y-%m-%dT%H:%M:%SZ)"
