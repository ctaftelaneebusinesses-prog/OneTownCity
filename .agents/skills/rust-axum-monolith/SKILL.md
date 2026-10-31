---
name: rust-axum-monolith
description: Build and verify Rust + Axum + Tokio + SQLx modular monolith endpoints with strict tenant isolation.
---
1. Keep all backend logic inside a single modular Rust crate (`backend/`). Do not create microservices.
2. Derive tenant scope (`tenant_id`) from verified server-side membership headers/sessions; never trust a `tenant_id` passed in the client body or query string.
3. Bound database connection pools conservatively (max 15 connections for local/2GB RAM parity) and run `cargo check` + `cargo clippy` after every edit.
