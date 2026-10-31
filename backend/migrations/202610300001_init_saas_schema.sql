-- OneTownCity Production SaaS Schema Migration
-- Migration: 202610300001_init_saas_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE vertical_type AS ENUM ('news', 'education', 'students', 'business');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'city_admin', 'content_provider', 'tenant_owner', 'student');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE org_role AS ENUM ('owner', 'admin', 'member');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE plan_tier AS ENUM ('free', 'growth_business', 'edu_pro', 'campus_enterprise');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE enquiry_type AS ENUM ('admission', 'course_fee', 'general_availability');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE enquiry_status AS ENUM ('open', 'responded', 'closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('not_verified', 'owner_claimed', 'details_reviewed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE moderation_status AS ENUM ('submitted', 'pending_review', 'approved', 'needs_changes', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE report_reason AS ENUM ('incorrect_details', 'closed_business', 'duplicate', 'misleading');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('open', 'resolved', 'dismissed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE news_item_type AS ENUM ('news', 'event', 'civic_project');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE opportunity_type AS ENUM ('internship', 'scholarship', 'hackathon', 'admission_drive', 'student_hostel', 'student_discount');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. MONETIZATION DOMAIN
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    tier plan_tier NOT NULL DEFAULT 'free',
    monthly_lead_quota INT NOT NULL DEFAULT 5,
    price_cents INT NOT NULL DEFAULT 0,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. IDENTITY DOMAIN
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TENANCY DOMAIN
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    vertical vertical_type NOT NULL,
    city VARCHAR(100) NOT NULL,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role org_role NOT NULL DEFAULT 'owner',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_org_user UNIQUE (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS leads_usage (
    tenant_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL, -- Format: 'YYYY-MM'
    leads_count INT NOT NULL DEFAULT 0,
    PRIMARY KEY (tenant_id, month_year)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. DIRECTORY DOMAIN
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vertical vertical_type NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    icon VARCHAR(50) NOT NULL DEFAULT 'tag',
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    vertical vertical_type NOT NULL,
    slug VARCHAR(220) UNIQUE NOT NULL,
    name VARCHAR(220) NOT NULL,
    tagline VARCHAR(300) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL,
    locality VARCHAR(120) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL DEFAULT '',
    whatsapp VARCHAR(20) NOT NULL DEFAULT '',
    website VARCHAR(255) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT '',
    operating_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
    facilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    courses JSONB NOT NULL DEFAULT '[]'::jsonb,
    admissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_sponsored BOOLEAN NOT NULL DEFAULT false,
    verification_status verification_status NOT NULL DEFAULT 'not_verified',
    moderation_status moderation_status NOT NULL DEFAULT 'approved',
    rejection_reason TEXT NOT NULL DEFAULT '',
    view_count INT NOT NULL DEFAULT 0,
    whatsapp_clicks INT NOT NULL DEFAULT 0,
    call_clicks INT NOT NULL DEFAULT 0,
    last_confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(tagline, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(locality, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(address, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'D')
    ) STORED
);

CREATE TABLE IF NOT EXISTS town_news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    city VARCHAR(100) NOT NULL,
    locality VARCHAR(120) NOT NULL DEFAULT '',
    item_type news_item_type NOT NULL DEFAULT 'news',
    title VARCHAR(250) NOT NULL,
    slug VARCHAR(260) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    source_name VARCHAR(150) NOT NULL DEFAULT 'Town Desk',
    source_url VARCHAR(500) NOT NULL DEFAULT '',
    is_confirmed_fact BOOLEAN NOT NULL DEFAULT true,
    event_date DATE NULL,
    event_time VARCHAR(50) NULL,
    event_venue VARCHAR(200) NULL,
    moderation_status moderation_status NOT NULL DEFAULT 'approved',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    city VARCHAR(100) NOT NULL,
    opportunity_type opportunity_type NOT NULL,
    title VARCHAR(250) NOT NULL,
    slug VARCHAR(260) UNIQUE NOT NULL,
    provider_name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    eligibility TEXT NOT NULL DEFAULT '',
    deadline DATE NULL,
    apply_url VARCHAR(500) NOT NULL DEFAULT '',
    contact_phone VARCHAR(20) NOT NULL DEFAULT '',
    discount_percent INT NULL,
    stipend_amount VARCHAR(100) NULL,
    moderation_status moderation_status NOT NULL DEFAULT 'approved',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. ENGAGEMENT DOMAIN
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    inquirer_name VARCHAR(150) NOT NULL,
    inquirer_phone VARCHAR(20) NOT NULL,
    inquirer_email VARCHAR(255) NOT NULL DEFAULT '',
    enquiry_type enquiry_type NOT NULL DEFAULT 'general_availability',
    message TEXT NOT NULL,
    status enquiry_status NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    discount_details TEXT NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    is_student_exclusive BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telemetry_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'view', 'whatsapp_click', 'call_click'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. GOVERNANCE DOMAIN
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    reported_by_email VARCHAR(255) NOT NULL DEFAULT 'anonymous@onetowncity.local',
    reason report_reason NOT NULL,
    details TEXT NOT NULL DEFAULT '',
    status report_status NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- INDEXES FOR PERFORMANCE & FULL-TEXT SEARCH
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_listings_search_vector ON listings USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_listings_name_trgm ON listings USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_listings_locality_trgm ON listings USING GIN (locality gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_listings_city_vertical ON listings (city, vertical, moderation_status);
CREATE INDEX IF NOT EXISTS idx_listings_tenant_id ON listings (tenant_id);
CREATE INDEX IF NOT EXISTS idx_town_news_city_type ON town_news (city, item_type, moderation_status);
CREATE INDEX IF NOT EXISTS idx_student_opps_city_type ON student_opportunities (city, opportunity_type, moderation_status);
CREATE INDEX IF NOT EXISTS idx_enquiries_tenant_status ON enquiries (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_reports_listing_status ON reports (listing_id, status);
