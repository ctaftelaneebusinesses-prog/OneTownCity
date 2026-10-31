#!/usr/bin/env python3
"""
OneTownCity — Idempotent Legacy Database ETL Migration Script
Imports legacy records from ./oldfiles/supabase-migration/backups/data.sql into onetowncity_saas.

Enforces:
1. Four core verticals: news, education, students, business.
2. Complete exclusion of repair services, plumbers, mechanics, automobiles, properties, lostfound.
3. Zero emojis & non-printable character stripping.
4. Multi-tenant SaaS domain mapping (Organizations, Listings, Town News, Student Opportunities).
5. Idempotent ON CONFLICT (slug) DO UPDATE upserts.
"""

import os
import re
import sys
import uuid
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
DATA_SQL_PATH = os.path.join(PROJECT_ROOT, "oldfiles", "supabase-migration", "backups", "data.sql")
OUTPUT_SQL_PATH = os.path.join(PROJECT_ROOT, "backend", "migrations", "202610300004_import_legacy_data.sql")
DB_URL = os.environ.get("DATABASE_URL", "postgresql://otc_admin:otc_local_password@127.0.0.1:5432/onetowncity_saas")

# Category mapping to OneTownCity categories
CATEGORY_MAP = {
    "college": "44444444-4444-4444-4444-444444444401",     # engineering-degree-colleges
    "school": "44444444-4444-4444-4444-444444444403",      # schools-academies
    "tuition_center": "44444444-4444-4444-4444-444444444402", # coaching-competitive-exams
    "stationery": "44444444-4444-4444-4444-444444444404",  # bookstores-libraries
    "study_cafe": "44444444-4444-4444-4444-444444444405",  # study-cafes-coworking
    "retail": "44444444-4444-4444-4444-444444444406",      # commercial-retail
    "grocery": "44444444-4444-4444-4444-444444444406",     # commercial-retail
    "clothing": "44444444-4444-4444-4444-444444444406",    # commercial-retail
    "tourism": "44444444-4444-4444-4444-444444444406",     # commercial-retail
    "hospital": "44444444-4444-4444-4444-444444444414",    # healthcare-clinics
    "pharmacy": "44444444-4444-4444-4444-444444444414",    # healthcare-clinics
    "restaurant": "44444444-4444-4444-4444-444444444415",  # dining-cafes
    "bakery": "44444444-4444-4444-4444-444444444415",      # dining-cafes
    "transport": "44444444-4444-4444-4444-444444444416",   # transport-mobility
}

FREE_PLAN_ID = "11111111-1111-1111-1111-111111111101"

EMOJI_PATTERN = re.compile(
    r"[\U00010000-\U0010ffff\u2600-\u26ff\u2700-\u27bf\uFE00-\uFE0F\u200d\u200c]",
    flags=re.UNICODE,
)

def strip_emojis_and_clean(text: str) -> str:
    """Removes emojis and non-printable characters, standardizing quotes."""
    if not text or text == "\\N":
        return ""
    cleaned = EMOJI_PATTERN.sub("", text)
    # Filter printable characters plus basic whitespace
    cleaned = "".join(c for c in cleaned if c.isprintable() or c in ("\n", "\t"))
    # Normalize unicode apostrophes and backticks
    cleaned = cleaned.replace("’", "'").replace("`", "'").replace("“", '"').replace("”", '"')
    return cleaned.strip()

def sql_escape(val: str) -> str:
    """Escapes single quotes for standard SQL string literals."""
    if val is None:
        return "NULL"
    cleaned = strip_emojis_and_clean(str(val))
    return "'" + cleaned.replace("'", "''") + "'"

def slugify(text: str) -> str:
    """Generates a clean URL slug from text."""
    clean = strip_emojis_and_clean(text).lower()
    clean = re.sub(r"[^a-z0-9]+", "-", clean)
    clean = re.sub(r"^-+|-+$", "", clean)
    return clean or "item"

def parse_copy_table(lines, table_name):
    """Extracts rows from COPY public.table (...) FROM stdin blocks."""
    header = None
    rows = []
    in_table = False
    for line in lines:
        if line.startswith(f'COPY "public"."{table_name}"') or line.startswith(f"COPY public.{table_name}"):
            header_match = re.findall(r"\((.*?)\)", line)
            if header_match:
                header = [col.replace('"', "").strip() for col in header_match[0].split(",")]
            in_table = True
            continue
        if in_table:
            if line.strip() == "\\.":
                break
            parts = line.rstrip("\n").split("\t")
            if header and len(parts) == len(header):
                rows.append(dict(zip(header, parts)))
    return header, rows

def extract_locality(address: str, default_town: str) -> str:
    """Extracts a concise locality name from a detailed address string."""
    addr = strip_emojis_and_clean(address)
    if not addr:
        return default_town
    parts = [p.strip() for p in addr.split(",") if p.strip()]
    if not parts:
        return default_town
    # Pick first segment that is not just numbers or postal code
    for part in parts:
        if not re.match(r"^[\d\s\-#]+$", part) and len(part) > 2:
            return part[:100]
    return default_town

def main():
    print("==================================================")
    print("OneTownCity Legacy Database ETL Migration")
    print("==================================================")
    print(f"Reading source database dump: {DATA_SQL_PATH}")

    if not os.path.exists(DATA_SQL_PATH):
        print(f"ERROR: Legacy data file not found at {DATA_SQL_PATH}")
        sys.exit(1)

    with open(DATA_SQL_PATH, "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()

    # 1. Parse Location Mapping
    _, loc_rows = parse_copy_table(lines, "core_location")
    loc_map = {}
    for l in loc_rows:
        loc_map[l["id"]] = strip_emojis_and_clean(l["name"])
    print(f"Loaded {len(loc_map)} location references.")

    # 2. Process core_business
    _, biz_rows = parse_copy_table(lines, "core_business")
    print(f"Discovered {len(biz_rows)} total businesses in legacy archive.")

    imported_biz = []
    excluded_biz = []

    for b in biz_rows:
        cat = b.get("category", "").lower().strip()
        # Exclusion rule: drop automobile and repair services
        if cat in ("automobile", "repair", "handyman"):
            excluded_biz.append(b)
            continue
        # Only allowed business categories
        if cat not in CATEGORY_MAP:
            excluded_biz.append(b)
            continue

        imported_biz.append(b)

    print(f"  -> Allowed: {len(imported_biz)} listings")
    print(f"  -> Excluded: {len(excluded_biz)} listings (Automobile / Repair)")

    # 3. Process core_news
    _, news_rows = parse_copy_table(lines, "core_news")
    print(f"Discovered {len(news_rows)} town news articles.")

    # 4. Process core_event
    _, event_rows = parse_copy_table(lines, "core_event")
    print(f"Discovered {len(event_rows)} community events.")

    # 5. Process core_job
    _, job_rows = parse_copy_table(lines, "core_job")
    print(f"Discovered {len(job_rows)} local job / opportunity postings.")
    imported_jobs = []
    excluded_jobs = []
    for j in job_rows:
        slug = j.get("slug", "")
        # Drop auto repair advisor job
        if "motors" in slug or "mechanic" in slug or "service-advisor" in slug:
            excluded_jobs.append(j)
        else:
            imported_jobs.append(j)
    print(f"  -> Allowed: {len(imported_jobs)} student opportunities")
    print(f"  -> Excluded: {len(excluded_jobs)} opportunities (Vehicle repair service)")

    # Generate SQL
    sql_statements = []
    sql_statements.append("-- OneTownCity Idempotent Legacy ETL Migration")
    sql_statements.append("-- Generated: 2026-10-30")
    sql_statements.append("BEGIN;\n")

    # Ensure anti_scam_acknowledged exists on student_opportunities
    sql_statements.append("ALTER TABLE student_opportunities ADD COLUMN IF NOT EXISTS anti_scam_acknowledged BOOLEAN NOT NULL DEFAULT true;\n")

    # ─────────────────────────────────────────────────────────────────────────
    # A. ORGANIZATIONS & LISTINGS (Education & Business)
    # ─────────────────────────────────────────────────────────────────────────
    sql_statements.append("-- ─────────────────────────────────────────────────────────────────────────")
    sql_statements.append("-- 1. TENANT ORGANIZATIONS & DIRECTORY LISTINGS")
    sql_statements.append("-- ─────────────────────────────────────────────────────────────────────────\n")

    for b in imported_biz:
        raw_slug = b.get("slug", "").strip() or slugify(b["name"])
        name = strip_emojis_and_clean(b["name"])
        cat = b.get("category", "").lower().strip()
        vertical = "education" if cat in ("college", "school", "tuition_center") else "business"
        cat_id = CATEGORY_MAP.get(cat, "44444444-4444-4444-4444-444444444406")

        city_id = b.get("city_id", "")
        city_name = loc_map.get(city_id, "Kuppam")
        # Standardize known towns
        if "nellore" in city_name.lower():
            city_name = "Nellore"
        elif "tirupati" in city_name.lower():
            city_name = "Tirupati"
        else:
            city_name = "Kuppam"

        address = strip_emojis_and_clean(b.get("address", ""))
        locality = extract_locality(address, city_name)
        phone = strip_emojis_and_clean(b.get("phone_number", ""))
        desc = strip_emojis_and_clean(b.get("description", ""))
        website = strip_emojis_and_clean(b.get("website", ""))
        view_count = int(b.get("view_count", "0") or 0)
        created_at = b.get("created_at", "NOW()")
        updated_at = b.get("updated_at", "NOW()")

        # Tagline generation
        if vertical == "education":
            tagline = f"Premier {cat.capitalize()} & Academic Learning Campus in {city_name}"
        elif cat == "hospital":
            tagline = f"Healthcare Center, Inpatient Care & Diagnostic Services in {city_name}"
        elif cat == "pharmacy":
            tagline = f"Licensed Community Pharmacy & Essential Medical Supplies in {city_name}"
        elif cat == "restaurant":
            tagline = f"Regional Dining, Traditional Cuisine & Food Services in {city_name}"
        elif cat == "transport":
            tagline = f"Local Mobility, Transit & Commute Support in {city_name}"
        else:
            tagline = f"Verified Commercial Storefront & Customer Services in {city_name}"

        # Deterministic UUIDs
        org_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"onetowncity-org-{raw_slug}"))
        listing_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"onetowncity-listing-{raw_slug}"))
        org_slug = f"{raw_slug}-org"

        # Verification flag: map approved legacy rows to details_reviewed
        verif_status = "details_reviewed" if b.get("status") == "approved" else "not_verified"

        # 1. Upsert Organization
        sql_statements.append(f"""INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('{org_id}', {sql_escape(name)}, '{org_slug}', '{vertical}', '{city_name}', '{FREE_PLAN_ID}', '{created_at}', '{updated_at}')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;""")

        # 2. Upsert Listing
        sql_statements.append(f"""INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '{listing_id}',
    '{org_id}',
    '{cat_id}',
    '{vertical}',
    '{raw_slug}',
    {sql_escape(name)},
    {sql_escape(tagline)},
    {sql_escape(desc)},
    {sql_escape(address or city_name)},
    {sql_escape(locality)},
    '{city_name}',
    {sql_escape(phone)},
    {sql_escape(phone)},
    {sql_escape(website)},
    '',
    '{{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{{}}'::jsonb,
    false,
    '{verif_status}',
    'approved',
    {view_count},
    '{updated_at}',
    '{created_at}',
    '{updated_at}'
) ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    address = EXCLUDED.address,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    phone = EXCLUDED.phone,
    whatsapp = EXCLUDED.whatsapp,
    website = EXCLUDED.website,
    verification_status = EXCLUDED.verification_status,
    moderation_status = EXCLUDED.moderation_status,
    last_confirmed_at = EXCLUDED.last_confirmed_at,
    updated_at = EXCLUDED.updated_at;\n""")

    # ─────────────────────────────────────────────────────────────────────────
    # B. TOWN NEWS & LOCAL EVENTS
    # ─────────────────────────────────────────────────────────────────────────
    sql_statements.append("-- ─────────────────────────────────────────────────────────────────────────")
    sql_statements.append("-- 2. TOWN NEWS & COMMUNITY EVENTS")
    sql_statements.append("-- ─────────────────────────────────────────────────────────────────────────\n")

    for n in news_rows:
        raw_slug = n.get("slug", "").strip() or slugify(n["title"])
        title = strip_emojis_and_clean(n["title"])
        content = strip_emojis_and_clean(n["content"])
        source = strip_emojis_and_clean(n.get("source", "")) or "Kuppam Town Desk"
        city_id = n.get("city_id", "")
        city_name = loc_map.get(city_id, "Kuppam")
        created_at = n.get("created_at", "NOW()")
        updated_at = n.get("updated_at", "NOW()")
        news_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"onetowncity-news-{raw_slug}"))
        mod_status = "approved" if n.get("status") == "approved" else "submitted"

        sql_statements.append(f"""INSERT INTO town_news (
    id, city, locality, item_type, title, slug, content, source_name, source_url,
    is_confirmed_fact, event_date, event_time, event_venue, moderation_status, created_at, updated_at
) VALUES (
    '{news_id}',
    '{city_name}',
    'Town Center',
    'news',
    {sql_escape(title)},
    '{raw_slug}',
    {sql_escape(content)},
    {sql_escape(source)},
    '',
    true,
    NULL, NULL, NULL,
    '{mod_status}',
    '{created_at}',
    '{updated_at}'
) ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    source_name = EXCLUDED.source_name,
    moderation_status = EXCLUDED.moderation_status,
    updated_at = EXCLUDED.updated_at;\n""")

    for e in event_rows:
        raw_slug = e.get("slug", "").strip() or slugify(e["title"])
        title = strip_emojis_and_clean(e["title"])
        desc = strip_emojis_and_clean(e.get("description", "")) or f"Community cultural festival and public gathering in {title}"
        venue = strip_emojis_and_clean(e.get("location", ""))
        city_id = e.get("city_id", "")
        city_name = loc_map.get(city_id, "Kuppam")
        event_date = e.get("event_date", "")
        event_date_sql = f"'{event_date}'" if event_date and event_date != "\\N" else "NULL"
        created_at = e.get("created_at", "NOW()")
        updated_at = e.get("updated_at", "NOW()")
        event_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"onetowncity-event-{raw_slug}"))

        sql_statements.append(f"""INSERT INTO town_news (
    id, city, locality, item_type, title, slug, content, source_name, source_url,
    is_confirmed_fact, event_date, event_time, event_venue, moderation_status, created_at, updated_at
) VALUES (
    '{event_id}',
    '{city_name}',
    'Cultural Grounds',
    'event',
    {sql_escape(title)},
    '{raw_slug}',
    {sql_escape(desc)},
    'Community Cultural Board',
    '',
    true,
    {event_date_sql},
    '10:00 AM',
    {sql_escape(venue)},
    'approved',
    '{created_at}',
    '{updated_at}'
) ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    event_date = EXCLUDED.event_date,
    event_venue = EXCLUDED.event_venue,
    moderation_status = EXCLUDED.moderation_status,
    updated_at = EXCLUDED.updated_at;\n""")

    # ─────────────────────────────────────────────────────────────────────────
    # C. STUDENT OPPORTUNITIES (Jobs & Internships)
    # ─────────────────────────────────────────────────────────────────────────
    sql_statements.append("-- ─────────────────────────────────────────────────────────────────────────")
    sql_statements.append("-- 3. STUDENT OPPORTUNITIES & ENTRY-LEVEL POSTINGS")
    sql_statements.append("-- ─────────────────────────────────────────────────────────────────────────\n")

    for j in imported_jobs:
        raw_slug = j.get("slug", "").strip() or slugify(j["job_title"] + "-" + j["company"])
        title = strip_emojis_and_clean(j["job_title"]).title()
        provider = strip_emojis_and_clean(j["company"]).title()
        desc = strip_emojis_and_clean(j.get("description", "")) or f"Entry-level position for {title} at {provider}. Hands-on regional training."
        salary = strip_emojis_and_clean(j.get("salary", ""))
        contact = strip_emojis_and_clean(j.get("contact_number", ""))
        city_id = j.get("city_id", "")
        city_name = loc_map.get(city_id, "Kuppam")
        created_at = j.get("created_at", "NOW()")
        updated_at = j.get("updated_at", "NOW()")
        opp_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"onetowncity-opp-{raw_slug}"))

        sql_statements.append(f"""INSERT INTO student_opportunities (
    id, tenant_id, city, opportunity_type, title, slug, provider_name,
    description, eligibility, deadline, apply_url, contact_phone,
    discount_percent, stipend_amount, moderation_status, anti_scam_acknowledged,
    created_at, updated_at
) VALUES (
    '{opp_id}',
    NULL,
    '{city_name}',
    'internship',
    {sql_escape(title)},
    '{raw_slug}',
    {sql_escape(provider)},
    {sql_escape(desc)},
    'Local candidates, college graduates, and final-year vocational students welcome. Never pay any fee.',
    NULL,
    '',
    {sql_escape(contact)},
    NULL,
    {sql_escape(salary)},
    'approved',
    true,
    '{created_at}',
    '{updated_at}'
) ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    provider_name = EXCLUDED.provider_name,
    description = EXCLUDED.description,
    stipend_amount = EXCLUDED.stipend_amount,
    contact_phone = EXCLUDED.contact_phone,
    anti_scam_acknowledged = EXCLUDED.anti_scam_acknowledged,
    moderation_status = EXCLUDED.moderation_status,
    updated_at = EXCLUDED.updated_at;\n""")

    sql_statements.append("COMMIT;\n")

    # Write SQL migration file
    with open(OUTPUT_SQL_PATH, "w", encoding="utf-8") as out:
        out.write("\n".join(sql_statements))

    print(f"\nGenerated idempotent SQL migration script: {OUTPUT_SQL_PATH}")
    print(f"Total SQL lines: {len(sql_statements)}")

    # Execute migration via psql
    print(f"\nExecuting migration against PostgreSQL ({DB_URL})...")
    res = subprocess.run(["psql", DB_URL, "-f", OUTPUT_SQL_PATH], capture_output=True, text=True)
    if res.returncode != 0:
        print("ERROR running psql migration:")
        print(res.stderr)
        sys.exit(1)
    else:
        print("Migration applied successfully.")

    # Run VACUUM ANALYZE
    print("\nRunning VACUUM ANALYZE on OneTownCity tables...")
    vacuum_cmd = "VACUUM ANALYZE organizations; VACUUM ANALYZE listings; VACUUM ANALYZE town_news; VACUUM ANALYZE student_opportunities; VACUUM ANALYZE categories;"
    v_res = subprocess.run(["psql", DB_URL, "-c", vacuum_cmd], capture_output=True, text=True)
    if v_res.returncode == 0:
        print("VACUUM ANALYZE complete.")
    else:
        print("VACUUM warning:", v_res.stderr)

    print("\n==================================================")
    print("ETL MIGRATION COMPLETED SUCCESSFULLY")
    print(f"Imported Listings: {len(imported_biz)}")
    print(f"Imported News: {len(news_rows)}")
    print(f"Imported Events: {len(event_rows)}")
    print(f"Imported Opportunities: {len(imported_jobs)}")
    print("==================================================")

if __name__ == "__main__":
    main()
