#!/usr/bin/env bash
set -euo pipefail

# ── Configure these ──────────────────────────────────────────────────────────
SSH_USER="${SSH_USER:-deploy}"
SSH_HOST="${SSH_HOST:?Set SSH_HOST, e.g. SSH_HOST=1.2.3.4 ./scripts/deploy.sh}"
REMOTE_PATH="${REMOTE_PATH:-/srv/asset-service}"
# ─────────────────────────────────────────────────────────────────────────────

echo "→ Syncing files to ${SSH_USER}@${SSH_HOST}:${REMOTE_PATH}"
rsync -az --relative \
  src \
  package.json \
  deploy/ecosystem.config.cjs \
  "${SSH_USER}@${SSH_HOST}:${REMOTE_PATH}/"

echo "→ Installing dependencies & reloading pm2"
ssh "${SSH_USER}@${SSH_HOST}" bash <<EOF
  set -e
  cd "${REMOTE_PATH}"
  npm install --omit=dev --silent
  pm2 reload deploy/ecosystem.config.cjs --env production || pm2 start deploy/ecosystem.config.cjs --env production
  pm2 save
EOF

echo "✓ Deploy complete"
