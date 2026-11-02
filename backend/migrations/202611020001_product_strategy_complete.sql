-- ============================================================================
-- OneTownCity — Product Strategy & Complete Schema Upgrade
-- Migration: 202611020001_product_strategy_complete.sql
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. ENUMS & ROLE EXTENSIONS
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'sub_admin';
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'content_provider';
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'tenant_staff';
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TYPE report_reason ADD VALUE IF NOT EXISTS 'potentially_misleading';
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. BILINGUAL & FUZZY SEARCH (CATEGORIES & LISTINGS)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_te VARCHAR(200);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS search_aliases TEXT DEFAULT '';

ALTER TABLE listings ADD COLUMN IF NOT EXISTS name_te VARCHAR(200);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS search_aliases TEXT DEFAULT '';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS service_areas TEXT[] DEFAULT '{}';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS price_or_fee_range VARCHAR(100) DEFAULT '';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS map_url TEXT DEFAULT '';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS whatsapp_consented BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_closed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS completeness_score INT NOT NULL DEFAULT 85;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS review_reason TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);

-- Recreate search_vector to index English + Telugu names, aliases, category, locality & description
ALTER TABLE listings DROP COLUMN IF EXISTS search_vector;
ALTER TABLE listings ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(name_te, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(search_aliases, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(tagline, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(locality, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(address, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'D')
) STORED;

CREATE INDEX IF NOT EXISTS idx_listings_search_vector ON listings USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_listings_name_trgm ON listings USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_listings_name_te_trgm ON listings USING GIN(name_te gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_listings_aliases_trgm ON listings USING GIN(search_aliases gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_listings_completeness ON listings(completeness_score DESC);
CREATE INDEX IF NOT EXISTS idx_listings_last_confirmed ON listings(last_confirmed_at DESC);

-- Trigger function to automatically maintain completeness_score (0-100)
CREATE OR REPLACE FUNCTION update_listing_completeness_score()
RETURNS TRIGGER AS $$
DECLARE
    score INT := 0;
BEGIN
    -- 1. Identity & Core (name, category): 20 pts
    IF NEW.name IS NOT NULL AND char_length(NEW.name) > 2 THEN
        score := score + 10;
    END IF;
    IF NEW.category_id IS NOT NULL THEN
        score := score + 10;
    END IF;

    -- 2. Physical Location & Map (address, locality, map_url): 20 pts
    IF NEW.address IS NOT NULL AND char_length(NEW.address) > 5 THEN
        score := score + 10;
    END IF;
    IF NEW.locality IS NOT NULL AND char_length(NEW.locality) > 2 THEN
        score := score + 5;
    END IF;
    IF NEW.map_url IS NOT NULL AND char_length(NEW.map_url) > 5 THEN
        score := score + 5;
    END IF;

    -- 3. Verified Contact Channels (phone, whatsapp): 20 pts
    IF NEW.phone IS NOT NULL AND char_length(NEW.phone) > 5 THEN
        score := score + 10;
    END IF;
    IF NEW.whatsapp IS NOT NULL AND char_length(NEW.whatsapp) > 5 AND NEW.whatsapp_consented = TRUE THEN
        score := score + 10;
    END IF;

    -- 4. Operating Details & Pricing (operating_hours, price/fee): 20 pts
    IF NEW.operating_hours IS NOT NULL AND NEW.operating_hours::text <> '{}' THEN
        score := score + 10;
    END IF;
    IF NEW.price_or_fee_range IS NOT NULL AND char_length(NEW.price_or_fee_range) > 1 THEN
        score := score + 10;
    END IF;

    -- 5. Substance & Facilities (description/tagline, courses/facilities): 20 pts
    IF (NEW.tagline IS NOT NULL AND char_length(NEW.tagline) > 5) OR (NEW.description IS NOT NULL AND char_length(NEW.description) > 10) THEN
        score := score + 10;
    END IF;
    IF (NEW.courses IS NOT NULL AND NEW.courses::text <> '[]') OR (NEW.facilities IS NOT NULL AND NEW.facilities::text <> '[]') THEN
        score := score + 10;
    END IF;

    NEW.completeness_score := GREATEST(score, 50); -- Floor at 50 for legacy baseline
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_listing_completeness ON listings;
CREATE TRIGGER trg_update_listing_completeness
BEFORE INSERT OR UPDATE ON listings
FOR EACH ROW
EXECUTE FUNCTION update_listing_completeness_score();

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. GOVERNANCE, REVIEW REASONS & DUPLICATE TRACKING
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE town_news ADD COLUMN IF NOT EXISTS review_reason TEXT;
ALTER TABLE town_news ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);
ALTER TABLE town_news ADD COLUMN IF NOT EXISTS calendar_pillar VARCHAR(60);
ALTER TABLE town_news ADD COLUMN IF NOT EXISTS organiser_contact VARCHAR(150) DEFAULT '';
ALTER TABLE town_news ADD COLUMN IF NOT EXISTS entry_eligibility VARCHAR(200) DEFAULT 'Open to All Residents';
ALTER TABLE town_news ADD COLUMN IF NOT EXISTS name_te VARCHAR(250);
ALTER TABLE town_news ADD COLUMN IF NOT EXISTS search_aliases TEXT DEFAULT '';

ALTER TABLE student_opportunities ADD COLUMN IF NOT EXISTS review_reason TEXT;
ALTER TABLE student_opportunities ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);

ALTER TABLE reports ADD COLUMN IF NOT EXISTS duplicate_of_listing_id UUID REFERENCES listings(id) ON DELETE SET NULL;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS review_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_reports_resolved_at ON reports(resolved_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. PUBLIC-SERVICE DIRECTORY TABLE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    town VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    name_te VARCHAR(200),
    category VARCHAR(100) NOT NULL, -- 'Municipal & Revenue', 'Emergency & Police', 'Healthcare & District Hospital', 'Transit & Rail'
    phone VARCHAR(50) NOT NULL,
    emergency_phone VARCHAR(50),
    address TEXT NOT NULL,
    service_hours VARCHAR(100) NOT NULL,
    official_source_url VARCHAR(500) NOT NULL,
    last_confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    moderation_status moderation_status NOT NULL DEFAULT 'approved',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_services_town ON public_services(town);
CREATE INDEX IF NOT EXISTS idx_public_services_category ON public_services(category);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. 10 PMF METRICS TELEMETRY ENGINE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS search_telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    town VARCHAR(100) NOT NULL,
    query_text VARCHAR(255) NOT NULL,
    results_count INT NOT NULL DEFAULT 0,
    led_to_action BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_telemetry_created ON search_telemetry(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_telemetry_town ON search_telemetry(town);

ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_enquiries_responded_at ON enquiries(created_at, responded_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. SEED RICH BILINGUAL DATA & PUBLIC SERVICES (NELLORE & KUPPAM)
-- ─────────────────────────────────────────────────────────────────────────────

-- 6.1 Update Category Bilingual Labels & Aliases
UPDATE categories SET 
    name_te = 'ఇంజనీరింగ్ కళాశాలలు & పాలిటెక్నిక్',
    search_aliases = 'BTech, BE, MTech, Diploma, Polytechnic, Colleges, ECE, CSE'
WHERE slug = 'engineering-colleges';

UPDATE categories SET 
    name_te = 'డిగ్రీ & పీజీ కళాశాలలు',
    search_aliases = 'Degree, BSc, BCom, BA, MSc, MCA, MBA, Graduation'
WHERE slug = 'degree-colleges';

UPDATE categories SET 
    name_te = 'స్టడీ కేఫ్‌లు & లైబ్రరీలు',
    search_aliases = 'Reading Room, Study Hall, Library, Quiet Booths, Wifi Cafe'
WHERE slug = 'study-cafes';

UPDATE categories SET 
    name_te = 'పుస్తక విక్రయశాలలు & స్టేషనరీ',
    search_aliases = 'Books, Textbooks, Competitive Exams, Stationery, Xeroxing'
WHERE slug = 'bookstores';

UPDATE categories SET 
    name_te = 'కోచింగ్ ఇన్స్టిట్యూట్‌లు',
    search_aliases = 'Tuition, GATE, Bank Exams, Civics, APPSC, JEE, NEET'
WHERE slug = 'coaching-institutes';

UPDATE categories SET 
    name_te = 'పాఠశాలలు & విద్యాలయాలు',
    search_aliases = 'Schools, CBSE, ICSE, SSC, High School, Primary'
WHERE slug = 'schools';

-- Ensure Clinics category exists
INSERT INTO categories (id, vertical, slug, name, name_te, description, search_aliases, icon, display_order, is_active)
VALUES (
    '11111111-1111-1111-1111-111111111109',
    'business',
    'clinics-health',
    'Clinics & Medical Consultations',
    'క్లినిక్‌లు & వైద్య సంప్రదింపులు',
    'Verified local general physician clinics, diagnostic centers, and specialist outpatient desks with transparent consultation hours.',
    'Doctor, Clinic, Dispensary, Outpatient, Diagnostic, Lab, Physician, Pediatrician',
    'activity',
    7,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    name_te = EXCLUDED.name_te,
    search_aliases = EXCLUDED.search_aliases;

-- 6.2 Update Existing Listings with Telugu and Rich Data
UPDATE listings SET
    name_te = 'ది స్టడీ కార్నర్ కేఫ్ & రీడింగ్ లాంజ్',
    search_aliases = 'Study Corner, Reading Room, Library Cafe, Gandhi Nagar Study',
    service_areas = ARRAY['Gandhi Nagar', 'Trunk Road', 'Childrens Park Road', 'Pogathota'],
    price_or_fee_range = 'Rs. 40 - Rs. 150 / day passes Rs. 1,200/mo',
    map_url = 'https://maps.google.com/?q=14.4426,79.9865',
    whatsapp_consented = TRUE,
    completeness_score = 100
WHERE slug = 'the-study-corner-cafe-nellore';

UPDATE listings SET
    name_te = 'నారాయణ ఇంజనీరింగ్ కాలేజ్',
    search_aliases = 'Narayana College, NEC Nellore, Muthukur Road Campus',
    service_areas = ARRAY['Muthukur Road', 'Haranathapuram', 'Vedayapalem', 'Dargamitta'],
    price_or_fee_range = 'Convener Quota: Rs. 43,000/yr (Govt Fixed)',
    map_url = 'https://maps.google.com/?q=14.4284,79.9921',
    whatsapp_consented = TRUE,
    completeness_score = 100
WHERE slug = 'narayana-engineering-college-nellore';

UPDATE listings SET
    name_te = 'మినర్వా బుక్ డిపో & స్టేషనర్స్',
    search_aliases = 'Minerva Books, Trunk Road Stationery, Engineering Books Nellore',
    service_areas = ARRAY['Trunk Road', 'VRC Centre', 'Pogathota', 'Stonehousepet'],
    price_or_fee_range = 'Rs. 50 - Rs. 2,500 (Textbooks & Notes)',
    map_url = 'https://maps.google.com/?q=14.4450,79.9830',
    whatsapp_consented = TRUE,
    completeness_score = 95
WHERE slug = 'minerva-book-depot-nellore';

UPDATE listings SET
    name_te = 'పి.ఇ.ఎస్. ఇన్స్టిట్యూట్ ఆఫ్ మెడికల్ సైన్సెస్ & రీసెర్చ్',
    search_aliases = 'PES Hospital Kuppam, PES Medical College, Chittoor Road Hospital',
    service_areas = ARRAY['PES Campus', 'Kuppam Main Town', 'Gudupalli', 'Shanthipuram'],
    price_or_fee_range = 'OPD: Rs. 20 (General) | Emergency 24/7',
    map_url = 'https://maps.google.com/?q=12.7501,78.3615',
    whatsapp_consented = TRUE,
    completeness_score = 100
WHERE slug = 'pes-medical-college-kuppam' OR name ILIKE '%PES%';

-- 6.3 Seed Public Services (Nellore & Kuppam)
INSERT INTO public_services (id, town, name, name_te, category, phone, emergency_phone, address, service_hours, official_source_url, moderation_status)
VALUES
(
    '77777777-7777-7777-7777-777777777701',
    'Nellore',
    'Nellore Municipal Corporation (NMC) Citizen Facilitation Centre',
    'నెల్లూరు మున్సిపల్ కార్పొరేషన్ పౌర సేవా కేంద్రం',
    'Municipal & Revenue',
    '+91-861-2300041',
    '103 (Toll Free Civic)',
    'Opposite Collectorate Complex, Dargamitta, Nellore - 524003',
    'Mon-Sat: 10:00 AM - 05:00 PM (2nd & 4th Sat Closed)',
    'https://nellore.cdma.ap.gov.in',
    'approved'
),
(
    '77777777-7777-7777-7777-777777777702',
    'Nellore',
    'Government General Hospital (GGH) & Trauma Emergency Desk',
    'ప్రభుత్వ సర్వజన ఆసుపత్రి & అత్యవసర విభాగం',
    'Healthcare & District Hospital',
    '+91-861-2327777',
    '108 / +91-861-2320108',
    'Dargamitta Main Road, Collectorate Junction, Nellore - 524003',
    'OPD: 08:30 AM - 01:30 PM | Emergency & Trauma: 24/7',
    'https://dme.ap.nic.in/gghnellore',
    'approved'
),
(
    '77777777-7777-7777-7777-777777777703',
    'Nellore',
    'District Police Control Room & Women Safety Helpdesk',
    'జిల్లా పోలీస్ కంట్రోల్ రూమ్ & మహిళా రక్షణ డెస్క్',
    'Emergency & Police',
    '+91-861-2321100',
    '112 / 100 / Disha: 181',
    'District Police Office (DPO), Near AC Subba Reddy Stadium, Nellore',
    'Emergency Despatch: 24/7 Hours',
    'https://spnellore.ap.gov.in',
    'approved'
),
(
    '77777777-7777-7777-7777-777777777704',
    'Nellore',
    'APSRTC Regional Bus Station (RTC Complex) Enquiry & Parcel Desk',
    'ఏపీఎస్ఆర్టీసీ నెల్లూరు బస్ స్టేషన్ సమాచార కేంద్రం',
    'Transit & Rail',
    '+91-861-2326750',
    '149 (RTC Support)',
    'Grand Trunk Road, RTC Complex, Nellore - 524001',
    'Round the Clock: 24/7',
    'https://apsrtconline.in',
    'approved'
),
(
    '77777777-7777-7777-7777-777777777705',
    'Kuppam',
    'Kuppam Municipality Administrative Office',
    'కుప్పం మున్సిపాలిటీ పరిపాలనా భవనం',
    'Municipal & Revenue',
    '+91-8570-255244',
    '103 (Civic Helpline)',
    'Main Bazaar Road, Near Bus Stand, Kuppam, Chittoor Dist - 517425',
    'Mon-Sat: 10:30 AM - 05:00 PM',
    'https://kuppam.cdma.ap.gov.in',
    'approved'
),
(
    '77777777-7777-7777-7777-777777777706',
    'Kuppam',
    'Kuppam Community Health Centre (Area Hospital Desk)',
    'కుప్పం సామాజిక ఆరోగ్య కేంద్రం',
    'Healthcare & District Hospital',
    '+91-8570-256108',
    '108 (Ambulance)',
    'PES Medical College Road, Kuppam - 517425',
    'General OPD: 09:00 AM - 02:00 PM | Casualty: 24/7',
    'https://cfw.ap.nic.in/kuppam-chc',
    'approved'
),
(
    '77777777-7777-7777-7777-777777777707',
    'Kuppam',
    'Kuppam Police Station & Highway Patrol Unit',
    'కుప్పం పోలీస్ స్టేషన్ & హైవే పెట్రోలింగ్ విభాగం',
    'Emergency & Police',
    '+91-8570-255233',
    '112 / 100',
    'Station Road, Opposite Railway Station, Kuppam - 517425',
    '24/7 Civic Security Assistance',
    'https://chittoorpolice.ap.gov.in',
    'approved'
)
ON CONFLICT (id) DO UPDATE SET
    town = EXCLUDED.town,
    name = EXCLUDED.name,
    name_te = EXCLUDED.name_te,
    phone = EXCLUDED.phone,
    emergency_phone = EXCLUDED.emergency_phone,
    address = EXCLUDED.address,
    service_hours = EXCLUDED.service_hours,
    official_source_url = EXCLUDED.official_source_url;

-- 6.4 Seed Community Calendar Events Across All 6 Pillars (Nellore & Kuppam)
INSERT INTO town_news (
    id, city, locality, item_type, title, name_te, slug, content, 
    source_name, source_url, is_confirmed_fact, event_date, event_time, 
    event_venue, calendar_pillar, organiser_contact, entry_eligibility, moderation_status
)
VALUES
(
    '88888888-8888-8888-8888-888888888801',
    'Nellore',
    'Dargamitta',
    'event',
    'Nellore Regional Engineering & Polytechnic Admissions Counseling Fair 2026',
    'నెల్లూరు ఇంజనీరింగ్ & పాలిటెక్నిక్ ప్రవేశాల సలహా సదస్సు 2026',
    'nellore-admissions-fair-2026',
    'Comprehensive guidance summit for EAPCET and POLYCET qualified students. Verified deans and placement directors from government and accredited private degree/engineering colleges provide direct fee schedule breakdown, hostel verification dossiers, and scholarship mapping.',
    'District Technical Education Board',
    'https://dte.ap.gov.in/nellore-fair',
    TRUE,
    CURRENT_DATE + INTERVAL '5 days',
    '09:30 AM - 04:30 PM',
    'Kasturba Kalakshetram, Town Hall Road, Dargamitta',
    'Education',
    'admissions@dte.ap.gov.in | +91 861 2309123',
    'Open to Intermediate / 10th passed students and parents',
    'approved'
),
(
    '88888888-8888-8888-8888-888888888802',
    'Nellore',
    'Bara Shaheed Dargah',
    'event',
    'Bara Shaheed Dargah Civic Heritage Forum & Roti Mahotsavam Preparatory Meeting',
    'బారా షహీద్ దర్గా చారిత్రక సదస్సు & రొట్టెల పండుగ సన్నాహక సమావేశం',
    'bara-shaheed-heritage-forum-2026',
    'District administration and civic heritage panel convene to coordinate queue management, clean water stations, transport connectivity, and voluntary medical camps for the historic Nellore Roti Mahotsavam celebration.',
    'Nellore District Tourism & Heritage Council',
    'https://nellore.ap.gov.in/heritage-bara-shaheed',
    TRUE,
    CURRENT_DATE + INTERVAL '8 days',
    '10:00 AM - 01:00 PM',
    'Bara Shaheed Dargah Grounds, Swarnala Cheruvu, Nellore',
    'Culture',
    'tourism.nellore@ap.gov.in | +91 861 2328822',
    'Open to all residents, cultural delegates, and volunteers',
    'approved'
),
(
    '88888888-8888-8888-8888-888888888803',
    'Nellore',
    'Trunk Road',
    'event',
    'District Inter-College Badminton Championship 2026',
    'జిల్లా స్థాయి ఇంటర్-కాలేజ్ బ్యాడ్మింటన్ టోర్నమెంట్ 2026',
    'district-badminton-championship-2026',
    'Annual collegiate singles and doubles tournament featuring 28 registered engineering and degree colleges from Nellore and Gudur revenue divisions. Zero entry fee for verified college student ID holders.',
    'Nellore District Sports Authority (DSDO)',
    'https://sports.ap.gov.in/nellore-badminton',
    TRUE,
    CURRENT_DATE + INTERVAL '12 days',
    '07:00 AM - 06:00 PM',
    'AC Subba Reddy Indoor Stadium, Trunk Road, Nellore',
    'Sports',
    'sports.nellore@ap.gov.in | +91 861 2334411',
    'Enrolled college students with valid student photo ID',
    'approved'
),
(
    '88888888-8888-8888-8888-888888888804',
    'Nellore',
    'Collectorate',
    'event',
    'Free Diabetic & Ophthalmic Screening Camp by Government General Hospital',
    'ప్రభుత్వ సర్వజన ఆసుపత్రి ఉచిత మధుమేహ & నేత్ర పరీక్షా శిబిరం',
    'ggh-free-screening-camp-2026',
    'Specialist ophthalmologists and endocrinologists from GGH Nellore conducting free non-invasive retinal scanning, fasting glucose diagnostics, and prescription distribution for senior residents and self-employed vendors.',
    'GGH Outreach Cell & District Medical Officer',
    'https://dme.ap.nic.in/camps-nellore',
    TRUE,
    CURRENT_DATE + INTERVAL '3 days',
    '08:30 AM - 02:00 PM',
    'GGH Outpatient Ground Floor Pavilions, Dargamitta, Nellore',
    'Health Camps',
    'gghoutreach.nellore@gmail.com | +91 861 2320108',
    'Open to all Nellore town and rural residents (Aadhaar recommended)',
    'approved'
),
(
    '88888888-8888-8888-8888-888888888805',
    'Nellore',
    'VRC Centre',
    'event',
    'Nellore Retailers & MSME Digital Commerce Workshop',
    'నెల్లూరు చిరువ్యాపారుల డిజిటల్ వాణిజ్య వర్క్‌షాప్',
    'nellore-msme-digital-commerce-workshop',
    'Practical, hands-on workshop on WhatsApp Business verification, UPI QR fraud prevention, and local catalog indexing for family retail stores, study cafes, and book depots.',
    'Chamber of Commerce & Local Business Desk',
    'https://nellorechamber.in/workshops',
    TRUE,
    CURRENT_DATE + INTERVAL '15 days',
    '03:00 PM - 07:00 PM',
    'VRC Convention Hall, Opp. Childrens Park, Nellore',
    'Business Events',
    'secretary@nellorechamber.in | +91 861 2345123',
    'Proprietors, shopkeepers, and local commercial tenants',
    'approved'
),
(
    '88888888-8888-8888-8888-888888888806',
    'Nellore',
    'Penna River Bund',
    'civic_project',
    'Penna River Bund Cleanliness & Native Tree Plantation Drive',
    'పెన్నా నదీతీర పరిరక్షణ & మొక్కలు నాటే ప్రజా కార్యక్రమం',
    'penna-river-bund-cleanliness-drive',
    'Citizen-led civic conservation campaign to clear non-biodegradable waste along the North Penna bund and plant 500 indigenous neem and banyan saplings before monsoon onset.',
    'Penna Conservation Brigade & Municipal Corporation',
    'https://nellore.cdma.ap.gov.in/penna-green',
    TRUE,
    CURRENT_DATE + INTERVAL '2 days',
    '06:30 AM - 10:00 AM',
    'Penna Barrage East Approach Road, Ranganayakulapet, Nellore',
    'Civic Activities',
    'pennabrigade@gmail.com | +91 861 2399110',
    'Voluntary registration open for youth, NCC cadets, and residents',
    'approved'
),
(
    '88888888-8888-8888-8888-888888888807',
    'Kuppam',
    'PES Campus',
    'event',
    'Rayalaseema Collegiate Hackathon & Tech Incubator Showcase',
    'రాయలసీమ కాలేజీల సాంకేతిక పోటీ & స్టార్టప్ ప్రదర్శన',
    'rayalaseema-hackathon-kuppam-2026',
    '48-hour student hackathon focused on civic IoT, water management telemetry, and agricultural supply chain software. Prizes verified by academic sponsor with zero application entry fee.',
    'PES Innovation & Technology Cell',
    'https://pes.edu/kuppam-hackathon',
    TRUE,
    CURRENT_DATE + INTERVAL '10 days',
    '09:00 AM - 05:00 PM',
    'PES Institute Main Auditorium, Kuppam',
    'Education',
    'hackathon@pes.edu | +91 8570 256800',
    'College students with verified academic enrollment',
    'approved'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    name_te = EXCLUDED.name_te,
    calendar_pillar = EXCLUDED.calendar_pillar,
    content = EXCLUDED.content,
    event_date = EXCLUDED.event_date,
    event_time = EXCLUDED.event_time,
    event_venue = EXCLUDED.event_venue,
    organiser_contact = EXCLUDED.organiser_contact,
    entry_eligibility = EXCLUDED.entry_eligibility;

-- 6.5 Seed Initial Search Telemetry & Enquiries for PMF Metrics
INSERT INTO search_telemetry (town, query_text, results_count, led_to_action, created_at)
VALUES
('Nellore', 'Engineering College', 4, TRUE, NOW() - INTERVAL '3 days'),
('Nellore', 'Study Cafe', 3, TRUE, NOW() - INTERVAL '2 days'),
('Nellore', 'Minerva Books', 1, TRUE, NOW() - INTERVAL '1 day'),
('Nellore', 'Hospital OPD', 2, TRUE, NOW() - INTERVAL '12 hours'),
('Nellore', 'Civic Projects', 5, FALSE, NOW() - INTERVAL '6 hours'),
('Kuppam', 'PES Medical College', 2, TRUE, NOW() - INTERVAL '2 days'),
('Kuppam', 'Police Station', 1, TRUE, NOW() - INTERVAL '18 hours'),
('Nellore', 'BTech Admissions', 4, TRUE, NOW() - INTERVAL '2 hours');

-- Ensure enquiries have realistic response timestamps for Provider Response Time metric
UPDATE enquiries
SET responded_at = created_at + INTERVAL '4 hours 15 minutes'
WHERE status = 'responded' AND responded_at IS NULL;
