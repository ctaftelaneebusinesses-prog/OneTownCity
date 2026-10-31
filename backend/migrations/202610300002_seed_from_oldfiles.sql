-- OneTownCity High-Fidelity Seed Migration
-- Migration: 202610300002_seed_from_oldfiles.sql

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. SEED PLANS (SaaS Monetization Tiers)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO plans (id, name, slug, tier, monthly_lead_quota, price_cents, features) VALUES
('11111111-1111-1111-1111-111111111101', 'Free Starter', 'free', 'free', 5, 0, '["basic_profile", "5_leads_monthly", "whatsapp_button"]'::jsonb),
('11111111-1111-1111-1111-111111111102', 'Growth Business', 'growth-business', 'growth_business', 25, 199900, '["priority_search", "25_leads_monthly", "offer_publishing", "click_telemetry"]'::jsonb),
('11111111-1111-1111-1111-111111111103', 'Education Pro', 'edu-pro', 'edu_pro', 50, 499900, '["course_catalog", "admission_workflow", "50_leads_monthly", "verified_review_badge", "placement_showcase"]'::jsonb),
('11111111-1111-1111-1111-111111111104', 'Campus Enterprise', 'campus-enterprise', 'campus_enterprise', 200, 999900, '["unlimited_leads", "custom_admissions_crm", "campus_announcements_priority", "dedicated_manager"]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    monthly_lead_quota = EXCLUDED.monthly_lead_quota,
    price_cents = EXCLUDED.price_cents,
    features = EXCLUDED.features;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. SEED USERS (Demo Personas)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO users (id, email, name, role) VALUES
('22222222-2222-2222-2222-222222222201', 'superadmin@onetowncity.local', 'Root Super Admin', 'super_admin'),
('22222222-2222-2222-2222-222222222202', 'cityadmin.nellore@onetowncity.local', 'Nellore City Admin', 'city_admin'),
('22222222-2222-2222-2222-222222222203', 'cityadmin.kuppam@onetowncity.local', 'Kuppam City Admin', 'city_admin'),
('22222222-2222-2222-2222-222222222204', 'principal@narayana-nellore.edu', 'Dr. K. S. Rao (Principal)', 'tenant_owner'),
('22222222-2222-2222-2222-222222222205', 'owner@minerva-books.local', 'V. Ramanathan (Proprietor)', 'tenant_owner'),
('22222222-2222-2222-2222-222222222206', 'student.ananya@campus.local', 'Ananya Sharma (Student)', 'student')
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. SEED ORGANIZATIONS & MEMBERSHIPS (Tenancy Domain)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO organizations (id, name, slug, vertical, city, plan_id) VALUES
('33333333-3333-3333-3333-333333333301', 'Narayana Engineering College', 'narayana-engineering-college-nellore', 'education', 'Nellore', '11111111-1111-1111-1111-111111111103'),
('33333333-3333-3333-3333-333333333302', 'Minerva Bookstore & Study Cafe', 'minerva-bookstore-study-cafe-nellore', 'business', 'Nellore', '11111111-1111-1111-1111-111111111102'),
('33333333-3333-3333-3333-333333333303', 'Kuppam Degree & PG College', 'kuppam-degree-pg-college', 'education', 'Kuppam', '11111111-1111-1111-1111-111111111101'),
('33333333-3333-3333-3333-333333333304', 'The Study Corner Cafe', 'the-study-corner-cafe-nellore', 'business', 'Nellore', '11111111-1111-1111-1111-111111111102'),
('33333333-3333-3333-3333-333333333305', 'SLV Cyber & Stationery Hub', 'slv-cyber-stationery-kuppam', 'business', 'Kuppam', '11111111-1111-1111-1111-111111111101')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    vertical = EXCLUDED.vertical,
    city = EXCLUDED.city,
    plan_id = EXCLUDED.plan_id;

INSERT INTO organization_members (organization_id, user_id, role) VALUES
('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222204', 'owner'),
('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222205', 'owner')
ON CONFLICT (organization_id, user_id) DO NOTHING;

INSERT INTO leads_usage (tenant_id, month_year, leads_count) VALUES
('33333333-3333-3333-3333-333333333301', '2026-10', 4),
('33333333-3333-3333-3333-333333333302', '2026-10', 2)
ON CONFLICT (tenant_id, month_year) DO UPDATE SET
    leads_count = EXCLUDED.leads_count;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. SEED CATEGORIES (4 Verticals Only)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO categories (id, vertical, slug, name, description, icon, display_order) VALUES
('44444444-4444-4444-4444-444444444401', 'education', 'engineering-degree-colleges', 'Engineering & Degree Colleges', 'Autonomous, university-affiliated institutes and polytechnics', 'graduation-cap', 1),
('44444444-4444-4444-4444-444444444402', 'education', 'coaching-competitive-exams', 'Coaching & Competitive Exams', 'IIT-JEE, NEET, GATE, and civil service training academies', 'book-open', 2),
('44444444-4444-4444-4444-444444444403', 'education', 'schools-academies', 'Schools & Junior Colleges', 'CBSE, ICSE, and state syllabus secondary institutions', 'building', 3),
('44444444-4444-4444-4444-444444444404', 'business', 'bookstores-libraries', 'Bookstores & Educational Supplies', 'Academic textbooks, stationery, and reading libraries', 'book', 1),
('44444444-4444-4444-4444-444444444405', 'business', 'study-cafes-coworking', 'Study Cafes & Workspaces', 'Quiet cafes with Wi-Fi, power sockets, and study desks', 'coffee', 2),
('44444444-4444-4444-4444-444444444406', 'business', 'commercial-retail', 'Commercial & Campus Retail', 'Electronics, print stations, and student daily essentials', 'store', 3),
('44444444-4444-4444-4444-444444444407', 'news', 'civic-development', 'Civic Development Tracker', 'Verified urban projects, roadworks, and municipal developments', 'git-commit', 1),
('44444444-4444-4444-4444-444444444408', 'news', 'town-announcements', 'Town Announcements & Alerts', 'Official municipal circulars, public notices, and civic alerts', 'bell', 2),
('44444444-4444-4444-4444-444444444409', 'news', 'local-events-calendar', 'Local Events & Festivals', 'Regional youth hackathons, campus fairs, and town expos', 'calendar', 3),
('44444444-4444-4444-4444-444444444410', 'students', 'internships-drives', 'Internships & Campus Drives', 'Verified technical apprenticeships and recruitment drives', 'briefcase', 1),
('44444444-4444-4444-4444-444444444411', 'students', 'scholarships-aid', 'Scholarships & Merit Schemes', 'State scholarships, corporate grants, and fee assistance', 'award', 2),
('44444444-4444-4444-4444-444444444412', 'students', 'verified-student-hostels', 'Verified Student Hostels', 'Clean accommodations inspected for safety, food, and amenities', 'home', 3),
('44444444-4444-4444-4444-444444444413', 'students', 'student-discount-passes', 'Student Discount Passes', 'Transit concessions, cafe discounts, and library passes', 'percent', 4)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    display_order = EXCLUDED.display_order;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. SEED LISTINGS (Education Hub & Local Businesses)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO listings (
    id, tenant_id, category_id, vertical, slug, name, tagline, description,
    address, locality, city, phone, whatsapp, website, email,
    operating_hours, facilities, courses, admissions,
    is_sponsored, verification_status, moderation_status,
    view_count, whatsapp_clicks, call_clicks, last_confirmed_at
) VALUES
(
    '55555555-5555-5555-5555-555555555501',
    '33333333-3333-3333-3333-333333333301',
    '44444444-4444-4444-4444-444444444401',
    'education',
    'narayana-engineering-college-nellore',
    'Narayana Engineering College',
    'Premier Engineering & Applied Technology Institution with AICTE & NBA Accreditation',
    'Established engineering campus offering accredited undergraduate and postgraduate programs in CSE, ECE, Data Science, and Mechanical Engineering. Equipped with state-of-the-art incubation labs, high-speed campus internet, digital library, and dedicated placement cell maintaining top regional hiring records.',
    'Dhurjati Nagar, Gudur Road',
    'Muthukur Road',
    'Nellore',
    '+91-861-2313842',
    '+91-9440182930',
    'https://www.necn.ac.in',
    'admissions@necn.ac.in',
    '{"monday_friday": "08:30 - 16:30", "saturday": "08:30 - 13:00", "sunday": "Closed"}'::jsonb,
    '["Digital Library", "Campus Wi-Fi", "IoT Lab", "Hostel Facilities", "Bus Transport", "Sports Arena"]'::jsonb,
    '[{"name": "B.Tech Computer Science & Engineering", "duration": "4 Years", "fee_est": "INR 72,000/year", "intake": 180}, {"name": "B.Tech Artificial Intelligence & Data Science", "duration": "4 Years", "fee_est": "INR 72,000/year", "intake": 120}, {"name": "M.Tech VLSI & Embedded Systems", "duration": "2 Years", "fee_est": "INR 60,000/year", "intake": 24}]'::jsonb,
    '{"status": "Open", "academic_year": "2026-2027", "deadline": "2026-11-30", "entrance_exams": ["AP EAPCET", "JEE Main", "ECET"]}'::jsonb,
    true,
    'details_reviewed',
    'approved',
    428,
    34,
    18,
    NOW() - INTERVAL '2 days'
),
(
    '55555555-5555-5555-5555-555555555502',
    '33333333-3333-3333-3333-333333333302',
    '44444444-4444-4444-4444-444444444404',
    'business',
    'minerva-bookstore-study-cafe-nellore',
    'Minerva Bookstore & Study Cafe',
    'Curated Academic Books, Competitive Exam Materials & Quiet Study Lounge',
    'Independent academic bookseller and quiet workspace serving students in Nellore for over two decades. Stocks university textbooks, GATE/UPSC/NEET materials, engineering codebooks, and high-speed fiber-backed workspace tables for deep study sessions.',
    'Trunk Road, Opp. VR College Ground',
    'Trunk Road',
    'Nellore',
    '+91-861-2321455',
    '+91-9848123456',
    'https://minervabooks.local',
    'contact@minervabooks.local',
    '{"monday_saturday": "09:00 - 21:00", "sunday": "10:00 - 18:00"}'::jsonb,
    '["Silent Study Zone", "Power Sockets at Every Table", "Spiral Binding", "Laser Printing", "Filter Coffee"]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    true,
    'owner_claimed',
    'approved',
    312,
    58,
    29,
    NOW() - INTERVAL '1 day'
),
(
    '55555555-5555-5555-5555-555555555503',
    '33333333-3333-3333-3333-333333333304',
    '44444444-4444-4444-4444-444444444405',
    'business',
    'the-study-corner-cafe-nellore',
    'The Study Corner Cafe',
    'Acoustic-Treated Co-Study Space with High-Speed Internet & Artisan Coffee',
    'Modern study cafe designed specifically for students, remote learners, and researchers. Features ergonomic seating, private study pods, noise-dampened meeting alcoves, and cold brew coffee.',
    'Pogathota 2nd Lane',
    'Pogathota',
    'Nellore',
    '+91-861-2339900',
    '+91-9121998877',
    '',
    'studycorner@nellorecafe.local',
    '{"monday_sunday": "07:30 - 22:30"}'::jsonb,
    '["Ergonomic Chairs", "1Gbps Fiber Wi-Fi", "Noise-Proof Study Pods", "Clean Restrooms"]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'details_reviewed',
    'approved',
    189,
    41,
    12,
    NOW() - INTERVAL '4 days'
),
(
    '55555555-5555-5555-5555-555555555504',
    '33333333-3333-3333-3333-333333333303',
    '44444444-4444-4444-4444-444444444401',
    'education',
    'kuppam-degree-pg-college',
    'Kuppam Degree & PG College',
    'Affiliated to Sri Venkateswara University with Comprehensive Science & Arts Streams',
    'Long-standing higher education campus in Kuppam providing B.Sc, B.Com, B.A., and M.Sc programs. Extensive laboratories, experienced faculty, and active student cultural and sports societies.',
    'PES Campus Road, Near Railway Station',
    'Station Road',
    'Kuppam',
    '+91-8570-256211',
    '+91-9441155223',
    'https://kuppamdegree.local',
    'info@kuppamdegree.local',
    '{"monday_friday": "09:00 - 16:00", "saturday": "09:00 - 13:00", "sunday": "Closed"}'::jsonb,
    '["Science Labs", "Central Library", "Girls Common Room", "Cricket Field", "NSS Unit"]'::jsonb,
    '[{"name": "B.Sc Computer Science & Electronics", "duration": "3 Years", "fee_est": "INR 22,000/year", "intake": 60}, {"name": "B.Com Computer Applications", "duration": "3 Years", "fee_est": "INR 18,000/year", "intake": 100}]'::jsonb,
    '{"status": "Open", "academic_year": "2026-2027", "deadline": "2026-11-15", "entrance_exams": ["Merit Basis", "OAMDC"]}'::jsonb,
    false,
    'not_verified',
    'approved',
    145,
    12,
    8,
    NOW() - INTERVAL '5 days'
),
(
    '55555555-5555-5555-5555-555555555505',
    '33333333-3333-3333-3333-333333333305',
    '44444444-4444-4444-4444-444444444406',
    'business',
    'slv-cyber-stationery-kuppam',
    'SLV Cyber & Stationery Hub',
    'Document Printing, Exam Form Submissions, Stationery & Spiral Binding',
    'Central student service center right opposite the bus depot in Kuppam. Provides fast xerox, engineering drawing sheets, admit card downloads, and university stationery supplies.',
    'Opposite RTC Bus Complex, Main Road',
    'Main Bazaar',
    'Kuppam',
    '+91-8570-255889',
    '+91-9988776655',
    '',
    'slvcyber@kuppam.local',
    '{"monday_saturday": "08:00 - 21:00", "sunday": "08:30 - 14:00"}'::jsonb,
    '["Color Laser Print", "Photocopy Service", "Lamination", "Project Binding"]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    false,
    'owner_claimed',
    'approved',
    98,
    22,
    7,
    NOW() - INTERVAL '3 days'
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    address = EXCLUDED.address,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    phone = EXCLUDED.phone,
    whatsapp = EXCLUDED.whatsapp,
    operating_hours = EXCLUDED.operating_hours,
    facilities = EXCLUDED.facilities,
    courses = EXCLUDED.courses,
    admissions = EXCLUDED.admissions,
    is_sponsored = EXCLUDED.is_sponsored,
    verification_status = EXCLUDED.verification_status,
    moderation_status = EXCLUDED.moderation_status,
    last_confirmed_at = EXCLUDED.last_confirmed_at;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. SEED TOWN NEWS & CIVIC DEVELOPMENT TRACKER
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO town_news (
    id, tenant_id, city, locality, item_type, title, slug, content,
    source_name, source_url, is_confirmed_fact, event_date, event_time, event_venue,
    moderation_status, created_at
) VALUES
(
    '66666666-6666-6666-6666-666666666601',
    NULL,
    'Nellore',
    'Pennar River Basin',
    'civic_project',
    'Pennar Riverfront Walkway & Ecological Promenade Phase 1',
    'pennar-riverfront-walkway-phase-1',
    'Municipal Corporation of Nellore has officially sanctioned Phase 1 construction for the 4.2 km riverfront promenade between Ranganayakulapet and Pennar Bridge. Includes solar illuminated cycling tracks, pedestrian stone pathways, flood defense retaining masonry, and public park amenities. Work tender awarded to NCC Urban.',
    'Nellore Municipal Gazette',
    'https://nellore.cdma.ap.gov.in/civic-works/pennar-phase-1',
    true,
    NULL,
    NULL,
    NULL,
    'approved',
    NOW() - INTERVAL '3 days'
),
(
    '66666666-6666-6666-6666-666666666602',
    NULL,
    'Nellore',
    'Magunta Layout',
    'event',
    'South Andhra Inter-Collegiate Youth Innovation Hackathon 2026',
    'south-andhra-youth-hackathon-2026',
    '48-hour regional hackathon uniting engineering and polytechnic students from across Tirupati and SPSR Nellore districts. Themes include AI in Agriculture, Hyperlocal Logistics, and Rural Health Solutions. Mentors from regional technology companies will judge prototype demos.',
    'District Innovation Council',
    'https://dic.ap.gov.in/events/hackathon-nellore-2026',
    true,
    CURRENT_DATE + 14,
    '09:00 AM',
    'Auditorium, V.R. College Grounds, Nellore',
    'approved',
    NOW() - INTERVAL '2 days'
),
(
    '66666666-6666-6666-6666-666666666603',
    NULL,
    'Kuppam',
    'Gudupalle Highway',
    'civic_project',
    'Kuppam Industrial Corridor Bypass Highway Expansion (Proposal)',
    'kuppam-industrial-corridor-bypass-proposal',
    'Pre-feasibility proposal submitted to the Andhra Pradesh Infrastructure Board proposing a 18 km 4-lane bypass connecting Kuppam railway corridor directly to Bengaluru-Chennai Expressway node. Currently in public objection and environmental review phase. No tenders issued yet.',
    'AP R&B Infrastructure Cell',
    'https://infrastructure.ap.gov.in/proposals/kuppam-bypass',
    false,
    NULL,
    NULL,
    NULL,
    'approved',
    NOW() - INTERVAL '6 days'
),
(
    '66666666-6666-6666-6666-666666666604',
    NULL,
    'Nellore',
    'Trunk Road',
    'news',
    'District Central Library Launches 24/7 Digital Reading Room',
    'district-central-library-24-7-digital-room',
    'The historic District Central Library on Trunk Road has officially opened its high-speed digital research terminal room. Equipped with 40 computer stations providing complimentary access to JSTOR, National Digital Library of India, and state competitive exam question archives.',
    'District Collectorate Press Release',
    'https://spsrnellore.ap.gov.in/press/library-upgrade',
    true,
    NULL,
    NULL,
    NULL,
    'approved',
    NOW() - INTERVAL '1 day'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    source_name = EXCLUDED.source_name,
    source_url = EXCLUDED.source_url,
    is_confirmed_fact = EXCLUDED.is_confirmed_fact,
    event_date = EXCLUDED.event_date,
    event_time = EXCLUDED.event_time,
    event_venue = EXCLUDED.event_venue,
    moderation_status = EXCLUDED.moderation_status;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. SEED STUDENT CORNER (Opportunities with Anti-Scam Verification)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO student_opportunities (
    id, tenant_id, city, opportunity_type, title, slug, provider_name,
    description, eligibility, deadline, apply_url, contact_phone, discount_percent, stipend_amount,
    moderation_status, created_at
) VALUES
(
    '77777777-7777-7777-7777-777777777701',
    '33333333-3333-3333-3333-333333333301',
    'Nellore',
    'internship',
    'Embedded Systems & IoT Firmware Engineering Internship',
    'embedded-systems-iot-internship-nellore',
    'Narayana Centre for Embedded Technologies',
    'Three-month hands-on hardware internship working on RTOS-based telemetry sensors and MQTT microcontrollers for regional aquaculture automation. Applicants must never pay any fee.',
    'Pre-final and final year B.Tech students in ECE, EEE, or CSE with working knowledge of C/C++ or Rust.',
    CURRENT_DATE + 28,
    'https://www.necn.ac.in/careers/iot-internship',
    '+91-861-2313842',
    NULL,
    'INR 12,000/month',
    'approved',
    NOW() - INTERVAL '2 days'
),
(
    '77777777-7777-7777-7777-777777777702',
    NULL,
    'Nellore',
    'scholarship',
    'Nellore Coastal District Higher Education Merit Fellowship',
    'nellore-coastal-district-merit-fellowship',
    'District Welfare & Higher Education Department',
    'Direct state government education stipend providing full tuition waiver and textbook grants for deserving degree and engineering candidates from rural mandals.',
    'Annual family income under INR 2,50,000; Minimum 75% score in Intermediate (10+2) board examinations.',
    CURRENT_DATE + 45,
    'https://jnanabhumi.ap.gov.in/fellowships/nellore',
    '+91-861-2330100',
    NULL,
    'Full Tuition + INR 10,000 allowance',
    'approved',
    NOW() - INTERVAL '4 days'
),
(
    '77777777-7777-7777-7777-777777777703',
    NULL,
    'Nellore',
    'student_hostel',
    'Sri Balaji Verified Student Residency (Boys & Girls Blocks)',
    'sri-balaji-verified-student-residency',
    'Sri Balaji Educational Residences',
    'Police-verified, CCTV-monitored accommodation located 300 meters from coaching centers on Trunk Road. Provides vegetarian meals, RO drinking water, backup power inverter, and dedicated study tables.',
    'Valid college ID or coaching admission card mandatory at enrollment.',
    NULL,
    'https://sribalajihostels.local',
    '+91-9440889900',
    NULL,
    NULL,
    'approved',
    NOW() - INTERVAL '1 day'
),
(
    '77777777-7777-7777-7777-777777777704',
    '33333333-3333-3333-3333-333333333302',
    'Nellore',
    'student_discount',
    'Student Academic Book & Stationery 20% Privilege Card',
    'student-book-stationery-discount-nellore',
    'Minerva Bookstore & Study Cafe',
    'Walk in with any recognized student ID card to receive instant 20% off technical textbooks, drawing instruments, and exam guides.',
    'Present current valid student ID at billing counter.',
    CURRENT_DATE + 60,
    '',
    '+91-861-2321455',
    20,
    NULL,
    'approved',
    NOW() - INTERVAL '3 days'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    provider_name = EXCLUDED.provider_name,
    description = EXCLUDED.description,
    eligibility = EXCLUDED.eligibility,
    deadline = EXCLUDED.deadline,
    apply_url = EXCLUDED.apply_url,
    contact_phone = EXCLUDED.contact_phone,
    discount_percent = EXCLUDED.discount_percent,
    stipend_amount = EXCLUDED.stipend_amount,
    moderation_status = EXCLUDED.moderation_status;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. SEED ENQUIRIES (Leads for Dashboard Demo)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO enquiries (
    id, tenant_id, listing_id, inquirer_name, inquirer_phone, inquirer_email,
    enquiry_type, message, status, created_at
) VALUES
(
    '88888888-8888-8888-8888-888888888801',
    '33333333-3333-3333-3333-333333333301',
    '55555555-5555-5555-5555-555555555501',
    'Ramesh Varma',
    '+91-9876543210',
    'ramesh.v@gmail.com',
    'admission',
    'Requesting information regarding B.Tech CSE management quota seats, fee structure, and hostel accommodation for academic year 2026-27.',
    'open',
    NOW() - INTERVAL '3 hours'
),
(
    '88888888-8888-8888-8888-888888888802',
    '33333333-3333-3333-3333-333333333301',
    '55555555-5555-5555-5555-555555555501',
    'Kavitha Reddy',
    '+91-9123456789',
    'kavitha.reddy@yahoo.com',
    'course_fee',
    'Do you offer lateral entry for diploma holders in AI & Data Science? Please share the syllabus and tuition details.',
    'responded',
    NOW() - INTERVAL '1 day'
),
(
    '88888888-8888-8888-8888-888888888803',
    '33333333-3333-3333-3333-333333333302',
    '55555555-5555-5555-5555-555555555502',
    'Siddharth M.',
    '+91-9988771122',
    'siddharth.m@outlook.com',
    'general_availability',
    'Looking for 3 copies of Standard Mechanical Engineering Handbook by Shigley (11th Edition). Are they currently in stock?',
    'open',
    NOW() - INTERVAL '5 hours'
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. SEED DATED OFFERS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO offers (
    id, tenant_id, listing_id, title, discount_details, valid_until, is_student_exclusive
) VALUES
(
    '99999999-9999-9999-9999-999999999901',
    '33333333-3333-3333-3333-333333333302',
    '55555555-5555-5555-5555-555555555502',
    'Semester Exam Study Pass',
    'Unlimited high-speed Wi-Fi and designated quiet desk access between 08:00 and 21:00 for INR 499/month with valid student ID.',
    NOW() + INTERVAL '30 days',
    true
)
ON CONFLICT (id) DO NOTHING;
