# OneTownCity — First-Time Setup Guide

## System Requirements (Already Installed ✅)
| Tool | Version Detected |
|------|-----------------|
| Ubuntu | 26.04.1 LTS (Resolute Raccoon) |
| Node.js | v24.22.0 |
| pnpm | 12.14.0 |
| Rust / Cargo | 1.99.1 |
| PostgreSQL | 18.6 (service running) |
| Docker | 29.9.1 |
| mkcert | 1.4.4 |
| git | 2.53.0 |

---

## Step 1 — Privileged Setup (Requires `sudo` — run once)

These commands need your password. Open a terminal and run them:

```bash
# 1a. Install AWS CLI v2
sudo apt-get install -y unzip
curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
cd /tmp && unzip -q awscliv2.zip
sudo ./aws/install --update
aws --version

# 1b. Create PostgreSQL superuser (matches your Linux login)
sudo -u postgres psql -c "CREATE USER prajith WITH SUPERUSER CREATEDB CREATEROLE LOGIN PASSWORD 'devpassword';"
sudo -u postgres psql -c "CREATE DATABASE onetowncity OWNER prajith;"

# 1c. Install PgBouncer (for non-Docker local pooling)
sudo apt-get install -y pgbouncer

# 1d. Set up ufw firewall rules (WSL note: ufw may need enabling)
sudo ufw allow 3000/tcp comment "Next.js dev"
sudo ufw allow 8080/tcp comment "Axum API dev"
sudo ufw deny 5432/tcp  # Block direct Postgres from outside
sudo ufw enable

# 1e. Generate TLS dev certificates
mkdir -p ~/OneTownCity/certs
cd ~/OneTownCity/certs
mkcert -install   # Installs local CA (one-time)
mkcert localhost 127.0.0.1 ::1
# Creates: localhost.pem + localhost-key.pem
```

---

## Step 2 — Configure AWS CLI for Cloudflare R2

```bash
# Get your R2 credentials from Cloudflare Dashboard → R2 → Manage API Tokens
aws configure --profile r2
# AWS Access Key ID: <your-r2-access-key>
# AWS Secret Access Key: <your-r2-secret-key>
# Default region name: auto
# Default output format: json

# Test connection:
aws s3 ls --profile r2 --endpoint-url https://ACCOUNT_ID.r2.cloudflarestorage.com
```

---

## Step 3 — Environment Files

```bash
# Backend
cp ~/OneTownCity/backend/.env.example ~/OneTownCity/backend/.env
# Edit DATABASE_URL, R2 credentials, SENTRY_DSN

# Frontend
cp ~/OneTownCity/frontend/.env.example ~/OneTownCity/frontend/.env.local
# Edit NEXT_PUBLIC_API_URL, SENTRY DSN, etc.
```

---

## Step 4 — Run Migrations

```bash
cd ~/OneTownCity/backend

# Option A: Against local Postgres (after Step 1b)
export DATABASE_URL="postgresql://prajith:devpassword@localhost:5432/onetowncity"
sqlx migrate run

# Option B: Against Docker Compose Postgres
docker compose up -d postgres
export DATABASE_URL="postgresql://prajith:devpassword@localhost:5433/onetowncity"
sqlx migrate run
```

---

## Step 5 — Install Frontend Observability Packages

```bash
cd ~/OneTownCity/frontend
pnpm add @sentry/nextjs
pnpm add @opentelemetry/sdk-node @opentelemetry/exporter-trace-otlp-http \
         @opentelemetry/resources @opentelemetry/semantic-conventions
```

---

## Step 6 — Start Development

```bash
# Terminal 1: Infrastructure
cd ~/OneTownCity && docker compose up -d

# Terminal 2: Rust backend
cd ~/OneTownCity/backend
export DATABASE_URL="postgresql://prajith:devpassword@localhost:6432/onetowncity"
cargo run

# Terminal 3: Next.js frontend
cd ~/OneTownCity/frontend
pnpm dev
```

Visit: http://localhost:3000 (frontend) | http://localhost:8080/health (backend API)

---

## Load Testing

```bash
# Install k6
sudo apt-get install -y gnupg
curl -fsSL https://dl.k6.io/key.gpg | sudo apt-key add -
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install -y k6

# Run load tests (while backend is running)
cd ~/OneTownCity
k6 run load-tests/api.js
# Or against staging:
BASE_URL=https://api.staging.onetowncity.com k6 run load-tests/api.js
```

---

## CI/CD

Push to GitHub and create a repo. GitHub Actions (`.github/workflows/ci.yml`) will:
1. Lint + Type-check + Build the frontend
2. Run Clippy + cargo test on the backend (with a live Postgres service)
3. Run `cargo audit` and `pnpm audit` for security vulnerabilities

Add these GitHub secrets:
- `SENTRY_AUTH_TOKEN`
- `DATABASE_URL` (for staging test runs)

---

## Security Reminders
- ⚠️ Never commit `.env` or `.env.local` — they're in `.gitignore`
- ⚠️ Rotate all placeholder secrets before deploying to production
- ⚠️ PgBouncer runs in **transaction** pool mode — avoid session-level features
- ⚠️ TLS certs in `certs/` are for **localhost only** — use a real CA in production
