#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Penggunaan: ./restore.sh <path-ke-digiconomic.dump>"
  exit 1
fi

DUMP_FILE="$1"
docker compose -f /opt/digiconomic/deploy/docker-compose.yml exec -T db \
  pg_restore -U app -d digiconomic --clean --if-exists < "$DUMP_FILE"

echo "Pemulihan database selesai dari $DUMP_FILE"
