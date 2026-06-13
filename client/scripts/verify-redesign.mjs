import { chromium } from "playwright-chromium";

const BASE = (process.env.VERIFY_BASE_URL ?? "http://localhost:4173").replace(/\/$/, "");

const results = [];
const check = (name, ok, extra = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` — ${extra}` : ""}`);
};

const run = async () => {
  const browser = await chromium.launch();

  // --- Desktop pass ---
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
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

  await page.goto(`${BASE}/projects`, { waitUntil: "networkidle" });
  check("projects page shows 8 cards", (await page.locator(".project-card").count()) === 8);

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
  const mobileErrors = [];
  mobile.on("pageerror", (e) => mobileErrors.push(String(e)));
  await mobile.goto(`${BASE}/`, { waitUntil: "networkidle" });
  check("mobile hero renders", (await mobile.locator(".hero-scene__title").count()) === 1);
  const metricText = (await mobile.locator(".impact__metric dt").first().textContent()) ?? "";
  check("reduced-motion counters show final value", !metricText.trim().startsWith("0%") && metricText.trim() !== "0");
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
