import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = path.resolve("./public/audit-screenshots");
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: "mobile_390", width: 390, height: 844, isMobile: true },
  { name: "tablet_768", width: 768, height: 1024, isMobile: true },
  { name: "desktop_1280", width: 1280, height: 800, isMobile: false },
  { name: "desktop_1440", width: 1440, height: 900, isMobile: false },
];

const ROUTES = [
  { path: "/", name: "home_discovery" },
  { path: "/dashboard", name: "saas_dashboard" },
  { path: "/admin", name: "admin_governance" },
  { path: "/architecture", name: "system_architecture" },
  { path: "/listings/narayana-engineering-college-nellore", name: "listing_detail" },
];

async function runVisualAudit() {
  console.log("========================================================");
  console.log("OneTownCity — Rigorous Multi-Device Visual Quality Audit");
  console.log("========================================================");

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

  const auditReport = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n--- Auditing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
    });

    const page = await context.newPage();
    const consoleLogs = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" || msg.type() === "warning") {
        consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
      }
    });

    for (const route of ROUTES) {
      const url = `http://127.0.0.1:3000${route.path}`;
      const shotFile = `${route.name}_${vp.name}.png`;
      const shotPath = path.join(SCREENSHOT_DIR, shotFile);

      try {
        await page.goto(url, { waitUntil: "networkidle" });
        await page.waitForTimeout(600);

        // Check horizontal overflow
        const hasHorizontalOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });

        // Check truly broken images (completed loading but failed with naturalWidth === 0)
        const brokenImagesCount = await page.evaluate(() => {
          const imgs = Array.from(document.querySelectorAll("img"));
          return imgs.filter((img) => img.complete && img.naturalWidth === 0).length;
        });

        // Capture screenshot
        await page.screenshot({ path: shotPath, fullPage: false });

        const result = {
          route: route.path,
          viewport: vp.name,
          screenshot: shotFile,
          overflow: hasHorizontalOverflow,
          brokenImages: brokenImagesCount,
          consoleErrors: [...consoleLogs],
        };
        consoleLogs.length = 0; // reset for next route

        auditReport.push(result);
        console.log(
          `  [CAPTURED] ${route.path} @ ${vp.width}px -> ${shotFile} (Overflow: ${hasHorizontalOverflow}, Broken Imgs: ${brokenImagesCount})`
        );
      } catch (err) {
        console.error(`  [ERROR] Failed to audit ${url} @ ${vp.name}:`, err.message);
      }
    }

    await context.close();
  }

  await browser.close();

  fs.writeFileSync(
    path.join(SCREENSHOT_DIR, "audit_summary.json"),
    JSON.stringify(auditReport, null, 2)
  );

  console.log("\n========================================================");
  console.log(`Visual Audit Complete! ${auditReport.length} viewport/route combinations inspected.`);
  console.log("========================================================");
}

runVisualAudit().catch((err) => {
  console.error("Fatal audit error:", err);
  process.exit(1);
});
