---
name: database-schema-validator
description: Validates SQL migrations against the 6 SaaS domains (Directory, Identity, Tenancy, Monetization, Engagement, Governance) before execution.
---
1. Validate all SQL migrations against the 6 SaaS domains before applying: Directory, Identity, Tenancy, Monetization, Engagement, Governance.
2. Ensure strict tenant isolation (`tenant_id`) across all tenant-scoped records and tables.
3. Verify indexes on foreign keys and full-text search `tsvector` columns.
4. Verify query plans using `EXPLAIN (ANALYZE, BUFFERS)` via the Postgres MCP server before committing schema updates.
