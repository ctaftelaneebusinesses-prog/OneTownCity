-- Migration: 202611010002_security_hardening_and_rls.sql
-- Description: Security check constraints on text inputs and composite audit indexes for strict tenant scoping

DO $$
BEGIN
    -- 1. Listings: Name length bound
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_listings_name_len'
    ) THEN
        ALTER TABLE listings
        ADD CONSTRAINT chk_listings_name_len
        CHECK (char_length(name) BETWEEN 2 AND 200);
    END IF;

    -- 2. Town News: Title length bound
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_town_news_title_len'
    ) THEN
        ALTER TABLE town_news
        ADD CONSTRAINT chk_town_news_title_len
        CHECK (char_length(title) BETWEEN 3 AND 250);
    END IF;

    -- 3. Student Opportunities: Title length bound
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_student_opps_title_len'
    ) THEN
        ALTER TABLE student_opportunities
        ADD CONSTRAINT chk_student_opps_title_len
        CHECK (char_length(title) BETWEEN 3 AND 250);
    END IF;

    -- 4. Enquiries: Inquirer name length bound
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_enquiries_inquirer_name_len'
    ) THEN
        ALTER TABLE enquiries
        ADD CONSTRAINT chk_enquiries_inquirer_name_len
        CHECK (char_length(inquirer_name) BETWEEN 2 AND 100);
    END IF;
END $$;

-- 5. Multi-Tenant Composite Indexes for fast and isolated tenant lookups
CREATE INDEX IF NOT EXISTS idx_listings_tenant_created 
    ON listings(tenant_id, created_at DESC) 
    WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_enquiries_tenant_created 
    ON enquiries(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_opps_tenant_created 
    ON student_opportunities(tenant_id, created_at DESC) 
    WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_offers_tenant_created 
    ON offers(tenant_id, created_at DESC);

-- 6. Audit logs index for City Admin governance
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created 
    ON audit_logs(actor_id, created_at DESC);
