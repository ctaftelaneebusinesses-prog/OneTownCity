# OneTownCity — Master Workspace Architecture & Guidelines

You are building the production-grade local monorepo for **OneTownCity**, a performance-first, multi-tenant local discovery and SaaS platform. 

### 1. STRICT SCOPE & FEATURE PRUNING RULES
- **ONLY build and keep features for these 4 verticals**:
  1. **News & Town Pulse (`news`)**: Verified town updates, campus announcements, civic development tracker (with `is_confirmed_fact` vs `proposal` status, source links, and `last_updated_at` timestamps), and a local event calendar.
  2. **Education Hub (`education`)**: Schools, engineering/degree colleges, coaching institutes, course catalogs, admissions timelines, facilities metadata, and direct admission/course fee enquiry workflows.
  3. **Student Corner (`students`)**: Internships, scholarships, hackathons, admission drives, verified student hostels, and student discount passes. Every opportunity MUST enforce an anti-scam notice ("Never pay money to apply for any internship or job").
  4. **Local Businesses (`business`)**: Commercial storefronts, bookstores, study cafes, and retail businesses with claimable profiles, operating hours, WhatsApp/call actions, dated student/local offers, and customer enquiry tracking.
- **STRICT EXCLUSIONS**: Completely remove and DO NOT include repair shops, plumbers, electricians, handyman service-request broadcasts, multi-provider repair quote comparisons, or general residential/commercial real-estate sales/rental directories.
- **LOCAL COMPILATION ONLY**: Do not provision or deploy to AWS, Kubernetes, Kafka, Elasticsearch, or Redis. Everything must run and compile locally using Docker Compose (PostgreSQL 16), Cargo (Rust), and npm/pnpm (Next.js).

### 2. TARGET TECHNICAL STACK & ARCHITECTURE
- **Monorepo Layout**:
  - `docker-compose.yml`: Local PostgreSQL 16 (`otc_postgres_local`, port `5432`, user `otc_admin`, password `otc_local_password`, db `onetowncity_saas`) tuned conservatively for a 2GB RAM footprint.
  - `backend/`: Modular monolith API built with **Rust + Axum 0.7 + Tokio + SQLx 0.8 (PostgreSQL)**.
  - `frontend/`: **Next.js (App Router) + React + TypeScript + Tailwind CSS + shadcn/ui**.
- **6 SaaS Domain Boundaries**:
  1. `Directory`: Categories, listings (`business`, `education`), town news/events (`news`), and student opportunities (`students`).
  2. `Identity`: Users and role assignments (`super_admin`, `city_admin`, `content_provider`, `tenant_owner`, `student`).
  3. `Tenancy`: Organizations (`business` or `education`), memberships, and strict tenant-scoped records. Derive `tenant_id` on the server from verified membership—never trust a client-supplied `tenant_id`.
  4. `Monetization`: SaaS plans (`free`, `growth_business`, `edu_pro`, `campus_enterprise`), monthly lead quotas, and clearly labeled `is_sponsored` placements. Never sell `verification` status as a paid badge.
  5. `Engagement`: Actionable enquiries (admission requests, course enquiries, business availability), WhatsApp/call click telemetry, and dated offers.
  6. `Governance`: Verification states (`not_verified`, `owner_claimed`, `details_reviewed`), moderation queue (`submitted`, `pending_review`, `approved`, `needs_changes`, `rejected`), and user issue reports (`incorrect_details`, `closed_business`, `duplicate`, `misleading`).

### 3. UI/UX DESIGN SYSTEM
- Implement a clean, minimalist dark-mode interface inspired by Nothing OS:
  - Canvas: Deep matte carbon (`bg-neutral-950`, `bg-neutral-900/40`), hairline borders (`border-neutral-800`), high-contrast typography, and tabular monospace (`font-mono`) for badges, timestamps, and metrics.
  - Zero emojis anywhere in the UI or code.
  - Persistent Town Selector in the header (defaulting to `Nellore`).

### 4. STEP-BY-STEP EXECUTION PLAN (AUTONOMOUS LOOP)
Execute the following steps sequentially, verifying each step via terminal and MCP tools before proceeding:

1. **Database & Migrations**:
   - Create `docker-compose.yml` and start the PostgreSQL container (`docker compose up -d`).
   - Create `backend/migrations/202610300001_init_saas_schema.sql` with all tables, enums, `tsvector` full-text search generated columns, `GIN` indexes, and foreign keys.
   - Apply the migration and write a seed script (`backend/migrations/seed.sql`) with realistic Nellore data across all 4 verticals (Engineering Colleges, Study Cafes/Bookstores, Regional Hackathons/Civic News, and Student Internships/Discounts).
   - Use the `postgres` MCP server to inspect the live tables and verify the schema.

2. **Rust + Axum Backend (`backend/`)**:
   - Scaffold the Cargo project and implement modular files: `main.rs`, `models.rs`, `auth.rs` (tenant membership extractor), `handlers/public.rs` (FTS search across Education/Business, News feed, Student Hub, Enquiry submission, Issue reporting), and `handlers/saas.rs` (Tenant Owner Dashboard, lead quota gating, creating student opportunities/offers, and Admin moderation queue).
   - Run `cargo check`, `cargo clippy`, and `cargo build` until it compiles with zero errors.

3. **Next.js + TypeScript Frontend (`frontend/`)**:
   - Scaffold the Next.js App Router project with Tailwind CSS.
   - Build `/` (Public Discovery Hub with persistent town selector, instant search, tab filters for All / News / Education / Students / Business, verification & freshness badges, and an interactive Enquiry modal).
   - Build `/dashboard` (Multi-Tenant SaaS Portal where college and business owners can switch test tenant personas, view profile views/WhatsApp clicks, respond to student/customer leads within their plan quota, post new internships/offers, and view plan entitlements).
   - Build `/admin` (City Admin Moderation Queue to approve/reject pending submissions and resolve user reports).
   - Run `npm run build` to verify strict TypeScript compilation.

4. **End-to-End Verification**:
   - Start both the Rust API (`127.0.0.1:8080`) and Next.js frontend (`127.0.0.1:3000`).
   - Verify all API endpoints with `curl` and use the `playwright` MCP server to verify UI flows in a headless browser.

### 5. GIT REPOSITORY RULES
- Strict Single Remote: All git operations and pushes must strictly target `https://github.com/ctaftelaneebusinesses-prog/OneTownCity.git`. Never add, retarget, or push to any other remote repository.

### 6. MANDATORY VECTOR ASSET RULE (SVG FIRST)
- Strictly convert all images, covers, emblems, logos, and illustrations to resolution-independent SVG vector graphics.
- Never render blurry raster PNG/JPG/WEBP files for UI covers, category headers, or brand monograms.
- Use clean architectural geometric vector SVGs grounded in our Swiss Civic Editorial palette (`#111110`, `#F4F2EE`, `#D8D3C8`, `#FF4F17`, `#0D6847`, `#D97706`) ensuring crisp, infinite scaling at any DPI with zero network lag.
