-- Migration: 202610300003_add_anti_scam_and_categories.sql
-- Add anti_scam_acknowledged flag to student opportunities and add missing business subcategories

ALTER TABLE student_opportunities 
ADD COLUMN IF NOT EXISTS anti_scam_acknowledged BOOLEAN NOT NULL DEFAULT true;

-- Additional business categories for legacy healthcare, dining, and transit entities
INSERT INTO categories (id, vertical, slug, name, description, icon, display_order)
VALUES 
    ('44444444-4444-4444-4444-444444444414', 'business', 'healthcare-clinics', 'Hospitals, Clinics & Pharmacies', 'Hospitals, diagnostic clinics, emergency medical centers, and pharmacies', 'stethoscope', 7),
    ('44444444-4444-4444-4444-444444444415', 'business', 'dining-cafes', 'Restaurants, Bakeries & Dining', 'Family restaurants, bakeries, cafes, and dining outlets', 'utensils', 8),
    ('44444444-4444-4444-4444-444444444416', 'business', 'transport-mobility', 'Transport & Transit Services', 'Bus depots, private transit operators, logistics, and taxi services', 'bus', 9)
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name,
    description = EXCLUDED.description;
