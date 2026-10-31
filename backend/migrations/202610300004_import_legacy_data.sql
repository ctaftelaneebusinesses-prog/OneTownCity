-- OneTownCity Idempotent Legacy ETL Migration
-- Generated: 2026-10-30
BEGIN;

ALTER TABLE student_opportunities ADD COLUMN IF NOT EXISTS anti_scam_acknowledged BOOLEAN NOT NULL DEFAULT true;

-- ─────────────────────────────────────────────────────────────────────────
-- 1. TENANT ORGANIZATIONS & DIRECTORY LISTINGS
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('7129273d-9128-563a-b978-6cbd5ce67902', 'St Joseph''s Women''s College of Education', 'st-josephs-womens-college-of-education-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:18.133087+00', '2026-07-27 15:45:16.424209+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '64f08597-f2c3-53ba-b03a-833347d87470',
    '7129273d-9128-563a-b978-6cbd5ce67902',
    '44444444-4444-4444-4444-444444444401',
    'education',
    'st-josephs-womens-college-of-education',
    'St Joseph''s Women''s College of Education',
    'Premier College & Academic Learning Campus in Kuppam',
    '',
    'Parsampettai, Jolarpet, Tamil Nadu 635851',
    'Parsampettai',
    'Kuppam',
    '9994209533',
    '9994209533',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    40,
    '2026-07-27 15:45:16.424209+00',
    '2026-07-27 14:22:18.133087+00',
    '2026-07-27 15:45:16.424209+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('5d80206a-3a2b-5df6-be08-3507224967d0', 'Government polytechnic For Women', 'government-polytechnic-for-women-org', 'education', 'Tirupati', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:15.308742+00', '2026-07-27 15:45:14.679456+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '8e6df796-60e0-512b-a4f1-9e522be8cf5b',
    '5d80206a-3a2b-5df6-be08-3507224967d0',
    '44444444-4444-4444-4444-444444444401',
    'education',
    'government-polytechnic-for-women',
    'Government polytechnic For Women',
    'Premier College & Academic Learning Campus in Tirupati',
    '',
    '6P3H+PQV, Bengaluru - Tirupati Hwy, Chittoor, Palamaner',
    '6P3H+PQV',
    'Tirupati',
    '1205922700',
    '1205922700',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    51,
    '2026-07-27 15:45:14.679456+00',
    '2026-07-27 14:22:15.308742+00',
    '2026-07-27 15:45:14.679456+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('1589aa7e-5047-5a63-9ad3-8d738891cf68', 'Adbutha Aharam', 'adbutha-aharam-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:07:15.939955+00', '2026-09-02 10:18:40.669705+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '2b8efb9b-45f3-5d32-8146-a0a71486ae45',
    '1589aa7e-5047-5a63-9ad3-8d738891cf68',
    '44444444-4444-4444-4444-444444444415',
    'business',
    'adbutha-aharam',
    'Adbutha Aharam',
    'Regional Dining, Traditional Cuisine & Food Services in Kuppam',
    'Google Maps: https://maps.app.goo.gl/4quX133FdjsQMPUr5',
    'Chittoor Main Road, near PES Medical College, beside Munjunatha convention, Kuppam, Nalagampalle, Andhra Pradesh 517425',
    'Chittoor Main Road',
    'Kuppam',
    '7799665299',
    '7799665299',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    397,
    '2026-09-02 10:18:40.669705+00',
    '2026-07-27 12:07:15.939955+00',
    '2026-09-02 10:18:40.669705+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('b04da23c-5c14-596e-b539-0c615a12faeb', 'Akshat Hospital', 'akshat-hospital-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:24:47.180358+00', '2026-07-29 06:38:34.019277+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'da394508-b29f-5342-a828-64798c362106',
    'b04da23c-5c14-596e-b539-0c615a12faeb',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'akshat-hospital',
    'Akshat Hospital',
    'Healthcare Center, Inpatient Care & Diagnostic Services in Kuppam',
    '',
    'Palamaner, Andhra Pradesh 517408',
    'Palamaner',
    'Kuppam',
    '9494878977',
    '9494878977',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    86,
    '2026-07-29 06:38:34.019277+00',
    '2026-07-27 12:24:47.180358+00',
    '2026-07-29 06:38:34.019277+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('7656a23b-1009-51e4-83d2-cecf94f6d6cf', 'Mother Theresa Institute Of Computer Applications, Palamaner', 'mother-theresa-institute-of-computer-applications-palamaner-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:10.883429+00', '2026-07-27 15:45:12.476147+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'a4c90e99-607f-59e1-b6da-8b0cd98d8e82',
    '7656a23b-1009-51e4-83d2-cecf94f6d6cf',
    '44444444-4444-4444-4444-444444444401',
    'education',
    'mother-theresa-institute-of-computer-applications-palamaner',
    'Mother Theresa Institute Of Computer Applications, Palamaner',
    'Premier College & Academic Learning Campus in Kuppam',
    '',
    'Palamaner, Gangavaram, Andhra Pradesh 517408',
    'Palamaner',
    'Kuppam',
    '9885375016',
    '9885375016',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    37,
    '2026-07-27 15:45:12.476147+00',
    '2026-07-27 14:22:10.883429+00',
    '2026-07-27 15:45:12.476147+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('64e76c52-4fda-5601-93b9-16cc967c1e52', 'Brindavan School', 'brindavan-school-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:21:55.007734+00', '2026-07-27 15:45:03.58298+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '5fb879fe-78fa-5e70-bdcc-08ca3c4b62c9',
    '64e76c52-4fda-5601-93b9-16cc967c1e52',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'brindavan-school',
    'Brindavan School',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    'Bazar St, Palamaner, Andhra Pradesh 517408',
    'Bazar St',
    'Kuppam',
    '8892004394',
    '8892004394',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    56,
    '2026-07-27 15:45:03.58298+00',
    '2026-07-27 14:21:55.007734+00',
    '2026-07-27 15:45:03.58298+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('00024a62-ec7d-5d17-b974-7cc1a290a9ae', 'hotel mangala vilas', 'hotel-mangala-vilas-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:07:11.081773+00', '2026-07-27 12:07:11.081798+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '21d107f0-2411-5207-8920-d3246e0e05cd',
    '00024a62-ec7d-5d17-b974-7cc1a290a9ae',
    '44444444-4444-4444-4444-444444444415',
    'business',
    'hotel-mangala-vilas',
    'hotel mangala vilas',
    'Regional Dining, Traditional Cuisine & Food Services in Kuppam',
    'Website: https://www.instagram.com/mangala_vilas_?igsh=ejhvcDJldzM0cHY4 | Google Maps: https://maps.app.goo.gl/Hwscqx1htbQ9pew6A',
    'New, bye pass road, Kuppam, Andhra Pradesh 517425',
    'New',
    'Kuppam',
    '9003805533',
    '9003805533',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    67,
    '2026-07-27 12:07:11.081798+00',
    '2026-07-27 12:07:11.081773+00',
    '2026-07-27 12:07:11.081798+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('f0634c21-a61b-5342-bc40-9cb5c59145b9', 'Bheema Restaurant', 'bheema-restaurant-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:07:10.093661+00', '2026-07-27 12:07:10.093683+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '35c06e48-867d-5b45-88f1-9e8fdf0ec446',
    'f0634c21-a61b-5342-bc40-9cb5c59145b9',
    '44444444-4444-4444-4444-444444444415',
    'business',
    'bheema-restaurant',
    'Bheema Restaurant',
    'Regional Dining, Traditional Cuisine & Food Services in Kuppam',
    'Google Maps: https://maps.app.goo.gl/C1Cj4weoeSBCiT189',
    'Bheema Restrauant, Kuppam, Andhra Pradesh 517425',
    'Bheema Restrauant',
    'Kuppam',
    '9118891166',
    '9118891166',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    75,
    '2026-07-27 12:07:10.093683+00',
    '2026-07-27 12:07:10.093661+00',
    '2026-07-27 12:07:10.093683+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('d1b5ec87-6e90-58ba-a660-66baba70425b', 'Friend''s Pharmacy', 'friends-pharmacy-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:29:32.244636+00', '2026-07-27 14:26:18.508173+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '9570c958-6844-5206-ad3f-c497449bb98e',
    'd1b5ec87-6e90-58ba-a660-66baba70425b',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'friends-pharmacy',
    'Friend''s Pharmacy',
    'Licensed Community Pharmacy & Essential Medical Supplies in Kuppam',
    '',
    'New Hotel Street, Junction, near Jolarpettai, Tamil Nadu 635851',
    'New Hotel Street',
    'Kuppam',
    '6383226051',
    '6383226051',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    71,
    '2026-07-27 14:26:18.508173+00',
    '2026-07-27 12:29:32.244636+00',
    '2026-07-27 14:26:18.508173+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('06bc9fd6-eae4-5b67-9364-f76161e54b30', 'Shiva Medical', 'shiva-medical-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:29:36.454103+00', '2026-07-27 14:26:19.958099+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '01e1b83d-3e3f-5581-b503-5c59c39d9cde',
    '06bc9fd6-eae4-5b67-9364-f76161e54b30',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'shiva-medical',
    'Shiva Medical',
    'Healthcare Center, Inpatient Care & Diagnostic Services in Kuppam',
    '',
    'HHHF+4XH, Parsampettai, Jolarpet, Tamil Nadu 635851',
    'HHHF+4XH',
    'Kuppam',
    '9362641418',
    '9362641418',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    38,
    '2026-07-27 14:26:19.958099+00',
    '2026-07-27 12:29:36.454103+00',
    '2026-07-27 14:26:19.958099+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('3f9dcd52-611b-55b0-a707-7d3911e15dae', 'MVR DEGREE COLLEGE -GANGAVARAM', 'mvr-degree-college-gangavaram-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:07.812119+00', '2026-07-27 15:45:11.01072+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '6e6a6981-ae11-5990-9c16-ad9cb7882edc',
    '3f9dcd52-611b-55b0-a707-7d3911e15dae',
    '44444444-4444-4444-4444-444444444401',
    'education',
    'mvr-degree-college-gangavaram',
    'MVR DEGREE COLLEGE -GANGAVARAM',
    'Premier College & Academic Learning Campus in Kuppam',
    '',
    'Sai nagar Gangavaram, Near Sai Baba Temple, Palamaner',
    'Sai nagar Gangavaram',
    'Kuppam',
    '9703600555',
    '9703600555',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    36,
    '2026-07-27 15:45:11.01072+00',
    '2026-07-27 14:22:07.812119+00',
    '2026-07-27 15:45:11.01072+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('f4caf448-f1fa-511a-a45a-4554cca6ad94', 'M.S. MULTISPECIALITY HOSPITAL, PALAMANER', 'ms-multispeciality-hospital-palamaner-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:24:49.399361+00', '2026-07-27 14:26:12.697512+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'd5b43e0a-350c-5bbf-bc37-7f6cddd30fd9',
    'f4caf448-f1fa-511a-a45a-4554cca6ad94',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'ms-multispeciality-hospital-palamaner',
    'M.S. MULTISPECIALITY HOSPITAL, PALAMANER',
    'Healthcare Center, Inpatient Care & Diagnostic Services in Kuppam',
    '',
    'Palamaner, Gangavaram, Andhra Pradesh 517408',
    'Palamaner',
    'Kuppam',
    '7386897581',
    '7386897581',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    43,
    '2026-07-27 14:26:12.697512+00',
    '2026-07-27 12:24:49.399361+00',
    '2026-07-27 14:26:12.697512+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('158b09d0-be97-5397-a487-1bdded165516', 'Santhipuram Royal School', 'santhipuram-royal-school-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:16.761602+00', '2026-07-27 15:45:15.409999+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '464e91dc-8eb4-5bb0-8795-cee4b0358c2f',
    '158b09d0-be97-5397-a487-1bdded165516',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'santhipuram-royal-school',
    'Santhipuram Royal School',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    '2-99, 2-99, Shanthipuram, Arimuthanapalle, Andhra Pradesh 517423',
    'Shanthipuram',
    'Kuppam',
    '9912624294',
    '9912624294',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    37,
    '2026-07-27 15:45:15.409999+00',
    '2026-07-27 14:22:16.761602+00',
    '2026-07-27 15:45:15.409999+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('e1e549a6-aa15-5b57-a2c4-86d66299007d', 'Little Flower English Medium High School', 'little-flower-english-medium-high-school-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:21:59.332192+00', '2026-07-27 15:45:06.401414+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '951a971b-29e0-5b7f-b25f-df4071dc99ec',
    'e1e549a6-aa15-5b57-a2c4-86d66299007d',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'little-flower-english-medium-high-school',
    'Little Flower English Medium High School',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    '5PVR+5R2, Dass Bungalow Bommidoddi Road, 6, 393/5, Palamaner, Andhra Pradesh 517408',
    '5PVR+5R2',
    'Kuppam',
    '9492800733',
    '9492800733',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    39,
    '2026-07-27 15:45:06.401414+00',
    '2026-07-27 14:21:59.332192+00',
    '2026-07-27 15:45:06.401414+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('e627129d-5eba-574b-8e1c-286376535dc9', 'CHINNARI HOSPITAL', 'chinnari-hospital-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:24:44.972095+00', '2026-07-27 14:26:09.475174+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'd4380c1b-be6e-58e6-b87f-709a57e1d2d5',
    'e627129d-5eba-574b-8e1c-286376535dc9',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'chinnari-hospital',
    'CHINNARI HOSPITAL',
    'Healthcare Center, Inpatient Care & Diagnostic Services in Kuppam',
    '',
    'opposite to canara bank, Sai Nagar, Palamaner, Gangavaram',
    'opposite to canara bank',
    'Kuppam',
    '9151515803',
    '9151515803',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    59,
    '2026-07-27 14:26:09.475174+00',
    '2026-07-27 12:24:44.972095+00',
    '2026-07-27 14:26:09.475174+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('14448e5c-4baf-58fe-9c14-bc3da79b783e', 'Gangama Temple', 'gangama-temple-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-09-03 05:50:16.64936+00', '2026-09-03 05:51:11.480156+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'bf637cd1-8a5d-502f-8e2c-e325d0c1bff6',
    '14448e5c-4baf-58fe-9c14-bc3da79b783e',
    '44444444-4444-4444-4444-444444444406',
    'business',
    'gangama-temple',
    'Gangama Temple',
    'Verified Commercial Storefront & Customer Services in Kuppam',
    '',
    '32, Nethaji Road, Old Pet, Kuppam, Chittoor District, Andhra Pradesh - 517425',
    'Nethaji Road',
    'Kuppam',
    '9844449289',
    '9844449289',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    33,
    '2026-09-03 05:51:11.480156+00',
    '2026-09-03 05:50:16.64936+00',
    '2026-09-03 05:51:11.480156+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('6442f0a8-0dcd-5222-9d28-c36807f9160b', 'SAINT FRANCIS JUNIOR COLLEGE (SFJC)', 'saint-francis-junior-college-sfjc-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:12.398176+00', '2026-07-27 15:45:13.210361+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '42fa43bc-2243-56f3-9d26-d19668341336',
    '6442f0a8-0dcd-5222-9d28-c36807f9160b',
    '44444444-4444-4444-4444-444444444401',
    'education',
    'saint-francis-junior-college-sfjc',
    'SAINT FRANCIS JUNIOR COLLEGE (SFJC)',
    'Premier College & Academic Learning Campus in Kuppam',
    '',
    'ST LOUIS FRIARY, FATHER''S BUNGALOW, near DSP OFFICE, OLDPET',
    'ST LOUIS FRIARY',
    'Kuppam',
    '8579251814',
    '8579251814',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    35,
    '2026-07-27 15:45:13.210361+00',
    '2026-07-27 14:22:12.398176+00',
    '2026-07-27 15:45:13.210361+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('271497c8-de5f-51e2-a438-c1db2fe186ff', 'NH Kuppam Restaurant', 'nh-kuppam-restaurant-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:07:14.001868+00', '2026-07-27 12:07:14.001877+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'c0bc78d6-c72e-5467-a016-c60719a5c184',
    '271497c8-de5f-51e2-a438-c1db2fe186ff',
    '44444444-4444-4444-4444-444444444415',
    'business',
    'nh-kuppam-restaurant',
    'NH Kuppam Restaurant',
    'Regional Dining, Traditional Cuisine & Food Services in Kuppam',
    'Google Maps: https://maps.app.goo.gl/12wt3WqHYXjdULEbA',
    'P8QW+JHX, opposite to BCN Resort, Kuppam, Andhra Pradesh 517425',
    'P8QW+JHX',
    'Kuppam',
    '9486899399',
    '9486899399',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    74,
    '2026-07-27 12:07:14.001877+00',
    '2026-07-27 12:07:14.001868+00',
    '2026-07-27 12:07:14.001877+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('0a5d702f-4895-5ceb-bec6-b8354bb7e7f1', 'PES Medical College', 'pes-medical-college-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:38.068856+00', '2026-07-27 15:45:27.108598+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '1fdd6b3f-72e6-55be-a3b2-b3b5e0a9f4fa',
    '0a5d702f-4895-5ceb-bec6-b8354bb7e7f1',
    '44444444-4444-4444-4444-444444444401',
    'education',
    'pes-medical-college',
    'PES Medical College',
    'Premier College & Academic Learning Campus in Kuppam',
    '',
    'Q9R8+883, Nalagampalle, Andhra Pradesh 517425',
    'Q9R8+883',
    'Kuppam',
    '8570256655',
    '8570256655',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    34,
    '2026-07-27 15:45:27.108598+00',
    '2026-07-27 14:22:38.068856+00',
    '2026-07-27 15:45:27.108598+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('61046f82-07fb-5b45-8e86-f8a0c32b8b97', 'Vani Vidyashram English Medium School', 'vani-vidyashram-english-medium-school-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:02.384447+00', '2026-07-27 15:45:08.080465+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '0613a11f-11a0-55ff-817a-b6ccc29d760a',
    '61046f82-07fb-5b45-8e86-f8a0c32b8b97',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'vani-vidyashram-english-medium-school',
    'Vani Vidyashram English Medium School',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    'Door No. 3, 111/1, Agraharam Road, Old Pet, Palamaner, Andhra Pradesh 517408',
    'Door No. 3',
    'Kuppam',
    '9959696981',
    '9959696981',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    36,
    '2026-07-27 15:45:08.080465+00',
    '2026-07-27 14:22:02.384447+00',
    '2026-07-27 15:45:08.080465+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('69c4e6f9-ee5e-577a-b5f0-2529ba1f0d30', 'Sri Vivekananda English Medium High School', 'sri-vivekananda-english-medium-high-school-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:25.199076+00', '2026-07-27 15:45:20.098057+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'bad83dd1-3fb0-56fa-9b82-20de7ba51c73',
    '69c4e6f9-ee5e-577a-b5f0-2529ba1f0d30',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'sri-vivekananda-english-medium-high-school',
    'Sri Vivekananda English Medium High School',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    'Near Sekhar nagar, Kamathamur, Kuppam, Andhra Pradesh 517425',
    'Near Sekhar nagar',
    'Kuppam',
    '9676758188',
    '9676758188',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    39,
    '2026-07-27 15:45:20.098057+00',
    '2026-07-27 14:22:25.199076+00',
    '2026-07-27 15:45:20.098057+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('03aa2411-708a-5ff0-8651-a993dceb9629', 'Narayana E Techno School - PAIBATA GUDUPALLI ROAD KUPPAM', 'narayana-e-techno-school-paibata-gudupalli-road-kuppam-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:23.716819+00', '2026-07-27 15:45:19.364671+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '702355c7-2cb6-50f9-8296-c6ec68cf3915',
    '03aa2411-708a-5ff0-8651-a993dceb9629',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'narayana-e-techno-school-paibata-gudupalli-road-kuppam',
    'Narayana E Techno School - PAIBATA GUDUPALLI ROAD KUPPAM',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    'Kuppam, Bairaganipalle (Rural), Andhra Pradesh 517425',
    'Kuppam',
    'Kuppam',
    '8179880268',
    '8179880268',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    36,
    '2026-07-27 15:45:19.364671+00',
    '2026-07-27 14:22:23.716819+00',
    '2026-07-27 15:45:19.364671+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('9fddffbe-0060-544a-be2f-3d249c55a164', 'CVRM Degree College', 'cvrm-degree-college-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:52.746294+00', '2026-07-27 15:45:36.314503+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'ef05eca8-4a6e-5062-b459-9f95946d14a6',
    '9fddffbe-0060-544a-be2f-3d249c55a164',
    '44444444-4444-4444-4444-444444444401',
    'education',
    'cvrm-degree-college',
    'CVRM Degree College',
    'Premier College & Academic Learning Campus in Kuppam',
    '',
    '2F3P+2QX, 3, Bazaar St, Venkatagirikota, Andhra Pradesh 517424',
    '2F3P+2QX',
    'Kuppam',
    '9440036316',
    '9440036316',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    56,
    '2026-07-27 15:45:36.314503+00',
    '2026-07-27 14:22:52.746294+00',
    '2026-07-27 15:45:36.314503+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('598a73c5-aa8f-5cf2-8521-e5add3037685', 'Mother Theresa CBSE School', 'mother-theresa-cbse-school-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:06.427977+00', '2026-07-27 15:45:10.278944+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'd1caa518-f216-50d6-8b68-89cddfaa7e59',
    '598a73c5-aa8f-5cf2-8521-e5add3037685',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'mother-theresa-cbse-school',
    'Mother Theresa CBSE School',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    'NH 42, Muthukur, Andhra Pradesh 517408',
    'NH 42',
    'Kuppam',
    '9490745656',
    '9490745656',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    37,
    '2026-07-27 15:45:10.278944+00',
    '2026-07-27 14:22:06.427977+00',
    '2026-07-27 15:45:10.278944+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('29ce9a4b-9fc8-539b-8482-65c7fa9f3cfb', 'Narayana EM School - Palamaneru', 'narayana-em-school-palamaneru-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:21:56.550058+00', '2026-07-27 15:45:04.332459+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '44af20d5-c4d1-58a7-82c7-d0dff8b4c3b5',
    '29ce9a4b-9fc8-539b-8482-65c7fa9f3cfb',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'narayana-em-school-palamaneru',
    'Narayana EM School - Palamaneru',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    '13-209/1, Basavanna Katta St, Revenue Ward 15, Rangapuram, Palamaner',
    '13-209/1',
    'Kuppam',
    '7569804913',
    '7569804913',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    33,
    '2026-07-27 15:45:04.332459+00',
    '2026-07-27 14:21:56.550058+00',
    '2026-07-27 15:45:04.332459+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('7e88fa1e-f425-5f77-8e1b-ba617169325a', 'SRRS MP Primary School (Govt)', 'srrs-mp-primary-school-govt-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:05.150727+00', '2026-07-27 15:45:09.548176+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '9e409432-54e1-5c3e-b03e-c689b0c2e056',
    '7e88fa1e-f425-5f77-8e1b-ba617169325a',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'srrs-mp-primary-school-govt',
    'SRRS MP Primary School (Govt)',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    '6P3W+39V RTC, Bus Stand Rd, Rangapuram, Palamaner, Andhra Pradesh 517408',
    '6P3W+39V RTC',
    'Kuppam',
    '9494599449',
    '9494599449',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    38,
    '2026-07-27 15:45:09.548176+00',
    '2026-07-27 14:22:05.150727+00',
    '2026-07-27 15:45:09.548176+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('5ade16de-17c9-52e7-a050-3e9566f66c31', 'Narayana e-Techno School - Palamaneru', 'narayana-e-techno-school-palamaneru-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:21:58.164219+00', '2026-07-27 15:45:05.094477+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '406735de-68be-52c6-a32c-ac2e3527122d',
    '5ade16de-17c9-52e7-a050-3e9566f66c31',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'narayana-e-techno-school-palamaneru',
    'Narayana e-Techno School - Palamaneru',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    '13-209/1, Basavanna Katta St, Revenue Ward 15, Rangapuram, Palamaner, Andhra Pradesh 517408',
    '13-209/1',
    'Kuppam',
    '9100714868',
    '9100714868',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    35,
    '2026-07-27 15:45:05.094477+00',
    '2026-07-27 14:21:58.164219+00',
    '2026-07-27 15:45:05.094477+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('7f2f5e8a-3fb4-519b-9de4-6d1236e35177', 'Diamond valley English medium school', 'diamond-valley-english-medium-school-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:00.929586+00', '2026-07-27 15:45:07.348525+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'c17c6d2a-c385-51ef-83de-a1ddf5d1150b',
    '7f2f5e8a-3fb4-519b-9de4-6d1236e35177',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'diamond-valley-english-medium-school',
    'Diamond valley English medium school',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    'NH42, Palamaner, Gangavaram, Andhra Pradesh 517408',
    'NH42',
    'Kuppam',
    '9701938381',
    '9701938381',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    46,
    '2026-07-27 15:45:07.348525+00',
    '2026-07-27 14:22:00.929586+00',
    '2026-07-27 15:45:07.348525+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('d12eba0a-2a85-59bc-9e9e-ec27452ada40', 'Government Higher Secondary School', 'government-higher-secondary-school-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:29:49.259949+00', '2026-07-27 14:26:26.502973+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '1e83e336-f401-560a-99b4-4f49acfdc102',
    'd12eba0a-2a85-59bc-9e9e-ec27452ada40',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'government-higher-secondary-school',
    'Government Higher Secondary School',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    'Jolarpet, Vellore SH-18, Salem - Tirupattur - Vaniyambadi Rd, Vellore, Tamil Nadu 635851',
    'Jolarpet',
    'Kuppam',
    '9841198212',
    '9841198212',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    45,
    '2026-07-27 14:26:26.502973+00',
    '2026-07-27 12:29:49.259949+00',
    '2026-07-27 14:26:26.502973+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('de8cf2a3-b72d-5479-b999-cf305d3b7e03', 'International Delhi Public School Kuppam', 'international-delhi-public-school-kuppam-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:26.529878+00', '2026-07-27 15:45:20.83128+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'df0ffbfa-da43-554d-baed-11cfd51efc13',
    'de8cf2a3-b72d-5479-b999-cf305d3b7e03',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'international-delhi-public-school-kuppam',
    'International Delhi Public School Kuppam',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    'Krishnarjuna Complex, Kuppam Gudipalli Rd, Bairaganipalle (Rural), Andhra Pradesh 517425',
    'Krishnarjuna Complex',
    'Kuppam',
    '9989388330',
    '9989388330',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    40,
    '2026-07-27 15:45:20.83128+00',
    '2026-07-27 14:22:26.529878+00',
    '2026-07-27 15:45:20.83128+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('4bd7ff03-e5df-5236-96af-570ba4bfd975', 'Mother Theresa Institute Of Engineering And Technology', 'mother-theresa-institute-of-engineering-and-technology-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:13.830947+00', '2026-07-27 15:45:13.944526+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '67796813-c48f-5c27-9b84-376c041118d0',
    '4bd7ff03-e5df-5236-96af-570ba4bfd975',
    '44444444-4444-4444-4444-444444444401',
    'education',
    'mother-theresa-institute-of-engineering-and-technology',
    'Mother Theresa Institute Of Engineering And Technology',
    'Premier College & Academic Learning Campus in Kuppam',
    '',
    'Melumoi Village And Post, Palamaner,, Chittoor Dist, Seemandhra, Melmoi',
    'Melumoi Village And Post',
    'Kuppam',
    '9866888648',
    '9866888648',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    37,
    '2026-07-27 15:45:13.944526+00',
    '2026-07-27 14:22:13.830947+00',
    '2026-07-27 15:45:13.944526+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('974ced36-7498-55cd-ab2d-226fbcaa3751', 'Don Bosco College / Centre', 'don-bosco-college-centre-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:19.587288+00', '2026-07-27 15:45:17.163925+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'd4f161cc-228b-5c25-a92b-253648d92d03',
    '974ced36-7498-55cd-ab2d-226fbcaa3751',
    '44444444-4444-4444-4444-444444444401',
    'education',
    'don-bosco-college-centre',
    'Don Bosco College / Centre',
    'Premier College & Academic Learning Campus in Kuppam',
    '',
    'HJPJ+FWG Don Bosco college, Athanavur, Yelagiri, Tamil Nadu 635853',
    'HJPJ+FWG Don Bosco college',
    'Kuppam',
    '2022268624',
    '2022268624',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    55,
    '2026-07-27 15:45:17.163925+00',
    '2026-07-27 14:22:19.587288+00',
    '2026-07-27 15:45:17.163925+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('a54a1142-be88-5ec4-aae0-b465480a9fe9', 'ELLAGIRI CLINIC AND MEDICAL', 'ellagiri-clinic-and-medical-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:29:40.864141+00', '2026-07-27 14:26:22.138514+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'fc1a0948-9a4b-56ba-8579-f1634af4c8f0',
    'a54a1142-be88-5ec4-aae0-b465480a9fe9',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'ellagiri-clinic-and-medical',
    'ELLAGIRI CLINIC AND MEDICAL',
    'Healthcare Center, Inpatient Care & Diagnostic Services in Kuppam',
    '',
    'Ponneri, Mandalavadi, Tamil Nadu 635851',
    'Ponneri',
    'Kuppam',
    '9600886352',
    '9600886352',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    72,
    '2026-07-27 14:26:22.138514+00',
    '2026-07-27 12:29:40.864141+00',
    '2026-07-27 14:26:22.138514+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('900ec7a9-f527-5ad3-9e6e-1f09fc065dc6', 'NAVATA TRANSPORT', 'navata-transport-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-29 12:30:25.506407+00', '2026-07-29 12:36:11.266642+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'e7b37e1e-b283-5053-83e4-6b7b8501f3e6',
    '900ec7a9-f527-5ad3-9e6e-1f09fc065dc6',
    '44444444-4444-4444-4444-444444444416',
    'business',
    'navata-transport',
    'NAVATA TRANSPORT',
    'Local Mobility, Transit & Commute Support in Kuppam',
    '',
    'Q83V+3CJ NAVATA TRANSPORT, The HP Rd, beside Sri Vidyanikethan school, Dollars Colony, Bairaganipalle (Rural), Andhra Pradesh 517425',
    'Q83V+3CJ NAVATA TRANSPORT',
    'Kuppam',
    '8666638787',
    '8666638787',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    70,
    '2026-07-29 12:36:11.266642+00',
    '2026-07-29 12:30:25.506407+00',
    '2026-07-29 12:36:11.266642+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('00b35ab3-9d10-56d6-af73-0935e187152e', 'Draft Biz One Updated', 'draft-biz-one-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-08-31 06:26:22.604493+00', '2026-08-31 06:26:52.713422+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '1843c3bd-a831-5481-9909-0b8463cc31a3',
    '00b35ab3-9d10-56d6-af73-0935e187152e',
    '44444444-4444-4444-4444-444444444406',
    'business',
    'draft-biz-one',
    'Draft Biz One Updated',
    'Verified Commercial Storefront & Customer Services in Kuppam',
    '',
    '123 Test St',
    '123 Test St',
    'Kuppam',
    '9876543210',
    '9876543210',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'not_verified',
    'approved',
    0,
    '2026-08-31 06:26:52.713422+00',
    '2026-08-31 06:26:22.604493+00',
    '2026-08-31 06:26:52.713422+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('af4dac85-65db-5beb-b59e-74a7920546a4', 'Makkal Marunthagam - Jolarpet, Tirupathur', 'makkal-marunthagam-jolarpet-tirupathur-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:29:35.004546+00', '2026-07-27 14:26:19.230812+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'a7dd1865-31c5-52c1-b532-83a3fdff67b8',
    'af4dac85-65db-5beb-b59e-74a7920546a4',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'makkal-marunthagam-jolarpet-tirupathur',
    'Makkal Marunthagam - Jolarpet, Tirupathur',
    'Licensed Community Pharmacy & Essential Medical Supplies in Kuppam',
    '',
    'No.72, MARUTHI MAHAL, TIRUPATTUR MAIN ROAD, opposite VAKKANAMPATTI POST, near JOLARPET BUS STOP, Jolarpet, TIRUPATTUR, Tamil Nadu 635851',
    'No.72',
    'Kuppam',
    '8072467051',
    '8072467051',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    77,
    '2026-07-27 14:26:19.230812+00',
    '2026-07-27 12:29:35.004546+00',
    '2026-07-27 14:26:19.230812+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('336634c2-b8ec-5012-8d6d-ff3b2774024e', 'Chikbun Food Plaza', 'chikbun-food-plaza-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:07:14.970619+00', '2026-07-27 12:07:14.970628+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'b559a882-c989-536a-a84d-853f82516474',
    '336634c2-b8ec-5012-8d6d-ff3b2774024e',
    '44444444-4444-4444-4444-444444444415',
    'business',
    'chikbun-food-plaza',
    'Chikbun Food Plaza',
    'Regional Dining, Traditional Cuisine & Food Services in Kuppam',
    'Google Maps: https://maps.app.goo.gl/29whiK8kdrtBpJJX9',
    'Kuppam, Nalagampalle, Andhra Pradesh 517425',
    'Kuppam',
    'Kuppam',
    '8008492808',
    '8008492808',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    62,
    '2026-07-27 12:07:14.970628+00',
    '2026-07-27 12:07:14.970619+00',
    '2026-07-27 12:07:14.970628+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('5ba664ac-59e3-5d15-b400-fbf0cd095a90', 'Kuppam night briyani', 'kuppam-night-briyani-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:07:16.915949+00', '2026-07-27 12:07:16.915959+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'cc034b62-584f-5acd-9ab8-f46201502db4',
    '5ba664ac-59e3-5d15-b400-fbf0cd095a90',
    '44444444-4444-4444-4444-444444444415',
    'business',
    'kuppam-night-briyani',
    'Kuppam night briyani',
    'Regional Dining, Traditional Cuisine & Food Services in Kuppam',
    'Google Maps: https://maps.app.goo.gl/ugfMUcAeQ7QB2Uvw6',
    'Settipalli Cross, Krishnagiri - Palamaner Rd, Kuppam, Beggilipalle, Andhra Pradesh 517425',
    'Settipalli Cross',
    'Kuppam',
    '6300581448',
    '6300581448',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    64,
    '2026-07-27 12:07:16.915959+00',
    '2026-07-27 12:07:16.915949+00',
    '2026-07-27 12:07:16.915959+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('13c2d499-7176-514b-997e-47349845da29', 'AURORA Kerala Ayurvedic hospital', 'aurora-kerala-ayurvedic-hospital-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:29:26.419039+00', '2026-07-27 14:26:15.606487+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '94099b3f-317e-51d8-b10e-37b24e17f509',
    '13c2d499-7176-514b-997e-47349845da29',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'aurora-kerala-ayurvedic-hospital',
    'AURORA Kerala Ayurvedic hospital',
    'Healthcare Center, Inpatient Care & Diagnostic Services in Kuppam',
    '',
    'Lingayath Street, beside Reliance Smart, Palamaner, Andhra Pradesh 517408',
    'Lingayath Street',
    'Kuppam',
    '8579293229',
    '8579293229',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    75,
    '2026-07-27 14:26:15.606487+00',
    '2026-07-27 12:29:26.419039+00',
    '2026-07-27 14:26:15.606487+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('2058a216-5819-5bd6-b0cc-220e27e02085', 'SRI DIVYA MEDICALS', 'sri-divya-medicals-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:29:39.409559+00', '2026-07-27 14:26:21.413545+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '57ab5908-a900-5181-bbd7-20b1ddffcbf6',
    '2058a216-5819-5bd6-b0cc-220e27e02085',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'sri-divya-medicals',
    'SRI DIVYA MEDICALS',
    'Licensed Community Pharmacy & Essential Medical Supplies in Kuppam',
    '',
    '32E, Vaniyambadi Main Rd, Jolarpet, Tamil Nadu 635851',
    '32E',
    'Kuppam',
    '9486995381',
    '9486995381',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    48,
    '2026-07-27 14:26:21.413545+00',
    '2026-07-27 12:29:39.409559+00',
    '2026-07-27 14:26:21.413545+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('6df026fa-44b0-54ca-8803-67ec0a7bde13', 'Shifa We Care IVF & Multispecialty Hospital Palamaner - Best Fertility Centre in Chittoor | Best IVF Treatment Centre.', 'shifa-we-care-ivf-multispecialty-hospital-palamaner-best-fertility-centre-in-chittoor-best-ivf-treatment-centre-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:29:24.89885+00', '2026-07-27 14:26:14.877468+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '0d605fd6-1438-5370-b6e4-a8dc9f8bd109',
    '6df026fa-44b0-54ca-8803-67ec0a7bde13',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'shifa-we-care-ivf-multispecialty-hospital-palamaner-best-fertility-centre-in-chittoor-best-ivf-treatment-centre',
    'Shifa We Care IVF & Multispecialty Hospital Palamaner - Best Fertility Centre in Chittoor | Best IVF Treatment Centre.',
    'Healthcare Center, Inpatient Care & Diagnostic Services in Kuppam',
    '',
    '11-139/7, MBT Rd, near rangababu circle, Rangapuram, Palamaner, Andhra Pradesh 517408',
    '11-139/7',
    'Kuppam',
    '7997227726',
    '7997227726',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    44,
    '2026-07-27 14:26:14.877468+00',
    '2026-07-27 12:29:24.89885+00',
    '2026-07-27 14:26:14.877468+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('eb66613b-8227-507e-9463-dde10a4e8dd7', 'NEW AL BAKE KUPPAM', 'new-al-bake-kuppam-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:07:13.030966+00', '2026-07-27 12:07:13.030987+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '40f0ea03-ff7b-57ac-89e6-a3f30a9d7359',
    'eb66613b-8227-507e-9463-dde10a4e8dd7',
    '44444444-4444-4444-4444-444444444415',
    'business',
    'new-al-bake-kuppam',
    'NEW AL BAKE KUPPAM',
    'Regional Dining, Traditional Cuisine & Food Services in Kuppam',
    'Website: https://aaharcart.com/ | Google Maps: https://maps.app.goo.gl/Zv2GLo6JdAsxaNoP8',
    'Palace Rd, opposite Celekt mobiles, Bairaganipalle (Rural), Andhra Pradesh 517425',
    'Palace Rd',
    'Kuppam',
    '9281427700',
    '9281427700',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    72,
    '2026-07-27 12:07:13.030987+00',
    '2026-07-27 12:07:13.030966+00',
    '2026-07-27 12:07:13.030987+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('ac202c40-4c76-5e74-bee9-e0807ea95dff', 'CP1 Business Kuppam Fixed', 'cp1-business-kuppam-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-08-31 06:27:55.977192+00', '2026-08-31 06:28:18.097239+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '741b8407-bc9e-5db2-b908-7491d49866b3',
    'ac202c40-4c76-5e74-bee9-e0807ea95dff',
    '44444444-4444-4444-4444-444444444406',
    'business',
    'cp1-business-kuppam',
    'CP1 Business Kuppam Fixed',
    'Verified Commercial Storefront & Customer Services in Kuppam',
    '',
    '456 Test Ave, updated',
    '456 Test Ave',
    'Kuppam',
    '9876543211',
    '9876543211',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'not_verified',
    'approved',
    0,
    '2026-08-31 06:28:18.097239+00',
    '2026-08-31 06:27:55.977192+00',
    '2026-08-31 06:28:18.097239+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('5014d486-c90a-58c5-85a7-d9ac887a828d', 'Government Hospital, Palamaner', 'government-hospital-palamaner-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:24:48.293427+00', '2026-07-27 14:26:11.650811+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '9b2dbf7d-186f-5d88-baa5-b6210b2173b6',
    '5014d486-c90a-58c5-85a7-d9ac887a828d',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'government-hospital-palamaner',
    'Government Hospital, Palamaner',
    'Healthcare Center, Inpatient Care & Diagnostic Services in Kuppam',
    '',
    'big labani mosque, 1-29, Old Pet, Palamaner, Andhra Pradesh 517408',
    'big labani mosque',
    'Kuppam',
    '9963040316',
    '9963040316',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    67,
    '2026-07-27 14:26:11.650811+00',
    '2026-07-27 12:24:48.293427+00',
    '2026-07-27 14:26:11.650811+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('cfb8bbe1-04ad-56a9-a5a6-b198d668db8b', 'Siva Nursing Home - Jolarpet, Tirupathur', 'siva-nursing-home-jolarpet-tirupathur-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:29:29.314705+00', '2026-07-27 14:26:17.057029+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'c8beaa92-3bb4-5eba-9445-380b933349f0',
    'cfb8bbe1-04ad-56a9-a5a6-b198d668db8b',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'siva-nursing-home-jolarpet-tirupathur',
    'Siva Nursing Home - Jolarpet, Tirupathur',
    'Healthcare Center, Inpatient Care & Diagnostic Services in Kuppam',
    '',
    'VKS Mani Street, Edaiyampatti, Jolarpet, Tamil Nadu 635851',
    'VKS Mani Street',
    'Kuppam',
    '4179241243',
    '4179241243',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    36,
    '2026-07-27 14:26:17.057029+00',
    '2026-07-27 12:29:29.314705+00',
    '2026-07-27 14:26:17.057029+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('b506a814-a2dd-5ab7-a07f-f9764b6bbc69', 'Green Dot', 'green-dot-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:29:42.239228+00', '2026-07-27 14:26:22.863453+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '699a115d-5fbe-52a6-a113-d54d2aa9363b',
    'b506a814-a2dd-5ab7-a07f-f9764b6bbc69',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'green-dot',
    'Green Dot',
    'Healthcare Center, Inpatient Care & Diagnostic Services in Kuppam',
    '',
    'Green Dot, Musque Street, Ponneri, Tamil Nadu 635851',
    'Green Dot',
    'Kuppam',
    '9442315685',
    '9442315685',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    63,
    '2026-07-27 14:26:22.863453+00',
    '2026-07-27 12:29:42.239228+00',
    '2026-07-27 14:26:22.863453+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('e1497091-0fcd-5147-b419-5b6bf3772f03', 'SHAHS'' CHILDREN''S HOSPITAL', 'shahs-childrens-hospital-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:29:22.008859+00', '2026-07-27 14:26:13.426612+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '4c923bfe-2b98-5200-a8f2-f0438698b59e',
    'e1497091-0fcd-5147-b419-5b6bf3772f03',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'shahs-childrens-hospital',
    'SHAHS'' CHILDREN''S HOSPITAL',
    'Healthcare Center, Inpatient Care & Diagnostic Services in Kuppam',
    '',
    '#17-35,FIRST FLOOR, MAREMMA GUDI STREET, Palamaner',
    'FIRST FLOOR',
    'Kuppam',
    '9505467388',
    '9505467388',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    42,
    '2026-07-27 14:26:13.426612+00',
    '2026-07-27 12:29:22.008859+00',
    '2026-07-27 14:26:13.426612+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('50176040-940a-5dea-a0ac-e3cc878d3509', 'Icon hospital', 'icon-hospital-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:29:27.827336+00', '2026-07-27 14:26:16.3318+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '05872bfe-f068-5c25-8e2a-8db77f0586bf',
    '50176040-940a-5dea-a0ac-e3cc878d3509',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'icon-hospital',
    'Icon hospital',
    'Healthcare Center, Inpatient Care & Diagnostic Services in Kuppam',
    '',
    'Kuna building, 13-79/1, Madanapalli Rd, Palamaner',
    'Kuna building',
    'Kuppam',
    '9949403415',
    '9949403415',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    47,
    '2026-07-27 14:26:16.3318+00',
    '2026-07-27 12:29:27.827336+00',
    '2026-07-27 14:26:16.3318+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('c69c8324-ef56-56b7-92a5-8f571d1f21cd', 'MEDICARE CHILDREN''S AND GENERAL HOSPITAL', 'medicare-childrens-and-general-hospital-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:24:46.073952+00', '2026-07-27 14:26:10.199401+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '3dd37ec7-0a34-5398-b322-8e23cb50ac6a',
    'c69c8324-ef56-56b7-92a5-8f571d1f21cd',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'medicare-childrens-and-general-hospital',
    'MEDICARE CHILDREN''S AND GENERAL HOSPITAL',
    'Healthcare Center, Inpatient Care & Diagnostic Services in Kuppam',
    '',
    '11-462 MBT ROAD, RANGABABU, CIRCLE, Old Pet, Palamaner',
    '11-462 MBT ROAD',
    'Kuppam',
    '9030546687',
    '9030546687',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    40,
    '2026-07-27 14:26:10.199401+00',
    '2026-07-27 12:24:46.073952+00',
    '2026-07-27 14:26:10.199401+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('7a4b7f44-7896-5d3b-ba7e-9bc3052414b7', 'SA Self Biz', 'sa-self-biz-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-08-31 07:25:17.106446+00', '2026-08-31 07:25:17.106446+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'dc300e6a-8e34-501d-b9ef-872e395b0eb8',
    '7a4b7f44-7896-5d3b-ba7e-9bc3052414b7',
    '44444444-4444-4444-4444-444444444406',
    'business',
    'sa-self-biz',
    'SA Self Biz',
    'Verified Commercial Storefront & Customer Services in Kuppam',
    '',
    '2 Self Rd',
    '2 Self Rd',
    'Kuppam',
    '9998887777',
    '9998887777',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'not_verified',
    'approved',
    0,
    '2026-08-31 07:25:17.106446+00',
    '2026-08-31 07:25:17.106446+00',
    '2026-08-31 07:25:17.106446+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('3f152dcc-51d9-58c1-b99e-a776d8d9243b', 'Rajesh Rj zphs school', 'rajesh-rj-zphs-school-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:45.802242+00', '2026-07-27 15:45:32.238789+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '804769fb-1930-5304-aef3-32596d1ed8c6',
    '3f152dcc-51d9-58c1-b99e-a776d8d9243b',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'rajesh-rj-zphs-school',
    'Rajesh Rj zphs school',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    'Ramakuppam, Andhra Pradesh 517401',
    'Ramakuppam',
    'Kuppam',
    '7893933397',
    '7893933397',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    35,
    '2026-07-27 15:45:32.238789+00',
    '2026-07-27 14:22:45.802242+00',
    '2026-07-27 15:45:32.238789+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('122abaf5-e8f6-535f-b435-dfc818dcdc9f', 'SAAIRAM MULTI SPECIALITY HOSPITAL', 'saairam-multi-speciality-hospital-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:24:05.978523+00', '2026-07-27 14:26:08.739915+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'db58934c-e9e4-5f80-b288-8be84ebbb4d8',
    '122abaf5-e8f6-535f-b435-dfc818dcdc9f',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'saairam-multi-speciality-hospital',
    'SAAIRAM MULTI SPECIALITY HOSPITAL',
    'Healthcare Center, Inpatient Care & Diagnostic Services in Kuppam',
    '',
    'Door no. 13-209/3, lingayath street, opp. Rangamahal, kothapeta, Palamaner',
    'Door no. 13-209/3',
    'Kuppam',
    '8297769979',
    '8297769979',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    43,
    '2026-07-27 14:26:08.739915+00',
    '2026-07-27 12:24:05.978523+00',
    '2026-07-27 14:26:08.739915+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('8fe7b550-4c36-58e7-b504-aac0d47e2af8', 'Mettur Transports Parcel (mSs bus) - Kuppam', 'mettur-transports-parcel-mss-bus-kuppam-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-29 12:30:24.468942+00', '2026-07-29 12:36:10.581295+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'cf7b01da-564e-52e4-aae6-af06773b27a5',
    '8fe7b550-4c36-58e7-b504-aac0d47e2af8',
    '44444444-4444-4444-4444-444444444416',
    'business',
    'mettur-transports-parcel-mss-bus-kuppam',
    'Mettur Transports Parcel (mSs bus) - Kuppam',
    'Local Mobility, Transit & Commute Support in Kuppam',
    '',
    '2/600, New Bye pass road, Chittor circle, Old Palamaner - Krishnagiri Rd, Kuppam, Andhra Pradesh 517425',
    '2/600',
    'Kuppam',
    '6380754841',
    '6380754841',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    71,
    '2026-07-29 12:36:10.581295+00',
    '2026-07-29 12:30:24.468942+00',
    '2026-07-29 12:36:10.581295+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('eea19420-892b-5321-8d70-ef42fdac3a73', 'Akshara EM School Ramakuppam', 'akshara-em-school-ramakuppam-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:41.382158+00', '2026-07-29 05:18:34.780955+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '4872c8fe-fdd7-5729-9390-24b739578123',
    'eea19420-892b-5321-8d70-ef42fdac3a73',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'akshara-em-school-ramakuppam',
    'Akshara EM School Ramakuppam',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    'Post office street, Ramakuppam, Andhra Pradesh 517401',
    'Post office street',
    'Kuppam',
    '9666233095',
    '9666233095',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    72,
    '2026-07-29 05:18:34.780955+00',
    '2026-07-27 14:22:41.382158+00',
    '2026-07-29 05:18:34.780955+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('e08fbc69-64cd-5a5c-8ad6-14708cfe56a5', 'Kuppam Degree College', 'kuppam-degree-college-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:32.571959+00', '2026-07-27 15:45:23.760879+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '7ed9565c-5d02-502b-aed5-283d6cd36663',
    'e08fbc69-64cd-5a5c-8ad6-14708cfe56a5',
    '44444444-4444-4444-4444-444444444401',
    'education',
    'kuppam-degree-college',
    'Kuppam Degree College',
    'Premier College & Academic Learning Campus in Kuppam',
    '',
    'S.No.:45/2A,Pedda Bangarunatham, Kuppam, Andhra Pradesh 517425',
    'S.No.:45/2A',
    'Kuppam',
    '9948171779',
    '9948171779',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    40,
    '2026-07-27 15:45:23.760879+00',
    '2026-07-27 14:22:32.571959+00',
    '2026-07-27 15:45:23.760879+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('e9d692d6-5b75-5ecd-976d-9d697a5469b1', 'BMS MEMORIAL CLINIC ,KUPPAM', 'bms-memorial-clinic-kuppam-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:24:24.174592+00', '2026-07-27 14:26:28.683186+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '7f569bbb-16de-52fa-bbec-1fc259c28c5d',
    'e9d692d6-5b75-5ecd-976d-9d697a5469b1',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'bms-memorial-clinic-kuppam',
    'BMS MEMORIAL CLINIC ,KUPPAM',
    'Healthcare Center, Inpatient Care & Diagnostic Services in Kuppam',
    '',
    'Netaji Road Opposite to Gandhi statue Kuppam mandal, Andhra Pradesh 517425',
    'Netaji Road Opposite to Gandhi statue Kuppam mandal',
    'Kuppam',
    '9966662322',
    '9966662322',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    78,
    '2026-07-27 14:26:28.683186+00',
    '2026-07-27 14:24:24.174592+00',
    '2026-07-27 14:26:28.683186+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('36108afd-646a-5c9d-973f-c4cbd1762724', 'Hawkings International school', 'hawkings-international-school-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:28.066032+00', '2026-07-27 15:45:21.561863+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '2ec4c7ea-1fe8-55ef-9c70-02ac7beaeaf0',
    '36108afd-646a-5c9d-973f-c4cbd1762724',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'hawkings-international-school',
    'Hawkings International school',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    'P8QF+F8J, Kuppam, Palarlapalle, Andhra Pradesh 517425',
    'P8QF+F8J',
    'Kuppam',
    '9952321179',
    '9952321179',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    38,
    '2026-07-27 15:45:21.561863+00',
    '2026-07-27 14:22:28.066032+00',
    '2026-07-27 15:45:21.561863+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('ada01efa-99ad-5735-a81e-171547f6692d', 'Kuppam College of Nursing', 'kuppam-college-of-nursing-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:40.27921+00', '2026-07-27 15:45:28.579325+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '2b7ee3dd-d82c-504d-b000-363f453d3062',
    'ada01efa-99ad-5735-a81e-171547f6692d',
    '44444444-4444-4444-4444-444444444401',
    'education',
    'kuppam-college-of-nursing',
    'Kuppam College of Nursing',
    'Premier College & Academic Learning Campus in Kuppam',
    '',
    'P9F5+2FP, Natrampalli -Tirupattur Kuppam Rd, Bevanapalle, Ekarlapalle, Andhra Pradesh 517425',
    'P9F5+2FP',
    'Kuppam',
    '9632773870',
    '9632773870',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    39,
    '2026-07-27 15:45:28.579325+00',
    '2026-07-27 14:22:40.27921+00',
    '2026-07-27 15:45:28.579325+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('4293be63-632b-526d-acf6-cedc109b730c', 'APSWREIS SCHOOL VIJALAPURAM', 'apswreis-school-vijalapuram-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:47.235331+00', '2026-07-27 15:45:32.972601+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '223f76a0-ea97-55fe-90e7-e97b7e6d82db',
    '4293be63-632b-526d-acf6-cedc109b730c',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'apswreis-school-vijalapuram',
    'APSWREIS SCHOOL VIJALAPURAM',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    'VFXM+6FW, Vijalapuram Rd, Ramakuppam, Andhra Pradesh 517401',
    'VFXM+6FW',
    'Kuppam',
    '7893561116',
    '7893561116',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    56,
    '2026-07-27 15:45:32.972601+00',
    '2026-07-27 14:22:47.235331+00',
    '2026-07-27 15:45:32.972601+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('2841adb5-9b56-5430-9256-79513fd9eb1c', 'Dr. Bhargav hospital and Bhargav Medicals', 'dr-bhargav-hospital-and-bhargav-medicals-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:24:25.267493+00', '2026-07-29 05:06:18.694588+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '04286ec5-a039-51a1-9cdc-b6d14b9906e9',
    '2841adb5-9b56-5430-9256-79513fd9eb1c',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'dr-bhargav-hospital-and-bhargav-medicals',
    'Dr. Bhargav hospital and Bhargav Medicals',
    'Healthcare Center, Inpatient Care & Diagnostic Services in Kuppam',
    '',
    'WF3P+G45, SH 508, Ramakuppam, Andhra Pradesh 517401',
    'WF3P+G45',
    'Kuppam',
    '8790796016',
    '8790796016',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    71,
    '2026-07-29 05:06:18.694588+00',
    '2026-07-27 14:24:25.267493+00',
    '2026-07-29 05:06:18.694588+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('17ea91e2-15f5-5483-9e49-1351a6133435', 'Sathya Vani English Medium High School', 'sathya-vani-english-medium-high-school-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:44.695435+00', '2026-07-27 15:45:31.508065+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'c7df3257-594d-5985-9b9f-ae9935e3c211',
    '17ea91e2-15f5-5483-9e49-1351a6133435',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'sathya-vani-english-medium-high-school',
    'Sathya Vani English Medium High School',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    'Mittapalli Cheruvu Katta Rd, Vijalapuram, Ramakuppam, Andhra Pradesh 517401',
    'Mittapalli Cheruvu Katta Rd',
    'Kuppam',
    '7569991248',
    '7569991248',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    38,
    '2026-07-27 15:45:31.508065+00',
    '2026-07-27 14:22:44.695435+00',
    '2026-07-27 15:45:31.508065+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('71531f26-2321-5d4b-9d8b-5b8af6948f5a', 'Sree Saradha English Medium High School', 'sree-saradha-english-medium-high-school-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:42.486033+00', '2026-07-27 15:45:30.04647+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'f0306c8e-41bc-5dfe-bb6a-537c23777b5f',
    '71531f26-2321-5d4b-9d8b-5b8af6948f5a',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'sree-saradha-english-medium-high-school',
    'Sree Saradha English Medium High School',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    'Vijalapuram, Ramakuppam Mandal, Chittoor, Ramakuppam, Andhra Pradesh 517425',
    'Vijalapuram',
    'Kuppam',
    '9912809646',
    '9912809646',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    38,
    '2026-07-27 15:45:30.04647+00',
    '2026-07-27 14:22:42.486033+00',
    '2026-07-27 15:45:30.04647+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('a69070ec-2c56-57a1-a730-f7e41d5bc68f', 'MITHRAN MEDICALS', 'mithran-medicals-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:29:37.954338+00', '2026-07-27 14:26:20.685184+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '28fc1968-3988-5447-a40d-a161cb58a413',
    'a69070ec-2c56-57a1-a730-f7e41d5bc68f',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'mithran-medicals',
    'MITHRAN MEDICALS',
    'Licensed Community Pharmacy & Essential Medical Supplies in Kuppam',
    '',
    'HGJQ+7JQ, Jolarpet-Natrampalli Rd, Katheri, Athurkuppam, Tamil Nadu 635851',
    'HGJQ+7JQ',
    'Kuppam',
    '8344026547',
    '8344026547',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    57,
    '2026-07-27 14:26:20.685184+00',
    '2026-07-27 12:29:37.954338+00',
    '2026-07-27 14:26:20.685184+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('368fe976-880a-5d28-8bf3-46542d61b43c', 'Kuppam Engineering College', 'kuppam-engineering-college-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:29.499556+00', '2026-07-27 15:45:22.290813+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '0a0f0937-8a80-5e67-95bf-4f40bbfd84a2',
    '368fe976-880a-5d28-8bf3-46542d61b43c',
    '44444444-4444-4444-4444-444444444401',
    'education',
    'kuppam-engineering-college',
    'Kuppam Engineering College',
    'Premier College & Academic Learning Campus in Kuppam',
    '',
    'KES Nagar, Kuppam, Pedda Bangarunatham, Andhra Pradesh 517425',
    'KES Nagar',
    'Kuppam',
    '8570256966',
    '8570256966',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    39,
    '2026-07-27 15:45:22.290813+00',
    '2026-07-27 14:22:29.499556+00',
    '2026-07-27 15:45:22.290813+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('f51ddcb4-9e94-5b57-8f14-d673edec3fc3', 'Vikas degree college', 'vikas-degree-college-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:31.138095+00', '2026-07-27 15:45:23.022483+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '7fa2ec4e-f7c3-5533-993f-46178c09d092',
    'f51ddcb4-9e94-5b57-8f14-d673edec3fc3',
    '44444444-4444-4444-4444-444444444401',
    'education',
    'vikas-degree-college',
    'Vikas degree college',
    'Premier College & Academic Learning Campus in Kuppam',
    '',
    'P8VV+CVJ, Kuppam, Andhra Pradesh 517425',
    'P8VV+CVJ',
    'Kuppam',
    '9000949454',
    '9000949454',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    43,
    '2026-07-27 15:45:23.022483+00',
    '2026-07-27 14:22:31.138095+00',
    '2026-07-27 15:45:23.022483+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('f3c647ac-3e59-598f-b091-d1300c711a41', 'RR Speciality Hospital', 'rr-speciality-hospital-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:24:21.991599+00', '2026-07-27 14:26:27.229074+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'b8c49138-ccbf-50fa-be65-4dee0f1bb0b6',
    'f3c647ac-3e59-598f-b091-d1300c711a41',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'rr-speciality-hospital',
    'RR Speciality Hospital',
    'Healthcare Center, Inpatient Care & Diagnostic Services in Kuppam',
    '',
    '13-373, Palace Rd, RS Pet, Kuppam, Bairaganipalle (Rural), Andhra Pradesh 517425',
    'Palace Rd',
    'Kuppam',
    '8498801805',
    '8498801805',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    44,
    '2026-07-27 14:26:27.229074+00',
    '2026-07-27 14:24:21.991599+00',
    '2026-07-27 14:26:27.229074+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('75d31e8b-8444-534d-ba6b-0dd20fdf0d54', 'Pragna Innovative School', 'pragna-innovative-school-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:03.821268+00', '2026-07-27 15:45:18.633205+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'd65ccbf6-2517-5959-803e-9f93e3d6cb48',
    '75d31e8b-8444-534d-ba6b-0dd20fdf0d54',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'pragna-innovative-school',
    'Pragna Innovative School',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    'Palamaner - Krishnagiri Rd, Chinnakurbalapalle Rural, Kuppam, Andhra Pradesh 517425',
    'Palamaner - Krishnagiri Rd',
    'Kuppam',
    '8712248058',
    '8712248058',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    36,
    '2026-07-27 15:45:18.633205+00',
    '2026-07-27 14:22:03.821268+00',
    '2026-07-27 15:45:18.633205+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('35288464-5ad4-5930-931e-88c749f81aa7', 'APSWREIS SCHOOL RAMAKUPPAM', 'apswreis-school-ramakuppam-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:43.590911+00', '2026-07-27 15:45:30.777075+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '58e48429-72e6-5f9b-a914-a311352e866e',
    '35288464-5ad4-5930-931e-88c749f81aa7',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'apswreis-school-ramakuppam',
    'APSWREIS SCHOOL RAMAKUPPAM',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    'WF2P+4P4, Vijalapuram, Ramakuppam, Andhra Pradesh 517401',
    'WF2P+4P4',
    'Kuppam',
    '9704550107',
    '9704550107',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    62,
    '2026-07-27 15:45:30.777075+00',
    '2026-07-27 14:22:43.590911+00',
    '2026-07-27 15:45:30.777075+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('bb530810-71db-59e0-8def-12903796e4eb', 'DHORAIDD', 'dhoraidd-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:39.177986+00', '2026-07-27 15:45:27.842116+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '4229b273-2faa-5c0b-a46e-b595c766f48d',
    'bb530810-71db-59e0-8def-12903796e4eb',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'dhoraidd',
    'DHORAIDD',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    'Q986+X9R, Kuppam, Chammaguttapalle, Andhra Pradesh 517425',
    'Q986+X9R',
    'Kuppam',
    '8790802057',
    '8790802057',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    50,
    '2026-07-27 15:45:27.842116+00',
    '2026-07-27 14:22:39.177986+00',
    '2026-07-27 15:45:27.842116+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('f66e3965-4836-5787-a7ab-a6d4bad2e1cb', 'Swastha Multispeciality Hospital', 'swastha-multispeciality-hospital-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:29:30.674151+00', '2026-07-27 14:26:17.782439+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'a38bc0b3-2eea-566a-a25f-a8f11e110498',
    'f66e3965-4836-5787-a7ab-a6d4bad2e1cb',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'swastha-multispeciality-hospital',
    'Swastha Multispeciality Hospital',
    'Healthcare Center, Inpatient Care & Diagnostic Services in Kuppam',
    '',
    'NO .17/19, MUNISAMY GOUNDER STREET, METTUCHAKKARAKUPPAM, Jolarpet, Tamil Nadu 635851',
    'NO .17/19',
    'Kuppam',
    '9943233466',
    '9943233466',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    40,
    '2026-07-27 14:26:17.782439+00',
    '2026-07-27 12:29:30.674151+00',
    '2026-07-27 14:26:17.782439+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('88d7b511-9327-5835-a123-f95235b3a949', 'Sai Mohan healthcare and diagnostics', 'sai-mohan-healthcare-and-diagnostics-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:24:23.081701+00', '2026-07-27 14:26:27.956523+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '69cf249f-7086-50ee-bf6f-c8c3ef429e78',
    '88d7b511-9327-5835-a123-f95235b3a949',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'sai-mohan-healthcare-and-diagnostics',
    'Sai Mohan healthcare and diagnostics',
    'Healthcare Center, Inpatient Care & Diagnostic Services in Kuppam',
    '',
    'Mohan circle, The HP Rd, junction, Kuppam, Bairaganipalle (Rural), Andhra Pradesh 517425',
    'Mohan circle',
    'Kuppam',
    '9347776263',
    '9347776263',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    39,
    '2026-07-27 14:26:27.956523+00',
    '2026-07-27 14:24:23.081701+00',
    '2026-07-27 14:26:27.956523+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('22175e5b-3e91-5710-baa7-c49991989bf4', 'Audit Test Biz', 'audit-test-biz-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-08-31 07:25:08.761376+00', '2026-08-31 07:25:51.941953+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'ca21a65f-ab9d-55b5-ba13-464df10c8ebf',
    '22175e5b-3e91-5710-baa7-c49991989bf4',
    '44444444-4444-4444-4444-444444444406',
    'business',
    'audit-test-biz',
    'Audit Test Biz',
    'Verified Commercial Storefront & Customer Services in Kuppam',
    '',
    '1 Audit Rd',
    '1 Audit Rd',
    'Kuppam',
    '9998887776',
    '9998887776',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    49,
    '2026-08-31 07:25:51.941953+00',
    '2026-08-31 07:25:08.761376+00',
    '2026-08-31 07:25:51.941953+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('c3db7bd3-a441-50bf-9dad-f5d13b4b5fe6', 'Kuppam Junior College', 'kuppam-junior-college-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:36.792137+00', '2026-07-27 15:45:26.211108+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '5e43b639-fc97-5a69-abdb-74c7012f8a6c',
    'c3db7bd3-a441-50bf-9dad-f5d13b4b5fe6',
    '44444444-4444-4444-4444-444444444401',
    'education',
    'kuppam-junior-college',
    'Kuppam Junior College',
    'Premier College & Academic Learning Campus in Kuppam',
    '',
    'P8XR+4XH, DK Palli Highway Rd, RS Pet, Bairaganipalle (Rural), Andhra Pradesh 517425',
    'P8XR+4XH',
    'Kuppam',
    '8570255040',
    '8570255040',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    37,
    '2026-07-27 15:45:26.211108+00',
    '2026-07-27 14:22:36.792137+00',
    '2026-07-27 15:45:26.211108+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('040a070c-faa8-5621-8227-90b4ed18d79b', 'Saraswathi Meternity Nursing Home ,Thasidar Street Palamaner', 'saraswathi-meternity-nursing-home-thasidar-street-palamaner-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:29:23.429203+00', '2026-07-27 14:26:14.150473+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'c10da24d-174b-52e3-8328-e262b5261903',
    '040a070c-faa8-5621-8227-90b4ed18d79b',
    '44444444-4444-4444-4444-444444444414',
    'business',
    'saraswathi-meternity-nursing-home-thasidar-street-palamaner',
    'Saraswathi Meternity Nursing Home ,Thasidar Street Palamaner',
    'Healthcare Center, Inpatient Care & Diagnostic Services in Kuppam',
    '',
    '6P4W+5F4, Bazar St, Palamaner, Andhra Pradesh 517408',
    '6P4W+5F4',
    'Kuppam',
    '8579252711',
    '8579252711',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    38,
    '2026-07-27 14:26:14.150473+00',
    '2026-07-27 12:29:23.429203+00',
    '2026-07-27 14:26:14.150473+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('383d05d4-1196-504c-a62f-5fc44f2ec814', 'Green Valley Public School, KUPPAM', 'green-valley-public-school-kuppam-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:48.547342+00', '2026-07-27 15:45:33.709125+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '5a871392-4c4f-5a2e-b905-4edf42e29fec',
    '383d05d4-1196-504c-a62f-5fc44f2ec814',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'green-valley-public-school-kuppam',
    'Green Valley Public School, KUPPAM',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    '1 Green Valley Rd , KGF, Ramakuppam Main Road, Ramakuppam (M, Ramakuppam, Andhra Pradesh 517401',
    '1 Green Valley Rd',
    'Kuppam',
    '9391872067',
    '9391872067',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    41,
    '2026-07-27 15:45:33.709125+00',
    '2026-07-27 14:22:48.547342+00',
    '2026-07-27 15:45:33.709125+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('af2e7e55-e0df-5087-96a5-006319595729', 'Govt.higher sec.school', 'govthigher-secschool-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:29:47.890071+00', '2026-07-27 14:26:25.77998+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'bdc95fb3-fbe2-5c87-bae1-3a48f965299d',
    'af2e7e55-e0df-5087-96a5-006319595729',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'govthigher-secschool',
    'Govt.higher sec.school',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    'HH9F+JF3, Jolarpet, Tamil Nadu 635851',
    'HH9F+JF3',
    'Kuppam',
    '7010331142',
    '7010331142',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    40,
    '2026-07-27 14:26:25.77998+00',
    '2026-07-27 12:29:47.890071+00',
    '2026-07-27 14:26:25.77998+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('d93a0e93-d435-51b5-9938-d7fd67874c69', 'Cross City Test Biz', 'cross-city-test-biz-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-08-31 10:02:03.970157+00', '2026-08-31 10:03:26.333569+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '014616a5-252e-524c-8cc0-3d5bfd54c7f5',
    'd93a0e93-d435-51b5-9938-d7fd67874c69',
    '44444444-4444-4444-4444-444444444406',
    'business',
    'cross-city-test-biz',
    'Cross City Test Biz',
    'Verified Commercial Storefront & Customer Services in Kuppam',
    '',
    '1 Real Rd',
    '1 Real Rd',
    'Kuppam',
    '9990002222',
    '9990002222',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    24,
    '2026-08-31 10:03:26.333569+00',
    '2026-08-31 10:02:03.970157+00',
    '2026-08-31 10:03:26.333569+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('efcb71f8-268c-547c-8db2-7c7cdecb1bb4', 'Universal Matric.Hr.Sec.School,Jolarpettai', 'universal-matrichrsecschooljolarpettai-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:29:43.674921+00', '2026-07-27 14:26:23.586174+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'd5e58834-0ae3-53f5-8b6c-268aa43ae6f9',
    'efcb71f8-268c-547c-8db2-7c7cdecb1bb4',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'universal-matrichrsecschooljolarpettai',
    'Universal Matric.Hr.Sec.School,Jolarpettai',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    'Jolarpet, Tamil Nadu 635851',
    'Jolarpet',
    'Kuppam',
    '9944308354',
    '9944308354',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    37,
    '2026-07-27 14:26:23.586174+00',
    '2026-07-27 12:29:43.674921+00',
    '2026-07-27 14:26:23.586174+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('c4887755-880f-5f91-b4c6-009f661b7d7b', 'GREEN VALLEY PUBLIC SCHOOL', 'green-valley-public-school-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:29:46.459783+00', '2026-07-27 14:26:25.055611+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '4a5982f9-8ac9-56a8-8eda-043755a76627',
    'c4887755-880f-5f91-b4c6-009f661b7d7b',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'green-valley-public-school',
    'GREEN VALLEY PUBLIC SCHOOL',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    'Somanayakkanpatti, junction, Village,jangalapuram, Jolarpet, Tamil Nadu 635851',
    'Somanayakkanpatti',
    'Kuppam',
    '4179242342',
    '4179242342',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    39,
    '2026-07-27 14:26:25.055611+00',
    '2026-07-27 12:29:46.459783+00',
    '2026-07-27 14:26:25.055611+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('fb930e00-0683-5ace-99b6-51e74be737f4', 'Allithinn Multi Cuisine Restuarant', 'allithinn-multi-cuisine-restuarant-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:07:12.05987+00', '2026-07-29 06:37:20.06361+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '660ed59e-9b37-5cf7-8bba-c2e7f44acd11',
    'fb930e00-0683-5ace-99b6-51e74be737f4',
    '44444444-4444-4444-4444-444444444415',
    'business',
    'allithinn-multi-cuisine-restuarant',
    'Allithinn Multi Cuisine Restuarant',
    'Regional Dining, Traditional Cuisine & Food Services in Kuppam',
    'Website: https://www.instagram.com/allithinnrestaurant?igsh=MWQ2dTNpc2N4eHp6aA== | Google Maps: https://maps.app.goo.gl/KLN3U5owrwMzB54d9',
    'PES MEDICAL COLLEGE, Kuppam, Beggilipalle, Andhra Pradesh 517425',
    'PES MEDICAL COLLEGE',
    'Kuppam',
    '9603768722',
    '9603768722',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    70,
    '2026-07-29 06:37:20.06361+00',
    '2026-07-27 12:07:12.05987+00',
    '2026-07-29 06:37:20.06361+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('8900ed2d-6893-5f89-a799-579984cd7a77', 'IRM Degree College', 'irm-degree-college-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:49.8046+00', '2026-07-27 15:45:34.445453+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'aee63a1a-77a6-5ce3-9486-d202fef186e7',
    '8900ed2d-6893-5f89-a799-579984cd7a77',
    '44444444-4444-4444-4444-444444444401',
    'education',
    'irm-degree-college',
    'IRM Degree College',
    'Premier College & Academic Learning Campus in Kuppam',
    '',
    'Q84R+V34, Bairaganipalle (Rural), Andhra Pradesh 517425',
    'Q84R+V34',
    'Kuppam',
    '9185702559',
    '9185702559',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    36,
    '2026-07-27 15:45:34.445453+00',
    '2026-07-27 14:22:49.8046+00',
    '2026-07-27 15:45:34.445453+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('fbbd9181-1807-5562-903d-69fe6f52b803', 'kidzee pre school Jolarpet', 'kidzee-pre-school-jolarpet-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 12:29:45.075794+00', '2026-07-27 14:26:24.327643+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'bf60d693-4b73-5c08-a1ed-6274f8bb5d36',
    'fbbd9181-1807-5562-903d-69fe6f52b803',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'kidzee-pre-school-jolarpet',
    'kidzee pre school Jolarpet',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    'junction bus stand, Jolarpet, Tamil Nadu 635851',
    'junction bus stand',
    'Kuppam',
    '9994128801',
    '9994128801',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    39,
    '2026-07-27 14:26:24.327643+00',
    '2026-07-27 12:29:45.075794+00',
    '2026-07-27 14:26:24.327643+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('81a81dc9-4d8e-5604-9c33-220f5080bd18', 'PES Institute of Medical Sciences and Research (PESIMSR)', 'pes-institute-of-medical-sciences-and-research-pesimsr-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:35.35909+00', '2026-07-27 15:45:25.222666+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '2b246414-5c65-5bd5-bdbf-038c1fa0a0b9',
    '81a81dc9-4d8e-5604-9c33-220f5080bd18',
    '44444444-4444-4444-4444-444444444401',
    'education',
    'pes-institute-of-medical-sciences-and-research-pesimsr',
    'PES Institute of Medical Sciences and Research (PESIMSR)',
    'Premier College & Academic Learning Campus in Kuppam',
    '',
    'NH- 219, Kuppam, Nalagampalle, Andhra Pradesh 517425',
    'NH- 219',
    'Kuppam',
    '8010622622',
    '8010622622',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    34,
    '2026-07-27 15:45:25.222666+00',
    '2026-07-27 14:22:35.35909+00',
    '2026-07-27 15:45:25.222666+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('1803a660-f997-5c5b-9eb7-336cb45c12f2', 'Vikas Junior College', 'vikas-junior-college-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:51.353339+00', '2026-07-27 15:45:35.553282+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '90217878-2b37-5368-b134-54b9da5869e6',
    '1803a660-f997-5c5b-9eb7-336cb45c12f2',
    '44444444-4444-4444-4444-444444444401',
    'education',
    'vikas-junior-college',
    'Vikas Junior College',
    'Premier College & Academic Learning Campus in Kuppam',
    '',
    'Q82Q+GGJ, Palace Extention,, N Palace Rd, Bairaganipalle (Rural), Andhra Pradesh 517425',
    'Q82Q+GGJ',
    'Kuppam',
    '8570255474',
    '8570255474',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    49,
    '2026-07-27 15:45:35.553282+00',
    '2026-07-27 14:22:51.353339+00',
    '2026-07-27 15:45:35.553282+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('8fe0bde6-bbb5-5298-96c2-acd1c3f871d5', 'AKR Express Parcel Service', 'akr-express-parcel-service-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-29 12:30:27.539674+00', '2026-07-29 12:36:12.621983+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '251f9d5b-fcff-5abf-90ee-646f077512ef',
    '8fe0bde6-bbb5-5298-96c2-acd1c3f871d5',
    '44444444-4444-4444-4444-444444444416',
    'business',
    'akr-express-parcel-service',
    'AKR Express Parcel Service',
    'Local Mobility, Transit & Commute Support in Kuppam',
    '',
    'Ward No.15, Raju Circle, Raju Nagar Colony Krishnagiri Bye Pass Road, Dt, Kuppam, Andhra Pradesh 517425',
    'Ward No.15',
    'Kuppam',
    '9150059069',
    '9150059069',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    72,
    '2026-07-29 12:36:12.621983+00',
    '2026-07-29 12:30:27.539674+00',
    '2026-07-29 12:36:12.621983+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('ac3643be-5b4f-555c-a8db-d30d575b255f', 'Narayana EM School - Kuppam', 'narayana-em-school-kuppam-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:21.102194+00', '2026-07-27 15:45:17.897736+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'e49d19ae-02ed-56f8-aa17-07bd99caeda9',
    'ac3643be-5b4f-555c-a8db-d30d575b255f',
    '44444444-4444-4444-4444-444444444403',
    'education',
    'narayana-em-school-kuppam',
    'Narayana EM School - Kuppam',
    'Premier School & Academic Learning Campus in Kuppam',
    '',
    'Kuppam Gudipalli Rd, Paibata, Kuppam, Bairaganipalle (Rural), Andhra Pradesh 517425',
    'Kuppam Gudipalli Rd',
    'Kuppam',
    '8179880268',
    '8179880268',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    36,
    '2026-07-27 15:45:17.897736+00',
    '2026-07-27 14:22:21.102194+00',
    '2026-07-27 15:45:17.897736+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('615eb56f-24c8-569d-a5f4-98b6a3d3e0d6', 'Dravida University', 'dravida-university-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:33.903462+00', '2026-07-27 15:45:24.493646+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    '075def19-4d00-59fe-8c07-18be4e362e3d',
    '615eb56f-24c8-569d-a5f4-98b6a3d3e0d6',
    '44444444-4444-4444-4444-444444444401',
    'education',
    'dravida-university',
    'Dravida University',
    'Premier College & Academic Learning Campus in Kuppam',
    '',
    'Q8W3+J59, Dravidian University Rd, Srinivasa Vanam, Agaram, Andhra Pradesh 517426',
    'Q8W3+J59',
    'Kuppam',
    '8570278220',
    '8570278220',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    64,
    '2026-07-27 15:45:24.493646+00',
    '2026-07-27 14:22:33.903462+00',
    '2026-07-27 15:45:24.493646+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('26fc3c8e-f271-5176-8e94-c9c5a87cbdb2', 'Navata Road Transport', 'navata-road-transport-org', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-29 12:30:26.523899+00', '2026-07-29 12:36:11.943683+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'f2fbe744-2cd4-59d9-abab-9534f152dc6f',
    '26fc3c8e-f271-5176-8e94-c9c5a87cbdb2',
    '44444444-4444-4444-4444-444444444416',
    'business',
    'navata-road-transport',
    'Navata Road Transport',
    'Local Mobility, Transit & Commute Support in Kuppam',
    '',
    '14TH WARD, 14TH BLOCK, D.NO.14-525, N Palace Rd, Dollars Colony, EXTENSION, Kuppam, Bairaganipalle (Rural), Andhra Pradesh 517425',
    '14TH WARD',
    'Kuppam',
    '8666638787',
    '8666638787',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    71,
    '2026-07-29 12:36:11.943683+00',
    '2026-07-29 12:30:26.523899+00',
    '2026-07-29 12:36:11.943683+00'
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
    updated_at = EXCLUDED.updated_at;

INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
VALUES ('dba234b8-9d5d-5af7-ae3f-46d8679ebe0a', 'SVCR GOVERNMENT DEGREE COLLEGE', 'svcr-government-degree-college-org', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101', '2026-07-27 14:22:09.428811+00', '2026-07-27 15:45:37.052516+00')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    updated_at = EXCLUDED.updated_at;
INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, last_confirmed_at, created_at, updated_at
) VALUES (
    'f330ef97-aeca-5032-bcfb-25ecd3525cad',
    'dba234b8-9d5d-5af7-ae3f-46d8679ebe0a',
    '44444444-4444-4444-4444-444444444401',
    'education',
    'svcr-government-degree-college',
    'SVCR GOVERNMENT DEGREE COLLEGE',
    'Premier College & Academic Learning Campus in Kuppam',
    '',
    'Road, Gudiyatham Rd, Palamaner, Andhra Pradesh 517408',
    'Road',
    'Kuppam',
    '9849669923',
    '9849669923',
    '',
    '',
    '{"monday_friday": "09:00 - 18:00", "saturday": "09:00 - 14:00", "sunday": "Closed"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    39,
    '2026-07-27 15:45:37.052516+00',
    '2026-07-27 14:22:09.428811+00',
    '2026-07-27 15:45:37.052516+00'
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
    updated_at = EXCLUDED.updated_at;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. TOWN NEWS & COMMUNITY EVENTS
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO town_news (
    id, city, locality, item_type, title, slug, content, source_name, source_url,
    is_confirmed_fact, event_date, event_time, event_venue, moderation_status, created_at, updated_at
) VALUES (
    '4b98bfc1-0e27-5790-8cc5-61d8f98de28b',
    'Kuppam',
    'Town Center',
    'news',
    'Kuppam Local Updates',
    'kuppam-local-updates',
    'Important updates from Kuppam',
    'Kuppam News',
    '',
    true,
    NULL, NULL, NULL,
    'approved',
    '2026-07-29 12:38:26.906095+00',
    '2026-07-29 12:38:26.906105+00'
) ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    source_name = EXCLUDED.source_name,
    moderation_status = EXCLUDED.moderation_status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO town_news (
    id, city, locality, item_type, title, slug, content, source_name, source_url,
    is_confirmed_fact, event_date, event_time, event_venue, moderation_status, created_at, updated_at
) VALUES (
    '7f198715-a484-522c-9679-9c0b7e41541c',
    'Kuppam',
    'Town Center',
    'news',
    'Kuppam News Today',
    'kuppam-news-today',
    'Kuppam latest local news and updates',
    'Kuppam News',
    '',
    true,
    NULL, NULL, NULL,
    'approved',
    '2026-07-29 12:38:25.888377+00',
    '2026-07-29 12:38:25.888395+00'
) ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    source_name = EXCLUDED.source_name,
    moderation_status = EXCLUDED.moderation_status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO town_news (
    id, city, locality, item_type, title, slug, content, source_name, source_url,
    is_confirmed_fact, event_date, event_time, event_venue, moderation_status, created_at, updated_at
) VALUES (
    'a675fae1-e16c-5852-8c1a-fd1ee9d3363e',
    'Kuppam',
    'Town Center',
    'news',
    'kuppam breaqking news',
    'kuppam-breaqking-news',
    'Latest breaking news from Kuppam',
    'kuppam news',
    '',
    true,
    NULL, NULL, NULL,
    'submitted',
    '2026-07-29 12:38:27.920638+00',
    '2026-08-26 10:29:54.513301+00'
) ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    source_name = EXCLUDED.source_name,
    moderation_status = EXCLUDED.moderation_status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO town_news (
    id, city, locality, item_type, title, slug, content, source_name, source_url,
    is_confirmed_fact, event_date, event_time, event_venue, moderation_status, created_at, updated_at
) VALUES (
    '799a5ab2-6da2-5e3d-98e4-4c154c3dea49',
    'Kuppam',
    'Town Center',
    'news',
    'kuppam''s Young Minds Are Building Products, Not Just Dreams.',
    'kuppams-young-minds-are-building-products-not-just-dreams',
    'KUPPAM''S YOUNG MINDS ARE BUILDING PRODUCTS, NOT JUST DREAMS!\r\n\r\nA new chapter in Kuppam''s startup story is beginning. \r\n\r\nA group of young students from **Kuppam has stepped forward to launch a product-based startup**, turning their ideas, skills and passion into something real.\r\n\r\nThis isn''t just about starting a company.\r\n\r\nIt''s about **young people from Kuppam creating, innovating and building solutions for the future.** \r\n\r\nFrom classrooms to startups.\r\nFrom ideas to products.\r\nFrom Kuppam to the world. \r\n\r\n **The next generation of Kuppam entrepreneurs is here.**\r\n\r\n Kuppam, Andhra Pradesh\r\n **Source: Hello Kuppam**\r\n\r\n#HelloKuppam #Kuppam #KuppamYouth #KuppamStudents #StartupKuppam #YoungEntrepreneurs #StudentStartup #ProductBasedStartup #StartupIndia #Innovation #MadeInKuppam',
    'Hello Kuppam | Kuppam Youth & Startup Update',
    '',
    true,
    NULL, NULL, NULL,
    'approved',
    '2026-08-01 11:56:52.098383+00',
    '2026-08-18 10:26:24.786152+00'
) ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    source_name = EXCLUDED.source_name,
    moderation_status = EXCLUDED.moderation_status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO town_news (
    id, city, locality, item_type, title, slug, content, source_name, source_url,
    is_confirmed_fact, event_date, event_time, event_venue, moderation_status, created_at, updated_at
) VALUES (
    'b06a6b0b-2734-5d8d-b09f-a44a984ec50c',
    'Tirupati',
    'Cultural Grounds',
    'event',
    'Sri Tirupati Gangamma',
    'sri-tirupati-gangamma',
    'Community cultural festival and public gathering in Sri Tirupati Gangamma',
    'Community Cultural Board',
    '',
    true,
    '2026-11-12',
    '10:00 AM',
    '32, Nethaji Rd, opp. Sri Tirupati Gangamma Temple, Old Pet, Bairaganipalle (Rural), Andhra Pradesh 517425',
    'approved',
    '2026-07-29 09:53:24.021533+00',
    '2026-07-29 09:53:24.021545+00'
) ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    event_date = EXCLUDED.event_date,
    event_venue = EXCLUDED.event_venue,
    moderation_status = EXCLUDED.moderation_status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO town_news (
    id, city, locality, item_type, title, slug, content, source_name, source_url,
    is_confirmed_fact, event_date, event_time, event_venue, moderation_status, created_at, updated_at
) VALUES (
    '52077066-e831-5d0d-86e6-760b528d4a42',
    'Kuppam',
    'Cultural Grounds',
    'event',
    'Sri Peddapuli Gangamma',
    'sri-peddapuli-gangamma',
    'Community cultural festival and public gathering in Sri Peddapuli Gangamma',
    'Community Cultural Board',
    '',
    true,
    '2026-10-10',
    '10:00 AM',
    'P8VV+QMG, Kuppam, Andhra Pradesh 517425',
    'approved',
    '2026-07-29 09:53:22.79097+00',
    '2026-07-29 09:53:22.791018+00'
) ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    event_date = EXCLUDED.event_date,
    event_venue = EXCLUDED.event_venue,
    moderation_status = EXCLUDED.moderation_status,
    updated_at = EXCLUDED.updated_at;

-- ─────────────────────────────────────────────────────────────────────────
-- 3. STUDENT OPPORTUNITIES & ENTRY-LEVEL POSTINGS
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO student_opportunities (
    id, tenant_id, city, opportunity_type, title, slug, provider_name,
    description, eligibility, deadline, apply_url, contact_phone,
    discount_percent, stipend_amount, moderation_status, anti_scam_acknowledged,
    created_at, updated_at
) VALUES (
    '2e7ab255-a327-5d4a-932a-c7bd66123b76',
    NULL,
    'Kuppam',
    'internship',
    'Site Supervisor',
    'site-supervisor-kuppam-construction',
    'Kuppam Construction',
    'Supervise construction site activities',
    'Local candidates, college graduates, and final-year vocational students welcome. Never pay any fee.',
    NULL,
    '',
    '9876543219',
    NULL,
    '₹20,000–₹30,000',
    'approved',
    true,
    '2026-07-29 12:38:00.003093+00',
    '2026-07-29 12:38:00.003106+00'
) ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    provider_name = EXCLUDED.provider_name,
    description = EXCLUDED.description,
    stipend_amount = EXCLUDED.stipend_amount,
    contact_phone = EXCLUDED.contact_phone,
    anti_scam_acknowledged = EXCLUDED.anti_scam_acknowledged,
    moderation_status = EXCLUDED.moderation_status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO student_opportunities (
    id, tenant_id, city, opportunity_type, title, slug, provider_name,
    description, eligibility, deadline, apply_url, contact_phone,
    discount_percent, stipend_amount, moderation_status, anti_scam_acknowledged,
    created_at, updated_at
) VALUES (
    '44058f27-1abc-5ba7-8d89-95abd1ab33b3',
    NULL,
    'Kuppam',
    'internship',
    'Accountant',
    'accountant-kuppam-finance',
    'Kuppam  Finance',
    'Manage accounts and financial records',
    'Local candidates, college graduates, and final-year vocational students welcome. Never pay any fee.',
    NULL,
    '',
    '9876543216',
    NULL,
    '₹20,000–₹30,000',
    'approved',
    true,
    '2026-07-29 12:37:56.95788+00',
    '2026-07-29 12:37:56.957892+00'
) ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    provider_name = EXCLUDED.provider_name,
    description = EXCLUDED.description,
    stipend_amount = EXCLUDED.stipend_amount,
    contact_phone = EXCLUDED.contact_phone,
    anti_scam_acknowledged = EXCLUDED.anti_scam_acknowledged,
    moderation_status = EXCLUDED.moderation_status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO student_opportunities (
    id, tenant_id, city, opportunity_type, title, slug, provider_name,
    description, eligibility, deadline, apply_url, contact_phone,
    discount_percent, stipend_amount, moderation_status, anti_scam_acknowledged,
    created_at, updated_at
) VALUES (
    '7f924298-4f4d-5cf8-92c2-f10e181f70aa',
    NULL,
    'Kuppam',
    'internship',
    'Sales Executive',
    'sales-executive-kuppam-super-market',
    'Kuppam Super Market',
    'Assist customers and manage sales',
    'Local candidates, college graduates, and final-year vocational students welcome. Never pay any fee.',
    NULL,
    '',
    '9876543212',
    NULL,
    '₹12,000–₹18,000',
    'approved',
    true,
    '2026-07-29 12:37:52.899732+00',
    '2026-07-29 12:37:52.899742+00'
) ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    provider_name = EXCLUDED.provider_name,
    description = EXCLUDED.description,
    stipend_amount = EXCLUDED.stipend_amount,
    contact_phone = EXCLUDED.contact_phone,
    anti_scam_acknowledged = EXCLUDED.anti_scam_acknowledged,
    moderation_status = EXCLUDED.moderation_status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO student_opportunities (
    id, tenant_id, city, opportunity_type, title, slug, provider_name,
    description, eligibility, deadline, apply_url, contact_phone,
    discount_percent, stipend_amount, moderation_status, anti_scam_acknowledged,
    created_at, updated_at
) VALUES (
    '6968a8c7-dcea-5669-9f25-3e223b22c133',
    NULL,
    'Kuppam',
    'internship',
    'Tailor',
    'tailor-kuppam-garments',
    'Kuppam Garments',
    'Stitch and alter garments',
    'Local candidates, college graduates, and final-year vocational students welcome. Never pay any fee.',
    NULL,
    '',
    '9876543215',
    NULL,
    '₹12,000–₹20,000',
    'approved',
    true,
    '2026-07-29 12:37:55.943693+00',
    '2026-07-29 12:37:55.943703+00'
) ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    provider_name = EXCLUDED.provider_name,
    description = EXCLUDED.description,
    stipend_amount = EXCLUDED.stipend_amount,
    contact_phone = EXCLUDED.contact_phone,
    anti_scam_acknowledged = EXCLUDED.anti_scam_acknowledged,
    moderation_status = EXCLUDED.moderation_status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO student_opportunities (
    id, tenant_id, city, opportunity_type, title, slug, provider_name,
    description, eligibility, deadline, apply_url, contact_phone,
    discount_percent, stipend_amount, moderation_status, anti_scam_acknowledged,
    created_at, updated_at
) VALUES (
    '8b5a6b3d-563b-5275-9f18-a56015df050e',
    NULL,
    'Kuppam',
    'internship',
    'Teacher',
    'teacher-kuppam-schools',
    'Kuppam Schools',
    'Teach students and manage classes',
    'Local candidates, college graduates, and final-year vocational students welcome. Never pay any fee.',
    NULL,
    '',
    '9876543217',
    NULL,
    '₹18,000–₹25,000',
    'approved',
    true,
    '2026-07-29 12:37:57.972905+00',
    '2026-07-29 12:37:57.972915+00'
) ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    provider_name = EXCLUDED.provider_name,
    description = EXCLUDED.description,
    stipend_amount = EXCLUDED.stipend_amount,
    contact_phone = EXCLUDED.contact_phone,
    anti_scam_acknowledged = EXCLUDED.anti_scam_acknowledged,
    moderation_status = EXCLUDED.moderation_status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO student_opportunities (
    id, tenant_id, city, opportunity_type, title, slug, provider_name,
    description, eligibility, deadline, apply_url, contact_phone,
    discount_percent, stipend_amount, moderation_status, anti_scam_acknowledged,
    created_at, updated_at
) VALUES (
    '4f7f3cb1-aa53-5358-9ebc-84f3546bc0c2',
    NULL,
    'Kuppam',
    'internship',
    'Computer Operator',
    'computer-operator-kuppam-tech-solutions',
    'Kuppam Tech Solutions',
    'Data entry and computer operations',
    'Local candidates, college graduates, and final-year vocational students welcome. Never pay any fee.',
    NULL,
    '',
    '9876543213',
    NULL,
    '₹15,000–₹22,000',
    'approved',
    true,
    '2026-07-29 12:37:53.915512+00',
    '2026-07-29 12:37:53.915521+00'
) ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    provider_name = EXCLUDED.provider_name,
    description = EXCLUDED.description,
    stipend_amount = EXCLUDED.stipend_amount,
    contact_phone = EXCLUDED.contact_phone,
    anti_scam_acknowledged = EXCLUDED.anti_scam_acknowledged,
    moderation_status = EXCLUDED.moderation_status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO student_opportunities (
    id, tenant_id, city, opportunity_type, title, slug, provider_name,
    description, eligibility, deadline, apply_url, contact_phone,
    discount_percent, stipend_amount, moderation_status, anti_scam_acknowledged,
    created_at, updated_at
) VALUES (
    '89bfb8f0-050c-5403-8df7-a66c04c6e2c5',
    NULL,
    'Kuppam',
    'internship',
    'Pharmacist',
    'pharmacist-kuppam-medicals',
    'Kuppam Medicals',
    'Handle medicines and customer service',
    'Local candidates, college graduates, and final-year vocational students welcome. Never pay any fee.',
    NULL,
    '',
    '9876543211',
    NULL,
    '₹18,000–₹25,000',
    'approved',
    true,
    '2026-07-29 12:37:51.884495+00',
    '2026-07-29 12:37:51.884504+00'
) ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    provider_name = EXCLUDED.provider_name,
    description = EXCLUDED.description,
    stipend_amount = EXCLUDED.stipend_amount,
    contact_phone = EXCLUDED.contact_phone,
    anti_scam_acknowledged = EXCLUDED.anti_scam_acknowledged,
    moderation_status = EXCLUDED.moderation_status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO student_opportunities (
    id, tenant_id, city, opportunity_type, title, slug, provider_name,
    description, eligibility, deadline, apply_url, contact_phone,
    discount_percent, stipend_amount, moderation_status, anti_scam_acknowledged,
    created_at, updated_at
) VALUES (
    'b0db3840-1ac6-5f38-8d7a-c5656a2cd9a2',
    NULL,
    'Kuppam',
    'internship',
    'Machine Operator',
    'machine-operator-kuppam-industries',
    'Kuppam Industries',
    'Operate and maintain machines',
    'Local candidates, college graduates, and final-year vocational students welcome. Never pay any fee.',
    NULL,
    '',
    '9876543210',
    NULL,
    '₹15,000–₹20,000',
    'approved',
    true,
    '2026-07-29 12:37:50.860876+00',
    '2026-07-29 12:37:50.860889+00'
) ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    provider_name = EXCLUDED.provider_name,
    description = EXCLUDED.description,
    stipend_amount = EXCLUDED.stipend_amount,
    contact_phone = EXCLUDED.contact_phone,
    anti_scam_acknowledged = EXCLUDED.anti_scam_acknowledged,
    moderation_status = EXCLUDED.moderation_status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO student_opportunities (
    id, tenant_id, city, opportunity_type, title, slug, provider_name,
    description, eligibility, deadline, apply_url, contact_phone,
    discount_percent, stipend_amount, moderation_status, anti_scam_acknowledged,
    created_at, updated_at
) VALUES (
    '05742b2f-b589-55a0-847a-a87a05db9721',
    NULL,
    'Kuppam',
    'internship',
    'Chef',
    'chef-kuppam-restaurant',
    'Kuppam Restaurant',
    'Prepare food and manage kitchen tasks',
    'Local candidates, college graduates, and final-year vocational students welcome. Never pay any fee.',
    NULL,
    '',
    '9876543214',
    NULL,
    '₹12,000–₹20,000',
    'approved',
    true,
    '2026-07-29 12:37:54.929854+00',
    '2026-07-29 12:37:54.929864+00'
) ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    provider_name = EXCLUDED.provider_name,
    description = EXCLUDED.description,
    stipend_amount = EXCLUDED.stipend_amount,
    contact_phone = EXCLUDED.contact_phone,
    anti_scam_acknowledged = EXCLUDED.anti_scam_acknowledged,
    moderation_status = EXCLUDED.moderation_status,
    updated_at = EXCLUDED.updated_at;

COMMIT;
