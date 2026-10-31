import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ARTIFACT_SCREENSHOT_DIR = "/home/prajith/.gemini/antigravity-cli/brain/b2ad4530-ef6c-459f-b827-564ca415e976/screenshots";
if (!fs.existsSync(ARTIFACT_SCREENSHOT_DIR)) {
  fs.mkdirSync(ARTIFACT_SCREENSHOT_DIR, { recursive: true });
}

async function captureScreenshots() {
  console.log("==================================================");
  console.log("Capturing High-Resolution Design System Screenshots");
  console.log("==================================================");

  const ldPath = `/tmp/chrome_deps/usr/lib/x86_64-linux-gnu:/home/prajith/.local/lib/chrome_deps/usr/lib/x86_64-linux-gnu:${process.env.LD_LIBRARY_PATH || ""}`;
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

  // Desktop context
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const desktopPage = await desktopContext.newPage();

  // Mobile context
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();

  try {
    // 1. Discovery Hub (Desktop & Mobile)
    console.log("Capturing 01_discovery_desktop and mobile...");
    await desktopPage.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
    await desktopPage.waitForTimeout(1000);
    await desktopPage.screenshot({ path: path.join(ARTIFACT_SCREENSHOT_DIR, "ui_01_discovery_desktop.png"), fullPage: false });

    await mobilePage.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({ path: path.join(ARTIFACT_SCREENSHOT_DIR, "ui_01_discovery_mobile.png"), fullPage: false });

    // 2. Listing Detail (Desktop & Mobile)
    console.log("Capturing 02_listing_detail_desktop and mobile...");
    await desktopPage.goto("http://127.0.0.1:3000/listings/narayana-engineering-college-nellore", { waitUntil: "networkidle" });
    await desktopPage.screenshot({ path: path.join(ARTIFACT_SCREENSHOT_DIR, "ui_02_listing_detail_desktop.png"), fullPage: false });

    await mobilePage.goto("http://127.0.0.1:3000/listings/narayana-engineering-college-nellore", { waitUntil: "networkidle" });
    await mobilePage.screenshot({ path: path.join(ARTIFACT_SCREENSHOT_DIR, "ui_02_listing_detail_mobile.png"), fullPage: false });

    // 3. SaaS Dashboard (Desktop & Mobile)
    console.log("Capturing 03_saas_dashboard_desktop and mobile...");
    await desktopPage.goto("http://127.0.0.1:3000/dashboard", { waitUntil: "networkidle" });
    await desktopPage.screenshot({ path: path.join(ARTIFACT_SCREENSHOT_DIR, "ui_03_saas_dashboard_desktop.png"), fullPage: false });

    await mobilePage.goto("http://127.0.0.1:3000/dashboard", { waitUntil: "networkidle" });
    await mobilePage.screenshot({ path: path.join(ARTIFACT_SCREENSHOT_DIR, "ui_03_saas_dashboard_mobile.png"), fullPage: false });

    // 4. Governance Admin Queue (Desktop & Mobile)
    console.log("Capturing 04_admin_governance_desktop and mobile...");
    await desktopPage.goto("http://127.0.0.1:3000/admin", { waitUntil: "networkidle" });
    await desktopPage.screenshot({ path: path.join(ARTIFACT_SCREENSHOT_DIR, "ui_04_admin_governance_desktop.png"), fullPage: false });

    await mobilePage.goto("http://127.0.0.1:3000/admin", { waitUntil: "networkidle" });
    await mobilePage.screenshot({ path: path.join(ARTIFACT_SCREENSHOT_DIR, "ui_04_admin_governance_mobile.png"), fullPage: false });

    // 5. Enquiry Modal
    console.log("Capturing 05_enquiry_modal_desktop...");
    await desktopPage.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
    const enquireBtn = desktopPage.locator("button:has-text('Enquire')").first();
    await enquireBtn.click();
    await desktopPage.waitForTimeout(400);
    await desktopPage.screenshot({ path: path.join(ARTIFACT_SCREENSHOT_DIR, "ui_05_enquiry_modal_desktop.png") });

    console.log("All UI visual screenshots captured successfully!");
  } catch (err) {
    console.error("Screenshot capture error:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

captureScreenshots();
