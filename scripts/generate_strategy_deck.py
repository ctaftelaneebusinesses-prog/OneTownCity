#!/usr/bin/env python3
"""
Generate OneTownCity Executive Strategy & SaaS Execution Deck (.pptx)
Follows Swiss Civic Editorial typography, 16:9 widescreen, custom shape cards,
metric callouts, table ledgers, zero emojis, high-contrast monochrome + vermilion.
"""

import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

# ── Color Palette: Swiss Civic Editorial ─────────────────────────────────────
INK_PRIMARY   = RGBColor(0x11, 0x11, 0x10)  # #111110 Dark Carbon Ink
INK_SECONDARY = RGBColor(0x57, 0x55, 0x51)  # #575551 Secondary Neutral
INK_MUTED     = RGBColor(0x8B, 0x87, 0x7F)  # #8B877F Muted Caption
CANVAS        = RGBColor(0xF4, 0xF2, 0xEE)  # #F4F2EE Editorial Off-white
CANVAS_WHITE  = RGBColor(0xFF, 0xFF, 0xFF)  # #FFFFFF Pure Surface
BORDER_GRID   = RGBColor(0xD8, 0xD3, 0xC8)  # #D8D3C8 Hairline Border
ACCENT_SIGNAL = RGBColor(0xFF, 0x4F, 0x17)  # #FF4F17 Signal Vermilion
ACCENT_GREEN  = RGBColor(0x0D, 0x68, 0x47)  # #0D6847 Verified Forest Green
ACCENT_AMBER  = RGBColor(0xD9, 0x77, 0x06)  # #D97706 Proposal Amber

FONT_TITLE = "Georgia"
FONT_BODY  = "Arial"
FONT_MONO  = "Courier New"

def create_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    def set_slide_background(slide, color):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = color

    def add_header(slide, kicker, title, dark=False):
        # Kicker / Category tag
        tx_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.4))
        tf = tx_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = kicker.upper()
        p.font.name = FONT_MONO
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = ACCENT_SIGNAL if dark else ACCENT_SIGNAL

        # Main Title
        tx_title = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.7), Inches(0.7))
        tf_t = tx_title.text_frame
        tf_t.word_wrap = True
        tf_t.margin_left = tf_t.margin_top = tf_t.margin_right = tf_t.margin_bottom = 0
        p_t = tf_t.paragraphs[0]
        p_t.text = title
        p_t.font.name = FONT_TITLE
        p_t.font.size = Pt(24)
        p_t.font.bold = True
        p_t.font.color.rgb = RGBColor(0xF4, 0xF2, 0xEE) if dark else INK_PRIMARY

    def add_card(slide, left, top, width, height, bg_color=CANVAS_WHITE, border_color=BORDER_GRID):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        if border_color:
            shape.line.color.rgb = border_color
            shape.line.width = Pt(1)
        else:
            shape.line.fill.background()
        return shape

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 1: Title Slide (Dark Editorial)
    # ═════════════════════════════════════════════════════════════════════════
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, INK_PRIMARY)

    # Decorative top bar
    bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.2), Inches(0.5), Inches(0.08))
    bar.fill.solid()
    bar.fill.fore_color.rgb = ACCENT_SIGNAL
    bar.line.fill.background()

    # Title box
    tbox = s1.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.5), Inches(3.2))
    tf1 = tbox.text_frame
    tf1.word_wrap = True

    p = tf1.paragraphs[0]
    p.text = "ONETOWNCITY"
    p.font.name = FONT_MONO
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_SIGNAL

    p2 = tf1.add_paragraph()
    p2.text = "Master Product Strategy &\nHyperlocal SaaS Execution Plan"
    p2.font.name = FONT_TITLE
    p2.font.size = Pt(40)
    p2.font.bold = True
    p2.font.color.rgb = RGBColor(0xF4, 0xF2, 0xEE)
    p2.space_before = Pt(14)

    p3 = tf1.add_paragraph()
    p3.text = "The Verified Academic, Civic & Commercial Operating System for Tier-2 & Tier-3 Regional Hubs"
    p3.font.name = FONT_BODY
    p3.font.size = Pt(15)
    p3.font.color.rgb = INK_MUTED
    p3.space_before = Pt(12)

    # 4 Meta Badges at bottom
    badges = [
        ("PILOT TOWNS", "Nellore & Kuppam, AP"),
        ("CORE STACK", "Rust Axum + PostgreSQL + Next.js"),
        ("DATA PRINCIPLE", "Zero Emojis · 100% Verified"),
        ("RELEASE DATE", "November 2026 Production"),
    ]
    for i, (k, v) in enumerate(badges):
        b_left = Inches(0.8 + i * 2.95)
        add_card(s1, b_left, Inches(5.4), Inches(2.8), Inches(1.2), RGBColor(0x1A, 0x1A, 0x18), RGBColor(0x33, 0x33, 0x30))
        tb = s1.shapes.add_textbox(b_left + Inches(0.15), Inches(5.55), Inches(2.5), Inches(0.9))
        tf = tb.text_frame
        p = tf.paragraphs[0]
        p.text = k
        p.font.name = FONT_MONO
        p.font.size = Pt(9)
        p.font.bold = True
        p.font.color.rgb = ACCENT_SIGNAL
        p_sub = tf.add_paragraph()
        p_sub.text = v
        p_sub.font.name = FONT_BODY
        p_sub.font.size = Pt(12)
        p_sub.font.bold = True
        p_sub.font.color.rgb = RGBColor(0xF4, 0xF2, 0xEE)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 2: Google Search & Maps Gap in Tier-2/3 Towns
    # ═════════════════════════════════════════════════════════════════════════
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2, CANVAS)
    add_header(s2, "Market Opportunity / Structural Deficiencies", "The Google Maps & Local Search Failure in Regional India")

    points = [
        ("Ghost & Unverified Listings", "Over 45% of Google Maps local business listings in Tier-2/3 towns contain defunct phone numbers, permanently closed storefronts, or outdated operating hours. Nobody audits physical reality."),
        ("Zero Academic Workflows", "Colleges and engineering institutions on Google Maps are merely pin drops. There are zero structured admission schedules, zero course fee ranges, zero facility accreditation details, and zero direct lead forms."),
        ("Rampant Student Scams", "Unregulated job aggregators demand upfront 'registration charges' and 'security deposits' from rural graduates. Google search offers zero anti-scam consumer protection enforcement."),
        ("No Civic Development Context", "Citizens cannot verify whether municipal announcements (flyovers, water lines, highway expansions) are confirmed government orders or mere political proposals with no source link.")
    ]
    for i, (head, desc) in enumerate(points):
        col = i % 2
        row = i // 2
        c_left = Inches(0.8 + col * 5.95)
        c_top = Inches(1.8 + row * 2.5)
        add_card(s2, c_left, c_top, Inches(5.75), Inches(2.25))

        tb = s2.shapes.add_textbox(c_left + Inches(0.3), c_top + Inches(0.25), Inches(5.15), Inches(1.75))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"0{i+1} / {head.upper()}"
        p.font.name = FONT_MONO
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = ACCENT_SIGNAL

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.name = FONT_BODY
        p2.font.size = Pt(12)
        p2.font.color.rgb = INK_SECONDARY
        p2.space_before = Pt(8)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 3: The 4 Strategic Verticals
    # ═════════════════════════════════════════════════════════════════════════
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3, CANVAS)
    add_header(s3, "Product Scope / Strict Boundaries", "The Four Strategic Verticals & Permanent Exclusions")

    verts = [
        ("NEWS & TOWN PULSE", "news", "Verified civic updates, 6-pillar community calendar, and municipal development tracker strictly separating CONFIRMED FACT from PROPOSAL with official government sources."),
        ("EDUCATION HUB", "education", "Engineering, degree, and polytechnic colleges with accredited course catalogs, verified fee structures, admission timelines, and direct enquiry routing."),
        ("STUDENT CORNER", "students", "Internships, merit scholarships, campus recruitment drives, verified student hostels, and student discounts. Strict zero-fee consumer protection."),
        ("LOCAL BUSINESSES", "business", "Authenticated commercial storefronts, study cafes, bookstores, and clinics with consented WhatsApp links, operating hours, and verified dated passes.")
    ]
    for i, (v_name, v_slug, v_desc) in enumerate(verts):
        left = Inches(0.8 + i * 2.95)
        add_card(s3, left, Inches(1.8), Inches(2.8), Inches(3.8))
        tb = s3.shapes.add_textbox(left + Inches(0.2), Inches(2.0), Inches(2.4), Inches(3.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"VERTICAL 0{i+1}"
        p.font.name = FONT_MONO
        p.font.size = Pt(9)
        p.font.bold = True
        p.font.color.rgb = ACCENT_SIGNAL

        p_t = tf.add_paragraph()
        p_t.text = v_name
        p_t.font.name = FONT_MONO
        p_t.font.size = Pt(13)
        p_t.font.bold = True
        p_t.font.color.rgb = INK_PRIMARY
        p_t.space_before = Pt(4)

        p_d = tf.add_paragraph()
        p_d.text = v_desc
        p_d.font.name = FONT_BODY
        p_d.font.size = Pt(11)
        p_d.font.color.rgb = INK_SECONDARY
        p_d.space_before = Pt(8)

    # Exclusions Banner at bottom
    add_card(s3, Inches(0.8), Inches(5.85), Inches(11.7), Inches(1.0), INK_PRIMARY, None)
    tb_ex = s3.shapes.add_textbox(Inches(1.1), Inches(5.95), Inches(11.1), Inches(0.8))
    tf_ex = tb_ex.text_frame
    tf_ex.word_wrap = True
    p = tf_ex.paragraphs[0]
    p.text = "PERMANENT SCOPE EXCLUSIONS (STRICT NON-NEGOTIABLE)"
    p.font.name = FONT_MONO
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = ACCENT_SIGNAL
    p2 = tf_ex.add_paragraph()
    p2.text = "Zero plumbing, electrician, handyman repair broadcasts, multi-provider quotes, or residential/commercial real estate brokerage listings. OneTownCity is strictly an academic, civic, student, and local retail infrastructure platform."
    p2.font.name = FONT_BODY
    p2.font.size = Pt(11)
    p2.font.color.rgb = RGBColor(0xF4, 0xF2, 0xEE)
    p2.space_before = Pt(3)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 4: Trust & Verification Architecture
    # ═════════════════════════════════════════════════════════════════════════
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4, CANVAS)
    add_header(s4, "Governance & Integrity / Editorial Moat", "The Three-Tier Verification Engine & Freshness Protocol")

    pillars = [
        ("ZERO PAID VERIFICATION", "Uncompromised Trust", "Verification badges (Owner Claimed, Details Reviewed) can NEVER be purchased. They are strictly earned through document audit, telephone verification, and physical inspection. Paid SaaS subscriptions only grant lead quotas and sponsored search ranking, never verification credibility."),
        ("ANTI-SCAM STUDENT PROMISE", "Consumer Protection Guarantee", "Every internship, scholarship, and campus drive listed on OneTownCity strictly enforces a Zero Application Fee rule. Any organization attempting to solicit registration money or security fees from students is immediately banned and reported to local authorities."),
        ("30-DAY FRESHNESS GUARANTEE", "Continuous Audit Cadence", "Institutions and storefronts must reconfirm their phone, operating hours, and fee structure every 30 days via our 1-click dashboard reconfirmation. Listings exceeding 30 days without reconfirmation are demoted from top search ranking.")
    ]
    for i, (title, sub, body) in enumerate(pillars):
        left = Inches(0.8 + i * 3.95)
        add_card(s4, left, Inches(1.8), Inches(3.8), Inches(4.8))
        tb = s4.shapes.add_textbox(left + Inches(0.25), Inches(2.05), Inches(3.3), Inches(4.3))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"PILLAR 0{i+1}"
        p.font.name = FONT_MONO
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = ACCENT_SIGNAL

        p_t = tf.add_paragraph()
        p_t.text = title
        p_t.font.name = FONT_TITLE
        p_t.font.size = Pt(15)
        p_t.font.bold = True
        p_t.font.color.rgb = INK_PRIMARY
        p_t.space_before = Pt(4)

        p_s = tf.add_paragraph()
        p_s.text = sub
        p_s.font.name = FONT_MONO
        p_s.font.size = Pt(10)
        p_s.font.bold = True
        p_s.font.color.rgb = ACCENT_GREEN
        p_s.space_before = Pt(2)

        p_b = tf.add_paragraph()
        p_b.text = body
        p_b.font.name = FONT_BODY
        p_b.font.size = Pt(12)
        p_b.font.color.rgb = INK_SECONDARY
        p_b.space_before = Pt(10)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 5: Hyperlocal SaaS Monetization & Unit Economics
    # ═════════════════════════════════════════════════════════════════════════
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5, CANVAS)
    add_header(s5, "Monetization Model / Multi-Tenant SaaS", "Subscription Tiers, Lead Quotas & High-Intent Unit Economics")

    plans = [
        ("COMMUNITY FREE", "INR 0 / mo", "5 verified leads/mo", "Basic verified profile, public phone & WhatsApp, standard search visibility.", INK_SECONDARY),
        ("GROWTH BUSINESS", "INR 499 / mo", "25 verified leads/mo", "Local bookstores, study cafes, clinics. Consented WhatsApp desk, 1 featured category placement, lead inbox.", ACCENT_AMBER),
        ("EDUCATION PRO", "INR 1,499 / mo", "50 verified leads/mo", "Colleges & coaching academies. Structured admissions timeline, course fee lead tracking, multi-seat dashboard.", ACCENT_SIGNAL),
        ("CAMPUS ENTERPRISE", "INR 4,999 / mo", "200 verified leads/mo", "Autonomous universities & engineering campuses. Sponsored homepage placement, hackathon drive publishing, API CRM routing.", ACCENT_GREEN)
    ]
    for i, (name, price, quota, features, color) in enumerate(plans):
        left = Inches(0.8 + i * 2.95)
        add_card(s5, left, Inches(1.8), Inches(2.8), Inches(4.8))
        tb = s5.shapes.add_textbox(left + Inches(0.2), Inches(2.05), Inches(2.4), Inches(4.3))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = name
        p.font.name = FONT_MONO
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = color

        p_pr = tf.add_paragraph()
        p_pr.text = price
        p_pr.font.name = FONT_TITLE
        p_pr.font.size = Pt(20)
        p_pr.font.bold = True
        p_pr.font.color.rgb = INK_PRIMARY
        p_pr.space_before = Pt(6)

        p_q = tf.add_paragraph()
        p_q.text = quota
        p_q.font.name = FONT_MONO
        p_q.font.size = Pt(10)
        p_q.font.bold = True
        p_q.font.color.rgb = INK_MUTED
        p_q.space_before = Pt(2)

        p_f = tf.add_paragraph()
        p_f.text = features
        p_f.font.name = FONT_BODY
        p_f.font.size = Pt(11)
        p_f.font.color.rgb = INK_SECONDARY
        p_f.space_before = Pt(14)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 6: 10 Core PMF & Quality Metrics
    # ═════════════════════════════════════════════════════════════════════════
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6, CANVAS)
    add_header(s6, "Telemetry & Operational Rigor / City Admin Dashboard", "The Ten Core Product-Market Fit & Quality Metrics")

    metrics_list = [
        ("01 / Search Success Rate", ">= 80%", "Weekly", "Queries leading to clicked action or valid results."),
        ("02 / Contact Action Rate", ">= 15%", "Weekly", "Total phone calls + WhatsApp clicks per profile view."),
        ("03 / Enquiry Completion Rate", ">= 70%", "Weekly", "Admission & service requests marked 'responded' in inbox."),
        ("04 / Avg Listing Completeness", ">= 85%", "Monthly", "Weighted score: fee ranges, hours, maps, Telugu alias."),
        ("05 / 30-Day Freshness Rate", ">= 80%", "Monthly", "% of listings reconfirmed by owners within 30 days."),
        ("06 / Repeat Session Rate", ">= 30%", "Monthly", "% of residents returning within a 14-day window."),
        ("07 / Median Provider Response", "<= 6 Hours", "Weekly", "Time taken by college or merchant to reply to lead."),
        ("08 / Report Resolution Time", "<= 48 Hours", "Weekly", "Median turnaround for City Admin resolving citizen flags."),
        ("09 / Indexable Page Corpus", ">= 200 Pages", "Monthly", "SEO canonical pages: approved listings, news, opps."),
        ("10 / Active Tenant Retention", ">= 85%", "Monthly", "% of paid organizations updating profiles & viewing leads.")
    ]
    for i, (m_name, target, cadence, desc) in enumerate(metrics_list):
        col = i % 5
        row = i // 5
        c_left = Inches(0.8 + col * 2.37)
        c_top = Inches(1.8 + row * 2.5)
        add_card(s6, c_left, c_top, Inches(2.25), Inches(2.3))

        tb = s6.shapes.add_textbox(c_left + Inches(0.15), c_top + Inches(0.15), Inches(1.95), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = m_name.upper()
        p.font.name = FONT_MONO
        p.font.size = Pt(8.5)
        p.font.bold = True
        p.font.color.rgb = ACCENT_SIGNAL

        p_t = tf.add_paragraph()
        p_t.text = target
        p_t.font.name = FONT_TITLE
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = INK_PRIMARY
        p_t.space_before = Pt(4)

        p_c = tf.add_paragraph()
        p_c.text = f"Cadence: {cadence}"
        p_c.font.name = FONT_MONO
        p_c.font.size = Pt(8.5)
        p_c.font.color.rgb = ACCENT_GREEN
        p_c.space_before = Pt(2)

        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.name = FONT_BODY
        p_d.font.size = Pt(9.5)
        p_d.font.color.rgb = INK_SECONDARY
        p_d.space_before = Pt(4)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 7: Technical Monorepo Architecture
    # ═════════════════════════════════════════════════════════════════════════
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7, INK_PRIMARY)
    add_header(s7, "System Architecture / Local-First Production", "Modular Monolith Stack & 6 SaaS Domain Boundaries", dark=True)

    tech_layers = [
        ("FRONTEND LAYER", "Next.js 16 App Router", "Server & client components, Tailwind CSS, Framer Motion spring physics, bilingual EN|TE switcher, zero emojis, high-density Swiss typography."),
        ("API BACKEND", "Rust + Axum 0.7 / 0.8", "Tokio asynchronous runtime, compile-time verified SQLx 0.8 queries, tenant membership extractor, audit worker, sub-5ms response latencies."),
        ("DATABASE ENGINE", "PostgreSQL 16 Local", "Multi-tenant tables, tsvector generated search columns with English + Telugu trigram GIN indexes, 0-100 completeness triggers."),
        ("DOMAIN BOUNDARIES", "6 Core SaaS Modules", "Directory (Listings & News), Identity (RBAC), Tenancy (Orgs & Memberships), Monetization (Plans & Quotas), Engagement (Leads & Offers), Governance (Moderation & Reports).")
    ]
    for i, (layer, tech, desc) in enumerate(tech_layers):
        left = Inches(0.8 + i * 2.95)
        add_card(s7, left, Inches(1.8), Inches(2.8), Inches(4.8), RGBColor(0x1A, 0x1A, 0x18), RGBColor(0x33, 0x33, 0x30))
        tb = s7.shapes.add_textbox(left + Inches(0.2), Inches(2.05), Inches(2.4), Inches(4.3))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = layer
        p.font.name = FONT_MONO
        p.font.size = Pt(9)
        p.font.bold = True
        p.font.color.rgb = ACCENT_SIGNAL

        p_t = tf.add_paragraph()
        p_t.text = tech
        p_t.font.name = FONT_TITLE
        p_t.font.size = Pt(14)
        p_t.font.bold = True
        p_t.font.color.rgb = RGBColor(0xF4, 0xF2, 0xEE)
        p_t.space_before = Pt(4)

        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.name = FONT_BODY
        p_d.font.size = Pt(11)
        p_d.font.color.rgb = INK_MUTED
        p_d.space_before = Pt(10)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 8: 30-Day Town Pilot Rollout Roadmap
    # ═════════════════════════════════════════════════════════════════════════
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8, CANVAS)
    add_header(s8, "Operational Playbook / Execution Milestones", "30-Day Town Pilot Rollout & Expansion Roadmap")

    phases = [
        ("WEEK 01 / DAYS 1 — 7", "Civic Foundation & Ground Truth", "Deploy municipal helpline database (hospitals, police desks, women safety counters). Seed 30+ top engineering colleges and study cafes in Nellore and Kuppam. Verify physical addresses and phone lines."),
        ("WEEK 02 / DAYS 8 — 15", "Merchant & Institution Claims", "Conduct in-person onboarding with bookstore owners, coaching academies, and clinics. Facilitate ownership claims on /claim/[slug] and enable consented WhatsApp lead desks."),
        ("WEEK 03 / DAYS 16 — 23", "Campus Activation & Student Hub", "Partner with Student Student Unions to publish regional hackathons, merit scholarships, and verified hostel listings. Enforce mandatory anti-scam consumer protection notices."),
        ("WEEK 04 / DAYS 24 — 30", "PMF Audit & Multi-Town Scaling", "Review live telemetry against the 10 PMF metrics (Search Success >= 80%, Completeness >= 85%, Retention >= 85%). Activate paid SaaS plan billing for colleges and expand to adjacent AP towns.")
    ]
    for i, (wk, title, details) in enumerate(phases):
        left = Inches(0.8 + i * 2.95)
        add_card(s8, left, Inches(1.8), Inches(2.8), Inches(4.8))
        tb = s8.shapes.add_textbox(left + Inches(0.2), Inches(2.05), Inches(2.4), Inches(4.3))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = wk
        p.font.name = FONT_MONO
        p.font.size = Pt(9)
        p.font.bold = True
        p.font.color.rgb = ACCENT_SIGNAL

        p_t = tf.add_paragraph()
        p_t.text = title
        p_t.font.name = FONT_TITLE
        p_t.font.size = Pt(14)
        p_t.font.bold = True
        p_t.font.color.rgb = INK_PRIMARY
        p_t.space_before = Pt(4)

        p_d = tf.add_paragraph()
        p_d.text = details
        p_d.font.name = FONT_BODY
        p_d.font.size = Pt(11)
        p_d.font.color.rgb = INK_SECONDARY
        p_d.space_before = Pt(10)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 9: Regional Linguistic Moat & Bilingual FTS
    # ═════════════════════════════════════════════════════════════════════════
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9, CANVAS)
    add_header(s9, "Linguistic Defensibility / Regional Inclusivity", "Bilingual English-Telugu Experience & Trigram Search Moat")

    features = [
        ("NATIVE TELUGU LABELS", "Every category, public service helpline, and town event carries verified Telugu script alongside English (e.g. నెల్లూరు ఇంజనీరింగ్ కళాశాలలు)."),
        ("PHONETIC & ALIAS SEARCH", "Residents searching with local colloquial names or Telugu spellings hit fuzzy trigram and tsvector indexes without dead ends."),
        ("PERSISTENT TOWN SELECTOR", "One-click switching between pilot towns (Nellore and Kuppam) dynamically updates all feeds, event dates, and emergency desk numbers."),
        ("AUTONOMOUS ZERO-RESULT SUGGESTIONS", "When a resident searches for an unindexed merchant or campus, the engine triggers an instant prefilled /submit workflow for community contribution.")
    ]
    for i, (head, desc) in enumerate(features):
        col = i % 2
        row = i // 2
        c_left = Inches(0.8 + col * 5.95)
        c_top = Inches(1.8 + row * 2.5)
        add_card(s9, c_left, c_top, Inches(5.75), Inches(2.25))

        tb = s9.shapes.add_textbox(c_left + Inches(0.3), c_top + Inches(0.25), Inches(5.15), Inches(1.75))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = head
        p.font.name = FONT_MONO
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = ACCENT_SIGNAL

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.name = FONT_BODY
        p2.font.size = Pt(12)
        p2.font.color.rgb = INK_SECONDARY
        p2.space_before = Pt(8)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 10: Executive Summary & Governance Charter
    # ═════════════════════════════════════════════════════════════════════════
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10, INK_PRIMARY)
    add_header(s10, "Executive Conclusion / Strategic Vision", "OneTownCity: The Defensible Regional Hyperlocal Moat", dark=True)

    points_summary = [
        ("STRUCTURAL DEFENSIBILITY", "Global platforms cannot afford physical on-the-ground verification in 5,000 Tier-2/3 Indian towns. OneTownCity's high-craft civic verification network creates an insurmountable trust barrier."),
        ("HIGH-VALUE CONVERSIONS", "Instead of commoditized repair clicks, our monetization captures high-ticket engineering admissions (INR 1.5L - 4L/student) and sustained retail student discount engagement."),
        ("AUTONOMOUS SCALABILITY", "Built with local-first Rust and PostgreSQL performance, a single low-spec VM handles hundreds of towns with sub-10ms response times and zero cloud vendor lock-in.")
    ]
    for i, (title, text) in enumerate(points_summary):
        top = Inches(1.8 + i * 1.65)
        add_card(s10, Inches(0.8), top, Inches(11.7), Inches(1.4), RGBColor(0x1A, 0x1A, 0x18), RGBColor(0x33, 0x33, 0x30))
        tb = s10.shapes.add_textbox(Inches(1.1), top + Inches(0.18), Inches(11.1), Inches(1.0))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = f"PILLAR 0{i+1} / {title}"
        p.font.name = FONT_MONO
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = ACCENT_SIGNAL

        p2 = tf.add_paragraph()
        p2.text = text
        p2.font.name = FONT_BODY
        p2.font.size = Pt(12)
        p2.font.color.rgb = RGBColor(0xF4, 0xF2, 0xEE)
        p2.space_before = Pt(4)

    output_path = "OneTownCity_Product_Strategy_and_SaaS_Execution.pptx"
    prs.save(output_path)
    print(f"[SUCCESS] Executive Strategy Deck saved to: {output_path}")

if __name__ == "__main__":
    create_deck()
