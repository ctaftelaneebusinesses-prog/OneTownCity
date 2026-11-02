import { chromium } from "../frontend/node_modules/playwright/index.mjs";

const API_BASE = "http://127.0.0.1:8080/api/v1";
const WEB_BASE = "http://127.0.0.1:3000";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    failed++;
    throw new Error(message);
  } else {
    console.log(`[PASS] ${message}`);
    passed++;
  }
}

async function runApiVerification() {
  console.log("\n--- PART 1: API & TELEMETRY VERIFICATION ---");

  // 1. Check Homepage Endpoint
  const resHome = await fetch(`${API_BASE}/homepage?town=Nellore`);
  assert(resHome.ok, "GET /api/v1/homepage?town=Nellore returns 200 OK");
  const homeData = await resHome.json();
  assert(homeData.town === "Nellore", "Homepage returns town = Nellore");
  assert(Array.isArray(homeData.popular_categories) && homeData.popular_categories.length > 0, "Homepage contains popular categories");
  assert(Array.isArray(homeData.happening_this_week) && homeData.happening_this_week.length > 0, "Homepage contains happening this week events");
  assert(Array.isArray(homeData.public_services) && homeData.public_services.length > 0, "Homepage contains public services");
  assert(homeData.stats && typeof homeData.stats.total_verified_listings === "number", "Homepage contains stats object");

  // 2. Check 10 PMF Metrics Endpoint
  const resMetrics = await fetch(`${API_BASE}/admin/metrics`);
  assert(resMetrics.ok, "GET /api/v1/admin/metrics returns 200 OK");
  const metrics = await resMetrics.json();
  assert(typeof metrics.search_success_rate_pct === "number", "PMF Metric 1: search_success_rate_pct is numeric");
  assert(typeof metrics.contact_action_rate_pct === "number", "PMF Metric 2: contact_action_rate_pct is numeric");
  assert(typeof metrics.enquiry_completion_rate_pct === "number", "PMF Metric 3: enquiry_completion_rate_pct is numeric");
  assert(typeof metrics.avg_listing_completeness_pct === "number", "PMF Metric 4: avg_listing_completeness_pct is numeric");
  assert(typeof metrics.freshness_30d_rate_pct === "number", "PMF Metric 5: freshness_30d_rate_pct is numeric");
  assert(typeof metrics.repeat_session_rate_pct === "number", "PMF Metric 6: repeat_session_rate_pct is numeric");
  assert(typeof metrics.median_provider_response_hours === "number", "PMF Metric 7: median_provider_response_hours is numeric");
  assert(typeof metrics.median_correction_resolution_hours === "number", "PMF Metric 8: median_correction_resolution_hours is numeric");
  assert(typeof metrics.indexable_pages_count === "number", "PMF Metric 9: indexable_pages_count is numeric");
  assert(typeof metrics.active_tenant_retention_pct === "number", "PMF Metric 10: active_tenant_retention_pct is numeric");

  // 3. Check Search Telemetry
  const resTelem = await fetch(`${API_BASE}/search/telemetry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      town: "Nellore",
      query_text: "engineering colleges",
      results_count: 5,
      led_to_action: true,
    }),
  });
  assert(resTelem.ok, "POST /api/v1/search/telemetry records query successfully");

  // 4. Check Listing Freshness Reconfirmation
  const narayanaListingId = "55555555-5555-5555-5555-555555555501";
  const resReconfirm = await fetch(`${API_BASE}/saas/listings/${narayanaListingId}/reconfirm`, {
    method: "POST",
  });
  assert(resReconfirm.ok, "POST /api/v1/saas/listings/{id}/reconfirm updates last_confirmed_at");
  const reconfirmData = await resReconfirm.json();
  assert(reconfirmData.status === "success", "Reconfirm status = success");
}

async function runBrowserVerification() {
  console.log("\n--- PART 2: PLAYWRIGHT BROWSER E2E VERIFICATION ---");
  const browser = await chromium.launch({
    headless: true,
    env: {
      ...process.env,
      LD_LIBRARY_PATH: `/tmp/chrome_deps/usr/lib/x86_64-linux-gnu:${process.env.LD_LIBRARY_PATH || ""}`,
    },
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
    executablePath: "/home/prajith/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome",
  });

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));
  page.on("console", (msg) => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`));
  page.on("requestfailed", (req) => console.log(`[REQUEST FAILED] ${req.method()} ${req.url()}: ${req.failure()?.errorText}`));
  page.on("response", (res) => {
    if (res.url().includes("reconfirm")) {
      console.log(`[RECONFIRM RESPONSE] Status: ${res.status()} ${res.statusText()}`);
    }
  });

  // 1. Visit Homepage
  console.log("[NAV] Loading Discovery Hub at / ...");
  await page.goto(`${WEB_BASE}/`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(2500);
  assert(await page.title().then((t) => t.includes("OneTownCity")), "Page title includes OneTownCity");

  // Check 9 sections exist on page
  const text = await page.innerText("body");
  assert(!text.match(/[\u{1F300}-\u{1F6FF}]/u), "DOM contains zero emojis");
  assert(text.includes("SECTION 03 / DIRECTORY TAXONOMY"), "Section 03 Popular Categories rendered");
  assert(text.includes("SECTION 04 / TOWN PULSE"), "Section 04 Happening This Week & Calendar rendered");
  assert(text.includes("SECTION 05 / PUBLIC DESK"), "Section 05 Public Service Directory rendered");
  assert(text.includes("SECTION 06 / FRESHNESS LEDGER"), "Section 06 What is New Freshness Ledger rendered");
  assert(text.includes("SECTION 07 / SPOTLIGHT & DIRECTORY"), "Section 07 Spotlight Directory rendered");
  assert(text.includes("SECTION 08 / CITIZEN GOVERNANCE"), "Section 08 Community Contribution Studio rendered");
  assert(text.includes("SECTION 09 / CIVIC CHARTER"), "Section 09 Trust Safety Charter rendered");

  // 2. Test Bilingual Toggle
  console.log("[ACTION] Testing Bilingual Toggle EN | తెలుగు ...");
  const langBtn = page.locator("button[aria-label='Toggle language English or Telugu']");
  if (await langBtn.isVisible()) {
    await langBtn.click();
    await page.waitForTimeout(400);
    const teluguText = await page.innerText("body");
    assert(teluguText.includes("నెల్లూరు") || teluguText.includes("తెలుగు"), "Bilingual toggle switches to Telugu text");
    await langBtn.click(); // switch back
    await page.waitForTimeout(300);
  }

  // 3. Test Search & Empty State with 1-Click Suggest Trigger
  console.log("[ACTION] Testing Zero-Results Empty State with Suggest Trigger ...");
  const searchInput = page.locator("input[type='text']").first();
  await searchInput.click();
  await searchInput.fill("NonExistentSpecialtyCollegeXYZ");
  // Click search button
  await page.locator("button:has-text('Search')").or(page.locator("button:has-text('వెతకండి')")).first().click();
  await page.waitForTimeout(1500);
  const emptyText = await page.innerText("body");
  console.log("[DEBUG] emptyText substring containing Suggest:", emptyText.match(/.*Suggest.*/gi));
  assert(
    emptyText.includes("No matching records") || emptyText.includes("NonExistentSpecialtyCollegeXYZ"),
    "Empty state triggers for unmatched query"
  );
  assert(
    emptyText.includes("Suggest") && emptyText.includes("NonExistentSpecialtyCollegeXYZ"),
    "1-Click Suggest Listing CTA rendered in empty state"
  );
  await searchInput.fill(""); // clear search
  await page.locator("button:has-text('Search')").or(page.locator("button:has-text('వెతకండి')")).first().click();
  await page.waitForTimeout(800);

  // 4. Test SaaS Dashboard
  console.log("[NAV] Loading SaaS Studio at /dashboard ...");
  await page.goto(`${WEB_BASE}/dashboard`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(1000);
  const dashText = (await page.innerText("body")).toLowerCase();
  assert(dashText.includes("completeness") && dashText.includes("freshness"), "Completeness meter rendered in dashboard");
  assert(dashText.includes("reconfirm details are current"), "1-Click Reconfirm button visible in dashboard");

  // Click 1-Click Reconfirm button
  const reconfirmBtn = page.locator("button:has-text('Reconfirm Details Are Current')");
  if (await reconfirmBtn.isVisible()) {
    console.log("[ACTION] Clicking Reconfirm Details Are Current...");
    await reconfirmBtn.click();
    await page.waitForTimeout(1500);
    const postReconfirmText = (await page.innerText("body")).toLowerCase();
    console.log("[DEBUG] Post reconfirm text has reconfirmed:", postReconfirmText.includes("reconfirmed"));
    assert(postReconfirmText.includes("reconfirmed"), "Freshness reconfirmation feedback displayed");
  }

  // 5. Test Admin Governance & 10 PMF Metrics
  console.log("[NAV] Loading Governance Desk at /admin ...");
  await page.goto(`${WEB_BASE}/admin`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(1000);
  const adminText = (await page.innerText("body")).toLowerCase();
  assert(adminText.includes("pmf metrics"), "PMF Metrics tab exists in admin");
  assert(adminText.includes("search success rate"), "Search Success Rate card rendered");
  assert(adminText.includes("contact action rate"), "Contact Action Rate card rendered");
  assert(adminText.includes("avg completeness"), "Avg Completeness card rendered");
  assert(adminText.includes("30-day freshness rate"), "30-Day Freshness Rate card rendered");
  assert(adminText.includes("active tenant retention"), "Active Tenant Retention card rendered");

  // 6. Test System Map Architecture Page
  console.log("[NAV] Loading Architecture Map at /architecture ...");
  await page.goto(`${WEB_BASE}/architecture`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(1000);
  const archText = (await page.innerText("body")).toLowerCase();
  assert(archText.includes("30-day town pilot rollout roadmap"), "Section 05 30-day pilot rollout roadmap rendered");
  assert(archText.includes("six-domain saas architecture"), "Six-Domain SaaS architecture rendered");

  // Mobile Viewport Check (390x844)
  console.log("[VIEWPORT] Checking mobile responsiveness (390x844) on / ...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${WEB_BASE}/`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(1000);
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  assert(!hasOverflow, "Zero horizontal overflow on mobile viewport 390x844");

  await browser.close();

  assert(pageErrors.length === 0, `Zero uncaught page errors (found: ${pageErrors.length})`);
}

async function main() {
  try {
    await runApiVerification();
    await runBrowserVerification();
    console.log(`\n========================================`);
    console.log(`ALL VERIFICATIONS PASSED: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);
    process.exit(0);
  } catch (err) {
    console.error(`\nFAILED VERIFICATION:`, err);
    process.exit(1);
  }
}

main();
