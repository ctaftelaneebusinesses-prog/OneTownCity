# OneTownCity — Migration Audit & Domain Asset Extraction

**Source Archive:** `./oldfiles/Kuppam_Project` (Read-only reference)  
**Target Platform:** OneTownCity Multi-Tenant SaaS (Rust Axum + PostgreSQL 16 + Next.js App Router)  
**Date:** 2026-10-30  

---

## 1. Executive Summary

This audit establishes the explicit boundary between legacy Django assets (`./oldfiles/Kuppam_Project`) and the modern OneTownCity SaaS platform. All legacy code in `./oldfiles` is archived as a read-only historical record. The new platform consolidates all data, routes, and logic into 4 hyper-focused local discovery verticals across 6 SaaS domain boundaries.

---

## 2. Vertical Mapping (Preserved & Upgraded)

| Vertical | Legacy Django Models (`./oldfiles`) | Legacy URLs Preserved | Upgraded SaaS Entities | Key Upgrades |
| :--- | :--- | :--- | :--- | :--- |
| **News & Town Pulse (`news`)** | `News`, `Event`, `Project` | `/news/`, `/news/<slug>/`, `/events/`, `/events/<slug>/`, `/projects/` | `town_news` table (`item_type`: `news`, `event`, `civic_project`) | Distinguishes `is_confirmed_fact` (true) vs proposals (false); source verification URLs; `last_updated_at` audit timestamps; local event calendar with venues. |
| **Education Hub (`education`)** | `Business` (categories `school`, `college`, `tuition_center`), `Category` | `/education/`, `/tuition-centers/` | `listings` (`vertical = 'education'`), `courses` JSONB, `facilities` JSONB, `admissions` JSONB | Schools, engineering/degree colleges, and coaching centers with structured course catalogs, fee estimates, admissions deadlines, and direct admission enquiry workflows. |
| **Student Corner (`students`)** | `Scholarship`, `Job` (internships, drives), `Business` (subcategory `student_services`) | `/scholarships/`, `/jobs/`, `/student-services/` | `student_opportunities` (`opportunity_type`: `internship`, `scholarship`, `hackathon`, `admission_drive`, `student_hostel`, `student_discount`) | Mandatory anti-scam disclosure on every item: *"Never pay money to apply for any internship or opportunity."* Verified student hostels, student discount passes, and merit scholarships. |
| **Local Businesses (`business`)** | `Business` (retail, bookstores, cafes, groceries, restaurants) | `/businesses/`, `/businesses/<slug>/` | `listings` (`vertical = 'business'`), `offers` | Claimable business profiles, operating hours, WhatsApp/phone click telemetry, dated student/local discounts, and lead capture. |

---

## 3. Ruthlessly Pruned Legacy Features (Deprecated & Excluded)

The following components from `./oldfiles/Kuppam_Project` are explicitly excluded from the database schema, API, and frontend:

1. **Repair Services & Handyman Broadcasts**:
   - Dropped models: `repair` categories, automobile repair services, repair quote comparison broadcasts.
   - Dropped API endpoints: `api/businesses/nearby-repair/`, `/repair-services/`.
2. **General Real Estate**:
   - Dropped model: `Property` (`property_list`, `property_detail`, residential/commercial sales/rentals).
   - Dropped categories: `real_estate`.
3. **Miscellaneous Unaligned Modules**:
   - Dropped: `LostFound` model (`/lost-found/`).
   - Dropped: Handyman service broadcasts and multi-provider bid comparisons.
4. **Third-Party Cloud Dependencies**:
   - Dropped: Supabase Auth SDK, Supabase Storage, AWS S3, Render deployment configs.
   - Replaced by: Standard local PostgreSQL 16 (`otc_admin` / `onetowncity_saas`) and local Axum API.

---

## 4. Location & Geographic Scope

- **Primary Default Town:** `Nellore` (SPSR Nellore District, Andhra Pradesh).
- **Secondary Legacy Town:** `Kuppam` (Chittoor District, Andhra Pradesh).
- Persistent town selector in the top bar allows instant switching between towns while maintaining identical schema and UI consistency.

---

## 5. Architectural Alignment (6 SaaS Domains)

1. **Directory**: Structured categories, listings (`business`, `education`), town pulse (`news`), and student hub (`students`).
2. **Identity**: RBAC (`super_admin`, `city_admin`, `content_provider`, `tenant_owner`, `student`).
3. **Tenancy**: Organizations and verified memberships; server-derived `tenant_id`.
4. **Monetization**: Tiered SaaS plans (`free`, `growth_business`, `edu_pro`, `campus_enterprise`) with monthly lead quotas.
5. **Engagement**: Actionable enquiries, click telemetry (WhatsApp, call), and dated offers.
6. **Governance**: Verification states (`not_verified`, `owner_claimed`, `details_reviewed`), city admin moderation queue, and user issue reporting (`incorrect_details`, `closed_business`, `duplicate`, `misleading`).


---

## 6. Legacy Database ETL Migration Audit (2026-10-30)

### Discovered Legacy Data Artifacts
- [`oldfiles/supabase-migration/backups/data.sql`](file:///home/prajith/OneTownCity/oldfiles/supabase-migration/backups/data.sql) (971 KB PostgreSQL standard dump)
- [`oldfiles/supabase-migration/backups/standalone_migration.sql`](file:///home/prajith/OneTownCity/oldfiles/supabase-migration/backups/standalone_migration.sql) (1004 KB standalone migration dump)
- [`oldfiles/supabase-migration/backups/schema.sql`](file:///home/prajith/OneTownCity/oldfiles/supabase-migration/backups/schema.sql) (107 KB legacy schema DDL)
- [`oldfiles/Kuppam_Project/database/schema.sql`](file:///home/prajith/OneTownCity/oldfiles/Kuppam_Project/database/schema.sql) (legacy Django DDL)

### Legacy Table Counts & Filtering Metrics

| Legacy Table | Pre-Filter Count | Post-Filter Imported | Excluded | Rationale & Vertical Mapping | Target Entity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `core_business` | 97 | 89 | 8 | **Included**: 28 Schools, 19 Colleges, 20 Hospitals/Clinics, 8 Restaurants, 5 Retail, 4 Pharmacies, 4 Transport, 1 Tourism.<br>**Excluded**: 7 Automobile & 1 Repair Service. | `organizations` (89), `listings` (89) (`education`: 47, `business`: 42) |
| `core_news` | 4 | 4 | 0 | **Included**: 4 verified town news updates, announcements, and innovation reports. | `town_news` (`item_type = 'news'`) |
| `core_event` | 2 | 2 | 0 | **Included**: 2 community festival & cultural events (`Sri Peddapuli Gangamma`, `Sri Tirupati Gangamma`). | `town_news` (`item_type = 'event'`) |
| `core_job` | 10 | 9 | 1 | **Included**: 9 student opportunities & entry-level jobs (Teacher, Accountant, Computer Operator, etc.).<br>**Excluded**: 1 vehicle repair service advisor. | `student_opportunities` (`opportunity_type = 'internship'`) with `anti_scam_acknowledged = true` |
| `core_property` | 2 | 0 | 2 | **Excluded**: Residential & commercial real estate listings (prohibited vertical). | Dropped |
| `core_lostfound` | 0 | 0 | 0 | **Excluded**: Lost & Found classifieds. | Dropped |
| `core_location` | 41 | Reference | 0 | Normalized city mapping: `city_id 33` -> `Kuppam`, `city_id 39` -> `Nellore`, `city_id 41` -> `Tirupati`. | Town normalization |
| `core_category` | 41 | Reference | 0 | Mapping legacy subcategories into SaaS domain categories. | Category taxonomy |

Total Records Processed for Import: **104 verified records** (89 listings, 4 news, 2 events, 9 student opportunities).  
Total Records Excluded: **11 deprecated records** (8 auto/repair businesses, 1 auto repair job, 2 properties).

---

## 7. Migration Verification & Performance Validation

### Live Database State (`onetowncity_saas` on `127.0.0.1:5432`)
- **Total Organizations**: `94` (5 seed + 89 legacy imported)
- **Total Listings**: `94` (5 seed + 89 legacy imported: 49 Education, 45 Business)
- **Total Town News & Events**: `10` (4 seed + 6 legacy imported)
- **Total Student Opportunities**: `13` (4 seed + 9 legacy imported, all with `anti_scam_acknowledged = true`)
- **Excluded Vertical Leak Count**: `0` (Zero repair shops, mechanics, plumbers, automobiles, or properties)

### Full-Text Search Plan (`EXPLAIN (ANALYZE, BUFFERS)`)
```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, name, slug, locality, city, verification_status
FROM listings
WHERE search_vector @@ websearch_to_tsquery('english', 'Hospital Kuppam')
LIMIT 10;
```
- **Planning Time**: `1.315 ms`
- **Execution Time**: `0.049 ms`
- **Rows Matched**: `10` (out of 13 matching medical/hospital listings in Kuppam)

### Playwright E2E Test Suite Validation
- **`e2e_legacy_migration_test.mjs`**: Passed (5/5 suites)
  - Zero-emoji enforcement across Kuppam discovery page
  - Kuppam regional listings loading with correct badges
  - Student Corner anti-scam notice prominently rendered with legacy job items
  - Town Pulse & News displaying Kuppam local updates
  - Canonical detail page `/listings/akshat-hospital` rendered with reviewed verification badge
  - FTS instant search for `Hospital` returning 13 matching listings
- **`e2e_verification.mjs`**: Passed (9/9 suites regression)
  - Nellore discovery hub, town selector, course enquiry modal capture, lead inbox real-time receipt, tenant persona switching, and admin moderation queue.

