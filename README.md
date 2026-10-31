# OneTownCity — Root Workspace

This is the monorepo root for OneTownCity SaaS.

```
OneTownCity/
├── frontend/           Next.js 16 + TypeScript + Tailwind CSS
├── backend/            Rust (Axum + SQLx + Tokio)
├── load-tests/         k6 load test scripts
├── certs/              TLS dev certificates (mkcert, git-ignored)
├── .github/workflows/  GitHub Actions CI
└── docker-compose.yml  Local dev containers (Postgres + PgBouncer)
```

## Prerequisites

See [SETUP.md](SETUP.md) for first-time setup instructions.

## Quick Start

```bash
# 1. Start infrastructure
docker compose up -d

# 2. Backend
cd backend && cargo run

# 3. Frontend (separate terminal)
cd frontend && pnpm dev
```

## URLs (dev)

| Service     | URL                         |
|-------------|------------------------------|
| Frontend    | https://localhost:3000       |
| Backend API | http://localhost:8080/api/v1 |
| Health      | http://localhost:8080/health |
| PgBouncer   | postgresql://localhost:6432  |
