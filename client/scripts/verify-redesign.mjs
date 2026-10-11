import { chromium } from "playwright-chromium";

const BASE = (process.env.VERIFY_BASE_URL ?? "http://localhost:4173").replace(/\/$/, "");

const results = [];
const check = (name, ok, extra = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` — ${extra}` : ""}`);
};

// Missing elements count as empty or failed instead of hanging, so a red run still prints every FAIL.
const text = async (target, selector) =>
  (await target.locator(selector).count()) > 0 ? ((await target.locator(selector).first().textContent()) ?? "") : "";
const attempt = (promise) => promise.then(
  () => true,
  () => false
);

const run = async () => {
  const browser = await chromium.launch(
    process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}
  );

  // --- Desktop pass ---
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  check("hero renders", (await page.locator(".hero-scene__title").count()) === 1);

  for (const id of ["impact", "about", "experience", "projects", "skills", "awards", "contact"]) {
    check(`section #${id} exists`, (await page.locator(`#${id}`).count()) === 1);
  }
  check("social links are real", (await page.locator('.social-links a[href="#"]').count()) === 0);
  check("nav has four numbered items", (await page.locator(".site-nav__key").count()) === 4);
  check("nav labels are terminal-style", (await text(page, ".site-nav__link")).includes("[1]"));
  check("status bar shows copyright", (await text(page, ".status-bar")).includes("Pravesh Pandey"));
  check("footer links Upwork", (await page.locator('.site-footer a[href*="upwork.com"]').count()) === 1);
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(500);
  check(
    "header stays on screen while scrolling",
    await page.evaluate(() => document.querySelector(".site-header")?.getBoundingClientRect().top === 0)
  );
  await page.screenshot({ path: "/tmp/portfolio-desktop.png", fullPage: true });

  const hashRedirects = [
    ["/about", "#about"],
    ["/experience", "#experience"],
    ["/skills", "#skills"],
    ["/achievements", "#awards"],
    ["/contact", "#contact"]
  ];
  for (const [from, hash] of hashRedirects) {
    await page.goto(`${BASE}${from}`, { waitUntil: "networkidle" });
    await page
      .waitForFunction((h) => window.location.hash === h, hash, { timeout: 5000 })
      .catch(() => {});
    check(`redirect ${from} → /${hash}`, page.url().includes(hash));
  }
  for (const from of ["/process", "/brief"]) {
    await page.goto(`${BASE}${from}`, { waitUntil: "networkidle" });
    await page
      .waitForFunction(() => window.location.pathname.endsWith("/work-with-me"), { timeout: 5000 })
      .catch(() => {});
    check(`redirect ${from} → /work-with-me`, page.url().includes("/work-with-me"));
  }

  await page.goto(`${BASE}/trading`, { waitUntil: "networkidle" });
  check("trading page lists two case studies", (await page.locator(".case-pane--study").count()) === 2);
  check("trading page explains what isn't published", (await page.locator(".not-published li").count()) === 3);
  check("trading page ends with a hire CTA", (await page.locator(".hire-cta").count()) === 1);
  for (const slug of ["flowpulse", "options-backtester", "localcache"]) {
    await page.goto(`${BASE}/case-studies/${slug}`, { waitUntil: "networkidle" });
    check(
      `case study ${slug} renders`,
      (await page.locator(".pipeline__stage").count()) >= 3 &&
        (await page.locator(".decision-table tbody tr").count()) >= 2 &&
        (await page.locator(".hire-cta").count()) === 1
    );
  }
  check("case study sets the tab title", (await page.title()).startsWith("LocalCache · "));
  await page.goto(`${BASE}/case-studies/does-not-exist`, { waitUntil: "networkidle" });
  check("unknown case study shows 404", (await text(page, "h1")).includes("404"));
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await attempt(page.click('.site-nav__link:has-text("trading")'));
  await attempt(page.waitForURL("**/trading"));
  check("nav [2] trading opens /trading", page.url().endsWith("/trading"));

  await page.goto(`${BASE}/projects`, { waitUntil: "networkidle" });
  check("projects page shows 12 cards", (await page.locator(".project-card").count()) === 12);

  await page.goto(`${BASE}/work-with-me`, { waitUntil: "networkidle" });
  check("brief form present", (await page.locator(".brief-form").count()) === 1);
  check("process steps present", (await page.locator(".process-card").count()) === 4);

  check("no console errors (desktop)", errors.length === 0, errors.join(" | ").slice(0, 300));
  await page.close();

  // --- Mobile + reduced-motion pass ---
  const mobile = await browser.newPage({
    viewport: { width: 375, height: 720 },
    reducedMotion: "reduce"
  });
  mobile.setDefaultTimeout(5000);
  const mobileErrors = [];
  mobile.on("pageerror", (e) => mobileErrors.push(String(e)));
  await mobile.goto(`${BASE}/`, { waitUntil: "networkidle" });
  check("mobile hero renders", (await mobile.locator(".hero-scene__title").count()) === 1);
  const metricText = (await mobile.locator(".impact__metric dt").first().textContent()) ?? "";
  check("reduced-motion counters show final value", !metricText.trim().startsWith("0%") && metricText.trim() !== "0");
  await attempt(mobile.click(".site-header__toggle"));
  check("mobile menu offers the PDF", await mobile.locator('.site-nav__pdf a[href$="resume.pdf"]').isVisible());
  await attempt(mobile.click(".site-header__scrim"));
  await mobile.screenshot({ path: "/tmp/portfolio-mobile.png", fullPage: true });
  check("no console errors (mobile)", mobileErrors.length === 0, mobileErrors.join(" | ").slice(0, 300));
  await mobile.close();

  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
