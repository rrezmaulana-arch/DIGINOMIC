#!/usr/bin/env bash
set -euo pipefail

# Backup harian PostgreSQL + folder uploads terenkripsi ke Google Drive (PRD Bagian 12.2)
BACKUP_DIR="/tmp/diginomic-backup-$(date +%Y%m%d-%H%M%S)"
REMOTE_BASE="${BACKUP_REMOTE_BASE:-gdrive-crypt:digiconomic-backups}"
REMOTE_DEST="${REMOTE_BASE}/$(date +%Y%m%d)"
DB_ADMIN_USER="${DB_ADMIN_USER:-pgadmin}"

send_alert() {
  local msg="$1"
  echo "[BACKUP ERROR] $msg" >&2
  if [ -n "${BACKUP_ALERT_WEBHOOK:-}" ]; then
    curl -fsS -X POST -H "Content-Type: application/json" \
      -d "{\"text\":\"[Diginomic Backup] $msg\"}" \
      "$BACKUP_ALERT_WEBHOOK" >/dev/null 2>&1 || true
  fi
}

on_error() {
  local exit_code=$?
  send_alert "Backup gagal (exit=$exit_code). Salinan lokal dipertahankan di $BACKUP_DIR untuk pemeriksaan."
  exit "$exit_code"
}
trap on_error ERR

if ! command -v rclone >/dev/null 2>&1; then
  send_alert "rclone tidak terpasang; pengiriman backup tidak dapat dilakukan."
  exit 1
fi

mkdir -p "$BACKUP_DIR"

docker compose -f /opt/digiconomic/deploy/docker-compose.yml exec -T db \
  pg_dump -U "$DB_ADMIN_USER" -Fc digiconomic > "$BACKUP_DIR/digiconomic.dump"

tar -czf "$BACKUP_DIR/uploads.tar.gz" -C /opt/digiconomic/deploy/data uploads

if [ ! -s "$BACKUP_DIR/digiconomic.dump" ] || [ ! -s "$BACKUP_DIR/uploads.tar.gz" ]; then
  send_alert "File dump database atau arsip uploads kosong."
  exit 1
fi

rclone copy "$BACKUP_DIR" "$REMOTE_DEST"

# Verifikasi integritas & keberadaan arsip di tujuan sebelum menghapus salinan lokal
rclone check "$BACKUP_DIR" "$REMOTE_DEST" --one-way

# Hapus backup lama (> 7 hari) hanya setelah backup hari ini terverifikasi
rclone delete --min-age 7d "$REMOTE_BASE"

rm -rf "$BACKUP_DIR"
echo "Backup selesai dan terverifikasi di $REMOTE_DEST pada $(date -u +%Y-%m-%dT%H:%M:%SZ)"
