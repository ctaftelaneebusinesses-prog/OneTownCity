// scripts/security_audit_test.mjs
// Comprehensive Security & Reliability Verification Suite for OneTownCity Phase B

const BASE_URL = process.env.API_BASE || "http://127.0.0.1:8080/api/v1";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

async function testSqlInjectionResilience() {
  console.log("\n--- TEST: SQL Injection Resilience ---");
  const sqliPayload = "' OR '1'='1' --";
  const res = await fetch(`${BASE_URL}/listings?q=${encodeURIComponent(sqliPayload)}`);
  assert(res.status === 200, `SQLi search payload handled safely with HTTP 200 (got ${res.status})`);
  const data = await res.json();
  assert(Array.isArray(data), "Returned valid JSON array without database syntax errors");
}

async function testDangerousUrlRejection() {
  console.log("\n--- TEST: Input Validation & Dangerous URL Rejection ---");
  
  // Test javascript: in opportunity apply_url
  const res = await fetch(`${BASE_URL}/saas/opportunities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": "22222222-2222-2222-2222-222222222204",
      "x-tenant-persona": "education",
    },
    body: JSON.stringify({
      opportunity_type: "internship",
      title: "Cyber Security Trainee",
      provider_name: "Nellore Institute",
      description: "Hands-on vulnerability assessments for engineering students.",
      apply_url: "javascript:alert(document.cookie)",
    }),
  });

  assert(res.status === 400, `Prohibited javascript: URL rejected with HTTP 400 (got ${res.status})`);
  const err = await res.json();
  assert(
    err.error && err.error.includes("Prohibited or dangerous URL scheme"),
    `Clear error message returned: "${err.error}"`
  );
}

async function testEnquiryInputValidation() {
  console.log("\n--- TEST: Public Enquiry Length and Phone Validation ---");
  // Test invalid phone and short name
  const res = await fetch(`${BASE_URL}/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      listing_id: "00000000-0000-0000-0000-000000000001",
      inquirer_name: "X", // too short
      inquirer_phone: "abc-invalid",
      enquiry_type: "admission",
      message: "Short",
    }),
  });

  assert(res.status === 400, `Invalid enquiry rejected with HTTP 400 (got ${res.status})`);
  const err = await res.json();
  assert(
    err.error && err.error.includes("Inquirer name must be at least 2 characters"),
    `Clear validation error returned: "${err.error}"`
  );
}

async function testCrossTenantIsolation() {
  console.log("\n--- TEST: Strict Tenant Scoping (IDOR Protection) ---");
  // Fetch real leads for education tenant
  const leadsRes = await fetch(`${BASE_URL}/saas/leads`, {
    headers: {
      "x-user-id": "22222222-2222-2222-2222-222222222204",
      "x-tenant-persona": "education",
    },
  });
  
  if (leadsRes.ok) {
    const leads = await leadsRes.json();
    if (leads.length > 0) {
      const targetLeadId = leads[0].id;
      // Attempt to mutate this lead using Business tenant persona / credentials
      const breachAttempt = await fetch(`${BASE_URL}/saas/leads/${targetLeadId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "22222222-2222-2222-2222-222222222205", // Business owner
          "x-tenant-persona": "business",
        },
        body: JSON.stringify({ status: "responded" }),
      });

      assert(
        breachAttempt.status === 404,
        `Cross-tenant lead status mutation blocked with HTTP 404 Not Found (got ${breachAttempt.status})`
      );
    }
  }
}

async function testRateLimiting() {
  console.log("\n--- TEST: In-Memory Bounded Rate Limiting (Token Bucket) ---");
  const results = [];
  // Send 13 rapid requests to auth login
  for (let i = 0; i < 13; i++) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "nonexistent@onetowncity.local",
        password: "WrongPassword123!",
      }),
    });
    results.push(res.status);
  }

  const rateLimitedCount = results.filter((s) => s === 429).length;
  assert(
    rateLimitedCount > 0,
    `Token bucket rate limiter triggered: ${rateLimitedCount}/13 requests received HTTP 429 (Too Many Requests)`
  );
}

async function testSecurityAndCacheHeaders() {
  console.log("\n--- TEST: HTTP Security & Cache-Control Headers ---");
  const publicRes = await fetch(`${BASE_URL}/listings`);
  
  assert(
    publicRes.headers.get("x-content-type-options") === "nosniff",
    `X-Content-Type-Options: nosniff present`
  );
  assert(
    publicRes.headers.get("x-frame-options") === "DENY",
    `X-Frame-Options: DENY present`
  );
  assert(
    publicRes.headers.get("referrer-policy") === "strict-origin-when-cross-origin",
    `Referrer-Policy: strict-origin-when-cross-origin present`
  );
  
  const publicCache = publicRes.headers.get("cache-control");
  assert(
    publicCache && publicCache.includes("public"),
    `Public endpoints have public cache header: "${publicCache}"`
  );

  const saasRes = await fetch(`${BASE_URL}/saas/dashboard`, {
    headers: {
      "x-user-id": "22222222-2222-2222-2222-222222222204",
      "x-tenant-persona": "education",
    },
  });
  const saasCache = saasRes.headers.get("cache-control");
  assert(
    saasCache && saasCache.includes("no-store"),
    `Sensitive SaaS portal endpoints have strict no-store cache header: "${saasCache}"`
  );
}

async function runAll() {
  console.log("=== ONETOWNCITY SECURITY & RELIABILITY AUDIT ===");
  try {
    await testSqlInjectionResilience();
    await testDangerousUrlRejection();
    await testEnquiryInputValidation();
    await testCrossTenantIsolation();
    await testRateLimiting();
    await testSecurityAndCacheHeaders();
  } catch (err) {
    console.error("Test execution error:", err);
    failed++;
  }

  console.log("\n===============================================");
  console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("===============================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAll();
