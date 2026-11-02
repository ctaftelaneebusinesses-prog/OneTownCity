export default function ArchitecturePage() {
  return (
    <div style={{ backgroundColor: '#F4F2EE', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: '#111110',
          color: '#F4F2EE',
          padding: '48px 32px',
          borderBottom: '1px solid rgba(244,242,238,0.08)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              fontSize: '11px',
              color: 'rgba(244,242,238,0.4)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            System Architecture / Interactive Map
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: 'clamp(32px, 5vw, 52px)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              marginTop: 12,
              fontWeight: 400,
              color: '#F4F2EE',
            }}
          >
            OneTownCity
            <br />
            Monorepo Architecture
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans, system-ui, sans-serif)',
              fontSize: 14,
              color: 'rgba(244,242,238,0.6)',
              marginTop: 16,
              maxWidth: '60ch',
              lineHeight: 1.6,
              margin: '16px 0 0 0',
            }}
          >
            Six multi-tenant SaaS domains. Rust + Axum API. PostgreSQL 16 with FTS. Next.js App Router
            frontend. Local-first compilation.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px' }}>

        {/* Section 1: Civic Verification Pipeline */}
        <section style={{ marginBottom: 64 }}>
          <h2
            style={{
              fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              fontSize: '11px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#8B877F',
              marginBottom: 24,
              fontWeight: 400,
            }}
          >
            01 — Civic Verification Pipeline
          </h2>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #D8D3C8',
              padding: '40px 32px',
              overflowX: 'auto',
            }}
          >
            <svg
              viewBox="0 0 900 200"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '100%', maxWidth: 900, display: 'block', margin: '0 auto' }}
              aria-label="Civic Verification Pipeline diagram"
            >
              {/* SUBMITTED */}
              <rect x="10" y="70" width="140" height="60" rx="2" fill="#111110" />
              <text x="80" y="97" textAnchor="middle" fill="#F4F2EE" fontSize="11" fontFamily="'JetBrains Mono', monospace" fontWeight="600">SUBMITTED</text>
              <text x="80" y="113" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">content.status = submitted</text>

              {/* Arrow 1 */}
              <line x1="150" y1="100" x2="200" y2="100" stroke="#FF4F17" strokeWidth="2" markerEnd="url(#arrowOrange)" />

              {/* SOURCE AUDITED */}
              <rect x="200" y="70" width="160" height="60" rx="2" fill="#111110" />
              <text x="280" y="97" textAnchor="middle" fill="#F4F2EE" fontSize="11" fontFamily="'JetBrains Mono', monospace" fontWeight="600">SOURCE AUDITED</text>
              <text x="280" y="113" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">source_link verified</text>

              {/* Arrow 2 */}
              <line x1="360" y1="100" x2="410" y2="100" stroke="#FF4F17" strokeWidth="2" markerEnd="url(#arrowOrange)" />

              {/* PENDING REVIEW */}
              <rect x="410" y="70" width="160" height="60" rx="2" fill="#111110" />
              <text x="490" y="97" textAnchor="middle" fill="#F4F2EE" fontSize="11" fontFamily="'JetBrains Mono', monospace" fontWeight="600">PENDING REVIEW</text>
              <text x="490" y="113" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">moderation queue</text>

              {/* Arrow to CONFIRMED */}
              <line x1="570" y1="85" x2="640" y2="55" stroke="#FF4F17" strokeWidth="2" markerEnd="url(#arrowOrange)" />
              {/* Arrow to PROPOSAL */}
              <line x1="570" y1="115" x2="640" y2="145" stroke="#FF4F17" strokeWidth="2" markerEnd="url(#arrowOrange)" />

              {/* CONFIRMED FACT */}
              <rect x="640" y="20" width="150" height="50" rx="2" fill="#0D6847" />
              <text x="715" y="42" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontFamily="'JetBrains Mono', monospace" fontWeight="600">CONFIRMED FACT</text>
              <text x="715" y="58" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="9" fontFamily="'JetBrains Mono', monospace">is_confirmed_fact = true</text>

              {/* PROPOSAL */}
              <rect x="640" y="120" width="150" height="50" rx="2" fill="#D97706" />
              <text x="715" y="142" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontFamily="'JetBrains Mono', monospace" fontWeight="600">PROPOSAL</text>
              <text x="715" y="158" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="9" fontFamily="'JetBrains Mono', monospace">is_confirmed_fact = false</text>

              {/* NEEDS CHANGES - rejected path */}
              <rect x="640" y="70" width="110" height="30" rx="2" fill="rgba(17,17,16,0.12)" stroke="#D8D3C8" strokeWidth="1" />
              <text x="695" y="89" textAnchor="middle" fill="#575551" fontSize="9" fontFamily="'JetBrains Mono', monospace">NEEDS CHANGES</text>

              {/* Arrow markers */}
              <defs>
                <marker id="arrowOrange" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#FF4F17" />
                </marker>
              </defs>
            </svg>
          </div>
        </section>

        {/* Section 2: 6-Domain SaaS Architecture */}
        <section style={{ marginBottom: 64 }}>
          <h2
            style={{
              fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              fontSize: '11px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#8B877F',
              marginBottom: 24,
              fontWeight: 400,
            }}
          >
            02 — Six-Domain SaaS Architecture
          </h2>

          <div
            style={{
              backgroundColor: '#111110',
              border: '1px solid #D8D3C8',
              padding: '40px 32px',
              overflowX: 'auto',
            }}
          >
            <svg
              viewBox="0 0 900 500"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '100%', maxWidth: 900, display: 'block', margin: '0 auto' }}
              aria-label="Six-Domain SaaS Architecture diagram"
            >
              {/* Stack layer: Next.js */}
              <rect x="10" y="10" width="880" height="55" rx="2" fill="rgba(244,242,238,0.04)" stroke="#D8D3C8" strokeWidth="1" />
              <text x="50" y="38" fill="#F4F2EE" fontSize="12" fontFamily="'JetBrains Mono', monospace" fontWeight="600">Next.js App Router</text>
              <text x="50" y="54" fill="rgba(244,242,238,0.4)" fontSize="9" fontFamily="'JetBrains Mono', monospace">/ (Discovery) · /dashboard (Tenant SaaS) · /admin (Moderation) · /architecture (This Page)</text>

              {/* Arrow down to API */}
              <line x1="445" y1="65" x2="445" y2="90" stroke="#FF4F17" strokeWidth="1.5" markerEnd="url(#arrowOrangeArch)" />

              {/* Rust/Axum API */}
              <rect x="10" y="90" width="880" height="55" rx="2" fill="rgba(255,79,23,0.08)" stroke="#FF4F17" strokeWidth="1" />
              <text x="50" y="118" fill="#FF4F17" fontSize="12" fontFamily="'JetBrains Mono', monospace" fontWeight="600">Rust + Axum 0.7 API</text>
              <text x="50" y="134" fill="rgba(244,242,238,0.4)" fontSize="9" fontFamily="'JetBrains Mono', monospace">127.0.0.1:8080 · SQLx 0.8 · Tokio · Tower middleware · Tenant membership extractor</text>

              {/* Arrow down to DB */}
              <line x1="445" y1="145" x2="445" y2="170" stroke="#FF4F17" strokeWidth="1.5" markerEnd="url(#arrowOrangeArch)" />

              {/* PostgreSQL */}
              <rect x="10" y="170" width="880" height="55" rx="2" fill="rgba(13,104,71,0.12)" stroke="#0D6847" strokeWidth="1" />
              <text x="50" y="198" fill="#0D6847" fontSize="12" fontFamily="'JetBrains Mono', monospace" fontWeight="600">PostgreSQL 16</text>
              <text x="50" y="214" fill="rgba(244,242,238,0.4)" fontSize="9" fontFamily="'JetBrains Mono', monospace">onetowncity_saas · tsvector FTS columns · GIN indexes · Docker Compose local</text>

              {/* 6 Domain boxes */}
              {/* Row of 6 domains */}
              {/* Directory */}
              <rect x="10" y="260" width="135" height="100" rx="2" fill="#111110" stroke="#D8D3C8" strokeWidth="1" />
              <text x="78" y="283" textAnchor="middle" fill="#F4F2EE" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="600">DIRECTORY</text>
              <line x1="20" y1="290" x2="135" y2="290" stroke="rgba(216,211,200,0.3)" strokeWidth="0.5" />
              <text x="78" y="305" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">listings</text>
              <text x="78" y="319" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">news_items</text>
              <text x="78" y="333" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">student_opps</text>
              <text x="78" y="347" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">categories</text>

              {/* Identity */}
              <rect x="155" y="260" width="135" height="100" rx="2" fill="#111110" stroke="#D8D3C8" strokeWidth="1" />
              <text x="222" y="283" textAnchor="middle" fill="#F4F2EE" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="600">IDENTITY</text>
              <line x1="165" y1="290" x2="280" y2="290" stroke="rgba(216,211,200,0.3)" strokeWidth="0.5" />
              <text x="222" y="305" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">users</text>
              <text x="222" y="319" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">super_admin</text>
              <text x="222" y="333" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">city_admin</text>
              <text x="222" y="347" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">tenant_owner</text>

              {/* Tenancy */}
              <rect x="300" y="260" width="135" height="100" rx="2" fill="#111110" stroke="#D8D3C8" strokeWidth="1" />
              <text x="367" y="283" textAnchor="middle" fill="#F4F2EE" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="600">TENANCY</text>
              <line x1="310" y1="290" x2="425" y2="290" stroke="rgba(216,211,200,0.3)" strokeWidth="0.5" />
              <text x="367" y="305" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">organizations</text>
              <text x="367" y="319" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">memberships</text>
              <text x="367" y="333" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">tenant_id</text>
              <text x="367" y="347" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">server-derived</text>

              {/* Monetization */}
              <rect x="445" y="260" width="135" height="100" rx="2" fill="#111110" stroke="#D8D3C8" strokeWidth="1" />
              <text x="512" y="283" textAnchor="middle" fill="#F4F2EE" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="600">MONETIZATION</text>
              <line x1="455" y1="290" x2="570" y2="290" stroke="rgba(216,211,200,0.3)" strokeWidth="0.5" />
              <text x="512" y="305" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">saas_plans</text>
              <text x="512" y="319" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">lead_quotas</text>
              <text x="512" y="333" textAnchor="middle" fill="#D97706" fontSize="8" fontFamily="'JetBrains Mono', monospace">is_sponsored</text>
              <text x="512" y="347" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">free/growth/pro</text>

              {/* Engagement */}
              <rect x="590" y="260" width="135" height="100" rx="2" fill="#111110" stroke="#D8D3C8" strokeWidth="1" />
              <text x="657" y="283" textAnchor="middle" fill="#F4F2EE" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="600">ENGAGEMENT</text>
              <line x1="600" y1="290" x2="715" y2="290" stroke="rgba(216,211,200,0.3)" strokeWidth="0.5" />
              <text x="657" y="305" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">enquiries</text>
              <text x="657" y="319" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">click_events</text>
              <text x="657" y="333" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">offers</text>
              <text x="657" y="347" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">whatsapp/call</text>

              {/* Governance */}
              <rect x="735" y="260" width="155" height="100" rx="2" fill="#111110" stroke="#D8D3C8" strokeWidth="1" />
              <text x="812" y="283" textAnchor="middle" fill="#F4F2EE" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="600">GOVERNANCE</text>
              <line x1="745" y1="290" x2="880" y2="290" stroke="rgba(216,211,200,0.3)" strokeWidth="0.5" />
              <text x="812" y="305" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">moderation_queue</text>
              <text x="812" y="319" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">issue_reports</text>
              <text x="812" y="333" textAnchor="middle" fill="#0D6847" fontSize="8" fontFamily="'JetBrains Mono', monospace">verified/claimed</text>
              <text x="812" y="347" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">details_reviewed</text>

              {/* Connecting lines from DB to domains */}
              <line x1="78" y1="225" x2="78" y2="260" stroke="rgba(216,211,200,0.3)" strokeWidth="1" />
              <line x1="222" y1="225" x2="222" y2="260" stroke="rgba(216,211,200,0.3)" strokeWidth="1" />
              <line x1="367" y1="225" x2="367" y2="260" stroke="rgba(216,211,200,0.3)" strokeWidth="1" />
              <line x1="512" y1="225" x2="512" y2="260" stroke="rgba(216,211,200,0.3)" strokeWidth="1" />
              <line x1="657" y1="225" x2="657" y2="260" stroke="rgba(216,211,200,0.3)" strokeWidth="1" />
              <line x1="812" y1="225" x2="812" y2="260" stroke="rgba(216,211,200,0.3)" strokeWidth="1" />
              <line x1="10" y1="225" x2="890" y2="225" stroke="rgba(216,211,200,0.2)" strokeWidth="0.5" />

              {/* Seed Data label */}
              <rect x="350" y="390" width="200" height="36" rx="2" fill="rgba(244,242,238,0.04)" stroke="rgba(216,211,200,0.4)" strokeWidth="1" />
              <text x="450" y="411" textAnchor="middle" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">seed.sql — Nellore realistic data</text>
              <text x="450" y="424" textAnchor="middle" fill="rgba(244,242,238,0.3)" fontSize="8" fontFamily="'JetBrains Mono', monospace">Engineering Colleges · Cafes · Hackathons · Internships</text>

              <defs>
                <marker id="arrowOrangeArch" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#FF4F17" />
                </marker>
              </defs>
            </svg>
          </div>
        </section>

        {/* Section 3: API Endpoints Table */}
        <section style={{ marginBottom: 64 }}>
          <h2
            style={{
              fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              fontSize: '11px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#8B877F',
              marginBottom: 24,
              fontWeight: 400,
            }}
          >
            03 — API Endpoint Reference
          </h2>

          <div style={{ border: '1px solid #D8D3C8', backgroundColor: '#FFFFFF', overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#111110' }}>
                  <th
                    style={{
                      padding: '12px 20px',
                      textAlign: 'left',
                      fontSize: '10px',
                      color: 'rgba(244,242,238,0.4)',
                      fontWeight: 400,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      width: '80px',
                    }}
                  >
                    Method
                  </th>
                  <th
                    style={{
                      padding: '12px 20px',
                      textAlign: 'left',
                      fontSize: '10px',
                      color: 'rgba(244,242,238,0.4)',
                      fontWeight: 400,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Endpoint
                  </th>
                  <th
                    style={{
                      padding: '12px 20px',
                      textAlign: 'left',
                      fontSize: '10px',
                      color: 'rgba(244,242,238,0.4)',
                      fontWeight: 400,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Description
                  </th>
                  <th
                    style={{
                      padding: '12px 20px',
                      textAlign: 'left',
                      fontSize: '10px',
                      color: 'rgba(244,242,238,0.4)',
                      fontWeight: 400,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      width: '100px',
                    }}
                  >
                    Auth
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    method: 'GET',
                    endpoint: '/api/v1/listings',
                    desc: 'Public directory search with full-text search across Education and Business',
                    auth: 'Public',
                    methodColor: '#0D6847',
                  },
                  {
                    method: 'GET',
                    endpoint: '/api/v1/news',
                    desc: 'Town pulse and civic news feed with verification status',
                    auth: 'Public',
                    methodColor: '#0D6847',
                  },
                  {
                    method: 'GET',
                    endpoint: '/api/v1/students/opportunities',
                    desc: 'Student hub: internships, scholarships, hackathons, discount passes',
                    auth: 'Public',
                    methodColor: '#0D6847',
                  },
                  {
                    method: 'POST',
                    endpoint: '/api/v1/enquiries',
                    desc: 'Submit enquiry: admission request, course enquiry, business availability',
                    auth: 'Public',
                    methodColor: '#FF4F17',
                  },
                  {
                    method: 'GET',
                    endpoint: '/api/v1/saas/dashboard',
                    desc: 'Tenant owner dashboard: profile views, lead quota, WhatsApp clicks',
                    auth: 'Tenant',
                    methodColor: '#0D6847',
                  },
                  {
                    method: 'PATCH',
                    endpoint: '/api/v1/saas/leads/:id/status',
                    desc: 'Update lead status within plan quota; gated by monthly lead allowance',
                    auth: 'Tenant',
                    methodColor: '#D97706',
                  },
                  {
                    method: 'GET',
                    endpoint: '/api/v1/admin/moderation',
                    desc: 'City admin moderation queue: pending submissions and issue reports',
                    auth: 'Admin',
                    methodColor: '#0D6847',
                  },
                  {
                    method: 'POST',
                    endpoint: '/api/v1/admin/verify/:id',
                    desc: 'Set verification status: not_verified, owner_claimed, details_reviewed',
                    auth: 'Admin',
                    methodColor: '#FF4F17',
                  },
                ].map((row, i) => (
                  <tr
                    key={row.endpoint}
                    style={{
                      borderTop: '1px solid #EAE6DF',
                      backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F4F2EE',
                    }}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: row.methodColor,
                          letterSpacing: '0.04em',
                          fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                        }}
                      >
                        {row.method}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <code
                        style={{
                          fontSize: '12px',
                          color: '#111110',
                          fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                        }}
                      >
                        {row.endpoint}
                      </code>
                    </td>
                    <td
                      style={{
                        padding: '14px 20px',
                        fontSize: '13px',
                        color: '#575551',
                        lineHeight: 1.5,
                        fontFamily: 'system-ui, sans-serif',
                      }}
                    >
                      {row.desc}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '9px',
                          letterSpacing: '0.05em',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          border: '1px solid #D8D3C8',
                          color: '#8B877F',
                          fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                        }}
                      >
                        {row.auth}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Database Schema Diagram */}
        <section style={{ marginBottom: 64 }}>
          <h2
            style={{
              fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              fontSize: '11px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#8B877F',
              marginBottom: 24,
              fontWeight: 400,
            }}
          >
            04 — Database Schema Overview
          </h2>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #D8D3C8',
              padding: '40px 32px',
              overflowX: 'auto',
            }}
          >
            <svg
              viewBox="0 0 900 480"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '100%', maxWidth: 900, display: 'block', margin: '0 auto' }}
              aria-label="Database schema diagram"
            >
              {/* Helper: table box component rendered manually */}

              {/* organizations */}
              <rect x="10" y="10" width="180" height="130" rx="2" fill="#111110" />
              <rect x="10" y="10" width="180" height="30" rx="2" fill="#FF4F17" />
              <text x="100" y="29" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontFamily="'JetBrains Mono', monospace" fontWeight="600">organizations</text>
              <text x="24" y="60" fill="rgba(244,242,238,0.8)" fontSize="9" fontFamily="'JetBrains Mono', monospace">id UUID PK</text>
              <text x="24" y="76" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">name TEXT</text>
              <text x="24" y="92" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">org_type (business|edu)</text>
              <text x="24" y="108" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">town TEXT</text>
              <text x="24" y="124" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">plan saas_plan_enum</text>

              {/* memberships */}
              <rect x="210" y="10" width="180" height="110" rx="2" fill="#111110" />
              <rect x="210" y="10" width="180" height="30" rx="2" fill="#111110" stroke="#D8D3C8" strokeWidth="1" />
              <rect x="210" y="10" width="180" height="30" rx="2" fill="rgba(255,79,23,0.15)" />
              <text x="300" y="29" textAnchor="middle" fill="#F4F2EE" fontSize="11" fontFamily="'JetBrains Mono', monospace" fontWeight="600">memberships</text>
              <text x="224" y="60" fill="rgba(244,242,238,0.8)" fontSize="9" fontFamily="'JetBrains Mono', monospace">id UUID PK</text>
              <text x="224" y="76" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">user_id UUID FK</text>
              <text x="224" y="92" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">org_id UUID FK</text>
              <text x="224" y="108" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">role user_role_enum</text>

              {/* FK line: memberships -> organizations */}
              <line x1="210" y1="65" x2="190" y2="65" stroke="#D8D3C8" strokeWidth="1" strokeDasharray="3,2" />

              {/* listings */}
              <rect x="410" y="10" width="200" height="160" rx="2" fill="#111110" />
              <rect x="410" y="10" width="200" height="30" rx="2" fill="#0D6847" />
              <text x="510" y="29" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontFamily="'JetBrains Mono', monospace" fontWeight="600">listings</text>
              <text x="424" y="60" fill="rgba(244,242,238,0.8)" fontSize="9" fontFamily="'JetBrains Mono', monospace">id UUID PK</text>
              <text x="424" y="76" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">org_id UUID FK</text>
              <text x="424" y="92" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">category listing_category</text>
              <text x="424" y="108" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">name TEXT</text>
              <text x="424" y="124" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">fts_vector tsvector</text>
              <text x="424" y="140" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">verification_state</text>
              <text x="424" y="156" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">is_sponsored BOOL</text>

              {/* FK line: listings -> organizations */}
              <line x1="410" y1="76" x2="390" y2="76" stroke="#D8D3C8" strokeWidth="1" strokeDasharray="3,2" />
              <line x1="390" y1="76" x2="390" y2="55" stroke="#D8D3C8" strokeWidth="1" strokeDasharray="3,2" />
              <line x1="390" y1="55" x2="300" y2="55" stroke="#D8D3C8" strokeWidth="1" strokeDasharray="3,2" />
              <line x1="300" y1="55" x2="300" y2="10" stroke="#D8D3C8" strokeWidth="1" strokeDasharray="3,2" />

              {/* news_items */}
              <rect x="630" y="10" width="200" height="145" rx="2" fill="#111110" />
              <rect x="630" y="10" width="200" height="30" rx="2" fill="#0D6847" />
              <text x="730" y="29" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontFamily="'JetBrains Mono', monospace" fontWeight="600">news_items</text>
              <text x="644" y="60" fill="rgba(244,242,238,0.8)" fontSize="9" fontFamily="'JetBrains Mono', monospace">id UUID PK</text>
              <text x="644" y="76" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">title TEXT</text>
              <text x="644" y="92" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">is_confirmed_fact BOOL</text>
              <text x="644" y="108" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">source_link TEXT</text>
              <text x="644" y="124" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">fts_vector tsvector</text>
              <text x="644" y="140" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">last_updated_at TIMESTAMPTZ</text>

              {/* student_opportunities */}
              <rect x="10" y="200" width="200" height="145" rx="2" fill="#111110" />
              <rect x="10" y="200" width="200" height="30" rx="2" fill="#0D6847" />
              <text x="110" y="219" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontFamily="'JetBrains Mono', monospace" fontWeight="600">student_opportunities</text>
              <text x="24" y="250" fill="rgba(244,242,238,0.8)" fontSize="9" fontFamily="'JetBrains Mono', monospace">id UUID PK</text>
              <text x="24" y="266" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">opp_type opportunity_type</text>
              <text x="24" y="282" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">title TEXT</text>
              <text x="24" y="298" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">anti_scam_notice BOOL</text>
              <text x="24" y="314" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">deadline DATE</text>
              <text x="24" y="330" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">fts_vector tsvector</text>

              {/* enquiries */}
              <rect x="230" y="200" width="180" height="160" rx="2" fill="#111110" />
              <rect x="230" y="200" width="180" height="30" rx="2" fill="rgba(255,79,23,0.15)" stroke="#FF4F17" strokeWidth="1" />
              <text x="320" y="219" textAnchor="middle" fill="#FF4F17" fontSize="11" fontFamily="'JetBrains Mono', monospace" fontWeight="600">enquiries</text>
              <text x="244" y="250" fill="rgba(244,242,238,0.8)" fontSize="9" fontFamily="'JetBrains Mono', monospace">id UUID PK</text>
              <text x="244" y="266" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">listing_id UUID FK</text>
              <text x="244" y="282" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">submitter_name TEXT</text>
              <text x="244" y="298" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">phone TEXT</text>
              <text x="244" y="314" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">message TEXT</text>
              <text x="244" y="330" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">status lead_status</text>
              <text x="244" y="346" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">created_at TIMESTAMPTZ</text>

              {/* FK line: enquiries -> listings */}
              <line x1="410" y1="120" x2="410" y2="270" stroke="#D8D3C8" strokeWidth="1" strokeDasharray="3,2" />
              <line x1="410" y1="270" x2="410" y2="266" stroke="#D8D3C8" strokeWidth="1" strokeDasharray="3,2" />

              {/* saas_plans */}
              <rect x="430" y="200" width="190" height="130" rx="2" fill="#111110" />
              <rect x="430" y="200" width="190" height="30" rx="2" fill="rgba(217,119,6,0.2)" stroke="#D97706" strokeWidth="1" />
              <text x="525" y="219" textAnchor="middle" fill="#D97706" fontSize="11" fontFamily="'JetBrains Mono', monospace" fontWeight="600">saas_plans</text>
              <text x="444" y="250" fill="rgba(244,242,238,0.8)" fontSize="9" fontFamily="'JetBrains Mono', monospace">id UUID PK</text>
              <text x="444" y="266" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">plan_name TEXT</text>
              <text x="444" y="282" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">monthly_lead_quota INT</text>
              <text x="444" y="298" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">featured_placements INT</text>
              <text x="444" y="314" fill="rgba(244,242,238,0.5)" fontSize="9" fontFamily="'JetBrains Mono', monospace">price_inr_monthly INT</text>

              {/* GIN index callout */}
              <rect x="640" y="200" width="220" height="80" rx="2" fill="rgba(13,104,71,0.08)" stroke="#0D6847" strokeWidth="1" />
              <text x="750" y="220" textAnchor="middle" fill="#0D6847" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="600">GIN Indexes (FTS)</text>
              <text x="654" y="240" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">idx_listings_fts ON listings(fts_vector)</text>
              <text x="654" y="256" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">idx_news_fts ON news_items(fts_vector)</text>
              <text x="654" y="272" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">idx_opps_fts ON student_opportunities</text>

              {/* Legend */}
              <rect x="640" y="300" width="220" height="80" rx="2" fill="rgba(244,242,238,0.04)" stroke="rgba(216,211,200,0.3)" strokeWidth="1" />
              <text x="750" y="320" textAnchor="middle" fill="rgba(244,242,238,0.4)" fontSize="9" fontFamily="'JetBrains Mono', monospace" fontWeight="600">LEGEND</text>
              <rect x="654" y="330" width="12" height="8" rx="1" fill="#0D6847" />
              <text x="672" y="338" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">Directory tables</text>
              <rect x="654" y="348" width="12" height="8" rx="1" fill="#FF4F17" />
              <text x="672" y="356" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">Engagement / action</text>
              <rect x="654" y="366" width="12" height="8" rx="1" fill="#D97706" />
              <text x="672" y="374" fill="rgba(244,242,238,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">Monetization</text>
            </svg>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            borderTop: '1px solid #D8D3C8',
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              fontSize: '10px',
              color: '#8B877F',
              letterSpacing: '0.04em',
            }}
          >
            OneTownCity — Monorepo Architecture Reference
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              fontSize: '10px',
              color: '#8B877F',
              letterSpacing: '0.04em',
            }}
          >
            Rust + Axum 0.7 · SQLx 0.8 · PostgreSQL 16 · Next.js App Router
          </span>
        </footer>
      </div>
    </div>
  );
}
