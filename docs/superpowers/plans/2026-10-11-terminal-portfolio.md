# Terminal Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the portfolio into a dark trading-terminal site with three audience paths, case studies with decision logs, a CloudShell-style shell drawer and a shareable order-flow playground, shipped in three phases.

**Architecture:** The React 18 + Vite SPA keeps its structure: data modules → pages/sections → layout. New pure-JS modules (`src/data/caseStudies.js`, `src/data/links.js`, `src/shell/commands.js`, `src/shell/hotkey.js`, `src/sim/*`) hold the logic and are unit-tested with Node's built-in runner. UI components stay thin. The shell drawer and `/lab` page are code-split with `React.lazy`, behind an error boundary.

**Tech Stack:** React 18, React Router 6, Framer Motion 11, Vite 5, `node --test`, Playwright (`playwright-chromium`, existing dev dependency) for browser smoke checks.

**Spec:** `docs/superpowers/specs/2026-10-11-terminal-portfolio-design.md`, including its "Revisions after review" section.

## Global Constraints

- No new runtime or dev dependencies. The only dependency change is removing `@studio-freight/react-lenis`.
- Fonts: JetBrains Mono (UI, headings, data, shell) and Inter (paragraphs), from Google Fonts with `display=swap`, replacing Fraunces and Manrope.
- Dark only. Tokens: `--bg #0b0d0c`, `--pane #101513`, `--border #23302a`, `--text #d8e3dc`, `--text-2 #a9bcb2`, `--dim #6f8379`, `--amber #ffb000`, `--green #3ddc84`, `--red #ff6b5b`. Red is for alerts only; falling values use amber. All text pairs were checked for WCAG AA: dim on pane is 4.57:1, the lowest pair.
- Trading copy has **no numbers**: no P&L, hit rates, Sharpe or latency. A unit test enforces this for trading case studies, including their decision logs. Every claim must match the FlowPulse, ScriptBackTesting, TradingBot and LocalCache repos. Pravesh confirmed the FlowPulse claims (short-horizon forecasting models, Telegram-feedback recalibration, C++20).
- Unverifiable superlatives such as "institutional-grade", "profitable" or "used by traders" are not allowed.
- Simulated data is always labelled `SIM` or "simulated". The lab must not show any accuracy or hit-rate counter, since that reads as a performance claim.
- Initial JS ≤ 113.5 kB gzip, measured from Vite's build output for `assets/index-*.js`. Today it is 113.49 kB, so there's no headroom; measure after Tasks 3, 6 and 13. The shell drawer and `/lab` must be separate chunks.
- `prefers-reduced-motion`: no motion; content appears immediately; the marquee does not scroll.
- Every `localStorage` access is wrapped in try/catch, and the site must work identically without storage.
- Single-key shortcuts (`` ` `` and `1`–`5`) never fire while typing in a form field, and the `shortcuts off` command can turn them off (WCAG 2.1.4).
- Mobile: 16px side gutter; no horizontal page scroll at 375px width; fixed bars respect `env(safe-area-inset-bottom)`.
- Pure modules imported by unit tests (`src/data/*`, `src/shell/commands.js`, `src/shell/hotkey.js`, `src/sim/*`) use **relative imports only**, because `node --test` does not resolve the Vite aliases.
- Never push, merge or open a PR without Pravesh's explicit go-ahead. Each phase ends with a stop for review.

## Conventions

**Working directory:** `/home/pp/orca/Portfolio`, branch `quant-projects-upwork`. Client commands run from `client/`.

**Verify procedure:** run this whenever a step says "Run the verify procedure."

```bash
cd /home/pp/orca/Portfolio/client
npm run lint && npm test && npm run build
npx vite preview --port 4173 --strictPort > /tmp/preview.log 2>&1 &
sleep 2
CHROME_PATH=$(find ~/.cache/ms-playwright -type f -name chrome-headless-shell | sort | tail -1) node scripts/verify-redesign.mjs
pkill -f "vite preview --port 4173"
```

Expected: lint clean, every unit test passes, the build succeeds, and the verify script's last line reads `N/N checks passed` with no `FAIL` lines. (`npm test` exists from Task 1 on; before that, skip it.) From Task 3 on, a missing element makes a check FAIL quickly instead of hanging, so a red run still prints every result.

**Commit** (this machine has no global git identity). Use the attribution trailer the executing session is given; for this session it is:

```bash
git add <files>
git -c user.name="Pravesh Pandey" -c user.email=pravesh25pandey@gmail.com commit -m "<subject>" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011e2mAMXCkHJQGfChFBYrTo"
```

## Review Focus

1. **Stale tab after a redeploy:** the shell or `/lab` chunk 404s. The page must show a "reload" prompt and keep working, never go blank. Browser checks in Tasks 10 and 14.
2. **Typing a backtick or a digit in a form field** (contact or brief form) must type the character, not open the shell or change page. This is pinned by unit tests in Task 9 and a browser check in Task 10.
3. **Blocked storage** (private mode, Safari with site data blocked): the shell still opens and closes, `shortcuts off` still works for the page view, and there are no page errors. Browser check in Task 10.
4. **Phones at 375px**: no page scrolls sideways. The ticker marquee, pipeline diagrams, decision tables, project grid and order-book ladder are the risky parts. Browser check in Task 8, extended in Task 14.
5. **Hidden browser tab**: the ticker and lab stop stepping, with no burst of catch-up steps on return. Browser check in Task 13.

---

# Phase 1 — Terminal redesign

### Task 1: Unit-test runner and project slugs

**Files:**
- Modify: `client/package.json` (scripts)
- Modify: `.github/workflows/ci.yml` (client job)
- Modify: `client/src/data/profile.js` (add `slug` to all 12 projects)
- Create: `client/tests/profile.test.js`

**Interfaces:**
- Produces: `npm test`; every `projectShowcase` entry has `slug: string` (kebab-case, unique). Later tasks use these exact slugs: `flowpulse`, `options-backtester`, `localcache`, `market-depth-bot`, `ai-sudoku-solver`, `imme-conference-platform`, `tamperscripts`, `cell-phone-controlled-car`, `digital-marketing-website`, `covin`, `stockholm-paring`, `curves`.

- [ ] **Step 1: Add the test script.** In `client/package.json` `"scripts"`, add after `"lint"` (with a comma after the `"lint"` line):

```json
    "test": "node --test \"tests/**/*.test.js\""
```

- [ ] **Step 2: Write the failing test** `client/tests/profile.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { projectShowcase } from "../src/data/profile.js";

test("every project has a unique kebab-case slug", () => {
  const slugs = projectShowcase.map((project) => project.slug);
  for (const slug of slugs) assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
  assert.equal(new Set(slugs).size, slugs.length);
});
```

- [ ] **Step 3: Run it to verify it fails.**

Run: `cd client && npm test`
Expected: FAIL. `slug` is `undefined`, so `assert.match` throws.

- [ ] **Step 4: Add slugs.** In `client/src/data/profile.js`, add a `slug` line directly after each project's `title` line, for example:

```js
  {
    title: "FlowPulse",
    slug: "flowpulse",
```

| title | slug |
|---|---|
| FlowPulse | `flowpulse` |
| Options Backtester for Indian F&O | `options-backtester` |
| LocalCache | `localcache` |
| Market Depth Trading Bot | `market-depth-bot` |
| AI Sudoku Solver | `ai-sudoku-solver` |
| IMME Conference Platform | `imme-conference-platform` |
| TamperScripts Collection | `tamperscripts` |
| Cell Phone Controlled Car | `cell-phone-controlled-car` |
| Digital Marketing Portfolio Website | `digital-marketing-website` |
| Covin Web Application | `covin` |
| STOCKHOLM_PARING | `stockholm-paring` |
| Curves - Mathematical Visualization | `curves` |

- [ ] **Step 5: Run the test to verify it passes.**

Run: `cd client && npm test`
Expected: `ℹ pass 1`, `ℹ fail 0`.

- [ ] **Step 6: Run unit tests in CI.** In `.github/workflows/ci.yml`, in the `client` job, insert between the `Lint` and `Build` steps:

```yaml
      - name: Unit tests
        run: npm test
```

- [ ] **Step 7: Commit.**

```bash
git add client/package.json client/tests/profile.test.js client/src/data/profile.js .github/workflows/ci.yml
# commit subject: "Add project slugs and node unit-test runner"
```

---

### Task 2: Case-study content and decision logs

**Files:**
- Create: `client/src/data/caseStudies.js`
- Create: `client/tests/caseStudies.test.js`

**Interfaces:**
- Consumes: project slugs (Task 1).
- Produces: `caseStudies: Array<{ slug, kind: "trading" | "infrastructure", title, summary, problem, pipeline: string[], approach: string[], decisions: Array<{ decision, chosen, rejected }>, highlights: string[], limitations: string[], stack: string[], codeLink: string | null }>` and `findCaseStudy(slug) → study | undefined`.

- [ ] **Step 1: Write the failing test** `client/tests/caseStudies.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { projectShowcase } from "../src/data/profile.js";
import { caseStudies, findCaseStudy } from "../src/data/caseStudies.js";

test("every case study matches a project and has all its sections", () => {
  const projectSlugs = new Set(projectShowcase.map((project) => project.slug));
  for (const study of caseStudies) {
    assert.ok(projectSlugs.has(study.slug), `${study.slug} has no project`);
    assert.ok(["trading", "infrastructure"].includes(study.kind), `${study.slug}.kind`);
    for (const key of ["title", "summary", "problem"]) {
      assert.ok(study[key].length > 0, `${study.slug}.${key}`);
    }
    assert.ok(study.pipeline.length >= 3, `${study.slug}.pipeline`);
    assert.ok(study.approach.length >= 1, `${study.slug}.approach`);
    assert.ok(study.highlights.length >= 3 && study.highlights.length <= 5, `${study.slug}.highlights`);
    assert.ok(study.limitations.length >= 1, `${study.slug}.limitations`);
    assert.ok(study.stack.length >= 1, `${study.slug}.stack`);
    assert.ok(study.decisions.length >= 2 && study.decisions.length <= 4, `${study.slug}.decisions`);
    for (const row of study.decisions) {
      for (const key of ["decision", "chosen", "rejected"]) assert.ok(row[key].length > 0, `${study.slug} decision.${key}`);
    }
  }
});

test("trading case studies publish no numbers", () => {
  for (const study of caseStudies.filter((item) => item.kind === "trading")) {
    const text = [
      study.summary,
      study.problem,
      ...study.pipeline,
      ...study.approach,
      ...study.highlights,
      ...study.limitations,
      ...study.decisions.flatMap((row) => [row.decision, row.chosen, row.rejected])
    ]
      .join(" ")
      .replaceAll("C++20", "C++");
    assert.doesNotMatch(text, /\d/, `${study.slug} contains a digit`);
  }
});

test("findCaseStudy returns the study or undefined", () => {
  assert.equal(findCaseStudy("flowpulse").title, "FlowPulse");
  assert.equal(findCaseStudy("does-not-exist"), undefined);
});
```

- [ ] **Step 2: Run it to verify it fails.**

Run: `cd client && npm test`
Expected: FAIL with `Cannot find module '.../src/data/caseStudies.js'`.

- [ ] **Step 3: Create** `client/src/data/caseStudies.js`. Every sentence was checked against the repos' READMEs and code: worst-case fills, completed-bar signals and "no price is fabricated" are in ScriptBackTesting's `backend/engine.py`, and the polling depth feed is in the FlowPulse README. The decision-log rationales and the "Next:" lines are drafts for Pravesh to confirm at the Task 8 stop. Keep the wording when executing.

```js
export const caseStudies = [
  {
    slug: "flowpulse",
    kind: "trading",
    title: "FlowPulse",
    summary:
      "A C++ engine that continuously watches Indian index options and MCX commodities, spots large institutional orders as they hit the book, and paper-trades every signal so each idea is judged on realistic P&L.",
    problem:
      "Institutional orders are where moves start, but they hide inside a fast, noisy options market. Spotting them means reading the order book continuously, separating real pressure from routine churn, and acting before the signal goes stale — without a human staring at screens all day.",
    pipeline: [
      "Market data feed",
      "Order-book analyzer",
      "OFI · microprice · VPIN",
      "Institutional-order detector",
      "Telegram alerts + paper trades",
      "PostgreSQL · Grafana"
    ],
    approach: [
      "FlowPulse polls market depth for NIFTY, BANKNIFTY and FINNIFTY options and MCX contracts, tracks how the order book changes between snapshots, and computes market-microstructure signals on every update: order-flow imbalance, microprice and VPIN.",
      "A detector combines those signals to flag likely institutional activity. Each alert goes to Telegram with inline feedback buttons and opens a paper trade, so every signal is scored on what it would actually have earned after costs."
    ],
    decisions: [
      {
        decision: "Acting on signals",
        chosen: "Paper-trade every alert with full F&O charges and lot sizes",
        rejected: "Routing live orders from the start: a signal should prove itself after costs before it touches capital."
      },
      {
        decision: "Detector thresholds",
        chosen: "Recalibrate automatically from feedback on Telegram alerts",
        rejected: "Fixed, hand-tuned thresholds: as market conditions change they drift into noise or silence."
      },
      {
        decision: "Where results live",
        chosen: "PostgreSQL for alerts, trades and market data, with Grafana dashboards",
        rejected: "Log files: every review question becomes a scripting job instead of a query."
      }
    ],
    highlights: [
      "Modern C++20 core built with CMake, with candle building and indicators (EMA, RSI, volatility) on top of the raw feed.",
      "Feedback loop: reactions to Telegram alerts automatically recalibrate the detector's thresholds.",
      "Paper trading that models full NSE F&O charges, lot sizes, time-based exits and end-of-day square-off.",
      "Short-horizon return forecasting models alongside the rule-based detector.",
      "Dockerized deployment with CI pipelines, PostgreSQL persistence and Grafana dashboards."
    ],
    limitations: [
      "Paper trading only — no live capital is routed through it.",
      "Signals are tuned for Indian index options and MCX; other markets would need their own calibration.",
      "Next: richer order-book features and a replay mode for studying past sessions."
    ],
    stack: ["C++20", "CMake", "PostgreSQL", "Grafana", "Docker", "Telegram API"],
    codeLink: null
  },
  {
    slug: "options-backtester",
    kind: "trading",
    title: "Options Backtester for Indian F&O",
    summary:
      "A research platform that replays options strategies minute by minute on archived index and option-chain data, charging every order the way an Indian F&O broker would, and stress-tests ideas with walk-forward research instead of a single lucky backtest.",
    problem:
      "Most options backtests flatter the strategy: they peek at bars that haven't closed, forward-fill missing prices, ignore charges, and tune parameters on the same data they report. Each shortcut inflates results that then fail live.",
    pipeline: [
      "Index + option-chain archive",
      "Completed-bar resampling",
      "Strategy signals",
      "Leg and strike selection",
      "Minute simulation with F&O charges",
      "Sweeps + walk-forward research"
    ],
    approach: [
      "The engine is deterministic: strategies only ever see completed underlying bars, missing prices are never forward-filled, and each leg is matched to a real contract by strike step and budget before an order is simulated with full charges.",
      "On top of the engine, a parallel sweep explores strategies, parameters, strike offsets and risk settings, while walk-forward research with Fixed Share weights and purged chronological validation checks whether an edge survives on data it was not tuned on."
    ],
    decisions: [
      {
        decision: "Fill prices",
        chosen: "Worst case: buys fill at the candle high, sells at the low, plus slippage",
        rejected: "Candle close or mid-price: optimistic fills are the most common way backtests flatter a strategy."
      },
      {
        decision: "What a strategy can see",
        chosen: "Only completed underlying bars; entries execute at the next minute's open",
        rejected: "Signals on the bar still forming: that is look-ahead bias, and it inflates every result."
      },
      {
        decision: "Missing prices",
        chosen: "Never forward-fill; a position whose strike leaves the archive settles at its last observed price",
        rejected: "Forward-filling gaps: invented prices create trades that could never have happened."
      },
      {
        decision: "Validation",
        chosen: "Walk-forward research with purged chronological splits",
        rejected: "One backtest tuned and scored on the same data: it reports luck as skill."
      }
    ],
    highlights: [
      "Look-ahead-safe simulation: session-anchored resampling and completed-bar signals only.",
      "Conservative worst-case fills: market buys fill at the candle high, sells at the low, plus configurable slippage.",
      "Per-order Indian F&O charge model on premium turnover.",
      "Plugin-style strategy library with validated parameters.",
      "Parallel parameter sweeps across processes."
    ],
    limitations: [
      "Research only — it never places orders.",
      "Sell-side margin is a user-configured estimate, not a broker margin calculation.",
      "Next: an options payoff and Greeks view for designing strategies before backtesting them."
    ],
    stack: ["Python", "FastAPI", "pandas", "NumPy", "Parquet", "Pydantic"],
    codeLink: null
  },
  {
    slug: "localcache",
    kind: "infrastructure",
    title: "LocalCache",
    summary:
      "A filesystem-backed cache with Redis-like ergonomics: entries live as sharded, hash-addressed files, so lookups stay constant-time as the cache grows, without holding an index in memory.",
    problem:
      "Services sometimes need a cache that is larger than RAM and survives restarts, but a full database is overkill. Naive file caches slow down as directories fill up, corrupt entries on crashes, and race when several processes write at once.",
    pipeline: [
      "Key",
      "SHA-256 hash",
      "Sharded path",
      "Atomic write / locked read",
      "TTL check",
      "Journal-driven eviction"
    ],
    approach: [
      "Every key is hashed with SHA-256 and mapped to a sharded directory path, so the cost of a lookup does not depend on how many entries exist. Writes go to a temporary file and are renamed into place, with optional fsync, so a crash never leaves a half-written entry.",
      "Concurrent access is coordinated with POSIX file locks. Expiry metadata sits next to each payload and is checked lazily on read, and an append-only access journal drives background eviction without keeping usage statistics in memory."
    ],
    decisions: [
      {
        decision: "Finding a key",
        chosen: "SHA-256 hash mapped to a sharded directory path",
        rejected: "An in-memory index: it caps the cache at what fits in RAM and must be rebuilt on every start."
      },
      {
        decision: "Crash safety",
        chosen: "Write to a temporary file, then rename it into place atomically (optional fsync)",
        rejected: "Writing in place: a crash mid-write leaves a corrupt entry behind."
      },
      {
        decision: "Concurrency",
        chosen: "POSIX file locks",
        rejected: "In-process locks only: two services sharing one cache directory would race."
      },
      {
        decision: "Eviction bookkeeping",
        chosen: "An append-only access journal",
        rejected: "An in-memory LRU list: memory use would grow with the number of entries."
      }
    ],
    highlights: [
      "Constant-time lookups via hash-addressed, sharded storage.",
      "Crash-safe atomic writes with optional durability (fsync).",
      "Multi-process safety with POSIX file locking.",
      "TTL support, batch get/put/delete and stream-based iteration.",
      "Java implementation with an earlier Python prototype."
    ],
    limitations: [
      "Single-host by design — it is not a distributed cache.",
      "Throughput is bounded by the underlying filesystem.",
      "Next: pluggable serializers and metrics hooks."
    ],
    stack: ["Java", "Python", "File systems", "Concurrency"],
    codeLink: "https://github.com/pravesh-pandey/LocalCache"
  }
];

export const findCaseStudy = (slug) => caseStudies.find((study) => study.slug === slug);
```

- [ ] **Step 4: Run tests to verify they pass.**

Run: `cd client && npm test`
Expected: `ℹ pass 4`, `ℹ fail 0`.

- [ ] **Step 5: Commit.**

```bash
git add client/src/data/caseStudies.js client/tests/caseStudies.test.js
# commit subject: "Add case studies with decision logs for FlowPulse, Options Backtester and LocalCache"
```

---

### Task 3: Terminal theme foundation

**Files:**
- Modify: `client/index.html` (viewport, fonts, title, description, Open Graph)
- Rewrite: `client/src/styles/global.css`
- Modify: `client/src/App.jsx`, `client/src/layout/AppLayout.jsx`
- Delete: `client/src/components/common/Cursor.jsx`, `client/src/components/common/Cursor.css`, `client/src/components/common/ScrollProgress.jsx`, `client/src/components/background/AmbientBackground.jsx`, `client/src/components/background/ambientBackground.css`
- Modify: `client/src/components/achievements/achievementGrid.css`, `client/src/components/forms/projectBriefForm.css`, `client/src/components/sections/contactSection.css`, `client/src/components/projects/projectGrid.css`
- Modify: `client/package.json`, `client/package-lock.json` (remove Lenis)
- Modify: `client/scripts/verify-redesign.mjs` (installed Chromium, non-hanging helpers)

**Interfaces:**
- Produces:
  - CSS tokens `--bg --pane --pane-2 --border --text --text-2 --dim --amber --green --red --font-mono --font-sans --radius --max-width --header-height --status-bar-height`. `--shell-height` is optional (set in Task 10) and is read by `body`'s padding.
  - Classes `.pane`, `.pane__label`, `.chip`, `.chips`, `.button`, `.button--primary`.
  - Legacy names (`--accent`, `--accent-2`, `--accent-3`, `--surface*`, `--card`, `--text-dim`, `--font-body`, `--font-display`, `--corner-*`, `--shadow-*`) remain as aliases, so untouched component CSS keeps working.
  - Verify-script helpers `text(target, selector) → Promise<string>` (returns `""` when the element is missing) and `attempt(promise) → Promise<boolean>`. Every later check uses them.

This task is a visual change, so its test is the existing smoke script plus a screenshot check.

- [ ] **Step 1: Make the verify script robust.** In `client/scripts/verify-redesign.mjs`:

(a) Replace

```js
  const browser = await chromium.launch();
```

with

```js
  const browser = await chromium.launch(
    process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}
  );
```

(b) Directly after the `check` helper (the `const check = ...;` block), insert:

```js

// Missing elements count as empty or failed instead of hanging, so a red run still prints every FAIL.
const text = async (target, selector) =>
  (await target.locator(selector).count()) > 0 ? ((await target.locator(selector).first().textContent()) ?? "") : "";
const attempt = (promise) => promise.then(
  () => true,
  () => false
);
```

(c) After `const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });` add `page.setDefaultTimeout(5000);`. After the `const mobile = await browser.newPage({ ... });` statement add `mobile.setDefaultTimeout(5000);`.

- [ ] **Step 2: Viewport, fonts and metadata.** In `client/index.html`:

Replace the viewport meta with:

```html
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, viewport-fit=cover, interactive-widget=resizes-content"
    />
```

Replace the Google Fonts `<link href=...>` with:

```html
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
```

Replace the description `content` with `Pravesh Pandey, Software Development Engineer at Amazon Alexa AI. Backend systems at Amazon scale and trading systems at market speed: case studies, projects and ways to work together.`, and the `<title>` with `Pravesh Pandey — Backend & Trading Systems Engineer`.

Directly after the description meta, add the site-wide link-preview tags. LinkedIn and Upwork read these; their crawlers don't run JavaScript, so per-page tags wouldn't be seen.

```html
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Pravesh Pandey — Backend & Trading Systems Engineer" />
    <meta
      property="og:description"
      content="Backend systems at Amazon scale. Trading systems at market speed. Case studies, projects and ways to work together."
    />
```

- [ ] **Step 3: Rewrite** `client/src/styles/global.css` completely:

```css
:root {
  color-scheme: dark;
  --bg: #0b0d0c;
  --pane: #101513;
  --pane-2: #111614;
  --border: #23302a;
  --text: #d8e3dc;
  --text-2: #a9bcb2;
  --dim: #6f8379;
  --amber: #ffb000;
  --green: #3ddc84;
  --red: #ff6b5b;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --font-sans: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
  --radius: 6px;
  --max-width: 1200px;
  --header-height: 3.25rem;
  --status-bar-height: 2rem;

  /* Older component styles still use these names; they map onto the terminal tokens. */
  --surface: var(--bg);
  --surface-alt: var(--pane);
  --card: var(--pane);
  --accent: var(--amber);
  --accent-2: var(--green);
  --accent-3: var(--text);
  --accent-rgb: 255, 176, 0;
  --accent-2-rgb: 61, 220, 132;
  --text-dim: var(--text-2);
  --shadow-1: none;
  --shadow-2: none;
  --font-body: var(--font-sans);
  --font-display: var(--font-mono);
  --corner-xl: var(--radius);
  --corner-lg: var(--radius);
  --corner-md: var(--radius);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  line-height: 1.6;
  min-height: 100vh;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  /* Room for the fixed status bar, the open shell drawer (--shell-height, set in shell.css) and the iPhone home indicator. */
  padding-bottom: calc(var(--status-bar-height) + var(--shell-height, 0px) + env(safe-area-inset-bottom));
}

::selection {
  background: var(--amber);
  color: var(--bg);
}

a {
  color: inherit;
  text-decoration: none;
}

a:hover,
a:focus-visible {
  color: var(--green);
}

:focus-visible {
  outline: 2px solid var(--green);
  outline-offset: 2px;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-mono);
  font-weight: 600;
  margin: 0 0 0.5em;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--text);
}

p {
  margin: 0 0 1em;
  color: var(--text-2);
}

ul {
  margin: 0;
  padding-left: 1.2rem;
  color: var(--text-2);
}

img {
  max-width: 100%;
  display: block;
  border-radius: var(--radius);
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: var(--header-height);
}

.site {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page {
  position: relative;
  padding: clamp(2rem, 5vw, 3.5rem) clamp(1rem, 5vw, 3rem);
  margin: 0 auto;
  width: min(100%, var(--max-width));
}

.page__header {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-bottom: clamp(1.8rem, 4vw, 3rem);
  animation: fade-rise 0.5s ease both;
}

.page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.page__eyebrow {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--amber);
}

.page__title {
  font-size: clamp(1.8rem, 4.5vw, 2.9rem);
  margin: 0;
}

.page__lead {
  font-size: 1.05rem;
  max-width: 68ch;
  margin: 0;
}

.section-heading {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin-bottom: clamp(1.4rem, 3vw, 2.2rem);
}

.section-heading__label,
.pane__label {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--amber);
}

.pane__label {
  margin-bottom: 0.7rem;
}

.section-heading__title {
  font-size: clamp(1.5rem, 3.4vw, 2.3rem);
  margin: 0;
  max-width: 28ch;
}

.section-heading__lead {
  font-size: 1rem;
  max-width: 64ch;
  margin: 0;
}

.glass-panel,
.pane {
  position: relative;
  background: var(--pane);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: clamp(1.1rem, 3vw, 1.6rem);
}

.grid {
  display: grid;
  gap: clamp(1.2rem, 3vw, 2rem);
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: transparent;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease;
}

.button:hover,
.button:focus-visible {
  border-color: var(--green);
  color: var(--green);
}

.button--primary {
  background: var(--amber);
  border-color: var(--amber);
  color: var(--bg);
}

.button--primary:hover,
.button--primary:focus-visible {
  background: transparent;
  border-color: var(--amber);
  color: var(--amber);
}

.button--ghost {
  background: transparent;
}

.pill,
.chip {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: transparent;
  color: var(--text-2);
  font-family: var(--font-mono);
  font-size: 0.75rem;
}

button.chip {
  cursor: pointer;
}

button.chip:hover,
button.chip:focus-visible {
  border-color: var(--green);
  color: var(--green);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.section-divider {
  height: 1px;
  width: 100%;
  margin: clamp(2rem, 5vw, 3.5rem) 0;
  background: var(--border);
}

@keyframes fade-rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

@media (max-width: 768px) {
  .page {
    padding: clamp(1.6rem, 6vw, 2.4rem) 1rem;
  }
}
```

- [ ] **Step 4: Remove Lenis and the custom cursor.** Replace `client/src/App.jsx` with:

```jsx
import { AppLayout } from "@layout/AppLayout.jsx";
import { AppRoutes } from "./router.jsx";

const App = () => (
  <AppLayout>
    <AppRoutes />
  </AppLayout>
);

export default App;
```

In `client/src/layout/AppLayout.jsx`, delete the `ScrollProgress` and `AmbientBackground` imports and their two JSX lines (`<AmbientBackground />`, `<ScrollProgress />`). Keep everything else.

Then run:

```bash
cd client
git rm src/components/common/Cursor.jsx src/components/common/Cursor.css src/components/common/ScrollProgress.jsx src/components/background/AmbientBackground.jsx src/components/background/ambientBackground.css
npm uninstall @studio-freight/react-lenis
```

- [ ] **Step 5: Replace hard-coded light colors.**

`client/src/components/achievements/achievementGrid.css`: replace `color: rgba(28, 26, 22, 0.5);` with:

```css
  color: var(--dim);
  font-family: var(--font-mono);
```

`client/src/components/forms/projectBriefForm.css`: in `.brief-form__field input, ... textarea` replace `border-radius: 16px;` with `border-radius: var(--radius);`. Replace the whole `.brief-form__status--error` rule with:

```css
.brief-form__status--error {
  background: rgba(255, 107, 91, 0.12);
  color: var(--red);
  border: 1px solid rgba(255, 107, 91, 0.35);
}
```

`client/src/components/sections/contactSection.css`: in `.form-group input, .form-group textarea` replace `border-radius: 14px;` with `border-radius: var(--radius);`. Replace the `.submit-btn` and `.submit-btn:hover` rules with:

```css
.submit-btn {
  align-self: flex-start;
  background: var(--amber);
  border: 1px solid var(--amber);
  color: var(--bg);
  padding: 0.6rem 1.4rem;
  border-radius: var(--radius);
  font-family: var(--font-mono);
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
  margin-top: 1rem;
}

.submit-btn:hover {
  background: transparent;
  color: var(--amber);
}
```

Replace `color: #b42318;` in `.contact-status--error` with `color: var(--red);`.

`client/src/components/projects/projectGrid.css`: replace `box-shadow: 0 24px 50px rgba(67, 52, 36, 0.2);` with `box-shadow: none;`.

- [ ] **Step 6: Run the verify procedure.**
Expected: lint and unit tests pass; the build succeeds with no `@studio-freight/react-lenis` import errors; `23/23 checks passed`. The header is still light; Task 4 restyles it. Note the `index-*.js` gzip size; it should drop below 113.49 kB now that Lenis is gone.

- [ ] **Step 7: Look at it.** Open `/tmp/portfolio-desktop.png`, written by the verify script. Body text should be Inter on near-black, headings JetBrains Mono, and panels dark with thin borders. Then run `grep -rn -E "rgba\((248|255, 255, 255|67, 52|43, 36|31, 27|28, 26)" client/src --include="*.css"`. Expected: matches only in `siteHeader.css`, which Task 4 rewrites.

- [ ] **Step 8: Commit.**

```bash
git add -A client/index.html client/src client/package.json client/package-lock.json client/scripts/verify-redesign.mjs
# commit subject: "Switch to the dark terminal theme and drop Lenis, cursor and ambient background"
```

---

### Task 4: Header, status bar, footer and shared links

**Files:**
- Create: `client/src/data/links.js`
- Modify: `client/src/data/navigation.js`
- Rewrite: `client/src/components/navigation/SiteHeader.jsx`, `client/src/components/navigation/siteHeader.css`
- Create: `client/src/components/navigation/StatusBar.jsx`, `client/src/components/navigation/statusBar.css`
- Modify: `client/src/components/navigation/SiteFooter.jsx`, `client/src/components/navigation/siteFooter.css`
- Modify: `client/src/components/sections/ContactSection.jsx`, `client/src/pages/WorkWithMePage.jsx`
- Modify: `client/src/layout/AppLayout.jsx`
- Modify: `client/scripts/verify-redesign.mjs`

**Interfaces:**
- Produces:
  - `links.js` exports `EMAIL`, `UPWORK_URL` and `socialLinks: Array<{label, href}>`; the shell uses them in Task 9.
  - `NAV_ITEMS: Array<{ path, key, label }>`.
  - `SiteHeader` defines a `goTo(path)` closure that handles both routes and `#section` paths; Task 10 reuses it for the number keys.
  - `<StatusBar>{leftSlot}</StatusBar>`: children render on the left and the copyright on the right. Task 10 passes the shell button as children.

- [ ] **Step 1: Write the failing browser checks.** In `client/scripts/verify-redesign.mjs`, directly after the `check("social links are real", ...)` line, insert:

```js
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
```

In the mobile pass, directly after the `check("reduced-motion counters show final value", ...)` line, insert:

```js
  await attempt(mobile.click(".site-header__toggle"));
  check("mobile menu offers the PDF", await mobile.locator('.site-nav__pdf a[href$="resume.pdf"]').isVisible());
  await attempt(mobile.click(".site-header__scrim"));
```

- [ ] **Step 2: Run the verify procedure to see them fail.**
Expected: the nav, status-bar, header-scroll and mobile-PDF checks FAIL. The footer Upwork check already passes; the link was added earlier on this branch.

- [ ] **Step 3: Create** `client/src/data/links.js`:

```js
export const EMAIL = "pravesh.pandey.mnnit@gmail.com";
export const UPWORK_URL = "https://www.upwork.com/freelancers/~0189bb4c7f00dbde1e";

export const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/pravesh25/" },
  { label: "GitHub", href: "https://github.com/pravesh-pandey" },
  { label: "LeetCode", href: "https://leetcode.com/u/pravesh_pandey/" },
  { label: "Upwork", href: UPWORK_URL }
];
```

- [ ] **Step 4: Replace** `client/src/data/navigation.js`:

```js
export const NAV_ITEMS = [
  { path: "/work-with-me", key: "1", label: "hire" },
  { path: "/trading", key: "2", label: "trading" },
  { path: "#experience", key: "3", label: "experience" },
  { path: "/projects", key: "4", label: "projects" }
];
```

- [ ] **Step 5: Rewrite** `client/src/components/navigation/SiteHeader.jsx`:
- The header no longer hides on scroll. That drops `useScroll` and `useMotionValueEvent`, and with them the scroll-linked framer-motion code it needed.
- The CV button reads `cv.pdf`.
- The mobile menu gains a `cv.pdf` item, since the header button is hidden on very small screens.

```jsx
import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { NAV_ITEMS } from "@data/navigation.js";
import "./siteHeader.css";

const cls = (...classes) => classes.filter(Boolean).join(" ");

// A terminal keeps its chrome on screen, so the header no longer hides on scroll.
export const SiteHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const resumeHref = `${import.meta.env.BASE_URL}resume.pdf`;
  const closeMenu = () => setIsOpen(false);

  // Paths starting with "#" are home-page sections; everything else is a route.
  const goTo = (path) => {
    closeMenu();
    if (!path.startsWith("#")) {
      navigate(path);
    } else if (location.pathname !== "/") {
      navigate(`/${path}`);
    } else if (location.hash === path) {
      // Same hash: navigation would be a no-op, so scroll directly.
      document.getElementById(path.slice(1))?.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth" });
    } else {
      // Keep the URL hash in sync; useHashScroll performs the scroll.
      navigate(path);
    }
  };

  return (
    <header className="site-header">
      <div className="site-header__container">
        <NavLink to="/" className="site-header__logo" onClick={closeMenu}>
          PP_
        </NavLink>

        <nav className={cls("site-nav", isOpen && "site-nav--open")} aria-label="Primary">
          <ul className="site-nav__list">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <a
                  href={item.path}
                  className="site-nav__link"
                  aria-current={location.pathname === item.path ? "page" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    goTo(item.path);
                  }}
                >
                  <span className="site-nav__key">[{item.key}]</span> {item.label}
                </a>
              </li>
            ))}
            <li className="site-nav__pdf">
              <a href={resumeHref} className="site-nav__link" target="_blank" rel="noreferrer">
                cv.pdf
              </a>
            </li>
          </ul>
        </nav>

        <div className="site-header__actions">
          <a className="button button--ghost" href={resumeHref} target="_blank" rel="noreferrer">
            cv.pdf
          </a>
          <button
            className="site-header__toggle"
            type="button"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
          >
            <span aria-hidden="true">[≡]</span> menu
          </button>
        </div>
      </div>
      <div
        className={cls("site-header__scrim", isOpen && "site-header__scrim--visible")}
        aria-hidden="true"
        onClick={closeMenu}
      />
    </header>
  );
};
```

- [ ] **Step 6: Rewrite** `client/src/components/navigation/siteHeader.css`:

```css
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: rgba(11, 13, 12, 0.94);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(6px);
}

.site-header__container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  width: min(calc(100% - 2rem), var(--max-width));
  height: 3.25rem;
  margin: 0 auto;
  font-family: var(--font-mono);
}

.site-header__logo {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--amber);
}

.site-nav__list {
  display: flex;
  gap: 1.4rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.site-nav__link {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text-2);
}

.site-nav__key {
  color: var(--dim);
}

.site-nav__link:hover,
.site-nav__link[aria-current="page"] {
  color: var(--green);
}

.site-nav__link[aria-current="page"] .site-nav__key {
  color: var(--green);
}

.site-nav__pdf {
  display: none;
}

.site-header__actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.site-header__actions .button {
  min-height: 2rem;
  padding: 0.25rem 0.8rem;
}

.site-header__toggle {
  display: none;
  align-items: center;
  gap: 0.35rem;
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
}

@media (max-width: 760px) {
  .site-nav {
    position: fixed;
    top: 0;
    right: -100%;
    height: 100vh;
    width: min(280px, 80vw);
    padding: 4.5rem 1.5rem 2rem;
    background: var(--pane);
    border-left: 1px solid var(--border);
    transition: right 0.25s ease;
    z-index: 100;
  }

  .site-nav--open {
    right: 0;
  }

  .site-nav__list {
    flex-direction: column;
    gap: 1.1rem;
  }

  .site-nav__link {
    font-size: 1rem;
  }

  .site-nav__pdf {
    display: list-item;
    list-style: none;
  }

  .site-header__toggle {
    display: inline-flex;
    position: relative;
    z-index: 110;
  }

  .site-header__scrim {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    z-index: 90;
  }

  .site-header__scrim--visible {
    opacity: 1;
    pointer-events: auto;
  }
}

@media (max-width: 480px) {
  .site-header__actions .button--ghost {
    display: none;
  }
}
```

- [ ] **Step 7: Create** `client/src/components/navigation/StatusBar.jsx`:

```jsx
import "./statusBar.css";

export const StatusBar = ({ children }) => (
  <div className="status-bar">
    <div className="status-bar__left">{children}</div>
    <span className="status-bar__copy">© {new Date().getFullYear()} Pravesh Pandey</span>
  </div>
);
```

and `client/src/components/navigation/statusBar.css`:

```css
.status-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  height: calc(var(--status-bar-height) + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 1rem env(safe-area-inset-bottom);
  background: var(--pane-2);
  border-top: 1px solid var(--border);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--dim);
}

.status-bar__left {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
```

- [ ] **Step 8: Footer.** Replace `client/src/components/navigation/SiteFooter.jsx`:

```jsx
import { EMAIL, socialLinks } from "@data/links.js";
import "./siteFooter.css";

const footerLinks = [...socialLinks, { label: "Email", href: `mailto:${EMAIL}` }];

export const SiteFooter = () => (
  <footer className="site-footer">
    <div className="site-footer__content">
      <h3>Let’s engineer what’s next.</h3>
      <p>
        Software engineer at Amazon Alexa AI, building backend systems at scale and trading systems at
        market speed.
      </p>
    </div>
    <ul className="site-footer__links">
      {footerLinks.map((item) => (
        <li key={item.href}>
          <a href={item.href} target="_blank" rel="noopener noreferrer">
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  </footer>
);
```

In `client/src/components/navigation/siteFooter.css`, delete the `backdrop-filter: blur(16px);` line and the whole `.site-footer__copy` rule. Change `.site-footer__content h3` font-size to `clamp(1.2rem, 3vw, 1.6rem)`.

- [ ] **Step 9: Use the shared links.** In `client/src/components/sections/ContactSection.jsx`:
- Delete the local `socialLinks` array.
- Add `import { EMAIL, socialLinks } from "@data/links.js";`.
- Replace each hard-coded `pravesh.pandey.mnnit@gmail.com`: use `` `mailto:${EMAIL}` `` in the two `href`s and `{EMAIL}` in the two link texts.

In `client/src/pages/WorkWithMePage.jsx`:
- Add `import { EMAIL, UPWORK_URL } from "@data/links.js";`.
- Use `` href={`mailto:${EMAIL}`} `` with text `{EMAIL}`.
- Use `href={UPWORK_URL}` for the Upwork link.

- [ ] **Step 10: Mount the status bar.** In `client/src/layout/AppLayout.jsx`, add `import { StatusBar } from "@components/navigation/StatusBar.jsx";` and render `<StatusBar />` immediately after the closing `</div>` of `.site` (inside the fragment).

- [ ] **Step 11: Run the verify procedure.**
Expected: every check passes, including the new ones.

- [ ] **Step 12: Commit.**

```bash
git add client/src client/scripts/verify-redesign.mjs
# commit subject: "Terminal header with numbered nav, bottom status bar and shared links"
```

---
### Task 5: Case-study pages, decision logs and /trading

**Files:**
- Create: `client/src/hooks/useDocumentTitle.js`
- Create: `client/src/components/caseStudies/CaseStudyPane.jsx`, `Pipeline.jsx`, `HireCta.jsx`, `caseStudies.css`
- Create: `client/src/pages/CaseStudyPage.jsx`, `client/src/pages/TradingPage.jsx`
- Modify: `client/src/router.jsx`
- Modify: `client/scripts/verify-redesign.mjs`

**Interfaces:**
- Consumes: `caseStudies`, `findCaseStudy` (Task 2); `EMAIL` (Task 4); verify helpers (Task 3).
- Produces:
  - `useDocumentTitle(title: string)`.
  - `<CaseStudyPane study={study} />` (class `case-pane case-pane--study`).
  - `<Pipeline stages={string[]} />`.
  - `<HireCta topic={string} />` (class `hire-cta`).
  - The `.case-grid` layout class.
  - Routes `/trading` and `/case-studies/:slug`.

- [ ] **Step 1: Write the failing browser checks.** In `client/scripts/verify-redesign.mjs`, insert directly before `await page.goto(\`${BASE}/projects\`, ...)`:

```js
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
```

- [ ] **Step 2: Run the verify procedure to see them fail.**
Expected: the trading-page, case-study and tab-title checks FAIL, because those routes render the 404 page. `unknown case study shows 404` and `nav [2] trading opens /trading` already pass; the latter only checks the URL.

- [ ] **Step 3: Create** `client/src/hooks/useDocumentTitle.js`:

```js
import { useEffect } from "react";

// Sets the tab title to "<title> · Pravesh Pandey" while the page is mounted, then restores it.
// (Link previews on LinkedIn/Upwork read index.html's static tags; crawlers there don't run JS.)
export const useDocumentTitle = (title) => {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} · Pravesh Pandey`;
    return () => {
      document.title = previous;
    };
  }, [title]);
};
```

- [ ] **Step 4: Create** `client/src/components/caseStudies/Pipeline.jsx`:

```jsx
export const Pipeline = ({ stages }) => (
  <ol className="pipeline" aria-label="How it works, step by step">
    {stages.map((stage) => (
      <li className="pipeline__stage" key={stage}>
        <span className="pipeline__box">{stage}</span>
      </li>
    ))}
  </ol>
);
```

- [ ] **Step 5: Create** `client/src/components/caseStudies/CaseStudyPane.jsx`:

```jsx
import { Link } from "react-router-dom";

export const CaseStudyPane = ({ study }) => (
  <article className="pane case-pane case-pane--study">
    <p className="pane__label">case study · {study.kind}</p>
    <h3 className="case-pane__title">{study.title}</h3>
    <p className="case-pane__summary">{study.summary}</p>
    <div className="chips">
      {study.stack.slice(0, 4).map((tech) => (
        <span className="chip" key={tech}>
          {tech}
        </span>
      ))}
    </div>
    <Link className="case-pane__link" to={`/case-studies/${study.slug}`}>
      read case study →
    </Link>
  </article>
);
```

- [ ] **Step 6: Create** `client/src/components/caseStudies/HireCta.jsx`. The walkthrough link opens an email with the topic in the subject:

```jsx
import { Link } from "react-router-dom";
import { EMAIL } from "@data/links.js";

export const HireCta = ({ topic }) => (
  <aside className="pane hire-cta" aria-label="Work with me">
    <p className="pane__label">next step</p>
    <p className="hire-cta__title">Need something like this?</p>
    <div className="hire-cta__actions">
      <Link className="button button--primary" to="/work-with-me">
        → hire me
      </Link>
      <a className="button" href={`mailto:${EMAIL}?subject=${encodeURIComponent(`Walkthrough: ${topic}`)}`}>
        ask for a walkthrough
      </a>
    </div>
  </aside>
);
```

- [ ] **Step 7: Create** `client/src/components/caseStudies/caseStudies.css`. On phones, the decision table stacks each row into labelled lines, so it never scrolls sideways.

```css
.case-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  gap: 1rem;
}

.case-pane {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.case-pane__title {
  margin: 0;
  font-size: 1.25rem;
}

.case-pane__summary {
  margin: 0;
  font-size: 0.95rem;
}

.case-pane__link {
  margin-top: auto;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--green);
}

.case-pane--lab {
  border-style: dashed;
}

.case-study__sections {
  display: grid;
  gap: 1rem;
  max-width: 900px;
}

.case-study__sections p:last-child {
  margin-bottom: 0;
}

.case-study__sections li + li {
  margin-top: 0.4rem;
}

.case-study__code {
  margin: 1rem 0 0;
  font-family: var(--font-mono);
  font-size: 0.85rem;
}

.case-study__code a {
  color: var(--green);
}

.pipeline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0 0 1.2rem;
}

.pipeline__stage {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pipeline__stage:not(:last-child)::after {
  content: "→";
  color: var(--amber);
}

.pipeline__box {
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text);
  overflow-wrap: anywhere;
}

.decision-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.decision-table th,
.decision-table td {
  padding: 0.55rem 0.6rem;
  border-top: 1px solid var(--border);
  text-align: left;
  vertical-align: top;
  color: var(--text-2);
}

.decision-table thead th {
  border-top: none;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dim);
}

.decision-table tbody th {
  font-family: var(--font-mono);
  font-weight: 500;
  color: var(--text);
}

.decision-table td:nth-child(2) {
  color: var(--green);
}

.not-published {
  margin-top: 1rem;
}

.not-published ul {
  display: grid;
  gap: 0.5rem;
}

.not-published p:last-child {
  margin: 1rem 0 0;
}

.hire-cta__title {
  margin: 0 0 1rem;
  font-family: var(--font-mono);
  font-size: 1.1rem;
  color: var(--text);
}

.hire-cta__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.trading-page .hire-cta {
  margin-top: 1rem;
}

@media (max-width: 640px) {
  .decision-table thead {
    display: none;
  }

  .decision-table tr,
  .decision-table th,
  .decision-table td {
    display: block;
  }

  .decision-table tbody th {
    padding-top: 0.8rem;
  }

  .decision-table td {
    border-top: none;
    padding-top: 0.2rem;
  }

  .decision-table td::before {
    content: attr(data-label) ": ";
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--dim);
  }

  .pipeline {
    flex-direction: column;
    align-items: flex-start;
  }

  .pipeline__stage {
    flex-direction: column;
    align-items: flex-start;
  }

  .pipeline__stage:not(:last-child)::after {
    content: "↓";
    padding-left: 0.8rem;
  }
}
```

- [ ] **Step 8: Create** `client/src/pages/CaseStudyPage.jsx`. Hooks run before the early return, as React requires.

```jsx
import { useParams } from "react-router-dom";
import { PageIntro } from "@components/common/PageIntro.jsx";
import { Pipeline } from "@components/caseStudies/Pipeline.jsx";
import { HireCta } from "@components/caseStudies/HireCta.jsx";
import { findCaseStudy } from "@data/caseStudies.js";
import { useDocumentTitle } from "@hooks/useDocumentTitle.js";
import { NotFoundPage } from "./NotFoundPage.jsx";
import "@components/caseStudies/caseStudies.css";

const KIND_LABEL = { trading: "Trading systems", infrastructure: "Infrastructure" };

export const CaseStudyPage = () => {
  const { slug } = useParams();
  const study = findCaseStudy(slug);
  useDocumentTitle(study ? study.title : "Not found");
  if (!study) return <NotFoundPage />;

  return (
    <article className="page case-study">
      <PageIntro eyebrow={`${KIND_LABEL[study.kind]} / case study`} title={study.title} lead={study.summary} />
      <div className="case-study__sections">
        <section className="pane">
          <h2 className="pane__label">The problem</h2>
          <p>{study.problem}</p>
        </section>
        <section className="pane">
          <h2 className="pane__label">How it works</h2>
          <Pipeline stages={study.pipeline} />
          {study.approach.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
        <section className="pane">
          <h2 className="pane__label">Decision log</h2>
          <table className="decision-table">
            <thead>
              <tr>
                <th scope="col">Decision</th>
                <th scope="col">Chosen</th>
                <th scope="col">Rejected, and why</th>
              </tr>
            </thead>
            <tbody>
              {study.decisions.map((row) => (
                <tr key={row.decision}>
                  <th scope="row">{row.decision}</th>
                  <td data-label="Chosen">{row.chosen}</td>
                  <td data-label="Rejected">{row.rejected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="pane">
          <h2 className="pane__label">Engineering highlights</h2>
          <ul>
            {study.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="pane">
          <h2 className="pane__label">{"Limits and what's next"}</h2>
          <ul>
            {study.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="pane">
          <h2 className="pane__label">Stack</h2>
          <div className="chips">
            {study.stack.map((tech) => (
              <span className="chip" key={tech}>
                {tech}
              </span>
            ))}
          </div>
          <p className="case-study__code">
            {study.codeLink ? (
              <a href={study.codeLink} target="_blank" rel="noopener noreferrer">
                view the code on GitHub →
              </a>
            ) : (
              "Code available on request."
            )}
          </p>
        </section>
        <HireCta topic={study.title} />
      </div>
    </article>
  );
};
```

- [ ] **Step 9: Create** `client/src/pages/TradingPage.jsx`, including the "What I don't publish, and why" pane:

```jsx
import { PageIntro } from "@components/common/PageIntro.jsx";
import { CaseStudyPane } from "@components/caseStudies/CaseStudyPane.jsx";
import { HireCta } from "@components/caseStudies/HireCta.jsx";
import { caseStudies } from "@data/caseStudies.js";
import { useDocumentTitle } from "@hooks/useDocumentTitle.js";
import "@components/caseStudies/caseStudies.css";

export const TradingPage = () => {
  useDocumentTitle("Trading systems");

  return (
    <div className="page trading-page">
      <PageIntro
        eyebrow="Trading systems"
        title="Market software, engineered like production systems."
        lead="Order-flow detection and options research for Indian markets, built with the same rigor as large-scale backend services."
      />
      <div className="case-grid">
        {caseStudies
          .filter((study) => study.kind === "trading")
          .map((study) => (
            <CaseStudyPane key={study.slug} study={study} />
          ))}
      </div>
      <section className="pane not-published" aria-labelledby="not-published-title">
        <h2 className="pane__label" id="not-published-title">
          {"What I don't publish, and why"}
        </h2>
        <ul>
          <li>
            No P&amp;L, win rates or Sharpe ratios. Backtest figures are easy to overfit and impossible to verify from a
            web page, so a number here would prove nothing.
          </li>
          <li>No live-trading claims. FlowPulse paper-trades its signals; nothing here routes real capital.</li>
          <li>No strategy parameters. The engineering is open to discuss; the edge stays private.</li>
        </ul>
        <p>Want to judge the rigor yourself? Ask for a walkthrough of the code and the method.</p>
      </section>
      <HireCta topic="trading systems" />
    </div>
  );
};
```

- [ ] **Step 10: Add routes.** In `client/src/router.jsx`, add the imports:

```jsx
import { TradingPage } from "@pages/TradingPage.jsx";
import { CaseStudyPage } from "@pages/CaseStudyPage.jsx";
```

and, after the `/projects` route:

```jsx
    <Route path="/trading" element={<TradingPage />} />
    <Route path="/case-studies/:slug" element={<CaseStudyPage />} />
```

- [ ] **Step 11: Run the verify procedure.**
Expected: every check passes.

- [ ] **Step 12: Commit.**

```bash
git add client/src client/scripts/verify-redesign.mjs
# commit subject: "Add case-study pages with decision logs and the trading systems page"
```

---

### Task 6: Hero with three paths, and home restructure

**Files:**
- Rewrite: `client/src/components/sections/HeroSection.jsx`, `client/src/components/sections/heroSection.css`
- Create: `client/src/hooks/useTypewriter.js`
- Create: `client/src/components/sections/TradingTeaserSection.jsx`
- Modify: `client/src/pages/HomePage.jsx`, `client/src/pages/homePage.css`
- Rewrite: `client/src/components/sections/ImpactSection.jsx`, `client/src/components/sections/impactSection.css`
- Modify: `client/src/components/common/SectionHeading.jsx`
- Modify: section numbers in `AboutSection.jsx`, `ExperienceSection.jsx`, `FeaturedProjectsSection.jsx`, `SkillsSection.jsx`, `AwardsSection.jsx`, `ContactSection.jsx`; About copy; CV link in `ExperienceSection.jsx`
- Modify: `client/scripts/verify-redesign.mjs`

**Interfaces:**
- Consumes: `CaseStudyPane`, `.case-grid` (Task 5).
- Produces: `useTypewriter(text: string, msPerChar: number) → string`; home section `#trading`; hero classes `.hero__title`, `.hero__path`, `.hero__tag`.

- [ ] **Step 1: Update the browser checks.** In `client/scripts/verify-redesign.mjs`:

Below the `BASE` constant, add:

```js
const TAGLINE = "> pravesh pandey · sde @ amazon alexa ai · quant dev";
```

Replace:

```js
  check("hero renders", (await page.locator(".hero-scene__title").count()) === 1);
```

with:

```js
  check("hero renders", (await page.locator(".hero__title").count()) === 1);
  check("hero offers three paths", (await page.locator(".hero__path").count()) === 3);
  await attempt(page.click('.site-nav__link:has-text("trading")'));
  await attempt(page.click(".site-header__logo"));
  check("tagline doesn't retype on return", (await text(page, '.hero__tag [aria-hidden="true"]')) === TAGLINE);
  check("experience section links the PDF", (await page.locator('#experience a[href$="resume.pdf"]').count()) === 1);
```

Change the section list to start with `"trading"`: `for (const id of ["trading", "impact", "about", "experience", "projects", "skills", "awards", "contact"]) {`.

Replace the mobile check `check("mobile hero renders", (await mobile.locator(".hero-scene__title").count()) === 1);` with:

```js
  check("mobile hero renders", (await mobile.locator(".hero__title").count()) === 1);
  check("reduced motion shows the full tagline at once", (await text(mobile, '.hero__tag [aria-hidden="true"]')) === TAGLINE);
```

- [ ] **Step 2: Run the verify procedure to see them fail.**
Expected: these checks FAIL:
- `hero renders`
- `hero offers three paths`
- `tagline doesn't retype on return`
- `experience section links the PDF`
- `section #trading exists`
- `mobile hero renders`
- the reduced-motion tagline check

- [ ] **Step 3: Create** `client/src/hooks/useTypewriter.js`:

```js
import { useEffect, useState } from "react";

// Reveals `text` one character every `msPerChar` ms; msPerChar <= 0 returns the full text.
export const useTypewriter = (text, msPerChar) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (msPerChar <= 0 || count >= text.length) return undefined;
    const id = setTimeout(() => setCount(count + 1), msPerChar);
    return () => clearTimeout(id);
  }, [count, text, msPerChar]);

  return msPerChar <= 0 ? text : text.slice(0, count);
};
```

- [ ] **Step 4: Rewrite** `client/src/components/sections/HeroSection.jsx`.
- The tagline types once per visit. `firstVisit` is captured once per mount, so the module flag set after the first render can't cut the typing short.
- Path 3 says "Experience," matching the `[3] experience` menu item.

```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { useTypewriter } from "@hooks/useTypewriter.js";
import "./heroSection.css";

const TAGLINE = "> pravesh pandey · sde @ amazon alexa ai · quant dev";

const PATHS = [
  { key: "1", to: "/work-with-me", title: "Hire me", detail: "Projects & Upwork" },
  { key: "2", to: "/trading", title: "Trading systems", detail: "Order flow, backtesting" },
  { key: "3", to: { pathname: "/", hash: "#experience" }, title: "Experience", detail: "Track record & CV" }
];

// The tagline types out once per visit; coming back to the home page shows it instantly.
let taglineTyped = false;

export const HeroSection = () => {
  const reduceMotion = useReducedMotion();
  const [firstVisit] = useState(() => !taglineTyped);
  const typed = useTypewriter(TAGLINE, reduceMotion || !firstVisit ? 0 : 35);

  useEffect(() => {
    taglineTyped = true;
  }, []);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <p className="hero__tag">
        <span className="sr-only">{TAGLINE}</span>
        <span aria-hidden="true">{typed}</span>
      </p>
      <h1 className="hero__title" id="hero-title">
        Backend systems at Amazon scale.{" "}
        <span className="hero__accent">
          Trading systems at market speed.
          <span className="hero__cursor" aria-hidden="true" />
        </span>
      </h1>
      <p className="hero__lead">
        I design, build and ship software that has to be fast and correct, for clients, teams and markets.
      </p>
      <nav className="hero__paths" aria-label="Choose a path">
        {PATHS.map((path) => (
          <Link key={path.key} className="hero__path" to={path.to}>
            <span className="hero__path-title">
              <span className="hero__path-key">[{path.key}]</span> {path.title} →
            </span>
            <span className="hero__path-detail">{path.detail}</span>
          </Link>
        ))}
      </nav>
    </section>
  );
};
```

- [ ] **Step 5: Rewrite** `client/src/components/sections/heroSection.css`:

```css
.hero {
  width: min(100%, var(--max-width));
  margin: 0 auto;
  padding: clamp(3rem, 10vh, 6rem) clamp(1rem, 5vw, 3rem) clamp(2rem, 6vh, 4rem);
}

.hero__tag {
  min-height: 1.6em;
  margin: 0 0 1.2rem;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--dim);
}

.hero__title {
  max-width: 22ch;
  margin: 0 0 1.2rem;
  font-size: clamp(1.9rem, 5.2vw, 3.6rem);
  line-height: 1.15;
}

.hero__accent {
  display: block;
  color: var(--green);
}

.hero__cursor {
  display: inline-block;
  width: 0.55em;
  height: 0.9em;
  margin-left: 0.15em;
  vertical-align: -0.08em;
  background: var(--green);
  animation: hero-blink 1s steps(1) infinite;
}

@keyframes hero-blink {
  50% {
    opacity: 0;
  }
}

.hero__lead {
  max-width: 56ch;
  margin: 0 0 2rem;
  font-size: clamp(1rem, 1.4vw, 1.15rem);
}

.hero__paths {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
  max-width: 900px;
}

.hero__path {
  display: grid;
  gap: 0.25rem;
  padding: 0.9rem 1rem;
  background: var(--pane);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: border-color 0.15s ease;
}

.hero__path:hover,
.hero__path:focus-visible {
  border-color: var(--green);
  color: inherit;
}

.hero__path-title {
  font-family: var(--font-mono);
  font-size: 0.95rem;
  color: var(--amber);
}

.hero__path-key {
  color: var(--dim);
}

.hero__path-detail {
  font-size: 0.85rem;
  color: var(--text-2);
}

@media (max-width: 640px) {
  .hero__paths {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .hero__path {
    padding: 0.4rem 0.9rem;
    border-radius: 999px;
  }

  .hero__path-title {
    font-size: 0.85rem;
  }

  .hero__path-detail {
    display: none;
  }
}
```

- [ ] **Step 6: Create** `client/src/components/sections/TradingTeaserSection.jsx`:

```jsx
import { Link } from "react-router-dom";
import { SectionHeading } from "@components/common/SectionHeading.jsx";
import { CaseStudyPane } from "@components/caseStudies/CaseStudyPane.jsx";
import { caseStudies } from "@data/caseStudies.js";
import "@components/caseStudies/caseStudies.css";

export const TradingTeaserSection = () => (
  <section id="trading" className="home-section">
    <SectionHeading
      number="01"
      label="Trading systems"
      title="Built for markets that don't wait."
      lead="Order-flow detection and options research for Indian markets, engineered like production software."
    />
    <div className="case-grid">
      {caseStudies
        .filter((study) => study.kind === "trading")
        .map((study) => (
          <CaseStudyPane key={study.slug} study={study} />
        ))}
    </div>
    <div className="featured-projects__more">
      <Link className="button" to="/trading">
        all trading work →
      </Link>
    </div>
  </section>
);
```

- [ ] **Step 7: Home order.** In `client/src/pages/HomePage.jsx`, import `TradingTeaserSection` from `@components/sections/TradingTeaserSection.jsx` and render `<TradingTeaserSection />` as the first child of `.home__sections`, before `<ImpactSection />`.

- [ ] **Step 8: Simplify the impact panel.** This removes the sticky 150vh scene and the scroll progress bar. Replace `client/src/components/sections/ImpactSection.jsx`:

```jsx
import { CountUp } from "@components/common/CountUp.jsx";
import { Reveal } from "@components/common/Reveal.jsx";
import { impactMetrics } from "@data/profile.js";
import "./impactSection.css";

export const ImpactSection = () => (
  <section id="impact" className="home-section impact">
    <Reveal className="pane">
      <h2 className="pane__label">Impact at Amazon</h2>
      <dl className="impact__grid">
        {impactMetrics.map((metric) => (
          <div className="impact__metric" key={metric.label}>
            <dt>
              <CountUp to={metric.value} suffix={metric.suffix} />
            </dt>
            <dd>{metric.label}</dd>
          </div>
        ))}
      </dl>
    </Reveal>
  </section>
);
```

and `client/src/components/sections/impactSection.css`:

```css
.impact__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(1rem, 3vw, 1.6rem);
  margin: 0.4rem 0 0;
}

.impact__metric dt {
  font-family: var(--font-mono);
  font-size: clamp(1.4rem, 3vw, 2.1rem);
  color: var(--amber);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.impact__metric dd {
  margin: 0.4rem 0 0;
  color: var(--text-2);
  font-size: 0.9rem;
}

@media (max-width: 900px) {
  .impact__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

- [ ] **Step 9: Terminal section labels.** In `client/src/components/common/SectionHeading.jsx`, replace `{number} — {label}` with `[{number}] {label}`.

- [ ] **Step 10: Renumber the home sections.** Change the `number` prop in each file:

| File | from | to |
|---|---|---|
| `AboutSection.jsx` | `"01"` | `"02"` |
| `ExperienceSection.jsx` | `"02"` | `"03"` |
| `FeaturedProjectsSection.jsx` | `"03"` | `"04"` |
| `SkillsSection.jsx` | `"04"` | `"05"` |
| `AwardsSection.jsx` | `"05"` | `"06"` |
| `ContactSection.jsx` | `"06"` | `"07"` |

- [ ] **Step 11: CV link in Experience.** This gives phones a PDF link outside the header. In `client/src/components/sections/ExperienceSection.jsx`, add directly after `<ExperienceTimeline items={experienceTimeline} />`:

```jsx
    <p className="experience__cv">
      <a className="button" href={`${import.meta.env.BASE_URL}resume.pdf`} target="_blank" rel="noreferrer">
        download cv.pdf →
      </a>
    </p>
```

and append to `client/src/pages/homePage.css`:

```css
.experience__cv {
  margin: 1.4rem 0 0;
}
```

- [ ] **Step 12: About copy.** In `client/src/components/sections/AboutSection.jsx`, append this sentence to the end of the second paragraph (after "…stay reliable as they grow."):

```
 Outside Amazon, I build trading systems for Indian markets (order-flow detection and options research) with the same production discipline.
```

In the Snapshot list, change the Focus line to `<strong>Focus</strong> Distributed systems · Trading systems · Backend services`.

- [ ] **Step 13: Run the verify procedure.**
Expected: every check passes. Note the `index-*.js` gzip size (must be ≤ 113.5 kB).

- [ ] **Step 14: Commit.**

```bash
git add client/src client/scripts/verify-redesign.mjs
# commit subject: "Value-led hero with three paths and a trading-systems section on home"
```

---

### Task 7: Project cards with case-study, hire and anchor links

**Files:**
- Rewrite: `client/src/components/projects/ProjectGrid.jsx`, `client/src/components/projects/projectGrid.css`
- Rewrite: `client/src/pages/ProjectsPage.jsx`
- Modify: `client/scripts/verify-redesign.mjs`

**Interfaces:**
- Consumes: project `slug`s (Task 1), `caseStudies` (Task 2), `useDocumentTitle` (Task 5).
- Produces:
  - Every `.project-card` is an `<article id={slug}>`, never an `<a>`, so links can nest inside it.
  - Each card has a `.project-card__hire` link, plus a link to `/case-studies/<slug>` when a case study exists.
  - `/projects#<slug>` scrolls to that card (used by the shell's `open` in Task 9).

- [ ] **Step 1: Write the failing browser checks.** In `client/scripts/verify-redesign.mjs`, after `check("projects page shows 12 cards", ...)`, insert:

```js
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
```

- [ ] **Step 2: Run the verify procedure to see them fail.**
Expected: the three new checks FAIL.

- [ ] **Step 3: Rewrite** `client/src/components/projects/ProjectGrid.jsx`:

```jsx
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { caseStudies } from "@data/caseStudies.js";
import "./projectGrid.css";

const caseStudySlugs = new Set(caseStudies.map((study) => study.slug));

export const ProjectGrid = ({ projects }) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="project-grid">
      {projects.map((project, index) => (
        <motion.article
          key={project.slug}
          id={project.slug}
          className="project-card"
          initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, delay: (index % 3) * 0.08, ease: "easeOut" }}
        >
          <div className="project-card__header">
            <h3>{project.title}</h3>
            <p>{project.tagline}</p>
          </div>
          <p className="project-card__description">{project.description}</p>
          <ul>
            {project.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          <div className="project-card__stack">
            {project.stack.map((tech) => (
              <span className="pill" key={tech}>
                {tech}
              </span>
            ))}
          </div>
          <div className="project-card__links">
            {caseStudySlugs.has(project.slug) && (
              <Link className="project-card__link" to={`/case-studies/${project.slug}`}>
                read case study →
              </Link>
            )}
            {project.link && (
              <a className="project-card__link" href={project.link} target="_blank" rel="noopener noreferrer">
                view on GitHub →
              </a>
            )}
            <Link className="project-card__hire" to="/work-with-me">
              need this? → hire
            </Link>
          </div>
        </motion.article>
      ))}
    </div>
  );
};
```

- [ ] **Step 4: Rewrite** `client/src/components/projects/projectGrid.css`. `minmax(min(100%, 320px), 1fr)` replaces the old fixed `350px` minimum, which overflowed 375px screens.

```css
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
  gap: 1.2rem;
}

.project-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.4rem;
  background: var(--pane);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: border-color 0.15s ease;
  scroll-margin-top: calc(var(--header-height) + 1rem);
}

.project-card:hover {
  border-color: var(--amber);
}

.project-card__header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.project-card__header p {
  margin: 0.35rem 0 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--amber);
}

.project-card__description {
  margin: 0;
  font-size: 0.95rem;
}

.project-card ul {
  margin: 0;
  padding-left: 1.1rem;
  font-size: 0.9rem;
}

.project-card__stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: auto;
}

.project-card__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.2rem;
  padding-top: 0.8rem;
  border-top: 1px dashed var(--border);
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

.project-card__link {
  color: var(--green);
}

.project-card__hire {
  margin-left: auto;
  color: var(--amber);
}
```

- [ ] **Step 5: Rewrite** `client/src/pages/ProjectsPage.jsx`:

```jsx
import { PageIntro } from "@components/common/PageIntro.jsx";
import { ProjectGrid } from "@components/projects/ProjectGrid.jsx";
import { projectShowcase } from "@data/profile.js";
import { useHashScroll } from "@hooks/useHashScroll.js";
import { useDocumentTitle } from "@hooks/useDocumentTitle.js";

export const ProjectsPage = () => {
  useHashScroll();
  useDocumentTitle("Projects");

  return (
    <div className="page projects-page">
      <PageIntro
        eyebrow="Projects"
        title="All projects."
        lead="Everything from trading systems and infrastructure to AI, IoT, automation, and full-stack builds."
      />
      <ProjectGrid projects={projectShowcase} />
    </div>
  );
};
```

- [ ] **Step 6: Run the verify procedure.**
Expected: every check passes.

- [ ] **Step 7: Commit.**

```bash
git add client/src/components/projects client/src/pages/ProjectsPage.jsx client/scripts/verify-redesign.mjs
# commit subject: "Project cards link to case studies, end with a hire link and can be deep-linked"
```

---

### Task 8: Phase 1 checks, docs and review stop

**Files:**
- Modify: `client/scripts/verify-redesign.mjs`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add the mobile overflow check (Review Focus 4).** In `client/scripts/verify-redesign.mjs`, in the mobile pass, insert directly before `check("no console errors (mobile)", ...)`:

```js
  for (const route of ["/", "/trading", "/case-studies/flowpulse", "/projects", "/work-with-me"]) {
    await mobile.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(`no horizontal scroll on ${route} (mobile)`, overflow <= 0, `${overflow}px`);
  }
```

- [ ] **Step 2: Run the verify procedure.**
Expected: every check passes. If a route overflows, the failure message gives the extra pixels. Find the element with `[...document.querySelectorAll("*")].filter((el) => el.getBoundingClientRect().right > innerWidth)`, fix its CSS (usually a fixed `min-width`, or a long unbroken string that needs `overflow-wrap: anywhere`), and re-run.

- [ ] **Step 3: Bundle budget.** From the `npm run build` output, read the gzip size of `dist/assets/index-*.js`.
Expected: ≤ 113.5 kB. If it's over, look for something imported eagerly that could be lazy, and fix the cause rather than raising the budget. `npx vite-bundle-visualizer` shows what's large; npx fetches it temporarily, so nothing gets installed.

- [ ] **Step 4: Lighthouse (manual).** With `vite preview` running:

```bash
CHROME_PATH=$(find ~/.cache/ms-playwright -type f -path "*chromium-*/chrome-linux*/chrome" | sort | tail -1) \
  npx -y lighthouse@12.0.0 http://localhost:4173/ --only-categories=performance --form-factor=mobile \
  --chrome-flags="--headless=new --no-sandbox" --output=json --output-path=/tmp/lh.json --quiet
node -e "console.log(Math.round(require('/tmp/lh.json').categories.performance.score * 100))"
```

Expected: ≥ 90. Record the score in the phase summary. If it's lower, list the top two opportunities from `/tmp/lh.json` (`audits` with `details.type === "opportunity"`) in the summary, and don't change scope without asking.

- [ ] **Step 5: Update** `CLAUDE.md`. Replace everything from `### Client (\`client/\`)` up to (not including) `### Server (\`server/\`)` with:

```markdown
### Client (`client/`)

- **Framework**: React 18 + Vite, with React Router v6 for routing.
- **Key libraries**: Framer Motion (short reveals and drawer motion). No Three.js and no Lenis; avoid adding runtime dependencies.
- **Look**: dark trading-terminal theme. Color, font and radius tokens live on `:root` in `src/styles/global.css`; older names (`--accent*`, `--surface*`, `--card`, `--text-dim`, `--font-body`, `--font-display`) alias the new tokens. JetBrains Mono for UI, headings and data; Inter for paragraphs. Red is for alerts only.
- **Path aliases**: `@`, `@components`, `@pages`, `@styles`, `@data`, `@layout`, `@hooks` — all resolve under `src/`. Pure modules imported by unit tests (`src/data/*`, `src/shell/commands.js`, `src/shell/hotkey.js`, `src/sim/*`) use relative imports only, because `node --test` doesn't resolve the aliases.
- **Layout**: `AppLayout` wraps every page with `SiteHeader`, `SiteFooter` and the fixed bottom `StatusBar`.
- **Routes** (`router.jsx`): `/`, `/trading`, `/case-studies/:slug`, `/projects`, `/work-with-me`. Old routes (`/about`, `/experience`, `/skills`, `/achievements`, `/contact`, `/process`, `/brief`) redirect.
- **Static data**: `src/data/profile.js` (projects with stable `slug`s, experience, skills, awards), `src/data/caseStudies.js` (case-study copy; trading entries must contain no numbers, enforced by `tests/caseStudies.test.js`), `src/data/links.js` (email, Upwork, social links).
- **Tests**: `npm test` runs `node --test` over `client/tests/`. `scripts/verify-redesign.mjs` is a Playwright smoke test against `vite preview` on port 4173; set `CHROME_PATH` to reuse an installed Chromium.
- **Dev proxy**: Vite proxies `/api` → `http://localhost:4000` so the client hits the local server without CORS issues in dev.
```

- [ ] **Step 6: Commit.**

```bash
git add client/scripts/verify-redesign.mjs CLAUDE.md
# commit subject: "Phase 1 checks: mobile overflow, docs for the terminal site"
```

- [ ] **Step 7: STOP for review.** Send Pravesh:
- desktop and mobile screenshots (`/tmp/portfolio-desktop.png`, `/tmp/portfolio-mobile.png`, plus a `/trading` and a case-study screenshot);
- the three case studies' copy as rendered. Point out the decision-log rationales and the "Next:" lines; both are drafts he needs to confirm or edit.
- the bundle size and Lighthouse score.

Ask whether to push the branch and open a PR for phase 1. Do not push without a yes.

---
# Phase 2 — Shell drawer

### Task 9: Shell commands and key rules

**Files:**
- Create: `client/src/shell/commands.js`, `client/src/shell/hotkey.js`
- Create: `client/tests/shell.test.js`

**Interfaces:**
- Consumes: `projectShowcase` with slugs (Task 1); `caseStudies` (Task 2); `EMAIL`, `UPWORK_URL` (Task 4).
- Produces:
  - `runCommand(input: string) → { lines: string[], navigate?: string, href?: string, clear?: true, close?: true, shortcuts?: boolean }`. `navigate` is an in-app route, which may include a `#hash`. A relative `href` is resolved against `import.meta.env.BASE_URL` by the UI. `shortcuts` asks the UI to turn single-key shortcuts on or off.
  - `complete(input: string) → string[]`: full replacement inputs.
  - `commandNames: string[]`: visible commands only; the hidden `sudo` is excluded.
  - `isShellToggleKey(event, shellInput | null) → boolean`.
  - `navShortcut(event, items: Array<{ key, path }>) → string | null`.
- Commands: `help`, `whoami`, `hire`, `upwork`, `trading`, `resume [--pdf]`, `ls projects`, `open <project>`, `cat <project>`, `lab`, `contact`, `man <command>`, `shortcuts on|off`, `clear`, `exit`, and the hidden `sudo hire`.

- [ ] **Step 1: Write the failing tests** `client/tests/shell.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { runCommand, complete, commandNames } from "../src/shell/commands.js";
import { isShellToggleKey, navShortcut } from "../src/shell/hotkey.js";

test("help lists every command", () => {
  const { lines } = runCommand("help");
  for (const name of commandNames) {
    assert.ok(lines.some((line) => line.startsWith(name)), `help is missing ${name}`);
  }
});

test("unknown commands suggest help", () => {
  assert.deepEqual(runCommand("rm -rf /").lines, ["command not found: rm. Try help"]);
});

test("blank input does nothing", () => {
  assert.deepEqual(runCommand("   "), { lines: [] });
});

test("commands are case-insensitive and ignore extra spaces", () => {
  assert.equal(runCommand("  HIRE  ").navigate, "/work-with-me");
});

test("open goes to a case study when one exists", () => {
  const result = runCommand("open flowpulse");
  assert.equal(result.navigate, "/case-studies/flowpulse");
  assert.deepEqual(result.lines, ["→ opened FlowPulse"]);
});

test("open falls back to the project's card for projects without a case study", () => {
  const result = runCommand("open tamperscripts");
  assert.equal(result.navigate, "/projects#tamperscripts");
  assert.match(result.lines[0], /^TamperScripts Collection: /);
});

test("open explains itself without an argument or with an unknown slug", () => {
  assert.match(runCommand("open").lines[0], /^usage: open/);
  assert.match(runCommand("open nope").lines[0], /^open: no project named nope/);
});

test("ls projects lists every slug", () => {
  const { lines } = runCommand("ls projects");
  assert.equal(lines.length, 12);
  assert.ok(lines[0].startsWith("flowpulse"));
});

test("resume navigates, resume --pdf opens the CV", () => {
  assert.equal(runCommand("resume").navigate, "/#experience");
  assert.equal(runCommand("resume --pdf").href, "resume.pdf");
});

test("lab is announced as coming soon until the playground ships", () => {
  assert.deepEqual(runCommand("lab"), { lines: ["lab: coming soon"] });
});

test("clear and exit signal the drawer", () => {
  assert.equal(runCommand("clear").clear, true);
  assert.equal(runCommand("exit").close, true);
});

test("cat prints a summary without leaving the page", () => {
  const study = runCommand("cat flowpulse");
  assert.equal(study.navigate, undefined);
  assert.equal(study.lines[0], "FlowPulse");
  assert.ok(study.lines.includes("highlights:"));
  assert.match(runCommand("cat covin").lines[0], /^Covin Web Application: /);
  assert.match(runCommand("cat nope").lines[0], /^cat: no project named nope/);
  assert.match(runCommand("cat").lines[0], /^usage: cat/);
});

test("man explains commands", () => {
  assert.deepEqual(runCommand("man open").lines, ["open <project> — open a project or case study"]);
  assert.deepEqual(runCommand("man sudo").lines, ["man: no manual entry for sudo"]);
  assert.deepEqual(runCommand("man").lines, ["usage: man <command>"]);
});

test("sudo hire is a hidden shortcut to hiring", () => {
  const result = runCommand("sudo hire");
  assert.equal(result.navigate, "/work-with-me");
  assert.equal(result.lines[0], "[sudo] permission granted.");
  assert.match(runCommand("sudo rm -rf /").lines[0], /^nice try/);
  assert.ok(!commandNames.includes("sudo"));
  assert.ok(!runCommand("help").lines.some((line) => line.startsWith("sudo")));
});

test("shortcuts can be turned off and on", () => {
  assert.equal(runCommand("shortcuts off").shortcuts, false);
  assert.equal(runCommand("shortcuts on").shortcuts, true);
  assert.equal(runCommand("shortcuts").shortcuts, undefined);
});

test("tab completion completes commands and open slugs", () => {
  assert.deepEqual(complete("tr"), ["trading"]);
  assert.deepEqual(complete("open fl"), ["open flowpulse"]);
  assert.deepEqual(complete("ls p"), ["ls projects"]);
  assert.deepEqual(complete("open c"), ["open cell-phone-controlled-car", "open covin", "open curves"]);
  assert.deepEqual(complete("cat lo"), ["cat localcache"]);
  assert.deepEqual(complete("man op"), ["man open"]);
  assert.deepEqual(complete("shortcuts o"), ["shortcuts on", "shortcuts off"]);
  assert.deepEqual(complete("su"), [], "hidden commands do not complete");
  assert.deepEqual(complete("zzz"), []);
  assert.deepEqual(complete("hire now"), []);
});

const element = (tagName, extra = {}) => ({ tagName, isContentEditable: false, value: "", ...extra });
const key = (target, extra = {}) => ({ key: "`", ctrlKey: false, metaKey: false, altKey: false, target, ...extra });

test("backtick toggles the shell outside form fields", () => {
  assert.equal(isShellToggleKey(key(element("BODY")), null), true);
  assert.equal(isShellToggleKey(key(element("A")), null), true);
});

test("backtick is ignored while typing in form fields", () => {
  for (const tag of ["INPUT", "TEXTAREA", "SELECT"]) {
    assert.equal(isShellToggleKey(key(element(tag)), null), false, tag);
  }
  assert.equal(isShellToggleKey(key(element("DIV", { isContentEditable: true })), null), false);
});

test("backtick in the shell input closes only when the input is empty", () => {
  const shellInput = element("INPUT");
  assert.equal(isShellToggleKey(key(shellInput), shellInput), true);
  shellInput.value = "open";
  assert.equal(isShellToggleKey(key(shellInput), shellInput), false);
});

test("other keys and modified backticks never toggle", () => {
  assert.equal(isShellToggleKey(key(element("BODY"), { key: "a" }), null), false);
  assert.equal(isShellToggleKey(key(element("BODY"), { ctrlKey: true }), null), false);
});

const NAV = [
  { path: "/work-with-me", key: "1" },
  { path: "/trading", key: "2" }
];

test("number keys map to nav items outside form fields", () => {
  assert.equal(navShortcut(key(element("BODY"), { key: "2" }), NAV), "/trading");
  assert.equal(navShortcut(key(element("BODY"), { key: "9" }), NAV), null);
});

test("number keys type normally in form fields and with modifiers", () => {
  assert.equal(navShortcut(key(element("INPUT"), { key: "1" }), NAV), null);
  assert.equal(navShortcut(key(element("BODY"), { key: "1", metaKey: true }), NAV), null);
});
```

- [ ] **Step 2: Run them to verify they fail.**

Run: `cd client && npm test`
Expected: FAIL with `Cannot find module '.../src/shell/commands.js'`.

- [ ] **Step 3: Create** `client/src/shell/commands.js`:

```js
import { projectShowcase } from "../data/profile.js";
import { caseStudies } from "../data/caseStudies.js";
import { EMAIL, UPWORK_URL } from "../data/links.js";

// A command returns { lines, navigate?, href?, clear?, close?, shortcuts? }.
// navigate is an in-site route; href opens in a new tab (relative hrefs resolve against BASE_URL);
// shortcuts (boolean) turns the single-key shortcuts on or off.
const opened = (path, title) => ({ lines: [`→ opened ${title}`], navigate: path });

const findStudy = (slug) => caseStudies.find((item) => item.slug === slug);
const findProject = (slug) => projectShowcase.find((item) => item.slug === slug);

const openProject = (slug) => {
  if (!slug) return { lines: ["usage: open <project>   (see: ls projects)"] };
  const study = findStudy(slug);
  if (study) return opened(`/case-studies/${slug}`, study.title);
  const project = findProject(slug);
  if (project) return { lines: [`${project.title}: ${project.tagline}`, "→ opened Projects"], navigate: `/projects#${slug}` };
  return { lines: [`open: no project named ${slug}. Try ls projects`] };
};

const catProject = (slug) => {
  if (!slug) return { lines: ["usage: cat <project>   (see: ls projects)"] };
  const study = findStudy(slug);
  if (study) {
    return {
      lines: [study.title, "", study.summary, "", "highlights:", ...study.highlights.map((item) => `  - ${item}`)]
    };
  }
  const project = findProject(slug);
  if (project) return { lines: [`${project.title}: ${project.tagline}`, "", project.description] };
  return { lines: [`cat: no project named ${slug}. Try ls projects`] };
};

const COMMANDS = [
  { name: "help", usage: "help", summary: "list commands", run: () => ({ lines: helpLines() }) },
  {
    name: "whoami",
    usage: "whoami",
    summary: "who built this",
    run: () => ({
      lines: ["Pravesh Pandey: SDE @ Amazon Alexa AI · builds trading systems in C++ and Python"]
    })
  },
  { name: "hire", usage: "hire", summary: "start a project with me", run: () => opened("/work-with-me", "Work with me") },
  {
    name: "upwork",
    usage: "upwork",
    summary: "open my Upwork profile",
    run: () => ({ lines: ["→ opening Upwork profile"], href: UPWORK_URL })
  },
  { name: "trading", usage: "trading", summary: "trading systems", run: () => opened("/trading", "Trading systems") },
  {
    name: "resume",
    usage: "resume [--pdf]",
    summary: "experience, or the CV as PDF",
    run: (args) =>
      args.includes("--pdf")
        ? { lines: ["→ opening resume.pdf"], href: "resume.pdf" }
        : opened("/#experience", "Experience")
  },
  {
    name: "ls",
    usage: "ls projects",
    summary: "list projects",
    run: (args) =>
      args[0] === "projects"
        ? { lines: projectShowcase.map((project) => `${project.slug.padEnd(28)}${project.title}`) }
        : { lines: ["usage: ls projects"] }
  },
  { name: "open", usage: "open <project>", summary: "open a project or case study", run: (args) => openProject(args[0]) },
  { name: "cat", usage: "cat <project>", summary: "print a project summary here", run: (args) => catProject(args[0]) },
  { name: "lab", usage: "lab", summary: "order-flow playground", run: () => ({ lines: ["lab: coming soon"] }) },
  {
    name: "contact",
    usage: "contact",
    summary: "how to reach me",
    run: () => ({ lines: [`email   ${EMAIL}`, "form    /#contact"] })
  },
  {
    name: "man",
    usage: "man <command>",
    summary: "explain a command",
    run: (args) => {
      if (!args[0]) return { lines: ["usage: man <command>"] };
      const command = COMMANDS.find((item) => item.name === args[0] && !item.hidden);
      return command
        ? { lines: [`${command.usage} — ${command.summary}`] }
        : { lines: [`man: no manual entry for ${args[0]}`] };
    }
  },
  {
    name: "shortcuts",
    usage: "shortcuts on|off",
    summary: "single-key shortcuts (` and 1–5)",
    run: (args) => {
      if (args[0] === "on") return { lines: ["keyboard shortcuts on"], shortcuts: true };
      if (args[0] === "off") return { lines: ["keyboard shortcuts off — use the >_ Shell button and the menu"], shortcuts: false };
      return { lines: ["usage: shortcuts on|off"] };
    }
  },
  { name: "clear", usage: "clear", summary: "clear the screen", run: () => ({ lines: [], clear: true }) },
  { name: "exit", usage: "exit", summary: "close the shell", run: () => ({ lines: [], close: true }) },
  {
    name: "sudo",
    hidden: true,
    usage: "sudo <command>",
    summary: "",
    run: (args) =>
      args[0] === "hire"
        ? { lines: ["[sudo] permission granted.", "→ opened Work with me"], navigate: "/work-with-me" }
        : { lines: ["nice try. (hint: sudo hire)"] }
  }
];

const visible = COMMANDS.filter((command) => !command.hidden);
const helpLines = () => visible.map((command) => `${command.usage.padEnd(18)}${command.summary}`);

export const commandNames = visible.map((command) => command.name);

export const runCommand = (input) => {
  const [name, ...args] = input.trim().toLowerCase().split(/\s+/);
  if (!name) return { lines: [] };
  const command = COMMANDS.find((item) => item.name === name);
  if (!command) return { lines: [`command not found: ${name}. Try help`] };
  return command.run(args);
};

const ARGUMENTS = {
  open: () => projectShowcase.map((project) => project.slug),
  cat: () => projectShowcase.map((project) => project.slug),
  ls: () => ["projects"],
  man: () => commandNames,
  shortcuts: () => ["on", "off"]
};

// Returns full replacement inputs that complete `input`, e.g. "open fl" → ["open flowpulse"].
export const complete = (input) => {
  const text = input.trimStart().toLowerCase();
  const [first = "", ...rest] = text.split(/\s+/);
  if (rest.length === 0) return commandNames.filter((name) => name.startsWith(first));
  if (rest.length > 1 || !ARGUMENTS[first]) return [];
  return ARGUMENTS[first]()
    .filter((option) => option.startsWith(rest[0]))
    .map((option) => `${first} ${option}`);
};
```

- [ ] **Step 4: Create** `client/src/shell/hotkey.js`:

```js
const EDITABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

const isTypingIn = (target) => Boolean(target) && (EDITABLE_TAGS.has(target.tagName) || target.isContentEditable);
const hasModifier = (event) => event.ctrlKey || event.metaKey || event.altKey;

// True when a keydown should open/close the shell: a bare backtick outside form fields,
// or inside the shell's own input while that input is empty.
export const isShellToggleKey = (event, shellInput) => {
  if (event.key !== "`" || hasModifier(event)) return false;
  if (shellInput && event.target === shellInput) return shellInput.value === "";
  return !isTypingIn(event.target);
};

// The route for a bare number key matching a nav item's key ("1"–"5"), or null.
// Never fires while typing, so digits still work in forms and in the shell.
export const navShortcut = (event, items) => {
  if (hasModifier(event) || isTypingIn(event.target)) return null;
  return items.find((item) => item.key === event.key)?.path ?? null;
};
```

- [ ] **Step 5: Run tests to verify they pass.**

Run: `cd client && npm test`
Expected: `ℹ pass 26`, `ℹ fail 0` (22 shell tests and 4 data tests).

- [ ] **Step 6: Commit.**

```bash
git add client/src/shell client/tests/shell.test.js
# commit subject: "Add shell commands, number-key and backtick rules"
```

---

### Task 10: Shell drawer UI

**Files:**
- Create: `client/src/components/common/ChunkErrorBoundary.jsx`
- Create: `client/src/shell/shortcuts.js`, `client/src/shell/useShellState.js`, `client/src/shell/ShellHost.jsx`, `client/src/shell/ShellDrawer.jsx`, `client/src/shell/shell.css`
- Modify: `client/src/components/navigation/SiteHeader.jsx` (number keys)
- Modify: `client/src/layout/AppLayout.jsx`
- Modify: `client/scripts/verify-redesign.mjs`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes:
  - `runCommand`, `complete`, `isShellToggleKey`, `navShortcut` (Task 9);
  - `StatusBar` (Task 4) and `SiteHeader`'s `goTo` (Task 4);
  - `--shell-height` in `body`'s padding (Task 3).
- Produces:
  - `<ChunkErrorBoundary className?>`, reused for `/lab` in Task 14.
  - `shortcutsEnabled()` and `setShortcutsEnabled(boolean)`.
  - `<ShellHost />`, which replaces `<StatusBar />` in `AppLayout`.
  - DOM contract for tests: button `.status-bar__shell`, drawer `#shell`, input `.shell__input`, chips `.shell__chips .chip`, `body[data-shell]`.

- [ ] **Step 1: Write the failing browser checks.** In `client/scripts/verify-redesign.mjs`, desktop pass, insert directly before `check("no console errors (desktop)", ...)`:

```js
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
```

After `await page.close();` (end of the desktop pass), insert the blocked-storage and stale-deploy checks (Review Focus 1 and 3):

```js
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
```

In the mobile pass, insert directly before the overflow loop:

```js
  await mobile.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await attempt(mobile.click(".status-bar__shell"));
  await attempt(mobile.click('.shell__chips .chip:has-text("trading")'));
  await attempt(mobile.waitForURL("**/trading"));
  check("mobile shell chip navigates", mobile.url().endsWith("/trading"));
  await attempt(mobile.click(".status-bar__shell"));
```

- [ ] **Step 2: Run the verify procedure to see them fail.**
Expected: the shell checks FAIL quickly, because `.status-bar__shell` doesn't exist yet. The script still finishes and prints its summary.

- [ ] **Step 3: Create** `client/src/components/common/ChunkErrorBoundary.jsx`:

```jsx
import { Component } from "react";

// Lazy chunks have hashed file names. After a redeploy, a tab opened earlier asks for a
// chunk that no longer exists; without this boundary React unmounts the whole app.
export class ChunkErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className={this.props.className ?? "page"} role="alert">
        <p>This part of the site was just updated.</p>
        <button type="button" className="button" onClick={() => window.location.reload()}>
          reload
        </button>
      </div>
    );
  }
}
```

- [ ] **Step 4: Create** `client/src/shell/shortcuts.js`:

```js
// Single-key shortcuts (` and 1–5) can be switched off, as WCAG 2.1.4 requires:
// speech-input users can otherwise trigger them by accident.
const STORAGE_KEY = "pp-shortcuts";
let fallback = true; // used when storage is blocked

export const shortcutsEnabled = () => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === null ? fallback : saved === "on";
  } catch {
    return fallback;
  }
};

export const setShortcutsEnabled = (enabled) => {
  fallback = enabled;
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // Storage unavailable: the choice lasts for this page view.
  }
};
```

- [ ] **Step 5: Create** `client/src/shell/useShellState.js`:

```js
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pp-shell";

// Open/maximized state, remembered per visitor. Storage can be blocked (private mode),
// so every access is guarded and the shell simply forgets its state there.
const load = () => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY)) ?? {};
    return { open: saved.open === true, maximized: saved.maximized === true };
  } catch {
    return { open: false, maximized: false };
  }
};

export const useShellState = () => {
  const [state, setState] = useState(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable: state lasts for this page view only.
    }
  }, [state]);

  const setOpen = useCallback((open) => setState((current) => ({ ...current, open })), []);
  const toggleMaximized = useCallback(
    () => setState((current) => ({ ...current, maximized: !current.maximized })),
    []
  );

  return { ...state, setOpen, toggleMaximized };
};
```

- [ ] **Step 6: Create** `client/src/shell/ShellHost.jsx`:

```jsx
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { StatusBar } from "@components/navigation/StatusBar.jsx";
import { ChunkErrorBoundary } from "@components/common/ChunkErrorBoundary.jsx";
import { useShellState } from "./useShellState.js";
import { isShellToggleKey } from "./hotkey.js";
import { shortcutsEnabled } from "./shortcuts.js";
import "./shell.css";

const ShellDrawer = lazy(() => import("./ShellDrawer.jsx"));

export const ShellHost = () => {
  const { open, maximized, setOpen, toggleMaximized } = useShellState();
  // Only a visitor's own click or keypress moves focus into the shell; a drawer restored
  // from an earlier visit must not steal focus on page load.
  const [focusOnOpen, setFocusOnOpen] = useState(false);
  const buttonRef = useRef(null);
  const inputRef = useRef(null);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, [setOpen]);

  const toggle = useCallback(() => {
    if (open) {
      close();
    } else {
      setFocusOnOpen(true);
      setOpen(true);
    }
  }, [open, close, setOpen]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!isShellToggleKey(event, inputRef.current)) return;
      if (event.target !== inputRef.current && !shortcutsEnabled()) return;
      event.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  // shell.css sizes the drawer and pads the page from this attribute, so content stays reachable.
  useEffect(() => {
    document.body.dataset.shell = open ? (maximized ? "max" : "open") : "";
  }, [open, maximized]);

  return (
    <>
      {open && (
        <ChunkErrorBoundary className="pane shell-error">
          <Suspense fallback={null}>
            <ShellDrawer
              inputRef={inputRef}
              autoFocus={focusOnOpen}
              maximized={maximized}
              onToggleMaximize={toggleMaximized}
              onClose={close}
            />
          </Suspense>
        </ChunkErrorBoundary>
      )}
      <StatusBar>
        <button
          ref={buttonRef}
          type="button"
          className={`status-bar__shell${open ? " status-bar__shell--on" : ""}`}
          aria-expanded={open}
          aria-controls={open ? "shell" : undefined}
          onClick={toggle}
        >
          {">_ Shell"}
        </button>
        <span className="status-bar__hint">` shell · 1–5 menu</span>
      </StatusBar>
    </>
  );
};
```

- [ ] **Step 7: Create** `client/src/shell/ShellDrawer.jsx`. It must have a **default** export, because `React.lazy` loads it.

```jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { runCommand, complete } from "./commands.js";
import { setShortcutsEnabled } from "./shortcuts.js";

const SUGGESTIONS = ["help", "hire", "trading", "resume", "lab"];
const WELCOME = { kind: "out", text: "Type help for commands. The site follows what you type." };

const resolveHref = (href) => (/^https?:/.test(href) ? href : `${import.meta.env.BASE_URL}${href}`);

const ShellDrawer = ({ inputRef, autoFocus, maximized, onToggleMaximize, onClose }) => {
  const navigate = useNavigate();
  const [lines, setLines] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [past, setPast] = useState([]);
  const [cursor, setCursor] = useState(null);
  const sectionRef = useRef(null);
  const logRef = useRef(null);

  // On touch screens, focusing the input would pop the keyboard over half the page; chips are the main input there.
  useEffect(() => {
    if (!autoFocus) return;
    if (window.matchMedia("(pointer: coarse)").matches) sectionRef.current?.focus();
    else inputRef.current?.focus();
  }, [autoFocus, inputRef]);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [lines]);

  const execute = (raw) => {
    const result = runCommand(raw);
    const entries = [{ kind: "in", text: raw }, ...result.lines.map((text) => ({ kind: "out", text }))];
    setLines((current) => (result.clear ? [] : [...current, ...entries]));
    if (raw.trim()) setPast((current) => [...current, raw]);
    setCursor(null);
    setInput("");
    if (typeof result.shortcuts === "boolean") setShortcutsEnabled(result.shortcuts);
    if (result.navigate) navigate(result.navigate);
    if (result.href) window.open(resolveHref(result.href), "_blank", "noopener,noreferrer");
    if (result.close) onClose();
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      execute(input);
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "Tab" && !event.shiftKey && input.trim()) {
      // Only completes when there's something to complete; otherwise Tab moves focus as usual (no keyboard trap).
      event.preventDefault();
      const options = complete(input);
      if (options.length === 1) setInput(`${options[0]} `);
      else if (options.length > 1) setLines((current) => [...current, { kind: "out", text: options.join("   ") }]);
    } else if (event.key === "ArrowUp" && past.length > 0) {
      event.preventDefault();
      const next = cursor === null ? past.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setInput(past[next]);
    } else if (event.key === "ArrowDown" && cursor !== null) {
      event.preventDefault();
      const next = cursor + 1;
      setCursor(next < past.length ? next : null);
      setInput(next < past.length ? past[next] : "");
    }
  };

  return (
    <section id="shell" ref={sectionRef} tabIndex={-1} className="shell" aria-label="Shell">
      <header className="shell__bar">
        <span>pravesh@desk:~</span>
        <span className="shell__actions">
          <button type="button" onClick={onToggleMaximize} aria-pressed={maximized}>
            {maximized ? "restore" : "maximize"}
          </button>
          <button type="button" onClick={onClose} aria-label="Close shell">
            ✕
          </button>
        </span>
      </header>
      <div className="shell__log" ref={logRef} role="log" aria-live="polite">
        {lines.map((line, index) => (
          <div key={index} className={`shell__line shell__line--${line.kind}`}>
            {line.kind === "in" && <span className="shell__prompt">$ </span>}
            {line.text}
          </div>
        ))}
      </div>
      <div className="shell__chips">
        {SUGGESTIONS.map((name) => (
          <button key={name} type="button" className="chip" onClick={() => execute(name)}>
            {name}
          </button>
        ))}
      </div>
      <label className="shell__input-row">
        <span className="shell__prompt" aria-hidden="true">
          $
        </span>
        <span className="sr-only">Shell command</span>
        <input
          ref={inputRef}
          className="shell__input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
        />
      </label>
    </section>
  );
};

export default ShellDrawer;
```

- [ ] **Step 8: Create** `client/src/shell/shell.css`:

```css
/* ShellHost sets body[data-shell]; the same height sizes the drawer and pads the page (see global.css). */
body[data-shell="open"] {
  --shell-height: 40vh;
}

body[data-shell="max"] {
  --shell-height: calc(90vh - var(--status-bar-height));
}

.shell,
.shell-error {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(var(--status-bar-height) + env(safe-area-inset-bottom));
  z-index: 55;
}

.shell {
  display: flex;
  flex-direction: column;
  height: var(--shell-height, 40vh);
  background: #070908;
  border-top: 2px solid var(--green);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text);
  animation: shell-up 0.18s ease-out;
}

.shell:focus {
  outline: none;
}

@keyframes shell-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
}

.shell__bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0.8rem;
  background: var(--pane-2);
  border-bottom: 1px solid var(--border);
  color: var(--green);
}

.shell__actions {
  display: flex;
  gap: 0.4rem;
}

.shell__actions button {
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-2);
  font: inherit;
  font-size: 0.75rem;
  padding: 0.1rem 0.5rem;
  cursor: pointer;
}

.shell__actions button:hover {
  border-color: var(--green);
  color: var(--green);
}

.shell__log {
  flex: 1;
  overflow-y: auto;
  padding: 0.6rem 0.8rem;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.shell__line--out {
  color: var(--text-2);
}

.shell__prompt {
  color: var(--green);
}

.shell__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border-top: 1px solid var(--border);
}

.shell__chips .chip {
  font-size: 0.75rem;
}

.shell__input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.8rem;
  border-top: 1px solid var(--border);
}

.shell__input-row:focus-within {
  box-shadow: inset 0 0 0 1px var(--green);
}

.shell__input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  color: var(--text);
  font: inherit;
  caret-color: var(--green);
}

.shell__input:focus {
  outline: none;
}

.status-bar__shell {
  background: none;
  border: 1px solid var(--green);
  border-radius: var(--radius);
  color: var(--green);
  font: inherit;
  padding: 0.05rem 0.5rem;
  cursor: pointer;
}

.status-bar__shell--on {
  background: var(--green);
  color: var(--bg);
}

@media (max-width: 640px) {
  .status-bar__hint {
    display: none;
  }

  body[data-shell="open"] {
    --shell-height: 55vh;
  }
}
```

- [ ] **Step 9: Number keys in the header.** In `client/src/components/navigation/SiteHeader.jsx`:

Change the React import to `import { useEffect, useState } from "react";`, and add:

```jsx
import { navShortcut } from "@/shell/hotkey.js";
import { shortcutsEnabled } from "@/shell/shortcuts.js";
```

Directly before `return (`, add:

```jsx
  // Number keys follow the menu ([1] hire … [4] projects); goTo changes every render, so re-subscribe each time.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (!shortcutsEnabled()) return;
      const path = navShortcut(event, NAV_ITEMS);
      if (!path) return;
      event.preventDefault();
      goTo(path);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
```

- [ ] **Step 10: Mount it.** In `client/src/layout/AppLayout.jsx`, replace the `StatusBar` import with `import { ShellHost } from "@/shell/ShellHost.jsx";` and `<StatusBar />` with `<ShellHost />`.

- [ ] **Step 11: Run the verify procedure.**
Expected: every check passes. Also confirm the build output lists a separate `ShellDrawer-*.js` chunk, and that `index-*.js` gzip is still ≤ 113.5 kB.

- [ ] **Step 12: Docs.** In `CLAUDE.md`, replace the Layout bullet with:

```markdown
- **Layout**: `AppLayout` wraps every page with `SiteHeader`, `SiteFooter` and `ShellHost` (the fixed bottom status bar with the `>_ Shell` button).
```

and add after it:

```markdown
- **Shell**: `src/shell/`.
  - `ShellHost` owns the toggle: the button, the backtick via `hotkey.js`, and open/maximized state persisted in `localStorage` with try/catch. It lazy-loads `ShellDrawer` inside `ChunkErrorBoundary`, and sets `body[data-shell]` so the page pads for the open drawer.
  - All commands live in `commands.js` and return `{ lines, navigate?, href?, clear?, close?, shortcuts? }`. Add new commands there, with a test in `tests/shell.test.js`.
  - Single-key shortcuts (`` ` ``, `1`–`5`) honour `shortcuts.js`, so visitors can turn them off with `shortcuts off`.
```

- [ ] **Step 13: Commit.**

```bash
git add client/src client/scripts/verify-redesign.mjs CLAUDE.md
# commit subject: "Add the CloudShell-style shell drawer and number-key navigation"
```

- [ ] **Step 14: STOP for review.** Send Pravesh screenshots or a short recording of the shell: open, `help`, `open flowpulse`, `cat localcache`, `sudo hire`, the number keys, and a mobile chip tap. Ask whether to push phase 2. Do not push without a yes.

---

# Phase 3 — Simulation, ticker and lab

### Task 11: Seeded market simulation

**Files:**
- Create: `client/src/sim/rng.js`, `client/src/sim/market.js`
- Create: `client/tests/market.test.js`

**Interfaces:**
- Produces:
  - `mulberry32(seed) → () => number in [0, 1)`.
  - `createMarket({ seed?, institutionalRate? }) → market`.
  - `step(market) → market`.
  - `inject(market, "buy" | "sell") → market`.
  - Constants `TICK`, `LEVELS`, `LOT`, `START_PRICE`, `LARGE_ORDER_LOTS`.
  - `market` = `{ rng, time, bidTicks, institutionalRate, pending, bids: {price,size}[], asks: {price,size}[], trades: {side,price,size}[] }`. Bids are sorted best-first (descending), asks best-first (ascending).
  - Large orders move the price 10–30 ticks in their direction.

- [ ] **Step 1: Write the failing tests** `client/tests/market.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { mulberry32 } from "../src/sim/rng.js";
import { createMarket, step, inject, LEVELS, LOT, LARGE_ORDER_LOTS } from "../src/sim/market.js";

const run = (market, steps) => {
  let current = market;
  for (let i = 0; i < steps; i += 1) current = step(current);
  return current;
};
const visible = ({ time, bids, asks, trades }) => ({ time, bids, asks, trades });

test("rng is deterministic and stays in [0, 1)", () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  for (let i = 0; i < 1000; i += 1) {
    const x = a();
    assert.equal(x, b());
    assert.ok(x >= 0 && x < 1);
  }
  assert.notEqual(mulberry32(1)(), mulberry32(2)());
});

test("same seed gives the same market", () => {
  let a = createMarket({ seed: 7 });
  let b = createMarket({ seed: 7 });
  for (let i = 0; i < 100; i += 1) {
    a = step(a);
    b = step(b);
    assert.deepEqual(visible(a), visible(b));
  }
});

test("the book stays well-formed", () => {
  let market = createMarket({ seed: 3, institutionalRate: 0.2 });
  for (let i = 0; i < 500; i += 1) {
    market = step(market);
    const { bids, asks } = market;
    assert.equal(bids.length, LEVELS);
    assert.equal(asks.length, LEVELS);
    assert.ok(bids[0].price < asks[0].price, "crossed book");
    for (let j = 1; j < LEVELS; j += 1) {
      assert.ok(bids[j].price < bids[j - 1].price, "bids not descending");
      assert.ok(asks[j].price > asks[j - 1].price, "asks not ascending");
    }
    for (const level of [...bids, ...asks]) {
      assert.ok(level.size >= LOT && level.size % LOT === 0, `bad size ${level.size}`);
    }
  }
});

test("inject forces one large order on the requested side", () => {
  const market = step(inject(run(createMarket({ seed: 5, institutionalRate: 0 }), 10), "sell"));
  const large = market.trades.filter((trade) => trade.size >= LARGE_ORDER_LOTS[0] * LOT);
  assert.equal(large.length, 1);
  assert.equal(large[0].side, "sell");
  assert.equal(large[0].price, market.bids[0].price);
  assert.equal(market.pending, null);
});
```

- [ ] **Step 2: Run them to verify they fail.**

Run: `cd client && npm test`
Expected: FAIL with `Cannot find module '.../src/sim/rng.js'`.

- [ ] **Step 3: Create** `client/src/sim/rng.js`:

```js
// mulberry32: tiny seeded PRNG. Same seed ⇒ same sequence, values in [0, 1).
export const mulberry32 = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
```

- [ ] **Step 4: Create** `client/src/sim/market.js`:

```js
import { mulberry32 } from "./rng.js";

// Simulated "SIM·NIFTY" market: a 10-level book on a 0.05 tick grid, random trades,
// and occasional large institutional orders. Not real market data.
export const TICK = 0.05;
export const LEVELS = 10;
export const LOT = 75;
export const START_PRICE = 24500;
export const LARGE_ORDER_LOTS = [40, 80];

const toPrice = (ticks) => Math.round(ticks * TICK * 100) / 100;
const randomLots = (rng, min, max) => LOT * (min + Math.floor(rng() * (max - min + 1)));

// direction -1 builds bids downward from the best bid, +1 builds asks upward from the best ask.
// Levels that survive a price move keep their size with ±20% churn.
const buildSide = (rng, bestTicks, direction, previous = []) =>
  Array.from({ length: LEVELS }, (_, index) => {
    const price = toPrice(bestTicks + direction * index);
    const prior = previous.find((level) => level.price === price);
    const size = prior
      ? Math.max(LOT, Math.round((prior.size * (0.8 + 0.4 * rng())) / LOT) * LOT)
      : randomLots(rng, 1, 12);
    return { price, size };
  });

export const createMarket = ({ seed = 1, institutionalRate = 0.03 } = {}) => {
  const rng = mulberry32(seed);
  const bidTicks = Math.round(START_PRICE / TICK);
  return {
    rng,
    time: 0,
    bidTicks,
    institutionalRate,
    pending: null,
    bids: buildSide(rng, bidTicks, -1),
    asks: buildSide(rng, bidTicks + 1, 1),
    trades: []
  };
};

// Forces one large order on `side` ("buy" | "sell") at the next step.
export const inject = (market, side) => ({ ...market, pending: side });

export const step = (market) => {
  const { rng } = market;
  const largeSide =
    market.pending ?? (rng() < market.institutionalRate ? (rng() < 0.5 ? "buy" : "sell") : null);
  // Random walk of 1–6 ticks most steps; a large order also pushes price 10–30 ticks its way.
  const walk = rng() < 0.6 ? (rng() < 0.5 ? 1 : -1) * (1 + Math.floor(rng() * 6)) : 0;
  const impact = largeSide ? (largeSide === "buy" ? 1 : -1) * (10 + Math.floor(rng() * 21)) : 0;
  const bidTicks = market.bidTicks + walk + impact;
  const bids = buildSide(rng, bidTicks, -1, market.bids);
  const asks = buildSide(rng, bidTicks + 1, 1, market.asks);
  const touch = (side) => (side === "buy" ? asks[0].price : bids[0].price);

  const trades = Array.from({ length: Math.floor(rng() * 4) }, () => {
    const side = rng() < 0.5 ? "buy" : "sell";
    return { side, price: touch(side), size: randomLots(rng, 1, 4) };
  });

  if (largeSide) {
    const size = randomLots(rng, ...LARGE_ORDER_LOTS);
    trades.push({ side: largeSide, price: touch(largeSide), size });
    // Size also builds at the touch behind the aggressor, so order-flow imbalance reacts.
    const book = largeSide === "buy" ? bids : asks;
    book[0] = { ...book[0], size: book[0].size + size };
  }

  return { ...market, time: market.time + 1, bidTicks, bids, asks, trades, pending: null };
};
```

- [ ] **Step 5: Run tests to verify they pass.**

Run: `cd client && npm test`
Expected: `ℹ pass 30`, `ℹ fail 0`.

- [ ] **Step 6: Commit.**

```bash
git add client/src/sim client/tests/market.test.js
# commit subject: "Add seeded order-book simulation"
```

---

### Task 12: Order-flow metrics and detector

**Files:**
- Create: `client/src/sim/metrics.js`
- Create: `client/tests/metrics.test.js`

**Interfaces:**
- Consumes: `mulberry32`, `LOT` (Task 11), used in tests only.
- Produces:
  - `microprice(book) → number`.
  - `ofi(prevBook, nextBook) → number`.
  - `createVpin({ bucketVolume, window? }) → { add(trade), value() → number in [0,1] }`. Trades are signed with the tick rule; the lab labels this a "tick-rule variant".
  - `createDetector() → { trade(trade, time) → Alert | null, flow(value, time, price) → Alert | null }`, where `Alert = { time, side: "buy"|"sell", price, size, reason: "size"|"ofi" }`.
  - Constants `SIZE_MULTIPLE = 5`, `SIZE_WINDOW = 200`, `OFI_Z = 3`, `OFI_WINDOW = 50`. `flow` flags a step whose OFI is more than 3σ from the mean of the previous 50 steps.

- [ ] **Step 1: Write the failing tests** `client/tests/metrics.test.js`. The expected values are hand-computed. For example, microprice = (100·100 + 101·300) / 400 = 100.75.

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { mulberry32 } from "../src/sim/rng.js";
import { LOT } from "../src/sim/market.js";
import { microprice, ofi, createVpin, createDetector } from "../src/sim/metrics.js";

test("microprice weights toward the thinner side", () => {
  const book = { bids: [{ price: 100, size: 300 }], asks: [{ price: 101, size: 100 }] };
  assert.equal(microprice(book), 100.75);
});

const top = (bidPrice, bidSize, askPrice, askSize) => ({
  bids: [{ price: bidPrice, size: bidSize }],
  asks: [{ price: askPrice, size: askSize }]
});

test("ofi follows the Cont–Kukanov–Stoikov definition", () => {
  assert.equal(ofi(top(100, 100, 101, 100), top(100, 150, 101, 100)), 50, "bid size up");
  assert.equal(ofi(top(100, 100, 101, 100), top(100, 100, 101, 150)), -50, "ask size up");
  assert.equal(ofi(top(100, 100, 101, 100), top(100.5, 150, 101, 100)), 150, "bid price up");
  assert.equal(ofi(top(100, 100, 101, 100), top(100, 100, 100.5, 120)), -120, "ask price down");
  assert.equal(ofi(top(100, 100, 101, 100), top(100, 100, 101, 100)), 0, "no change");
});

test("vpin buckets volume and signs trades with the tick rule", () => {
  const vpin = createVpin({ bucketVolume: 100 });
  assert.equal(vpin.value(), 0);
  vpin.add({ price: 10, size: 60 });
  vpin.add({ price: 9, size: 40 });
  assert.equal(vpin.value(), 0.2);
  vpin.add({ price: 9, size: 150 });
  assert.equal(vpin.value(), 0.6);
});

test("vpin stays within [0, 1] on a random tape", () => {
  const rng = mulberry32(11);
  const vpin = createVpin({ bucketVolume: 500, window: 10 });
  for (let i = 0; i < 2000; i += 1) {
    vpin.add({ price: 100 + Math.floor(rng() * 5), size: 1 + Math.floor(rng() * 900) });
    const value = vpin.value();
    assert.ok(value >= 0 && value <= 1, `vpin ${value}`);
  }
});

test("detector flags a large order but not normal ones", () => {
  const detector = createDetector();
  for (let i = 0; i < 30; i += 1) {
    assert.equal(detector.trade({ side: "buy", price: 100, size: LOT }, i), null);
  }
  assert.equal(detector.trade({ side: "buy", price: 100, size: LOT * 2 }, 30), null);
  const alert = detector.trade({ side: "sell", price: 99.95, size: LOT * 40 }, 31);
  assert.deepEqual(alert, { time: 31, side: "sell", price: 99.95, size: LOT * 40, reason: "size" });
});

test("detector stays quiet before it has enough history", () => {
  const detector = createDetector();
  assert.equal(detector.trade({ side: "buy", price: 100, size: LOT * 80 }, 0), null);
  assert.equal(detector.flow(1e6, 0, 100), null);
});

test("detector flags an order-flow spike and survives a flat series", () => {
  const detector = createDetector();
  for (let i = 0; i < 30; i += 1) assert.equal(detector.flow(i % 2 ? 10 : -10, i, 100), null);
  assert.deepEqual(detector.flow(500, 30, 100), { time: 30, side: "buy", price: 100, size: 500, reason: "ofi" });

  const flat = createDetector();
  for (let i = 0; i < 30; i += 1) flat.flow(5, i, 100);
  assert.equal(flat.flow(5000, 30, 100), null, "zero variance must not divide by zero");
});
```

- [ ] **Step 2: Run them to verify they fail.**

Run: `cd client && npm test`
Expected: FAIL with `Cannot find module '.../src/sim/metrics.js'`.

- [ ] **Step 3: Create** `client/src/sim/metrics.js`:

```js
// Size-weighted mid: leans toward the side with less resting size.
export const microprice = ({ bids, asks }) => {
  const bid = bids[0];
  const ask = asks[0];
  return (bid.price * ask.size + ask.price * bid.size) / (bid.size + ask.size);
};

// Order-flow imbalance between two top-of-book snapshots (Cont, Kukanov & Stoikov, 2014).
export const ofi = (prev, next) => {
  const [pb, nb, pa, na] = [prev.bids[0], next.bids[0], prev.asks[0], next.asks[0]];
  const bidFlow = (nb.price >= pb.price ? nb.size : 0) - (nb.price <= pb.price ? pb.size : 0);
  const askFlow = (na.price <= pa.price ? na.size : 0) - (na.price >= pa.price ? pa.size : 0);
  return bidFlow - askFlow;
};

// VPIN over fixed-volume buckets; trades are signed with the tick rule.
// value() is the mean |buy − sell| / bucketVolume over the last `window` full buckets, in [0, 1].
export const createVpin = ({ bucketVolume, window = 50 }) => {
  let lastPrice = null;
  let lastSide = "buy";
  let buy = 0;
  let sell = 0;
  const imbalances = [];

  return {
    add({ price, size }) {
      const side =
        lastPrice === null || price === lastPrice ? lastSide : price > lastPrice ? "buy" : "sell";
      lastPrice = price;
      lastSide = side;
      let remaining = size;
      while (remaining > 0) {
        const take = Math.min(bucketVolume - buy - sell, remaining);
        if (side === "buy") buy += take;
        else sell += take;
        remaining -= take;
        if (buy + sell === bucketVolume) {
          imbalances.push(Math.abs(buy - sell) / bucketVolume);
          if (imbalances.length > window) imbalances.shift();
          buy = 0;
          sell = 0;
        }
      }
    },
    value: () =>
      imbalances.length ? imbalances.reduce((sum, x) => sum + x, 0) / imbalances.length : 0
  };
};

export const SIZE_MULTIPLE = 5;
export const SIZE_WINDOW = 200;
export const OFI_Z = 3;
export const OFI_WINDOW = 50;
const MIN_SAMPLES = 20;

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

// Flags orders far larger than recent typical orders, and order-flow imbalance spikes.
// Alerts look like { time, side, price, size, reason: "size" | "ofi" }.
export const createDetector = () => {
  const sizes = [];
  const flows = [];

  return {
    trade(trade, time) {
      const typical = sizes.length >= MIN_SAMPLES ? median(sizes) : null;
      sizes.push(trade.size);
      if (sizes.length > SIZE_WINDOW) sizes.shift();
      if (typical === null || trade.size <= SIZE_MULTIPLE * typical) return null;
      return { time, side: trade.side, price: trade.price, size: trade.size, reason: "size" };
    },
    flow(value, time, price) {
      let alert = null;
      if (flows.length >= MIN_SAMPLES) {
        const mean = flows.reduce((sum, x) => sum + x, 0) / flows.length;
        const sd = Math.sqrt(flows.reduce((sum, x) => sum + (x - mean) ** 2, 0) / flows.length);
        if (sd > 0 && Math.abs(value - mean) / sd > OFI_Z) {
          alert = { time, side: value > mean ? "buy" : "sell", price, size: Math.abs(value), reason: "ofi" };
        }
      }
      flows.push(value);
      if (flows.length > OFI_WINDOW) flows.shift();
      return alert;
    }
  };
};
```

- [ ] **Step 4: Run tests to verify they pass.**

Run: `cd client && npm test`
Expected: `ℹ pass 37`, `ℹ fail 0`.

- [ ] **Step 5: Commit.**

```bash
git add client/src/sim/metrics.js client/tests/metrics.test.js
# commit subject: "Add OFI, microprice, VPIN and the large-order detector"
```

---

### Task 13: Simulation session and the ticker strip

**Files:**
- Create: `client/src/sim/session.js`, `client/src/sim/format.js`
- Create: `client/tests/session.test.js`
- Create: `client/src/hooks/useSimulation.js`
- Create: `client/src/components/navigation/TickerStrip.jsx`, `client/src/components/navigation/tickerStrip.css`
- Modify: `client/src/components/navigation/SiteHeader.jsx`, `client/src/styles/global.css`
- Modify: `client/scripts/verify-redesign.mjs`

**Interfaces:**
- Consumes: Tasks 11–12.
- Produces:
  - `createSession({ seed?, institutionalRate?, warmup? }) → { next() → Snapshot, inject(side), setRate(rate), current() → Snapshot }`. `warmup` steps run up front, which fills the charts and primes the detector.
  - `Snapshot = { time, price, changePct, microprice, ofi (rolling sum of the last 20 steps), vpin, bids, asks, alerts: Alert[] (newest first, ≤ MAX_ALERTS = 8), history: { price, microprice, ofi, vpin } (each ≤ HISTORY = 120 numbers) }`.
  - `fmt(value, digits = 2) → string`.
  - `useSimulation(session, intervalMs, running = true) → Snapshot`.
  - `<TickerStrip />`: the whole strip is a link to `/lab`, which Task 14 builds.

The ticker lives in the always-mounted header, which no longer hides on scroll. That makes it the single site-wide simulation the spec asks for.

- [ ] **Step 1: Write the failing tests** `client/tests/session.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { createSession, HISTORY, MAX_ALERTS } from "../src/sim/session.js";

test("session is deterministic and keeps bounded history", () => {
  const a = createSession({ seed: 9 });
  const b = createSession({ seed: 9 });
  for (let i = 0; i < 50; i += 1) assert.deepEqual(a.next(), b.next());
  for (let i = 0; i < 300; i += 1) a.next();
  const { history, alerts, vpin } = a.current();
  for (const key of ["price", "microprice", "ofi", "vpin"]) assert.equal(history[key].length, HISTORY, key);
  assert.ok(alerts.length <= MAX_ALERTS);
  assert.ok(vpin >= 0 && vpin <= 1);
});

test("session raises an alert soon after an injected order", () => {
  const session = createSession({ seed: 4, institutionalRate: 0 });
  for (let i = 0; i < 80; i += 1) session.next();
  session.inject("buy");
  const snapshot = session.next();
  assert.ok(
    snapshot.alerts.some((alert) => alert.side === "buy" && alert.time === snapshot.time),
    "no buy alert on the injection step"
  );
});

test("a warmed-up session starts with history and catches an immediate injection", () => {
  const session = createSession({ seed: 4, institutionalRate: 0, warmup: 60 });
  assert.equal(session.current().history.price.length, 60);
  session.inject("buy");
  const snapshot = session.next();
  assert.ok(snapshot.alerts.some((alert) => alert.side === "buy" && alert.time === snapshot.time));
});
```

- [ ] **Step 2: Run them to verify they fail.**

Run: `cd client && npm test`
Expected: FAIL with `Cannot find module '.../src/sim/session.js'`.

- [ ] **Step 3: Create** `client/src/sim/session.js`:

```js
import { createMarket, step, inject, LOT } from "./market.js";
import { microprice, ofi, createVpin, createDetector } from "./metrics.js";

export const HISTORY = 120;
export const MAX_ALERTS = 8;
const OFI_ROLL = 20;

const midOf = (market) => (market.bids[0].price + market.asks[0].price) / 2;
const pushBounded = (list, value, limit) => [...list, value].slice(-limit);

// One running simulation: call next() to advance a step and get a render-ready snapshot.
// `warmup` steps run up front so charts start full and the detector is primed.
export const createSession = ({ seed = 1, institutionalRate = 0.03, warmup = 0 } = {}) => {
  let market = createMarket({ seed, institutionalRate });
  const open = midOf(market);
  const vpin = createVpin({ bucketVolume: LOT * 50 });
  const detector = createDetector();
  let flows = [];
  let snapshot = {
    time: 0,
    price: open,
    changePct: 0,
    microprice: microprice(market),
    ofi: 0,
    vpin: 0,
    bids: market.bids,
    asks: market.asks,
    alerts: [],
    history: { price: [], microprice: [], ofi: [], vpin: [] }
  };

  const session = {
    next() {
      const prev = market;
      market = step(market);
      const price = midOf(market);
      const flow = ofi(prev, market);
      flows = pushBounded(flows, flow, OFI_ROLL);

      const fresh = [];
      for (const trade of market.trades) {
        vpin.add(trade);
        const alert = detector.trade(trade, market.time);
        if (alert) fresh.push(alert);
      }
      const flowAlert = detector.flow(flow, market.time, price);
      if (flowAlert) fresh.push(flowAlert);

      const rollingOfi = flows.reduce((sum, x) => sum + x, 0);
      const micro = microprice(market);
      const { history } = snapshot;
      snapshot = {
        time: market.time,
        price,
        changePct: ((price - open) / open) * 100,
        microprice: micro,
        ofi: rollingOfi,
        vpin: vpin.value(),
        bids: market.bids,
        asks: market.asks,
        alerts: [...fresh.reverse(), ...snapshot.alerts].slice(0, MAX_ALERTS),
        history: {
          price: pushBounded(history.price, price, HISTORY),
          microprice: pushBounded(history.microprice, micro, HISTORY),
          ofi: pushBounded(history.ofi, flow, HISTORY),
          vpin: pushBounded(history.vpin, vpin.value(), HISTORY)
        }
      };
      return snapshot;
    },
    inject(side) {
      market = inject(market, side);
    },
    setRate(rate) {
      market = { ...market, institutionalRate: rate };
    },
    current: () => snapshot
  };
  for (let i = 0; i < warmup; i += 1) session.next();
  return session;
};
```

and `client/src/sim/format.js`:

```js
// Indian digit grouping, fixed decimals: fmt(24512.3) → "24,512.30".
export const fmt = (value, digits = 2) =>
  value.toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits });
```

- [ ] **Step 4: Run tests to verify they pass.**

Run: `cd client && npm test`
Expected: `ℹ pass 40`, `ℹ fail 0`.

- [ ] **Step 5: Write the failing browser checks.** In `client/scripts/verify-redesign.mjs`, desktop pass, insert directly after the `check("tagline doesn't retype on return", ...)` line:

```js
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
```

- [ ] **Step 6: Run the verify procedure to see them fail.**
Expected: the four ticker checks FAIL (no `.ticker__group` yet).

- [ ] **Step 7: Create** `client/src/hooks/useSimulation.js`:

```js
import { useEffect, useState } from "react";

// Steps `session` every `intervalMs` while `running` and the tab is visible; returns the latest snapshot.
// A hidden tab stops the interval outright, so there is no burst of catch-up steps on return.
export const useSimulation = (session, intervalMs, running = true) => {
  const [snapshot, setSnapshot] = useState(() => session.current());

  useEffect(() => {
    setSnapshot(session.current());
    if (!running) return undefined;

    let id = null;
    const start = () => {
      if (id === null && document.visibilityState === "visible") {
        id = setInterval(() => setSnapshot(session.next()), intervalMs);
      }
    };
    const stop = () => {
      clearInterval(id);
      id = null;
    };
    const onVisibilityChange = () => (document.visibilityState === "visible" ? start() : stop());

    start();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [session, intervalMs, running]);

  return snapshot;
};
```

- [ ] **Step 8: Create** `client/src/components/navigation/TickerStrip.jsx`:

```jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { createSession } from "@/sim/session.js";
import { fmt } from "@/sim/format.js";
import { useSimulation } from "@hooks/useSimulation.js";
import "./tickerStrip.css";

const TickerItems = ({ snapshot }) => {
  const up = snapshot.changePct >= 0;
  const alert = snapshot.alerts[0];
  return (
    <>
      <span className="ticker__label">SIM·NIFTY</span>
      <span>
        {fmt(snapshot.price)}{" "}
        <span className={up ? "ticker__up" : "ticker__down"}>
          {up ? "▲" : "▼"}
          {fmt(Math.abs(snapshot.changePct))}%
        </span>
      </span>
      <span>
        OFI{" "}
        <span className={snapshot.ofi >= 0 ? "ticker__up" : "ticker__down"}>
          {snapshot.ofi >= 0 ? "+" : "−"}
          {fmt(Math.abs(snapshot.ofi), 0)}
        </span>
      </span>
      <span>μP {fmt(snapshot.microprice)}</span>
      <span>VPIN {fmt(snapshot.vpin)}</span>
      {alert && (
        <span className="ticker__alert">
          ● large {alert.side} @ {fmt(alert.price)}
        </span>
      )}
      <span className="ticker__note">simulated data</span>
    </>
  );
};

export const TickerStrip = () => {
  const [session] = useState(() => createSession({ seed: Date.now() >>> 0, warmup: 60 }));
  const snapshot = useSimulation(session, 500);
  const reduceMotion = useReducedMotion();

  return (
    <Link to="/lab" className="ticker" aria-label="Simulated market ticker: open the order-flow lab">
      <div className={`ticker__track${reduceMotion ? "" : " ticker__track--marquee"}`} aria-hidden="true">
        <span className="ticker__group">
          <TickerItems snapshot={snapshot} />
        </span>
        <span className="ticker__group ticker__group--copy">
          <TickerItems snapshot={snapshot} />
        </span>
      </div>
    </Link>
  );
};
```

and `client/src/components/navigation/tickerStrip.css`:

```css
.ticker {
  display: flex;
  align-items: center;
  height: 1.6rem;
  overflow: hidden;
  background: var(--pane-2);
  border-bottom: 1px solid var(--border);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-2);
}

.ticker:hover,
.ticker:focus-visible {
  color: var(--text);
}

.ticker__track {
  display: flex;
  white-space: nowrap;
}

.ticker__group {
  display: flex;
  gap: 1.6rem;
  padding: 0 1rem;
}

.ticker__group--copy {
  display: none;
}

.ticker__label {
  color: var(--amber);
}

.ticker__up {
  color: var(--green);
}

.ticker__down {
  color: var(--amber);
}

.ticker__alert {
  color: var(--red);
}

.ticker__note {
  color: var(--dim);
}

/* On narrow screens the strip doesn't fit, so it scrolls: two identical groups, shifted by one group width. */
@media (max-width: 900px) {
  .ticker__track--marquee {
    animation: ticker-scroll 30s linear infinite;
  }

  .ticker__track--marquee .ticker__group--copy {
    display: flex;
  }
}

@keyframes ticker-scroll {
  to {
    transform: translateX(-50%);
  }
}
```

- [ ] **Step 9: Mount it in the header.** In `client/src/components/navigation/SiteHeader.jsx`, add `import { TickerStrip } from "./TickerStrip.jsx";` and render `<TickerStrip />` as the first child of `<header className="site-header">`, before `<div className="site-header__container">`. In `client/src/styles/global.css`, change `--header-height: 3.25rem;` to `--header-height: 4.85rem;` (the 3.25rem bar plus the 1.6rem ticker).

- [ ] **Step 10: Run the verify procedure.**
Expected: every check passes, including the ticker checks and the mobile overflow checks (the marquee stays inside `.ticker`'s `overflow: hidden`). Check that `index-*.js` gzip is still ≤ 113.5 kB; the simulation is roughly 2 kB.

- [ ] **Step 11: Commit.**

```bash
git add client/src client/tests/session.test.js client/scripts/verify-redesign.mjs
# commit subject: "Add simulation session and the simulated ticker strip"
```

---

### Task 14: Lab page and wiring

**Files:**
- Create: `client/src/pages/LabPage.jsx`, `client/src/pages/labPage.css`
- Create: `client/src/components/lab/charts.jsx`, `client/src/components/lab/OrderBookLadder.jsx`
- Create: `client/src/components/caseStudies/LabPane.jsx`
- Modify: `client/src/router.jsx`, `client/src/data/navigation.js`
- Modify: `client/src/shell/commands.js`, `client/tests/shell.test.js`
- Modify: `client/src/pages/TradingPage.jsx`, `client/src/components/sections/TradingTeaserSection.jsx`
- Modify: `client/scripts/verify-redesign.mjs`, `CLAUDE.md`, `client/index.html` (description)

**Interfaces:**
- Consumes: `createSession`, `fmt`, `useSimulation` (Task 13); `ChunkErrorBoundary` (Task 10); `useDocumentTitle` (Task 5).
- Produces:
  - `<Sparkline series={[{ values: number[], className }]} min? max? label />`.
  - `<Bars values={number[]} label />`.
  - `<OrderBookLadder bids asks />`.
  - `<LabPane />` (class `case-pane case-pane--lab`).
  - The `/lab` route: lazy-loaded, with the seed in the URL (`/lab?seed=<0–4294967295>`).

- [ ] **Step 1: Update the failing unit test.** In `client/tests/shell.test.js`, replace the `"lab is announced as coming soon until the playground ships"` test with:

```js
test("lab opens the playground", () => {
  assert.deepEqual(runCommand("lab"), { lines: ["→ opened Lab"], navigate: "/lab" });
});
```

Run: `cd client && npm test`
Expected: FAIL. The actual output is `{ lines: ["lab: coming soon"] }`.

- [ ] **Step 2: Make it pass.** In `client/src/shell/commands.js`, change the `lab` command's `run` to `run: () => opened("/lab", "Lab")`.

Run: `cd client && npm test`
Expected: `ℹ pass 40`, `ℹ fail 0`.

- [ ] **Step 3: Write the failing browser checks.** In `client/scripts/verify-redesign.mjs`:
- Change the nav check to `check("nav has five numbered items", (await page.locator(".site-nav__key").count()) === 5);`.
- After the `trading page ends with a hire CTA` check, insert:

```js
  check("trading page links to the lab", (await page.locator('.case-pane--lab a[href$="/lab"]').count()) === 1);
```

Insert directly before the `// --- Shell drawer ---` block:

```js
  // --- Lab ---
  await page.goto(`${BASE}/lab?seed=42`, { waitUntil: "networkidle" });
  await attempt(page.waitForSelector(".lab__grid"));
  check("lab renders", (await page.locator(".lab__grid").count()) === 1);
  check("lab says the data is simulated", (await text(page, ".page__eyebrow")).includes("simulated"));
  check("lab runs the seed from the URL", (await text(page, ".lab__seed")) === "seed 42");
  check("lab labels its VPIN variant", (await page.locator('.pane__label:has-text("tick-rule variant")').count()) === 1);
  const labStart = await text(page, ".lab__value");
  await page.waitForTimeout(1600);
  check("lab metrics update", labStart !== "" && (await text(page, ".lab__value")) !== labStart);
  await attempt(page.focus(".lab__slider input"));
  await page.keyboard.press("Home");
  const alertBefore = await text(page, ".lab__alerts li");
  await attempt(page.click('button:has-text("inject large buy")'));
  const injected = await attempt(
    page.waitForFunction(
      (before) => {
        const latest = document.querySelector(".lab__alerts li")?.textContent ?? "";
        return latest !== before && latest.includes("BUY");
      },
      alertBefore,
      { timeout: 4000 }
    )
  );
  check("injected buy shows up in the alert log", injected);
  await page.goto(`${BASE}/lab`, { waitUntil: "networkidle" });
  await attempt(page.waitForURL(/[?&]seed=\d+/));
  check("lab writes its seed into the URL", /[?&]seed=\d+/.test(page.url()));
```

After the stale-shell block (`await stale.close();`), insert:

```js
  // --- Stale tab after a redeploy: the lab chunk is gone ---
  const staleLab = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  staleLab.setDefaultTimeout(5000);
  await staleLab.route("**/LabPage-*.js", (route) => route.abort());
  await staleLab.goto(`${BASE}/lab`, { waitUntil: "networkidle" });
  await attempt(staleLab.waitForSelector('[role="alert"]'));
  check(
    "missing lab chunk shows a reload prompt and the header survives",
    (await text(staleLab, '[role="alert"]')).includes("updated") && (await staleLab.locator(".site-header").count()) === 1
  );
  await staleLab.close();
```

In the mobile overflow loop, add `"/lab"` to the route list.

Run the verify procedure. Expected: the nav, trading-lab and every lab check FAIL; the script still finishes and prints its summary.

- [ ] **Step 4: Create** `client/src/components/lab/charts.jsx`:

```jsx
const W = 300;
const H = 80;

const toPoints = (values, min, max) => {
  const span = max - min || 1;
  const last = Math.max(values.length - 1, 1);
  return values.map((value, i) => `${(i / last) * W},${H - ((value - min) / span) * H}`).join(" ");
};

// Line chart; series share one y-scale (min/max default to the data range).
export const Sparkline = ({ series, min, max, label }) => {
  const all = series.flatMap((item) => item.values);
  const low = min ?? Math.min(...all);
  const high = max ?? Math.max(...all);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label}>
      {series.map(
        (item) =>
          item.values.length > 1 && (
            <polyline
              key={item.className}
              className={item.className}
              points={toPoints(item.values, low, high)}
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          )
      )}
    </svg>
  );
};

// Signed bars around a zero line, scaled to the largest magnitude.
export const Bars = ({ values, label }) => {
  const peak = Math.max(1, ...values.map(Math.abs));
  const width = W / Math.max(values.length, 1);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label}>
      <line className="chart__axis" x1="0" x2={W} y1={H / 2} y2={H / 2} vectorEffect="non-scaling-stroke" />
      {values.map((value, i) => {
        const height = (Math.abs(value) / peak) * (H / 2);
        return (
          <rect
            key={i}
            className={value >= 0 ? "chart__bar--up" : "chart__bar--down"}
            x={i * width}
            width={Math.max(width - 0.5, 0.5)}
            y={value >= 0 ? H / 2 - height : H / 2}
            height={height}
          />
        );
      })}
    </svg>
  );
};
```

- [ ] **Step 5: Create** `client/src/components/lab/OrderBookLadder.jsx`:

```jsx
import { fmt } from "@/sim/format.js";

// Asks on top (highest first), bids below; a depth bar behind each size shows its share of the largest level.
export const OrderBookLadder = ({ bids, asks }) => {
  const peak = Math.max(...bids.map((level) => level.size), ...asks.map((level) => level.size));
  const row = (level, side) => (
    <tr
      key={`${side}-${level.price}`}
      className={`ladder__row ladder__row--${side}`}
      style={{ "--depth": `${(level.size / peak) * 100}%` }}
    >
      <td>{side === "bid" ? fmt(level.size, 0) : ""}</td>
      <td className="ladder__price">{fmt(level.price)}</td>
      <td>{side === "ask" ? fmt(level.size, 0) : ""}</td>
    </tr>
  );

  return (
    <table className="ladder">
      <thead>
        <tr>
          <th scope="col">bid size</th>
          <th scope="col">price</th>
          <th scope="col">ask size</th>
        </tr>
      </thead>
      <tbody>
        {[...asks].reverse().map((level) => row(level, "ask"))}
        {bids.map((level) => row(level, "bid"))}
      </tbody>
    </table>
  );
};
```

- [ ] **Step 6: Create** `client/src/pages/LabPage.jsx`. The seed is read from `?seed=`. Anything that isn't an integer in range is replaced by a random seed, which is written back into the URL.

```jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageIntro } from "@components/common/PageIntro.jsx";
import { Sparkline, Bars } from "@components/lab/charts.jsx";
import { OrderBookLadder } from "@components/lab/OrderBookLadder.jsx";
import { createSession } from "@/sim/session.js";
import { fmt } from "@/sim/format.js";
import { useSimulation } from "@hooks/useSimulation.js";
import { useDocumentTitle } from "@hooks/useDocumentTitle.js";
import "./labPage.css";

const DEFAULT_RATE = 0.03;
const MAX_SEED = 2 ** 32 - 1;
const parseSeed = (value) => {
  const seed = Number(value);
  return value !== null && Number.isInteger(seed) && seed >= 0 && seed <= MAX_SEED ? seed : null;
};
const randomSeed = () => Math.floor(Math.random() * MAX_SEED);
const newSession = (seed, rate) => createSession({ seed, institutionalRate: rate, warmup: 60 });

export const LabPage = () => {
  useDocumentTitle("Order-flow lab");
  const [searchParams, setSearchParams] = useSearchParams();
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [seed, setSeed] = useState(() => parseSeed(searchParams.get("seed")) ?? randomSeed());
  const [session, setSession] = useState(() => newSession(seed, DEFAULT_RATE));
  const [running, setRunning] = useState(true);
  const [fast, setFast] = useState(false);
  const [copied, setCopied] = useState(false);
  const snapshot = useSimulation(session, fast ? 125 : 500, running);

  // The seed lives in the URL, so a run can be shared: same seed, same simulated market (at default settings).
  useEffect(() => {
    if (searchParams.get("seed") !== String(seed)) setSearchParams({ seed: String(seed) }, { replace: true });
  }, [seed, searchParams, setSearchParams]);

  const changeRate = (value) => {
    setRate(value);
    session.setRate(value);
  };

  const reset = () => {
    const next = randomSeed();
    setSeed(next);
    setSession(newSession(next, rate));
    setCopied(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="page lab">
      <PageIntro
        eyebrow="Lab · simulated data"
        title="Order-flow playground"
        lead="A simulated order book for a made-up index, SIM·NIFTY. Watch order-flow imbalance, microprice and VPIN react as orders arrive, then inject a large institutional order and see the detector catch it. Nothing here is real market data."
      />

      <div className="pane lab__controls">
        <button type="button" className="button" aria-pressed={!running} onClick={() => setRunning((value) => !value)}>
          {running ? "pause" : "play"}
        </button>
        <button type="button" className="button" aria-pressed={fast} onClick={() => setFast((value) => !value)}>
          speed {fast ? "4×" : "1×"}
        </button>
        <label className="lab__slider">
          institutional activity
          <input
            type="range"
            min="0"
            max="0.2"
            step="0.01"
            value={rate}
            onChange={(event) => changeRate(Number(event.target.value))}
          />
        </label>
        <button type="button" className="button button--primary" onClick={() => session.inject("buy")}>
          inject large buy
        </button>
        <button type="button" className="button" onClick={() => session.inject("sell")}>
          inject large sell
        </button>
        <button type="button" className="button" onClick={reset}>
          reset
        </button>
        <span className="lab__seed">seed {seed}</span>
        <button type="button" className="button" onClick={copyLink}>
          {copied ? "link copied" : "copy link to this run"}
        </button>
      </div>

      <div className="lab__grid">
        <section className="pane lab__book">
          <h2 className="pane__label">Order book (simulated)</h2>
          <OrderBookLadder bids={snapshot.bids} asks={snapshot.asks} />
        </section>

        <section className="pane">
          <h2 className="pane__label">Price vs microprice</h2>
          <p className="lab__value">
            {fmt(snapshot.price)} · μP {fmt(snapshot.microprice)}
          </p>
          <Sparkline
            label="Price and microprice over time"
            series={[
              { values: snapshot.history.price, className: "lab__line--price" },
              { values: snapshot.history.microprice, className: "lab__line--micro" }
            ]}
          />
          <p className="lab__explain">
            Microprice weights the mid-price by resting size. When buyers stack the bid, it leans above the mid before
            the price moves.
          </p>
        </section>

        <section className="pane">
          <h2 className="pane__label">Order-flow imbalance</h2>
          <p className="lab__value">
            rolling {snapshot.ofi >= 0 ? "+" : "−"}
            {fmt(Math.abs(snapshot.ofi), 0)}
          </p>
          <Bars values={snapshot.history.ofi} label="Order-flow imbalance per step" />
          <p className="lab__explain">
            OFI nets out size added and removed at the best bid and ask. Positive means buying pressure is building;
            negative means selling pressure.
          </p>
        </section>

        <section className="pane">
          <h2 className="pane__label">VPIN (tick-rule variant)</h2>
          <p className="lab__value">{fmt(snapshot.vpin)}</p>
          <Sparkline
            label="VPIN over time"
            min={0}
            max={1}
            series={[{ values: snapshot.history.vpin, className: "lab__line--vpin" }]}
          />
          <p className="lab__explain">
            VPIN measures how one-sided recent volume has been, over equal-volume buckets. This version signs trades
            with the tick rule rather than bulk volume classification. Near 1 means one side dominates the flow, a
            typical sign of informed or institutional trading.
          </p>
        </section>

        <section className="pane lab__alerts">
          <h2 className="pane__label">Detector alerts</h2>
          {snapshot.alerts.length > 0 ? (
            <ol>
              {snapshot.alerts.map((alert) => (
                <li key={`${alert.time}-${alert.reason}-${alert.side}`}>
                  <span className="lab__alert-dot">●</span> t{alert.time} {alert.side.toUpperCase()}{" "}
                  {fmt(alert.size, 0)} @ {fmt(alert.price)} · {alert.reason === "size" ? "large order" : "OFI spike"}
                </li>
              ))}
            </ol>
          ) : (
            <p>No alerts yet. Inject a large order to trigger one.</p>
          )}
          <p className="lab__explain">
            Flags an order more than five times the recent median size, or a step whose order-flow imbalance is more than
            three standard deviations from its recent mean.
          </p>
        </section>
      </div>
    </div>
  );
};
```

and `client/src/pages/labPage.css`:

```css
.lab__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.lab__slider {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-2);
}

.lab__slider input {
  accent-color: var(--amber);
}

.lab__seed {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--dim);
}

.lab__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  gap: 1rem;
}

.lab__book {
  grid-row: span 2;
}

.lab__value {
  margin: 0 0 0.5rem;
  font-family: var(--font-mono);
  color: var(--text);
}

.lab__explain {
  margin: 0.6rem 0 0;
  font-size: 0.85rem;
}

.chart {
  display: block;
  width: 100%;
  height: 80px;
}

.chart polyline {
  stroke-width: 1.5;
}

.lab__line--price {
  stroke: var(--text);
}

.lab__line--micro {
  stroke: var(--amber);
}

.lab__line--vpin {
  stroke: var(--green);
}

.chart__axis {
  stroke: var(--border);
}

.chart__bar--up {
  fill: var(--green);
}

.chart__bar--down {
  fill: var(--amber);
}

.ladder {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
}

.ladder th {
  padding: 0.2rem;
  font-weight: 400;
  color: var(--dim);
}

.ladder td {
  padding: 0.15rem 0.4rem;
  text-align: center;
  color: var(--text-2);
}

.ladder__row--bid .ladder__price {
  color: var(--green);
}

.ladder__row--ask .ladder__price {
  color: var(--amber);
}

.ladder__row--bid td:first-child {
  background: linear-gradient(to left, rgba(61, 220, 132, 0.18) var(--depth), transparent var(--depth));
}

.ladder__row--ask td:last-child {
  background: linear-gradient(to right, rgba(255, 176, 0, 0.16) var(--depth), transparent var(--depth));
}

.lab__alerts ol {
  display: grid;
  gap: 0.3rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text);
}

.lab__alert-dot {
  color: var(--red);
}
```

- [ ] **Step 7: Lazy route behind the error boundary.** In `client/src/router.jsx`, add:

```jsx
import { lazy, Suspense } from "react";
import { ChunkErrorBoundary } from "@components/common/ChunkErrorBoundary.jsx";

const LabPage = lazy(() => import("@pages/LabPage.jsx").then((module) => ({ default: module.LabPage })));
```

and after the `/case-studies/:slug` route:

```jsx
    <Route
      path="/lab"
      element={
        <ChunkErrorBoundary>
          <Suspense fallback={<div className="page">loading lab…</div>}>
            <LabPage />
          </Suspense>
        </ChunkErrorBoundary>
      }
    />
```

- [ ] **Step 8: Nav item.** Append to `NAV_ITEMS` in `client/src/data/navigation.js` (with a comma after the previous item):

```js
  { path: "/lab", key: "5", label: "lab" }
```

The number-key handler from Task 10 picks up `5` automatically.

- [ ] **Step 9: Lab pane on /trading and home.** Create `client/src/components/caseStudies/LabPane.jsx`:

```jsx
import { Link } from "react-router-dom";

export const LabPane = () => (
  <article className="pane case-pane case-pane--lab">
    <p className="pane__label">lab · simulated data</p>
    <h3 className="case-pane__title">Order-flow playground</h3>
    <p className="case-pane__summary">
      The ideas behind FlowPulse, live in your browser: watch order-flow imbalance, microprice and VPIN react to a
      simulated order book, and inject a large order to see the detector catch it.
    </p>
    <Link className="case-pane__link" to="/lab">
      launch →
    </Link>
  </article>
);
```

In `client/src/pages/TradingPage.jsx` and `client/src/components/sections/TradingTeaserSection.jsx`:
- import it: `import { LabPane } from "@components/caseStudies/LabPane.jsx";`;
- render `<LabPane />` as the last child of `.case-grid`.

- [ ] **Step 10: Run the verify procedure.**
Expected: every check passes. Confirm the build lists a separate `LabPage-*.js` chunk, and that `index-*.js` gzip is ≤ 113.5 kB.

- [ ] **Step 11: Docs and metadata.** In `client/index.html`, change the description's ending `case studies, projects and ways to work together.` to `case studies, projects and a live order-flow playground.`. In `CLAUDE.md`:
- change the Routes bullet to include `/lab` (lazy-loaded behind `ChunkErrorBoundary`, seed in `?seed=`);
- add:

```markdown
- **Simulation**: `src/sim/`.
  - `market.js` is the seeded order-book simulation. `metrics.js` has OFI, microprice, VPIN (tick-rule variant) and the large-order detector. `session.js` turns steps into render-ready snapshots, with optional warm-up.
  - `useSimulation` steps a session on an interval and pauses while the tab is hidden.
  - `TickerStrip` (inside `SiteHeader`, linking to `/lab`) and the lazy `/lab` page each own one session.
  - Everything simulated is labelled as such. Never add accuracy or hit-rate counters: they read as performance claims.
```

- [ ] **Step 12: Commit.**

```bash
git add client/src client/tests/shell.test.js client/scripts/verify-redesign.mjs client/index.html CLAUDE.md
# commit subject: "Add the shareable order-flow playground at /lab"
```

- [ ] **Step 13: Final checks and STOP.**
- Run the verify procedure once more.
- Re-run the Lighthouse command from Task 8 Step 4.
- Send Pravesh lab screenshots (desktop and mobile), a shareable `/lab?seed=…` link from the preview, the bundle sizes (`index`, `ShellDrawer`, `LabPage` chunks) and the Lighthouse score.
- Ask whether to push phase 3. Do not push without a yes.
