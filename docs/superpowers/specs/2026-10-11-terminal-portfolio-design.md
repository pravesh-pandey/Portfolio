# Terminal Portfolio — Design Spec

**Date:** 2026-10-11
**Status:** Approved by Pravesh; revised 2026-10-11 after an independent review (see "Revisions after review")
**Branch:** `quant-projects-upwork` (builds on that branch's project reorder + Upwork links)

## Goal

Make the portfolio a distinctive, client-winning site for a developer who is also a quant/trading-systems engineer. It serves three audiences equally: freelance clients (Upwork and direct), quant/trading clients, and full-time quant-dev and SDE recruiters. The site adopts a dark trading-terminal identity, routes each audience to its own path, adds case studies for the trading and infrastructure work, adds an optional CloudShell-style terminal drawer, and adds an interactive order-flow playground.

## Decisions made

| Question | Decision |
|---|---|
| Audience | Freelance clients, quant/trading clients, quant-dev/SDE recruiters — all equal |
| Hero strategy | One value line for everyone + three paths (hire / trading / résumé) |
| Visual direction | B — dark trading terminal across the whole site |
| Interaction model | Terminal-styled website by default; optional bottom shell drawer (like AWS CloudShell) that drives the site |
| Trading results | Shown publicly as method only — **no numbers** (no P&L, hit rates, Sharpe, latencies) for trading work |
| Tone | Confident and vivid, but every claim must be true to the code and READMEs; no unverifiable superlatives ("institutional-grade", "profitable", "used by traders") |
| Demos | Order-flow playground now; options payoff + Greeks tool in a later, separate project |
| Light mode | None — dark only |

## Out of scope

- Options payoff + Greeks tool (next project, own spec).
- Blog / research notes.
- Light theme.
- Server (`server/`), API contracts, contact/brief form behavior, deployment setup (GitHub Pages + Vercel), `resume.pdf`.

## Phases

Each phase is independently shippable to `main`.

1. **Terminal redesign** — visual system, routes and navigation, hero with three paths, `/trading`, case-study pages, CTA on every project.
2. **Shell drawer** — CloudShell-style terminal that drives the site.
3. **Simulation, ticker strip and `/lab`** — order-flow simulation, the site-wide simulated ticker strip, the playground page.

## 1. Information architecture

### Routes

| Route | Content | Phase |
|---|---|---|
| `/` | Hero (value line + 3 paths), trading-systems teaser (FlowPulse, Options Backtester, lab link), impact metrics (Amazon), experience, selected projects, skills, awards, contact | 1 |
| `/trading` | Short intro, FlowPulse + Options Backtester case-study panes, link to `/lab` | 1 |
| `/case-studies/:slug` | `flowpulse`, `options-backtester`, `localcache`; unknown slug → existing NotFound page | 1 |
| `/projects` | All 12 projects in current priority order | 1 |
| `/work-with-me` | Unchanged content plus existing Upwork link; restyled | 1 |
| `/lab` | Order-flow playground | 3 |

Existing redirects (`/about`, `/experience`, `/skills`, `/achievements`, `/contact`, `/process`, `/brief`) stay as they are.

### Navigation

`[1] hire` → `/work-with-me` · `[2] trading` → `/trading` · `[3] experience` → `/#experience` · `[4] projects` → `/projects` · `[5] lab` → `/lab`.

Before phase 3 ships, `[5] lab` is omitted. The header keeps a `cv.pdf` button; the mobile menu and the experience section also link the PDF, so phones never lose it. Mobile collapses the nav into a single `[≡] menu` toggle. The header stays on screen while scrolling (terminals don't hide their chrome).

### Hero

- Tag line (mono, dim): `> pravesh pandey · sde @ amazon alexa ai · quant dev`, typed out once per visit (instant on later returns and under reduced motion).
- Headline: "Backend systems at Amazon scale." / "Trading systems at market speed." (second line in green).
- Sub-line (Inter): "I design, build and ship software that has to be fast and correct, for clients, teams and markets."
- Three path panes: **Hire me →** (projects & Upwork, `/work-with-me`), **Trading systems →** (order flow, backtesting, `/trading`), **Experience →** (track record & CV, `/#experience`). On mobile they render as command chips.
- Blinking block cursor after the headline (static under reduced motion).

### Numbers policy

Amazon impact metrics (already on the public résumé) stay. Trading projects show no numbers anywhere, including the simulated ticker and lab, which are always labelled simulated.

## 2. Visual system

### Color tokens (defined once on `:root` in `global.css`)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0b0d0c` | Page background |
| `--pane` | `#101513` | Pane surfaces |
| `--border` | `#23302a` | Pane borders, dividers |
| `--text` | `#d8e3dc` | Primary text |
| `--text-2` | `#a9bcb2` | Body paragraphs |
| `--dim` | `#6f8379` | Labels, hints |
| `--amber` | `#ffb000` | Headings, labels, primary CTAs |
| `--green` | `#3ddc84` | Interactive elements, up-moves, shell |
| `--red` | `#ff6b5b` | Alerts only |

Every text/background pair used must meet WCAG AA contrast; any failing pair is adjusted at implementation time and the token table updated.

### Typography

- **JetBrains Mono** — nav, headings, labels, data, buttons, shell.
- **Inter** — paragraphs and long-form case-study text.
- Loaded from Google Fonts with `display=swap`, replacing Fraunces + Manrope in `client/index.html`.

### Motion

- Removed: pinned/scroll-scrubbed hero scenes, Lenis smooth scrolling (`@studio-freight/react-lenis` dependency removed), custom cursor (`Cursor.jsx`), ambient background (`AmbientBackground`), scroll progress bar (`ScrollProgress`), and any component left unused by these removals.
- Kept (Framer Motion): short fade/slide reveals, drawer slide, hero typing effect, blinking cursor.
- `prefers-reduced-motion`: all motion off; content appears immediately; marquee does not scroll.

### Shared building blocks

- **Pane** — bordered dark surface with an amber uppercase label; used for cards, case-study sections, lab panels.
- **Status bar** — fixed bottom bar: `>_ Shell` button (left), "press ` to open" hint, copyright (right). Phase 1 ships the bar without the button; phase 2 adds it.
- **Chip** — small rounded command button (shell suggestions, mobile hero paths, stack tags).

### Mobile

Single-column panes, 16px side gutter, no horizontal page scroll; ticker strip becomes a marquee; nav collapses to `[≡] menu`.

## 3. Shell drawer (phase 2)

### Behavior

- Toggle: footer `>_ Shell` button or the backtick key. Backtick is ignored while focus is in an `input`, `textarea`, `select` or contenteditable element (except the shell's own input, where backtick closes it only when the input is empty).
- Close: toggle, `Esc`, `exit`, or ✕.
- Size: 40vh default; maximize toggles 90vh.
- Persistence: open/closed and maximized state stored in `localStorage`, every access wrapped in try/catch; site works identically when storage is unavailable.
- The page behind stays scrollable and interactive.

### Commands

One module (`src/shell/commands.js`) defines all commands as `{ name, summary, run(args, ctx) }`. `run` returns output lines and optionally a route to navigate to. Output is built from the same data modules the pages use (`profile.js`, `caseStudies.js`).

| Command | Effect |
|---|---|
| `help` | List commands with summaries |
| `whoami` | One-line bio |
| `hire` | Navigate to `/work-with-me` |
| `upwork` | Open Upwork profile in a new tab |
| `trading` | Navigate to `/trading` |
| `resume` | Navigate to `/#experience`; `resume --pdf` opens `resume.pdf` |
| `ls projects` | List projects with slugs |
| `open <slug>` | Navigate to the case study if one exists, else to `/projects` and print the project summary |
| `lab` | Navigate to `/lab` (phase 3; before that prints "coming soon") |
| `contact` | Print email and contact-section link |
| `clear` | Clear output |
| `exit` | Close drawer |

- Unknown command → `command not found: <cmd>. Try help`.
- `Tab` completes command names and `open` slugs; `↑`/`↓` walk history (session only).
- Navigation prints `→ opened <page title>`.
- Mobile: a row of tappable chips (`help` `hire` `trading` `resume` `lab`) above the input.

### Accessibility

- Drawer is a labelled region (`aria-label="Shell"`), not a modal; no focus trap.
- Output container is an `aria-live="polite"` log.
- Opening focuses the input; closing returns focus to the `>_ Shell` button.

### Loading

The drawer is loaded with `React.lazy` on first open; nothing shell-related is in the initial bundle except the button.

## 4. Case studies (phase 1)

### Data and template

`src/data/caseStudies.js` exports an array; one page component renders any entry. Fields:

- `slug`, `title`, `summary` (1–2 sentences)
- `problem` (what made it hard)
- `pipeline` — ordered list of stage labels rendered as boxes with arrows, plus `approach` paragraph(s)
- `highlights` — 3–5 engineering bullets
- `limitations` — honest limits and next steps
- `stack` — chip list
- `codeLink` (optional; LocalCache only) or "Code available on request" text for private repos
- `decisions` — 2–4 rows of decision / chosen / rejected-and-why, rendered as a "Decision log" table (stacked on phones)
- CTA at the end of every case study: "Need something like this? → hire" (→ `/work-with-me`) and "Ask for a walkthrough" (opens an email with the project in the subject)

### Entries

- **FlowPulse** — pipeline: market data feed → order-book analyzer → OFI / microprice / VPIN → institutional-order detector → Telegram alerts + paper trades → PostgreSQL / Grafana. Limitations include "paper trading only, not live capital".
- **Options Backtester for Indian F&O** — pipeline: archived index + option-chain data → completed-bar resampling → strategy signals → leg/strike selection → minute simulation with F&O charges → sweeps and walk-forward research. Limitations include research-only (no order placement).
- **LocalCache** — pipeline: key → SHA-256 → sharded path → atomic write / locked read → TTL check → journal-driven eviction. Links to the public repo.

### Content rules

- No numbers for trading work.
- Each claim checked against the repo README/code before publishing.
- Pravesh reviews all case-study copy before it ships.

### Slugs

Every project gets a stable `slug` field in `profile.js` in phase 1 (e.g. `flowpulse`, `options-backtester`, `localcache`, `market-depth-bot`, `ai-sudoku-solver`). Case-study slugs match their project slugs; the shell's `open` and `ls projects` (phase 2) use the same slugs.

### Projects page and cards

- Order unchanged (current priority order on this branch).
- Cards with a case study get `read case study →`.
- Every card ends with a `need this? → hire` link to `/work-with-me`.
- Card links to GitHub remain where the repo is public.

## 5. Simulation, ticker and lab (phase 3)

### Simulation core (`src/sim/`, pure JS, no dependencies)

- `rng.js` — seeded PRNG (mulberry32); same seed ⇒ same run.
- `market.js` — `createMarket({ seed, institutionalRate })` and `step(state)`: mid-price random walk on a 0.05 tick grid, 10-level order book with size churn, trade arrivals, and occasional large "institutional" orders; `inject(state, side)` forces one large order.
- `metrics.js`:
  - **OFI** — top-of-book order-flow imbalance (Cont–Kukanov–Stoikov definition), per step and rolling sum.
  - **Microprice** — `(bid·askSize + ask·bidSize) / (bidSize + askSize)`.
  - **VPIN** — fixed-volume buckets, buy/sell split by tick rule, rolling mean of |buy − sell| / bucket volume; always in [0, 1].
  - **Detector** — flags an order when its size exceeds 5 × the rolling median order size (last 200 orders), or a step whose OFI is more than 3 standard deviations from its 50-step mean; both thresholds are named constants. Emits `{ time, side, price, size, reason }`.
  - The lab labels VPIN as a "tick-rule variant", since canonical VPIN uses bulk volume classification.
- Instrument label is `SIM·NIFTY`; every surface showing simulated data says "simulated".

### Ticker strip

- One site-wide simulation instance, owned by the ticker inside the always-mounted header, stepping about every 500 ms. The whole strip links to `/lab`.
- Pauses when `document.visibilityState` is hidden.
- Shows price and % change, OFI, microprice, VPIN, latest alert. Static (no marquee) under reduced motion.

### `/lab` page (lazy-loaded route)

- Panels: order-book ladder (10 levels), price vs microprice chart, OFI bars, VPIN line, alert log.
- Controls: play/pause, speed (1× / 4×), institutional-activity slider, inject large buy, inject large sell, reset (new seed).
- Each metric panel has a short "what this means" explainer.
- Charts are hand-written SVG polylines/bars; no chart library.
- The lab runs its own simulation instance so its controls don't disturb the site-wide ticker.

## 6. Testing and performance

### Unit tests

Node's built-in runner (`node --test`), no new dependencies; `npm test` script added to `client/package.json` and a test step added to the client job in `.github/workflows/ci.yml`.

- `metrics`: microprice on hand-computed books; OFI on hand-built book transitions — bid size up at same price ⇒ positive, ask size up at same price ⇒ negative, bid price up ⇒ +new bid size, ask price down ⇒ −new ask size; VPIN within [0, 1]; detector flags an injected large order and not a normal one.
- `market`: determinism — same seed produces identical first N steps.
- `commands`: `help` lists all commands; unknown command message; `open flowpulse` returns the case-study route; `open` with a project lacking a case study routes to `/projects`; tab completion of a partial name.

### Browser checks

Extend `client/scripts/verify-redesign.mjs` (Playwright, existing dev dependency):

- All routes render; nav items go to the right places; redirects still work.
- Each case-study page renders its sections and CTA; unknown slug shows NotFound.
- Projects page shows 12 cards; every card has a hire link.
- Shell opens via button and via backtick; `open flowpulse` navigates; `Esc` closes and focus returns to the button.
- `/lab` renders and its metrics update over time; ticker updates.
- No console errors on desktop and mobile; reduced-motion pass shows content without animation.

### Performance budget

- Initial JS ≤ 113 KB gzip (today's size); shell drawer and `/lab` are separate chunks.
- Lighthouse mobile performance ≥ 90 on `/` (checked manually before merging each phase).

### Housekeeping

Update the repo `CLAUDE.md` architecture section (it still describes the Three.js background and old routes).

## Revisions after review (2026-10-11)

An independent review (Fable 5.1) of this spec and the plan led to these additions; Pravesh chose the four creative items.

**Fixes**
- Lazy chunks (shell drawer, `/lab`) are wrapped in an error boundary that offers a reload, so a tab opened before a redeploy never goes blank.
- The shell's `Tab` key only completes when there is input; otherwise it moves focus (no keyboard trap).
- The open drawer pads the page by its own height (`body[data-shell]` → `--shell-height`), so nothing behind it becomes unreachable.
- A drawer restored from an earlier visit does not take focus on page load; only a visitor's own open does.
- Single-key shortcuts (`` ` `` and 1–5) can be switched off with `shortcuts off` (WCAG 2.1.4).
- Per-route document titles (`<title> · Pravesh Pandey`); site-wide Open Graph tags in `index.html` (link-preview crawlers don't run JavaScript).
- Mobile viewport uses `viewport-fit=cover, interactive-widget=resizes-content`; the status bar and drawer respect `env(safe-area-inset-bottom)`.
- Falling values use amber, since red is reserved for alerts.
- Simulation sessions can warm up (60 steps) so charts start full and the detector catches an immediate injection; large orders move the simulated price.
- Browser checks treat missing elements as failures instead of hanging.

**Creative additions**
- `/trading` gains a "What I don't publish, and why" pane: no P&L or win rates (easy to overfit, impossible to verify on a web page), no live-trading claims, no strategy parameters; walkthrough on request.
- Each case study gains a decision log (see Section 4).
- Shell: number keys `1`–`5` follow the menu; `cat <project>` prints a summary in place; `man <command>`; hidden `sudo hire`; `open <project>` without a case study scrolls to that card on `/projects`.
- Lab runs are shareable: the seed is in the URL (`/lab?seed=42`) with a "copy link to this run" button; the ticker opens the lab.

