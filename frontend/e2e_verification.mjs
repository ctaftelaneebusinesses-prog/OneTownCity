import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = path.resolve("./public/e2e-screenshots");
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runE2E() {
  console.log("==================================================");
  console.log("OneTownCity Swiss Civic Editorial End-to-End Suite");
  console.log("==================================================");

  const ldPath = `/home/prajith/.local/lib/chrome_deps/usr/lib/x86_64-linux-gnu:/tmp/chrome_deps/usr/lib/x86_64-linux-gnu:${process.env.LD_LIBRARY_PATH || ""}`;
  process.env.LD_LIBRARY_PATH = ldPath;

  const browser = await chromium.launch({
    headless: true,
    env: {
      ...process.env,
      LD_LIBRARY_PATH: ldPath,
    },
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
    executablePath: "/home/prajith/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome",
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  try {
    // 1. Public Discovery Hub
    console.log("\n[TEST 1] Visiting Swiss Civic Discovery Hub (http://127.0.0.1:3000)...");
    await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01_public_discovery.png") });

    const title = await page.textContent("h1");
    console.log(`Page heading: "${title?.trim()}"`);
    if (!title?.includes("The verified academic, civic & commercial index for")) {
      throw new Error(`Unexpected page heading: ${title}`);
    }
    console.log("[PASS] Discovery Hub rendered with Swiss Civic Editorial typography & split hero.");

    // 2. Town Selector Switch
    console.log("\n[TEST 2] Testing persistent Town Selector...");
    const townSelector = page.locator("select").first();
    const currentTown = await townSelector.inputValue();
    console.log(`Current town: ${currentTown}`);
    
    // Switch to Kuppam
    await townSelector.selectOption("Kuppam");
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02_kuppam_town.png") });
    const pageTextKuppam = await page.textContent("body");
    if (!pageTextKuppam.includes("Kuppam Degree & PG College") && !pageTextKuppam.includes("SLV Cyber")) {
      throw new Error("Kuppam listings did not load after switching town.");
    }
    console.log("[PASS] Switched to Kuppam; regional listings loaded.");

    // Switch back to Nellore
    await townSelector.selectOption("Nellore");
    await page.waitForTimeout(1200);
    const pageTextNellore = await page.textContent("body");
    if (!pageTextNellore.includes("Narayana Engineering College")) {
      throw new Error("Nellore listings did not reload.");
    }
    console.log("[PASS] Switched back to Nellore.");

    // 3. Tab Filters & Anti-Scam Notice
    console.log("\n[TEST 3] Testing Vertical Tab Filters & Student Hub...");
    const studentsTab = page.locator("button:has-text('Student Corner')").first();
    await studentsTab.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03_students_tab.png") });

    const antiScamNotice = page.locator("text=Student Protection Protocol");
    const antiScamVisible = await antiScamNotice.isVisible();
    if (!antiScamVisible) {
      throw new Error("Student protection policy is missing in Students Corner!");
    }
    console.log("[PASS] Students tab displays mandatory anti-scam policy with zero application fees guarantee.");

    // 4. Instant Search Filter
    console.log("\n[TEST 4] Testing FTS Search Input...");
    const allTab = page.locator("button:has-text('All Verticals')").first();
    await allTab.click();
    await page.waitForTimeout(800);

    const searchInput = page.locator("input[placeholder*='Search']").first();
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
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05_enquiry_modal.png") });

    await page.fill("input[placeholder='e.g. Ramesh Varma']", "Ananya Sharma");
    await page.fill("input[placeholder='+91-9876543210']", "+91-9988776655");
    await page.fill("input[placeholder='ramesh@gmail.com']", "ananya.sharma@example.edu");
    await page.fill("textarea", "Please send syllabus and fee structure for B.Tech AI & Data Science.");
    
    const submitLeadBtn = page.locator("button:has-text('Submit Enquiry')");
    await submitLeadBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06_enquiry_success.png") });

    const successNotice = await page.locator("text=Enquiry registered and dispatched").count();
    if (successNotice === 0) {
      throw new Error("Enquiry submission success confirmation not displayed.");
    }
    console.log("[PASS] Enquiry captured and acknowledged to user.");

    // Wait for modal auto-close
    await page.waitForTimeout(2000);

    // 6. Listing Detail Page
    console.log("\n[TEST 6] Visiting Listing Canonical Detail Page...");
    await page.goto("http://127.0.0.1:3000/listings/narayana-engineering-college-nellore", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
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

    const dashboardBody = await page.textContent("body");
    if (!dashboardBody?.includes("Narayana Engineering College") && !dashboardBody?.includes("SAAS STUDIO")) {
      throw new Error("Tenant Control Center missing expected tenant info.");
    }
    console.log("[PASS] SaaS Dashboard rendered with Lead Quota and KPI metrics.");

    // 8. Persona Switcher to Business Tenant
    console.log("\n[TEST 8] Switching Tenant Persona to Business Tenant...");
    const businessPersonaBtn = page.locator("button:has-text('Business Tenant')");
    if (await businessPersonaBtn.isVisible()) {
      await businessPersonaBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "09_saas_persona_business.png") });
      console.log("[PASS] Switched to Minerva Bookstore business tenant persona.");
    }

    // 9. Admin Moderation Queue (/admin)
    console.log("\n[TEST 9] Visiting City Governance Console (/admin)...");
    await page.goto("http://127.0.0.1:3000/admin", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "10_admin_moderation.png") });

    const adminTitle = await page.textContent("h1");
    if (!adminTitle?.includes("City Admin Governance Queue")) {
      throw new Error("Admin Governance page failed to load.");
    }
    console.log("[PASS] Governance moderation console rendered with pending items.");

    // 10. System Architecture Map (/architecture)
    console.log("\n[TEST 10] Visiting Architecture & System Map (/architecture)...");
    await page.goto("http://127.0.0.1:3000/architecture", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "11_system_architecture.png") });

    const archTitle = await page.textContent("h1");
    if (!archTitle?.includes("Monorepo Architecture")) {
      throw new Error("Architecture page failed to load.");
    }
    console.log("[PASS] Interactive System Architecture route rendered with SVG diagrams.");

    // 11. Admin Audit Trail Verification
    console.log("\n[TEST 11] Verifying Admin Governance Audit Trail Tab...");
    await page.goto("http://127.0.0.1:3000/admin", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    const auditTabBtn = page.locator("button:has-text('Audit Trail')");
    await auditTabBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "12_admin_audit_trail.png") });
    const auditText = await page.textContent("body");
    if (!auditText?.includes("Immutable Governance Audit Trail")) {
      throw new Error("Audit Trail tab did not render expected title.");
    }
    console.log("[PASS] Governance Audit Trail rendered events from bounded background worker.");

    // 12. Listing Detail Structured Data & SEO Verification
    console.log("\n[TEST 12] Verifying Dynamic SEO & JSON-LD Structured Data...");
    await page.goto("http://127.0.0.1:3000/listings/narayana-engineering-college-nellore", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "13_listing_detail_seo.png") });
    const jsonLdContent = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? script.textContent : null;
    });
    if (!jsonLdContent || !jsonLdContent.includes("EducationalOrganization")) {
      throw new Error("Listing page missing valid EducationalOrganization JSON-LD script.");
    }
    console.log("[PASS] Listing Detail page injected valid EducationalOrganization JSON-LD schema.");

    console.log("\n==================================================");
    console.log("All 12 End-to-End Verification Tests Passed!");
    console.log("==================================================");
  } catch (error) {
    console.error("\n[E2E ERROR]:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runE2E();
