---
name: postgres-multitenant-fts
description: Design PostgreSQL schemas, migrations, and full-text search queries for OneTownCity.
---
1. Restrict verticals strictly to `news`, `education`, `students`, and `business`. Never add repair shops, plumbers, handymen, or general real-estate tables.
2. Use PostgreSQL generated `tsvector` columns + `GIN` indexes and `pg_trgm` before suggesting any external search engine.
3. Verify query plans using `EXPLAIN (ANALYZE, BUFFERS)` through the Postgres MCP server and avoid N+1 reads.
