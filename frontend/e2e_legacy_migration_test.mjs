import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = path.resolve("./public/e2e-screenshots");
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Emoji detection regex
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;

async function runLegacyMigrationE2E() {
  console.log("==================================================");
  console.log("OneTownCity Legacy Migration End-to-End Verification");
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
    // 1. Visit Public Discovery Hub and switch to Kuppam
    console.log("\n[TEST 1] Visiting Public Discovery Hub & switching to Kuppam...");
    await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
    
    const townSelector = page.locator("select").first();
    await townSelector.selectOption("Kuppam");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "legacy_01_kuppam_home.png") });

    const pageText = await page.textContent("body");
    
    // Zero-emoji enforcement check
    if (EMOJI_REGEX.test(pageText || "")) {
      throw new Error("Zero-emoji rule violated: Emoji detected in Kuppam discovery page text!");
    }
    console.log("[PASS] Zero emojis verified across page text.");

    // Check for imported listings
    if (!pageText.includes("Akshat Hospital") && !pageText.includes("SLV Cyber")) {
      throw new Error("Imported legacy listings not visible on Kuppam discovery page.");
    }
    console.log("[PASS] Imported legacy listings visible on Kuppam discovery page.");

    // 2. Student Corner Opportunities
    console.log("\n[TEST 2] Verifying Student Corner legacy opportunities in Kuppam...");
    const studentsTab = page.locator("button:has-text('Student Corner')");
    await studentsTab.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "legacy_02_kuppam_students.png") });

    const studentPageText = await page.textContent("body");
    
    // Check anti-scam notice
    if (!studentPageText.includes("Never pay money to apply") && !studentPageText.includes("Anti-Scam")) {
      throw new Error("Mandatory Anti-Scam notice missing from Student Corner!");
    }
    console.log("[PASS] Mandatory Anti-Scam notice is prominently displayed.");

    // Check for imported jobs
    const hasJob = ["Site Supervisor", "Teacher", "Accountant", "Computer Operator"].some(job => studentPageText.includes(job));
    if (!hasJob) {
      throw new Error("Imported student opportunities (Site Supervisor, Teacher, etc.) not found.");
    }
    console.log("[PASS] Legacy imported opportunities (Site Supervisor, Teacher, etc.) verified.");

    // 3. News & Events Tab
    console.log("\n[TEST 3] Verifying News & Events in Kuppam...");
    const newsTab = page.locator("button:has-text('News & Town Pulse')");
    await newsTab.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "legacy_03_kuppam_news.png") });

    const newsPageText = await page.textContent("body");
    const hasNews = ["Kuppam Local Updates", "Sri Peddapuli Gangamma", "Kuppam News Today"].some(n => newsPageText.includes(n));
    if (!hasNews) {
      throw new Error("Imported legacy news/events not found on Town Pulse tab.");
    }
    console.log("[PASS] Imported legacy news/events displayed correctly.");

    // 4. Detail Page for Imported Listing
    console.log("\n[TEST 4] Navigating to imported listing detail page (/listings/akshat-hospital)...");
    await page.goto("http://127.0.0.1:3000/listings/akshat-hospital", { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "legacy_04_listing_detail.png") });

    const heading = await page.textContent("h1");
    if (!heading?.includes("Akshat Hospital")) {
      throw new Error(`Expected 'Akshat Hospital' in heading, found: ${heading}`);
    }
    console.log("[PASS] Canonical detail page rendered for Akshat Hospital.");

    // 5. Full-Text Search in Kuppam
    console.log("\n[TEST 5] Verifying Full-Text Search filter on imported listings...");
    await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
    await page.locator("select").first().selectOption("Kuppam");
    await page.waitForTimeout(500);

    const searchInput = page.locator("input[placeholder*='Search']");
    await searchInput.fill("Hospital");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "legacy_05_kuppam_search.png") });

    const hospitalCards = await page.locator("h2:has-text('Hospital'), h3:has-text('Hospital'), a:has-text('Hospital')").count();
    if (hospitalCards === 0) {
      throw new Error("Search filter for 'Hospital' returned 0 results in Kuppam.");
    }
    console.log(`[PASS] Search for 'Hospital' returned ${hospitalCards} matching listings.`);

    console.log("\n==================================================");
    console.log("ALL LEGACY MIGRATION VERIFICATION CHECKS PASSED!");
    console.log("==================================================");
  } catch (err) {
    console.error("\n[FAIL] Legacy Migration E2E failed:", err);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "legacy_failure.png") });
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runLegacyMigrationE2E();
