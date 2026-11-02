-- ============================================================================
-- OneTownCity — Phase A: Production Authentication, Sessions, Claims & RBAC
-- Migration: 202611010001_auth_sessions_and_claims.sql
-- ============================================================================

-- 1. Expand user roles to include sub_admin and tenant_staff
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'sub_admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'tenant_staff';

-- 2. Add password security columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- 3. Create user_sessions table (SHA-256 token hash)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT UNIQUE NOT NULL,
    user_agent TEXT,
    ip_address VARCHAR(64),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_revoked ON user_sessions(user_id, revoked_at);

-- 4. Create ownership_claims table (for claiming directory profiles)
CREATE TABLE IF NOT EXISTS ownership_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    claimant_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_name VARCHAR(200) NOT NULL,
    official_email VARCHAR(255) NOT NULL,
    official_phone VARCHAR(40) NOT NULL,
    verification_evidence TEXT NOT NULL,
    status moderation_status NOT NULL DEFAULT 'pending_review',
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ownership_claims_listing ON ownership_claims(listing_id);
CREATE INDEX IF NOT EXISTS idx_ownership_claims_claimant ON ownership_claims(claimant_user_id);
CREATE INDEX IF NOT EXISTS idx_ownership_claims_status ON ownership_claims(status);

-- 5. Create category_extension_requests table (for content_provider subcategory requests)
CREATE TABLE IF NOT EXISTS category_extension_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vertical vertical_type NOT NULL,
    proposed_name VARCHAR(100) NOT NULL,
    justification TEXT NOT NULL,
    status moderation_status NOT NULL DEFAULT 'pending_review',
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_category_ext_user ON category_extension_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_category_ext_status ON category_extension_requests(status);

-- 6. Seed pre-configured demo accounts with known Argon2id hash for 'Password123!'
-- Hash generated with argon2id, m=19456, t=2, p=1
-- $argon2id$v=19$m=19456,t=2,p=1$Dbs140iPIo65e9CVNaJrJA$rovMOOcZ1ZkjD9m33SLCNP0uQ1tqDRJRWqrmvc0qx3M
-- Also seed demo users

-- First, ensure all existing users have a non-empty password_hash
UPDATE users SET password_hash = '$argon2id$v=19$m=19456,t=2,p=1$Dbs140iPIo65e9CVNaJrJA$rovMOOcZ1ZkjD9m33SLCNP0uQ1tqDRJRWqrmvc0qx3M' WHERE password_hash = '';

-- Demo Account 1: Super / City Admin
INSERT INTO users (id, email, name, role, password_hash, is_active)
VALUES (
    '22222222-2222-2222-2222-222222222210',
    'admin@onetowncity.in',
    'Central Governance Admin',
    'super_admin',
    '$argon2id$v=19$m=19456,t=2,p=1$Dbs140iPIo65e9CVNaJrJA$rovMOOcZ1ZkjD9m33SLCNP0uQ1tqDRJRWqrmvc0qx3M',
    TRUE
)
ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    password_hash = EXCLUDED.password_hash,
    is_active = TRUE;

-- Demo Account 2: Education Tenant Owner (Dean Narayana)
INSERT INTO users (id, email, name, role, password_hash, is_active)
VALUES (
    '22222222-2222-2222-2222-222222222211',
    'dean@narayana.edu.in',
    'Dean Academic Affairs (Narayana Engineering)',
    'tenant_owner',
    '$argon2id$v=19$m=19456,t=2,p=1$Dbs140iPIo65e9CVNaJrJA$rovMOOcZ1ZkjD9m33SLCNP0uQ1tqDRJRWqrmvc0qx3M',
    TRUE
)
ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    password_hash = EXCLUDED.password_hash,
    is_active = TRUE;

-- Demo Account 3: Business Tenant Owner (Minerva Books)
INSERT INTO users (id, email, name, role, password_hash, is_active)
VALUES (
    '22222222-2222-2222-2222-222222222212',
    'owner@minervabooks.in',
    'V. Ramanathan (Minerva Bookstore & Study Cafe)',
    'tenant_owner',
    '$argon2id$v=19$m=19456,t=2,p=1$Dbs140iPIo65e9CVNaJrJA$rovMOOcZ1ZkjD9m33SLCNP0uQ1tqDRJRWqrmvc0qx3M',
    TRUE
)
ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    password_hash = EXCLUDED.password_hash,
    is_active = TRUE;

-- Demo Account 4: Content Provider (Editor Kuppam Pulse)
INSERT INTO users (id, email, name, role, password_hash, is_active)
VALUES (
    '22222222-2222-2222-2222-222222222213',
    'editor@kuppampulse.in',
    'Kuppam Civic & Campus Editorial Desk',
    'content_provider',
    '$argon2id$v=19$m=19456,t=2,p=1$Dbs140iPIo65e9CVNaJrJA$rovMOOcZ1ZkjD9m33SLCNP0uQ1tqDRJRWqrmvc0qx3M',
    TRUE
)
ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    password_hash = EXCLUDED.password_hash,
    is_active = TRUE;

-- Demo Account 5: Student / Resident
INSERT INTO users (id, email, name, role, password_hash, is_active)
VALUES (
    '22222222-2222-2222-2222-222222222214',
    'student@gist.edu.in',
    'P. Rakesh Kumar (GIST Student)',
    'student',
    '$argon2id$v=19$m=19456,t=2,p=1$Dbs140iPIo65e9CVNaJrJA$rovMOOcZ1ZkjD9m33SLCNP0uQ1tqDRJRWqrmvc0qx3M',
    TRUE
)
ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    password_hash = EXCLUDED.password_hash,
    is_active = TRUE;

-- Ensure organization memberships for dean and owner
DO $$
DECLARE
    narayana_org_id UUID;
    minerva_org_id UUID;
    dean_user_id UUID;
    owner_user_id UUID;
BEGIN
    SELECT id INTO narayana_org_id FROM organizations WHERE slug = 'narayana-educational-society-nellore' LIMIT 1;
    SELECT id INTO minerva_org_id FROM organizations WHERE slug = 'minerva-enterprises-nellore' LIMIT 1;
    SELECT id INTO dean_user_id FROM users WHERE email = 'dean@narayana.edu.in';
    SELECT id INTO owner_user_id FROM users WHERE email = 'owner@minervabooks.in';

    IF narayana_org_id IS NOT NULL AND dean_user_id IS NOT NULL THEN
        INSERT INTO organization_members (organization_id, user_id, role)
        VALUES (narayana_org_id, dean_user_id, 'owner')
        ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'owner';
    END IF;

    IF minerva_org_id IS NOT NULL AND owner_user_id IS NOT NULL THEN
        INSERT INTO organization_members (organization_id, user_id, role)
        VALUES (minerva_org_id, owner_user_id, 'owner')
        ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'owner';
    END IF;
END $$;
