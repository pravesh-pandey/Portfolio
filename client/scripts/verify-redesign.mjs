import { chromium } from "playwright-chromium";

const BASE = (process.env.VERIFY_BASE_URL ?? "http://localhost:4173").replace(/\/$/, "");
const TAGLINE = "> pravesh pandey · sde @ amazon alexa ai · quant dev";

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
  check("hero renders", (await page.locator(".hero__title").count()) === 1);
  check("hero offers three paths", (await page.locator(".hero__path").count()) === 3);
  await attempt(page.click('.site-nav__link:has-text("trading")'));
  await attempt(page.click(".site-header__logo"));
  check("tagline doesn't retype on return", (await text(page, '.hero__tag [aria-hidden="true"]')) === TAGLINE);
  const tickerStart = await text(page, ".ticker__group");
  await page.waitForTimeout(1600);
  check("ticker updates", tickerStart !== "" && (await text(page, ".ticker__group")) !== tickerStart);
  check("ticker is labelled simulated", tickerStart.includes("simulated"));
  check("ticker links to the lab", (await page.locator('a.ticker[href$="/lab"]').count()) === 1);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(600);
  const hiddenText = await text(page, ".ticker__group");
  await page.waitForTimeout(1600);
  check("ticker pauses while the tab is hidden", hiddenText !== "" && (await text(page, ".ticker__group")) === hiddenText);
  await page.reload({ waitUntil: "networkidle" });
  check("experience section links the PDF", (await page.locator('#experience a[href$="resume.pdf"]').count()) === 1);

  for (const id of ["trading", "impact", "about", "experience", "projects", "skills", "awards", "contact"]) {
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
  check("every project card has a hire link", (await page.locator(".project-card__hire").count()) === 12);
  check(
    "three cards link to case studies",
    (await page.locator('.project-card a[href*="/case-studies/"]').count()) === 3
  );
  await page.goto(`${BASE}/projects#tamperscripts`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  check(
    "projects page scrolls to a card from the URL",
    await page.evaluate(() => {
      const top = document.getElementById("tamperscripts")?.getBoundingClientRect().top ?? -1;
      return top >= 0 && top < window.innerHeight / 2;
    })
  );

  await page.goto(`${BASE}/work-with-me`, { waitUntil: "networkidle" });
  check("brief form present", (await page.locator(".brief-form").count()) === 1);
  check("process steps present", (await page.locator(".process-card").count()) === 4);

  // --- Shell drawer ---
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const isActive = (cls) => page.evaluate((name) => document.activeElement?.classList.contains(name) ?? false, cls);
  check("shell is closed by default", (await page.locator("#shell").count()) === 0);
  await attempt(page.click(".status-bar__shell"));
  await attempt(page.waitForSelector("#shell"));
  check("shell opens from the status bar", (await page.locator("#shell").count()) === 1);
  check("shell input has focus", await isActive("shell__input"));
  check(
    "open shell pads the page",
    await page.evaluate(() => parseFloat(getComputedStyle(document.body).paddingBottom) > 200)
  );
  await page.keyboard.press("Tab");
  check("Tab on an empty prompt leaves the shell (no trap)", !(await isActive("shell__input")));
  await attempt(page.focus(".shell__input"));
  await page.keyboard.type("open flowpulse");
  await page.keyboard.press("Enter");
  await attempt(page.waitForURL("**/case-studies/flowpulse"));
  check("open flowpulse navigates", page.url().includes("/case-studies/flowpulse"));
  await page.keyboard.press("Escape");
  check("Esc closes the shell", (await page.locator("#shell").count()) === 0);
  check("focus returns to the shell button", await isActive("status-bar__shell"));
  await page.keyboard.press("`");
  await attempt(page.waitForSelector("#shell"));
  check("backtick opens the shell", (await page.locator("#shell").count()) === 1);
  await page.keyboard.press("`");
  check("backtick in the empty shell input closes it", (await page.locator("#shell").count()) === 0);
  await page.keyboard.press("2");
  await attempt(page.waitForURL("**/trading"));
  check("number key 2 opens /trading", page.url().endsWith("/trading"));
  await page.keyboard.press("`");
  await attempt(page.waitForSelector("#shell"));
  await page.keyboard.type("shortcuts off");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Escape");
  await page.keyboard.press("`");
  check("shortcuts off disables the backtick", (await page.locator("#shell").count()) === 0);
  await attempt(page.click(".status-bar__shell"));
  await attempt(page.waitForSelector("#shell"));
  await page.keyboard.type("shortcuts on");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Escape");
  await page.goto(`${BASE}/#contact`, { waitUntil: "networkidle" });
  const formFocused = await attempt(page.focus("#name"));
  await page.keyboard.type("a`2b");
  check(
    "backtick and digits type normally in form fields",
    formFocused &&
      (await page.inputValue("#name")) === "a`2b" &&
      (await page.locator("#shell").count()) === 0 &&
      page.url().includes("#contact")
  );

  check("no console errors (desktop)", errors.length === 0, errors.join(" | ").slice(0, 300));
  await page.close();

  // --- Storage blocked (private mode) ---
  const blocked = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  blocked.setDefaultTimeout(5000);
  const blockedErrors = [];
  blocked.on("pageerror", (e) => blockedErrors.push(String(e)));
  await blocked.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("storage blocked");
      }
    });
  });
  await blocked.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await attempt(blocked.click(".status-bar__shell"));
  await attempt(blocked.waitForSelector("#shell"));
  check(
    "shell works with storage blocked",
    (await blocked.locator("#shell").count()) === 1 && blockedErrors.length === 0,
    blockedErrors.join(" | ").slice(0, 300)
  );
  await blocked.close();

  // --- Stale tab after a redeploy: the shell chunk is gone ---
  const stale = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  stale.setDefaultTimeout(5000);
  await stale.route("**/ShellDrawer-*.js", (route) => route.abort());
  await stale.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await attempt(stale.click(".status-bar__shell"));
  await attempt(stale.waitForSelector('[role="alert"]'));
  check(
    "missing shell chunk shows a reload prompt and the page survives",
    (await text(stale, '[role="alert"]')).includes("updated") && (await stale.locator(".hero__title").count()) === 1
  );
  await stale.close();

  // --- Stale tab after a redeploy: the ticker chunk is gone ---
  const staleTicker = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  staleTicker.setDefaultTimeout(5000);
  await staleTicker.route("**/TickerStrip-*.js", (route) => route.abort());
  await staleTicker.goto(`${BASE}/`, { waitUntil: "networkidle" });
  check(
    "missing ticker chunk leaves the header and page intact",
    (await staleTicker.locator(".site-header__logo").count()) === 1 &&
      (await staleTicker.locator(".hero__title").count()) === 1 &&
      (await staleTicker.locator('[role="alert"]').count()) === 0
  );
  await staleTicker.close();

  // --- Mobile + reduced-motion pass ---
  const mobile = await browser.newPage({
    viewport: { width: 375, height: 720 },
    reducedMotion: "reduce"
  });
  mobile.setDefaultTimeout(5000);
  const mobileErrors = [];
  mobile.on("pageerror", (e) => mobileErrors.push(String(e)));
  await mobile.goto(`${BASE}/`, { waitUntil: "networkidle" });
  check("mobile hero renders", (await mobile.locator(".hero__title").count()) === 1);
  check("reduced motion shows the full tagline at once", (await text(mobile, '.hero__tag [aria-hidden="true"]')) === TAGLINE);
  const metricText = (await mobile.locator(".impact__metric dt").first().textContent()) ?? "";
  check("reduced-motion counters show final value", !metricText.trim().startsWith("0%") && metricText.trim() !== "0");
  await attempt(mobile.click(".site-header__toggle"));
  check("mobile menu offers the PDF", await mobile.locator('.site-nav__pdf a[href$="resume.pdf"]').isVisible());
  await attempt(mobile.click(".site-header__scrim"));
  await mobile.screenshot({ path: "/tmp/portfolio-mobile.png", fullPage: true });
  await mobile.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await attempt(mobile.click(".status-bar__shell"));
  await attempt(mobile.click('.shell__chips .chip:has-text("trading")'));
  await attempt(mobile.waitForURL("**/trading"));
  check("mobile shell chip navigates", mobile.url().endsWith("/trading"));
  await attempt(mobile.click(".status-bar__shell"));
  for (const route of ["/", "/trading", "/case-studies/flowpulse", "/projects", "/work-with-me"]) {
    await mobile.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(`no horizontal scroll on ${route} (mobile)`, overflow <= 0, `${overflow}px`);
  }
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
