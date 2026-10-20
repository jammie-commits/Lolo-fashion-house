#!/usr/bin/env bash
# Deploys LoLo to a Vultr (Ubuntu/Debian) server over SSH.
#   deploy/deploy.sh root@139.84.244.220
# Optional env: ADMIN_PASSWORD (otherwise a strong one is generated on first deploy), DOMAIN (enables HTTPS via Caddy).
# Admin edits live in data/ and site/assets/gallery on the server; later deploys never overwrite them.
set -euo pipefail

TARGET="${1:?usage: deploy/deploy.sh user@host}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
APP=/opt/lolo
SSH=(ssh -o StrictHostKeyChecking=accept-new "$TARGET")

"${SSH[@]}" 'bash -s' <<'REMOTE'
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl ca-certificates rsync
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
id lolo >/dev/null 2>&1 || useradd --system --home /opt/lolo --shell /usr/sbin/nologin lolo
mkdir -p /opt/lolo && chown lolo:lolo /opt/lolo
REMOTE

FIRST=$("${SSH[@]}" "[ -f $APP/data/content.json ] && echo no || echo yes")
EXCLUDES=(--exclude .git --exclude node_modules --exclude .vercel --exclude '*.pdf' --exclude /server --exclude /lolo-fashion-house.html --exclude .DS_Store)
if [ "$FIRST" = no ]; then
  EXCLUDES+=(--exclude /data --exclude /site/assets/gallery)
fi
rsync -az --delete "${EXCLUDES[@]}" -e "ssh -o StrictHostKeyChecking=accept-new" "$HERE/" "$TARGET:$APP/"

"${SSH[@]}" DOMAIN="${DOMAIN:-}" PASS="${ADMIN_PASSWORD:-}" bash -s <<'REMOTE'
set -euo pipefail
APP=/opt/lolo
ENVF=/etc/lolo.env
if [ ! -f "$ENVF" ]; then
  PASS="${PASS:-$(head -c 18 /dev/urandom | base64 | tr -d '/+=' | head -c 20)}"
  if [ -n "$DOMAIN" ]; then PORT=3000; PROXY=1; else PORT=80; PROXY=0; fi
  printf 'ADMIN_PASSWORD=%s\nPORT=%s\nTRUST_PROXY=%s\n' "$PASS" "$PORT" "$PROXY" > "$ENVF"
  chmod 600 "$ENVF"
  echo "GENERATED_ADMIN_PASSWORD=$PASS"
fi
chown -R lolo:lolo $APP
cat > /etc/systemd/system/lolo.service <<'UNIT'
[Unit]
Description=LoLo Fashion House
After=network.target

[Service]
User=lolo
WorkingDirectory=/opt/lolo
EnvironmentFile=/etc/lolo.env
ExecStartPre=/usr/bin/node scripts/build.mjs
ExecStart=/usr/bin/node server.mjs
Restart=always
AmbientCapabilities=CAP_NET_BIND_SERVICE
NoNewPrivileges=true
ProtectSystem=full
ReadWritePaths=/opt/lolo

[Install]
WantedBy=multi-user.target
UNIT
if [ -n "$DOMAIN" ] && ! command -v caddy >/dev/null; then
  apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy.list
  apt-get update -y && apt-get install -y caddy
fi
if [ -n "$DOMAIN" ]; then
  printf '%s {\n  reverse_proxy localhost:3000\n}\n' "$DOMAIN" > /etc/caddy/Caddyfile
  systemctl reload caddy || systemctl restart caddy
fi
if command -v ufw >/dev/null && ufw status | grep -q "Status: active"; then ufw allow 80/tcp; ufw allow 443/tcp; fi
systemctl daemon-reload
systemctl enable lolo >/dev/null 2>&1
systemctl restart lolo
sleep 3
systemctl is-active lolo
REMOTE
echo "Deployed. Visit http://${TARGET#*@}/ (or https://${DOMAIN:-your-domain}/)"
