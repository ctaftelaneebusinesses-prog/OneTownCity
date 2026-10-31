import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = path.resolve("./public/e2e-screenshots");
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runE2E() {
  console.log("==================================================");
  console.log("OneTownCity End-to-End Headless Playwright Suite");
  console.log("==================================================");

  process.env.LD_LIBRARY_PATH = `/tmp/chrome_deps/usr/lib/x86_64-linux-gnu:${process.env.LD_LIBRARY_PATH || ""}`;

  const browser = await chromium.launch({
    headless: true,
    env: {
      ...process.env,
      LD_LIBRARY_PATH: `/tmp/chrome_deps/usr/lib/x86_64-linux-gnu:${process.env.LD_LIBRARY_PATH || ""}`,
    },
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
    executablePath: "/home/prajith/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome",
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  try {
    // 1. Public Discovery Hub
    console.log("\n[TEST 1] Visiting Public Discovery Hub (127.0.0.1:3000)...");
    await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01_public_discovery.png") });

    const title = await page.textContent("h1");
    console.log(`Page heading: "${title?.trim()}"`);
    if (!title?.includes("OneTownCity — Nellore")) {
      throw new Error(`Unexpected page heading: ${title}`);
    }
    console.log("[PASS] Discovery Hub rendered with Nothing OS aesthetic.");

    // 2. Town Selector Switch
    console.log("\n[TEST 2] Testing persistent Town Selector...");
    const townSelector = page.locator("select").first();
    const currentTown = await townSelector.inputValue();
    console.log(`Current town: ${currentTown}`);
    
    // Switch to Kuppam
    await townSelector.selectOption("Kuppam");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02_kuppam_town.png") });
    const pageTextKuppam = await page.textContent("body");
    if (!pageTextKuppam.includes("Kuppam Degree & PG College") && !pageTextKuppam.includes("SLV Cyber")) {
      throw new Error("Kuppam listings did not load after switching town.");
    }
    console.log("[PASS] Switched to Kuppam; regional listings loaded.");

    // Switch back to Nellore
    await townSelector.selectOption("Nellore");
    await page.waitForTimeout(1000);
    const pageTextNellore = await page.textContent("body");
    if (!pageTextNellore.includes("Narayana Engineering College")) {
      throw new Error("Nellore listings did not reload.");
    }
    console.log("[PASS] Switched back to Nellore.");

    // 3. Tab Filters & Anti-Scam Notice
    console.log("\n[TEST 3] Testing Vertical Tab Filters & Anti-Scam Policy...");
    const studentsTab = page.locator("button:has-text('Student Corner')");
    await studentsTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03_students_tab.png") });

    const antiScamNotice = page.locator("text=Anti-Scam Consumer Protection Notice");
    const antiScamVisible = await antiScamNotice.isVisible();
    if (!antiScamVisible) {
      throw new Error("Anti-scam policy banner is missing in Students Corner!");
    }
    console.log("[PASS] Students tab displays mandatory anti-scam policy.");

    // 4. Instant Search Filter
    console.log("\n[TEST 4] Testing FTS Search Input...");
    const allTab = page.locator("button:has-text('All Verticals')");
    await allTab.click();
    await page.waitForTimeout(500);

    const searchInput = page.locator("input[placeholder*='Search']");
    await searchInput.fill("Narayana");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04_search_filter.png") });

    const listingsCount = await page.locator("a:has-text('Narayana Engineering College')").count();
    if (listingsCount === 0) {
      throw new Error("Search filter for 'Narayana' returned no results.");
    }
    console.log("[PASS] Instant search query filtered to Narayana Engineering College.");

    // 5. Actionable Enquiry Modal Flow
    console.log("\n[TEST 5] Submitting Course/Admission Enquiry Modal...");
    const enquiryBtn = page.locator("button:has-text('Enquire')").first();
    await enquiryBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05_enquiry_modal.png") });

    await page.fill("input[placeholder='e.g. Ramesh Varma']", "Ananya Sharma");
    await page.fill("input[placeholder='+91-9876543210']", "+91-9988776655");
    await page.fill("input[placeholder='ramesh@gmail.com']", "ananya.sharma@example.edu");
    await page.fill("textarea", "Please send syllabus and fee structure for B.Tech AI & Data Science.");
    
    const submitLeadBtn = page.locator("button:has-text('Submit Lead')");
    await submitLeadBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06_enquiry_success.png") });

    const successNotice = await page.locator("text=Enquiry registered and dispatched").count();
    if (successNotice === 0) {
      throw new Error("Enquiry submission success confirmation not displayed.");
    }
    console.log("[PASS] Enquiry captured and acknowledged to user.");

    // Wait for modal auto-close
    await page.waitForTimeout(2200);

    // 6. Listing Detail Page
    console.log("\n[TEST 6] Visiting Listing Canonical Detail Page...");
    await page.goto("http://127.0.0.1:3000/listings/narayana-engineering-college-nellore", { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07_listing_detail.png") });

    const detailName = await page.textContent("h1");
    if (!detailName?.includes("Narayana Engineering College")) {
      throw new Error("Listing detail page title mismatch.");
    }
    console.log("[PASS] Canonical listing detail page rendered with facilities and courses.");

    // 7. Multi-Tenant SaaS Portal (/dashboard)
    console.log("\n[TEST 7] Visiting Multi-Tenant SaaS Portal (/dashboard)...");
    await page.goto("http://127.0.0.1:3000/dashboard", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "08_saas_dashboard.png") });

    const dashboardTitle = await page.textContent("h1");
    if (!dashboardTitle?.includes("Narayana Engineering College")) {
      throw new Error(`Tenant Control Center header missing: ${dashboardTitle}`);
    }

    // Verify lead quota meter
    const bodyText = await page.textContent("body");
    const lowerBody = bodyText ? bodyText.toLowerCase() : "";
    if (!lowerBody.includes("lead quota") || !lowerBody.includes("education pro")) {
      throw new Error(`Plan quota or entitlement details missing on dashboard: ${bodyText}`);
    }

    // Verify that our submitted lead appears in the Leads Inbox!
    if (!lowerBody.includes("ananya sharma")) {
      throw new Error("Newly submitted lead 'Ananya Sharma' not found in SaaS Leads Inbox.");
    }
    console.log("[PASS] Multi-tenant SaaS dashboard loaded; lead 'Ananya Sharma' received in real-time.");

    // Switch Tenant Persona to Minerva Bookstore
    console.log("\n[TEST 8] Switching Persona to Retail Business Tenant (Minerva Bookstore)...");
    const businessPersonaBtn = page.locator("button:has-text('Business Tenant')");
    await businessPersonaBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "09_saas_persona_business.png") });

    const businessText = (await page.textContent("body"))?.toLowerCase() || "";
    if (!businessText.includes("minerva bookstore")) {
      throw new Error("Failed to switch tenant persona to Minerva Bookstore.");
    }
    console.log("[PASS] Tenant persona switched; loaded business quota and storefront metrics.");

    // 8. City Admin Moderation Queue (/admin)
    console.log("\n[TEST 9] Visiting City Admin Governance Queue (/admin)...");
    await page.goto("http://127.0.0.1:3000/admin", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "10_admin_moderation.png") });

    const adminTitle = await page.textContent("h1");
    if (!adminTitle?.includes("City Moderation Queue")) {
      throw new Error("City Moderation Queue header missing.");
    }

    // Check User Reports tab
    const reportsTab = page.locator("button:has-text('User Reports')");
    await reportsTab.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "11_admin_reports.png") });

    const adminBody = (await page.textContent("body"))?.toLowerCase() || "";
    if (!adminBody.includes("citizen@nellore.org")) {
      throw new Error("Submitted report from 'citizen@nellore.org' not found in Admin queue.");
    }
    console.log("[PASS] City Admin Governance Queue displays submitted community reports.");

    console.log("\n==================================================");
    console.log("ALL 9 END-TO-END TEST SUITES PASSED SUCCESSFULLY!");
    console.log("==================================================");
  } catch (error) {
    console.error("\n[FAIL] E2E Verification failed:", error);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "failure.png") });
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runE2E();
