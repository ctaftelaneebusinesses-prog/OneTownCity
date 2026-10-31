#!/usr/bin/env bash
# OneTownCity — One-shot privileged setup script
# Run this ONCE in your WSL terminal: bash ~/OneTownCity/scripts/setup-sudo.sh
set -euo pipefail

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   OneTownCity — Privileged Setup Script              ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── 1. apt packages ───────────────────────────────────────────────────────────
echo "▶ [1/6] Installing apt packages (unzip, pgbouncer)..."
sudo apt-get update -qq
sudo apt-get install -y --no-install-recommends unzip pgbouncer

# ── 2. AWS CLI v2 ─────────────────────────────────────────────────────────────
echo ""
echo "▶ [2/6] Installing AWS CLI v2..."
if command -v aws &>/dev/null; then
  echo "   AWS CLI already installed: $(aws --version)"
else
  cd /tmp
  curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip
  unzip -q awscliv2.zip
  sudo ./aws/install --update
  echo "   ✅ AWS CLI installed: $(aws --version)"
fi

# ── 3. PostgreSQL role + database ─────────────────────────────────────────────
echo ""
echo "▶ [3/6] Creating PostgreSQL role 'prajith' and database 'onetowncity'..."
PGUSER_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='prajith'" 2>/dev/null || echo "0")
if [ "$PGUSER_EXISTS" = "1" ]; then
  echo "   Role 'prajith' already exists — skipping creation."
else
  sudo -u postgres psql -c "CREATE USER prajith WITH SUPERUSER CREATEDB CREATEROLE LOGIN PASSWORD 'devpassword';"
  echo "   ✅ Role 'prajith' created."
fi

PGDB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='onetowncity'" 2>/dev/null || echo "0")
if [ "$PGDB_EXISTS" = "1" ]; then
  echo "   Database 'onetowncity' already exists — skipping creation."
else
  sudo -u postgres psql -c "CREATE DATABASE onetowncity OWNER prajith;"
  echo "   ✅ Database 'onetowncity' created."
fi

# Verify
echo "   DB connection test:"
psql -U prajith -d onetowncity -c "SELECT current_user, version();" 2>&1 | head -3

# ── 4. Run SQLx migrations ─────────────────────────────────────────────────────
echo ""
echo "▶ [4/6] Running SQLx migrations..."
cd ~/OneTownCity/backend
export DATABASE_URL="postgresql://prajith:devpassword@localhost:5432/onetowncity"
sqlx migrate run
echo "   ✅ Migrations applied."

# ── 5. TLS dev certificates ───────────────────────────────────────────────────
echo ""
echo "▶ [5/6] Generating TLS dev certificates with mkcert..."
mkdir -p ~/OneTownCity/certs
cd ~/OneTownCity/certs
# mkcert -install needs access to system cert store (may need sudo on some systems)
mkcert -install 2>&1 || sudo mkcert -install 2>&1
mkcert localhost 127.0.0.1 ::1
echo "   ✅ Certificates generated:"
ls -la ~/OneTownCity/certs/

# ── 6. ufw firewall ───────────────────────────────────────────────────────────
echo ""
echo "▶ [6/6] Configuring ufw firewall rules..."
# Note: In WSL2, ufw may not be effective (kernel module may be missing)
# This is best-effort.
if sudo ufw status 2>/dev/null | grep -q "Status: active"; then
  sudo ufw allow 3000/tcp comment "Next.js frontend dev"
  sudo ufw allow 8080/tcp comment "Axum backend dev"
  sudo ufw deny  5432/tcp comment "Block direct Postgres external access"
  echo "   ✅ ufw rules applied."
else
  sudo ufw --force enable 2>/dev/null || true
  sudo ufw allow 3000/tcp comment "Next.js frontend dev" 2>/dev/null || true
  sudo ufw allow 8080/tcp comment "Axum backend dev" 2>/dev/null || true
  echo "   ⚠️  ufw enabled (WSL2 note: rules may be advisory only)"
fi

# ── 7. AWS CLI R2 profile ─────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════════"
echo "✅ Privileged setup complete!"
echo ""
echo "NEXT — Configure AWS CLI for Cloudflare R2:"
echo "  aws configure --profile r2"
echo "  # Enter your R2 Access Key, Secret Key, region=auto"
echo ""
echo "THEN — Start development:"
echo "  cd ~/OneTownCity && docker compose up -d"
echo "  cd backend  && DATABASE_URL=postgresql://prajith:devpassword@localhost:6432/onetowncity cargo run"
echo "  cd frontend && pnpm dev"
echo "══════════════════════════════════════════════════════════"
