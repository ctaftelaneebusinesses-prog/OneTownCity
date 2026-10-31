---
name: nextjs-shadcn-seo
description: Build high-speed Next.js App Router public SEO pages and multi-tenant SaaS owner dashboards with editorial light-and-plum design system.
---
1. Render public discovery pages (News, Education, Student Hub, Businesses) on the server with clean canonical URLs and explicit "Last Confirmed" dates.
2. Display transparent verification badges (`not_verified`, `owner_claimed`, `details_reviewed`) and never label a paid placement as organic.
3. Enforce the OneTownCity bespoke architectural color system:
   - Primary Canvas Background (`--bg-canvas`): `#DDE3E8` (Cool Alabaster Slate)
   - Elevated Card & Modal Surface (`--bg-surface`): `#F8FAFC` (Crisp Paper White)
   - Primary Brand & Deep Anchor (`--brand-plum`): `#3A0F34` (Imperial Plum)
   - Deep Hover / Footer Surface (`--brand-plum-dark`): `#240820` (Midnight Mulberry)
   - Primary Accent & Highlight (`--brand-gold`): `#EAAA00` (Marigold Gold)
   - Primary Ink (`--text-primary`): `#1E081B`
   - Secondary Muted Text (`--text-secondary`): `#5E4B5B`
   - Structural Hairline Border (`--border-subtle`): `#C3CDD6` (`1px` crisp borders)
   - Semantic Trust / Verified (`--status-verified`): `#0D6E52` (Civic Emerald)
   - Semantic Warning / Report (`--status-warning`): `#B93829`
4. Use tabular monospace metadata (`font-mono`, `font-mono-numbers`) for dates, fee ranges, quotas, and verification badges.
5. Zero emojis anywhere in the UI or code; use Lucide SVG icons with `1.75px` stroke width.
