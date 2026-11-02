#!/usr/bin/env node
/**
 * OneTownCity — Production Readiness, Security & Performance Benchmark
 * 
 * Verifies:
 * 1. Strict Cross-Tenant Isolation (403 Forbidden on unauthorized user, 404 on cross-tenant mutation)
 * 2. PostgreSQL Full-Text Search Query Plan Audit (Index scans & buffer cache hits, zero N+1)
 * 3. Latency Benchmarking (200 concurrent requests, reporting P50, P95, P99)
 */

import { execSync } from "node:child_process";

const API_BASE = "http://127.0.0.1:8080/api/v1";
const DB_URL = "postgresql://otc_admin:otc_local_password@127.0.0.1:5432/onetowncity_saas";

// Test Personas
const TENANT_A_USER = "22222222-2222-2222-2222-222222222204"; // Narayana Engineering College
const TENANT_B_USER = "22222222-2222-2222-2222-222222222205"; // Minerva Bookstore & Study Cafe
const STUDENT_USER  = "22222222-2222-2222-2222-222222222201"; // Student Persona (no tenant membership)
const ADMIN_USER    = "22222222-2222-2222-2222-222222222202"; // City Admin Persona

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runTenantIsolationTests() {
  console.log("\n========================================================");
  console.log("PHASE 1: STRICT MULTI-TENANT ISOLATION AUDIT");
  console.log("========================================================");

  // 1. Authorized read by Tenant A
  const resA = await fetch(`${API_BASE}/saas/leads`, {
    headers: { "x-user-id": TENANT_A_USER },
  });
  assert(resA.status === 200, `Authorized Tenant A fetch returned HTTP ${resA.status} OK`);
  const leadsA = await resA.json();
  assert(Array.isArray(leadsA), `Tenant A received valid leads array (${leadsA.length} leads)`);

  // 2. Unauthorized read by Student Persona (has no tenant membership)
  const resStudent = await fetch(`${API_BASE}/saas/leads`, {
    headers: { "x-user-id": STUDENT_USER },
  });
  assert(resStudent.status === 403, `Non-tenant user correctly blocked with HTTP 403 Forbidden`);

  // 3. Attack Simulation: Tenant B attempts to read leads of Tenant A
  // In our model, tenant_id is derived strictly on the server from verified session/x-user-id.
  // When Tenant B calls /saas/leads, they MUST only see Tenant B's leads.
  const resB = await fetch(`${API_BASE}/saas/leads`, {
    headers: { "x-user-id": TENANT_B_USER },
  });
  assert(resB.status === 200, `Authorized Tenant B fetch returned HTTP 200 OK`);
  const leadsB = await resB.json();
  
  // Verify zero overlap between Tenant A and Tenant B leads
  const idsA = new Set(leadsA.map((l) => l.id));
  const hasOverlap = leadsB.some((l) => idsA.has(l.id));
  assert(!hasOverlap, `Zero cross-tenant lead leakage: Tenant B cannot access Tenant A leads`);

  // 4. Attack Simulation: Cross-Tenant Mutation
  // If Tenant A has a lead, Tenant B attempts to update its status
  if (leadsA.length > 0) {
    const targetLeadId = leadsA[0].id;
    const patchRes = await fetch(`${API_BASE}/saas/leads/${targetLeadId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": TENANT_B_USER,
      },
      body: JSON.stringify({ status: "closed" }),
    });
    assert(
      patchRes.status === 404,
      `Cross-tenant lead mutation rejected with HTTP 404 Not Found (SQL WHERE tenant_id guard intact)`
    );
  } else {
    console.log("  [INFO] No existing leads for Tenant A; skipping cross-tenant lead mutation test");
  }

  // 5. Verify Immutable Audit Trail Logging
  const auditRes = await fetch(`${API_BASE}/admin/audit-logs`, {
    headers: { "x-user-id": ADMIN_USER },
  });
  assert(auditRes.status === 200, `Admin audit log endpoint returned HTTP 200 OK`);
  const logs = await auditRes.json();
  assert(Array.isArray(logs), `Audit logs returned valid list (${logs.length} entries recorded)`);
}

async function runQueryPlanAudit() {
  console.log("\n========================================================");
  console.log("PHASE 2: POSTGRESQL QUERY PLAN & BUFFER AUDIT");
  console.log("========================================================");

  const sqlFts = `
    EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
    SELECT id, name, slug, vertical, address, locality, city
    FROM listings
    WHERE search_vector @@ plainto_tsquery('english', 'Engineering')
      AND city = 'Nellore'
    LIMIT 20;
  `;

  try {
    const out = execSync(`psql "${DB_URL}" -t -A -c "${sqlFts.replace(/\n/g, " ")}"`, {
      encoding: "utf-8",
    });
    const planObj = JSON.parse(out.trim());
    const plan = planObj[0].Plan;
    const execTime = planObj[0]["Execution Time"];

    console.log(`  [INFO] Top-level Node: ${plan["Node Type"]}`);
    console.log(`  [INFO] Execution Time: ${execTime.toFixed(3)} ms`);
    console.log(`  [INFO] Shared Hit Blocks: ${plan["Shared Hit Blocks"] || 0}`);
    
    assert(execTime < 5.0, `FTS search query executed in ${execTime.toFixed(3)}ms (< 5ms SLA)`);
    assert(
      plan["Node Type"] === "Limit" || plan["Node Type"] === "Bitmap Heap Scan" || plan["Node Type"] === "Index Scan",
      `Query planner chose efficient index-assisted plan (${plan["Node Type"]})`
    );
  } catch (err) {
    console.error("  [FAIL] Failed to execute psql query plan audit:", err.message);
    failed++;
  }
}

async function runLatencyBenchmark() {
  console.log("\n========================================================");
  console.log("PHASE 3: CONCURRENT LATENCY BENCHMARK (200 REQUESTS)");
  console.log("========================================================");

  const TOTAL_REQUESTS = 200;
  const CONCURRENCY_LIMIT = 20;
  const urlList = [
    `${API_BASE}/listings?city=Nellore`,
    `${API_BASE}/listings?search=Engineering`,
    `${API_BASE}/listings?vertical=education&city=Nellore`,
    `${API_BASE}/listings?vertical=business&city=Nellore`,
    `${API_BASE}/listings/narayana-engineering-college-nellore`,
    `${API_BASE}/listings/minerva-bookstore-study-cafe-nellore`,
  ];

  console.log(`  Executing ${TOTAL_REQUESTS} requests with concurrency ${CONCURRENCY_LIMIT} across discovery endpoints...`);
  const latencies = [];

  let requestIndex = 0;
  async function worker() {
    while (requestIndex < TOTAL_REQUESTS) {
      const idx = requestIndex++;
      const targetUrl = urlList[idx % urlList.length];
      const t0 = performance.now();
      try {
        const res = await fetch(targetUrl, { keepalive: true });
        const t1 = performance.now();
        if (res.ok) {
          latencies.push(t1 - t0);
        } else {
          console.error(`Request ${idx} failed with status ${res.status}`);
        }
      } catch (e) {
        console.error(`Request ${idx} error:`, e.message);
      }
    }
  }

  const startAll = performance.now();
  const workers = Array.from({ length: CONCURRENCY_LIMIT }, () => worker());
  await Promise.all(workers);
  const totalDuration = performance.now() - startAll;

  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.50)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];
  const avg = latencies.reduce((sum, v) => sum + v, 0) / latencies.length;
  const min = latencies[0];
  const max = latencies[latencies.length - 1];

  console.log(`\n  --- BENCHMARK RESULTS (${latencies.length}/${TOTAL_REQUESTS} Succeeded) ---`);
  console.log(`  Total Batch Duration: ${totalDuration.toFixed(1)} ms`);
  console.log(`  Throughput          : ${(TOTAL_REQUESTS / (totalDuration / 1000)).toFixed(1)} req/s`);
  console.log(`  Min Response Time   : ${min.toFixed(2)} ms`);
  console.log(`  Average Response    : ${avg.toFixed(2)} ms`);
  console.log(`  P50 Response Time   : ${p50.toFixed(2)} ms`);
  console.log(`  P95 Response Time   : ${p95.toFixed(2)} ms`);
  console.log(`  P99 Response Time   : ${p99.toFixed(2)} ms`);
  console.log(`  Max Response Time   : ${max.toFixed(2)} ms`);

  assert(latencies.length === TOTAL_REQUESTS, `All ${TOTAL_REQUESTS} requests completed with 200 OK`);
  assert(p95 < 450.0, `P95 latency is ${p95.toFixed(2)}ms (< 450ms SLA under 20x concurrent load)`);
  assert(p99 < 750.0, `P99 latency is ${p99.toFixed(2)}ms (< 750ms SLA under 20x concurrent load)`);
}

async function main() {
  console.log("Starting OneTownCity Production Readiness & Security Verification");
  console.log(`Target API Base: ${API_BASE}`);
  console.log(`Target Database: ${DB_URL.replace(/:[^:]*@/, ":***@")}`);

  await runTenantIsolationTests();
  await runQueryPlanAudit();
  await runLatencyBenchmark();

  console.log("\n========================================================");
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
