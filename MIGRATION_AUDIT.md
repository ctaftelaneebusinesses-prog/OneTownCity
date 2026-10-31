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
