# OneTownCity — Product Requirements Document

> Version: 0.1.0 · Status: **Draft for Review** · Author: Architecture Team · Date: 2026-10-20

---

## 1. Executive Summary

OneTownCity is a **local business discovery and business-management SaaS platform**. It connects two primary audiences:

- **Consumers** — people discovering local businesses, services, professionals, and places in their town or city.
- **Business owners** — operators who claim, enrich, and manage their business profile, receive customer enquiries, and access paid management and visibility tools.

The platform offers a **free, publicly accessible directory** and a **paid SaaS tier** with advanced features for businesses. It is designed for multi-region operation with a lean, modular monolith architecture.

---

## 2. User Groups and Personas

### 2.1 Consumer (Guest / Registered)

| Attribute | Description |
|-----------|-------------|
| Goal | Discover trustworthy local businesses by category, location, or keyword |
| Pain points | Outdated listings, no photo evidence, no contact info, fake reviews |
| Access level | Free, no account required for browsing; account required for writing reviews or saving favourites |
| Key jobs-to-be-done | Find a plumber near me; browse cafés in town; read verified reviews; send an enquiry |

### 2.2 Business Owner (Operator)

| Attribute | Description |
|-----------|-------------|
| Goal | Attract customers, manage reputation, handle leads, understand analytics |
| Pain points | No visibility into who visits the listing; scattered enquiries; lack of professional presence online |
| Access level | Free claim and basic profile; paid tier for advanced features |
| Key jobs-to-be-done | Claim my business listing; update opening hours; respond to reviews; see how many people viewed my listing; upgrade plan |

### 2.3 Platform Admin

| Attribute | Description |
|-----------|-------------|
| Goal | Maintain data quality, approve verifications, moderate content, manage subscriptions |
| Access level | Internal-only admin panel |
| Key jobs-to-be-done | Approve business verification; remove spam listings; manage categories; view platform health |

---

## 3. Product Modules

### Module 1 — Public Discovery and Business Directory

**Description:** The public-facing, SEO-optimised business directory. No authentication required.

**Functional Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| DISC-01 | List businesses by town/city with pagination | Must |
| DISC-02 | Display business name, category, short description, address, and operating status | Must |
| DISC-03 | Business detail page with full profile, hours, photos, contact info | Must |
| DISC-04 | SEO-friendly URLs: `/[city]/[category]/[slug]` | Must |
| DISC-05 | Structured data (JSON-LD for `LocalBusiness`) for search engine indexing | Must |
| DISC-06 | Link to send enquiry from the public profile | Must |
| DISC-07 | Display verified badge if business is verified | Should |
| DISC-08 | Show aggregate review rating on listing and detail page | Should |
| DISC-09 | Similar/nearby businesses section | Could |
| DISC-10 | Featured listing positions for paid businesses | Could |

**Out of scope (v1):** Booking/reservation integration, payments from consumers, loyalty programmes.

---

### Module 2 — Business Profiles and Categories

**Description:** The profile data model and category taxonomy.

| ID | Requirement | Priority |
|----|-------------|----------|
| PROF-01 | Business profile: name, slug, description, category, address (structured), phone, email, website, hours, social links | Must |
| PROF-02 | Business category taxonomy (hierarchical: top-level → sub-category) | Must |
| PROF-03 | Business owners can upload up to 10 photos (stored in R2) | Must |
| PROF-04 | Business owners can set a logo/cover image | Must |
| PROF-05 | Structured address with geocoded lat/lng | Must |
| PROF-06 | Opening hours with holiday override support | Should |
| PROF-07 | Multiple service tags per business | Should |
| PROF-08 | Business can belong to one primary category and up to 3 secondary categories | Should |
| PROF-09 | Profile completeness score visible to owner | Could |

---

### Module 3 — Search, Filtering, and Location-Based Discovery

**Description:** How consumers find businesses.

| ID | Requirement | Priority |
|----|-------------|----------|
| SRCH-01 | Keyword search across name, description, tags (PostgreSQL full-text search using `tsvector`) | Must |
| SRCH-02 | Filter by category | Must |
| SRCH-03 | Filter by town/city | Must |
| SRCH-04 | Sort by: relevance, rating, newest, alphabetical | Should |
| SRCH-05 | Radius-based proximity search using PostGIS `ST_DWithin` | Should |
| SRCH-06 | Filter by "open now" based on hours and current time | Should |
| SRCH-07 | Search result pagination (cursor-based) | Must |
| SRCH-08 | Search autocomplete / suggestions | Could |
| SRCH-09 | Saved searches / alerts for registered consumers | Could |

> **Note:** Full-text search will use PostgreSQL `tsvector` + `GIN` index initially. A dedicated search engine (e.g. Meilisearch) is not required until query volumes or relevance requirements demonstrate a concrete gap. PostGIS will be added via `CREATE EXTENSION postgis` for proximity search.

---

### Module 4 — Business-Owner Accounts and Organisation Membership

**Description:** Authentication, organisation (multi-location business support), and role-based access.

| ID | Requirement | Priority |
|----|-------------|----------|
| ACCT-01 | Email + password authentication (bcrypt/argon2) | Must |
| ACCT-02 | Magic link / passwordless login option | Should |
| ACCT-03 | Business claim flow: owner proves ownership of an unclaimed listing | Must |
| ACCT-04 | Organisation entity: a business owner account can manage 1+ business profiles | Must |
| ACCT-05 | Organisation roles: `owner`, `admin`, `member` | Must |
| ACCT-06 | Invite team members to an organisation by email | Should |
| ACCT-07 | Multi-location support: one org, multiple branches | Should |
| ACCT-08 | Social login (Google OAuth) | Could |
| ACCT-09 | 2FA via TOTP | Could |

**Tenant isolation rule:** All data access in the backend MUST be scoped to the authenticated user's organisation membership. Joining on `org_id` is mandatory — no query may return another organisation's data.

---

### Module 5 — Enquiries and Lead Management

**Description:** How consumers contact businesses through the platform.

| ID | Requirement | Priority |
|----|-------------|----------|
| ENQR-01 | Consumer submits an enquiry form (name, email, message, optional phone) | Must |
| ENQR-02 | Enquiry is delivered to the business owner's notification email | Must |
| ENQR-03 | Business owner sees all enquiries in a dashboard inbox | Must |
| ENQR-04 | Enquiry thread / reply by email or within dashboard | Should |
| ENQR-05 | Enquiry spam filtering (rate limit, honeypot field) | Must |
| ENQR-06 | Enquiry status: `new`, `read`, `replied`, `archived` | Should |
| ENQR-07 | Enquiry analytics: volume by day, response rate | Should |
| ENQR-08 | Export enquiries to CSV | Could |

---

### Module 6 — Business Analytics

**Description:** Data insights available to business owners.

| ID | Requirement | Priority |
|----|-------------|----------|
| ANLT-01 | Profile view count (unique sessions per day/week/month) | Must |
| ANLT-02 | Enquiry volume over time | Must |
| ANLT-03 | Click-through count on phone, website, directions links | Should |
| ANLT-04 | Search appearance count | Should |
| ANLT-05 | Review trend over time | Should |
| ANLT-06 | Comparison to similar businesses (aggregated, anonymised) | Could |

**Implementation note:** Analytics events will be written asynchronously to an `analytics_events` table. Reporting will use materialised views or simple aggregations. No external analytics pipeline required at v1.

---

### Module 7 — Subscriptions and Entitlements

**Description:** Monetisation and plan enforcement.

| ID | Requirement | Priority |
|----|-------------|----------|
| SUBS-01 | Plan tiers: `free`, `starter`, `growth` | Must |
| SUBS-02 | Stripe integration for subscription billing | Must |
| SUBS-03 | Entitlement checks before serving paid features | Must |
| SUBS-04 | Webhook receiver for Stripe events (invoice, cancellation) | Must |
| SUBS-05 | Grace period (3 days) after payment failure before downgrade | Should |
| SUBS-06 | Plan upgrade/downgrade self-serve in dashboard | Should |
| SUBS-07 | Billing portal (Stripe customer portal) | Should |
| SUBS-08 | Usage-based limits enforced in API (e.g. photo count, analytics retention) | Must |

**Plan comparison (proposed):**

| Feature | Free | Starter | Growth |
|---------|------|---------|--------|
| Basic profile | ✅ | ✅ | ✅ |
| Photos | 3 | 10 | 20 |
| Enquiry inbox | ✅ | ✅ | ✅ |
| Analytics dashboard | — | ✅ (30d) | ✅ (12mo) |
| Featured listing | — | — | ✅ |
| Priority support | — | — | ✅ |
| Monthly price (GBP) | £0 | £9 | £29 |

---

### Module 8 — Reviews and Verification

**Description:** Consumer-generated reviews and business verification.

| ID | Requirement | Priority |
|----|-------------|----------|
| RVEW-01 | Registered consumers can submit one review per business (star rating + text) | Must |
| RVEW-02 | Reviews have status: `pending`, `approved`, `rejected` | Must |
| RVEW-03 | Admin approves reviews before they are public | Must |
| RVEW-04 | Business owner can flag a review for moderation | Should |
| RVEW-05 | Business owner can post a public response to a review | Should |
| RVEW-06 | Business verification: admin confirms business legitimacy via document or manual check | Must |
| RVEW-07 | Verified businesses display a badge | Must |

---

### Module 9 — Admin Moderation and Platform Operations

**Description:** Internal tools for platform health.

| ID | Requirement | Priority |
|----|-------------|----------|
| ADMN-01 | Admin can list, search, approve, suspend, or delete any business listing | Must |
| ADMN-02 | Admin can manage the category taxonomy | Must |
| ADMN-03 | Admin can impersonate a business owner (with audit log) | Should |
| ADMN-04 | Admin can view platform-wide metrics | Should |
| ADMN-05 | Flagged content queue for moderation | Should |
| ADMN-06 | Admin role is separate from business-owner role; enforced in backend | Must |

---

### Module 10 — Notifications and Audit Logging

**Description:** Communication and traceability.

| ID | Requirement | Priority |
|----|-------------|----------|
| NTFY-01 | Email notification on new enquiry | Must |
| NTFY-02 | Email notification on new review | Should |
| NTFY-03 | Email notification on subscription event | Must |
| NTFY-04 | In-app notification centre (dashboard bell icon) | Could |
| NTFY-05 | All admin actions are written to an immutable audit log | Must |
| NTFY-06 | Audit log entries include: actor, target, action, timestamp, IP | Must |
| NTFY-07 | Email delivery via transactional provider (Resend, Postmark, or SendGrid) | Must |

---

## 4. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Public directory pages < 200ms TTFB at edge (Cloudflare Cache) |
| **Availability** | 99.9% uptime SLA for API; planned maintenance during off-peak |
| **Scalability** | Designed to support up to 100,000 business listings without schema changes |
| **Security** | OWASP Top 10 mitigated; all API endpoints authenticated where required |
| **Privacy** | GDPR-compliant: data export, deletion on request, consent tracking |
| **Accessibility** | WCAG 2.1 AA for all consumer-facing pages |
| **SEO** | Server-side rendered or statically generated pages for discovery |
| **Internationalisation** | English (en-GB) v1; architecture must not block i18n later |

---

## 5. Open Questions Requiring Product Decisions

> These must be resolved before the relevant module is implemented.

| # | Question | Impact |
|---|----------|--------|
| Q1 | What is the target geography for v1? (UK only? UK + Ireland?) | Affects address format, currency, legal jurisdiction |
| Q2 | Is consumer registration required to send an enquiry? | Changes ENQR-01 significantly |
| Q3 | What is the review moderation SLA? Automated or human? | Affects RVEW-02 / RVEW-03 implementation |
| Q4 | Will business listings be imported from a data source (e.g. Companies House, Google Places) or purely user-submitted? | Major data pipeline decision |
| Q5 | Is Stripe the confirmed payment processor? (relevant for VAT on subscriptions) | Affects SUBS-02 entirely |
| Q6 | What email provider will be used for transactional email? | Affects NTFY-07 |
| Q7 | Should "towns" be a fixed taxonomy or user-created? | Affects DISC-03 routing and SRCH-03 |
| Q8 | Is there a legal / compliance review required before launch? | Affects timeline |
| Q9 | Will the admin panel be a separate Next.js route group or a standalone app? | Architecture decision |
| Q10 | What defines a "verified" business — document upload, phone call, physical letter? | Affects RVEW-06 implementation |

---

## 6. Acceptance Criteria Summary

Each module is considered complete when:

1. All **Must** requirements are implemented and covered by integration tests.
2. All **API endpoints** for the module are documented in `docs/API_CONTRACT.md`.
3. All **database tables** for the module appear in a migration with correct constraints and indexes.
4. **Entitlement checks** enforce plan limits before serving paid features (not just on the UI).
5. **Tenant isolation** is verified: no test can retrieve another organisation's data.
6. **Playwright e2e test** covers the critical consumer and owner journeys for the module.
