# Portfolio Redesign — Design Spec

**Date:** 2026-06-10
**Status:** Approved by Pravesh (brainstorming session)

## Goal

Redesign the portfolio (client SPA) for two audiences served equally — recruiters/hiring managers and freelance/consulting clients — with a refined version of the existing warm-editorial visual identity, a consolidated long-scroll structure, cinematic scroll animations, and content updated to match the current resume.

The server, API contracts, forms behavior, deployment setup (GitHub Pages + Vercel), `resume.pdf`, and README are explicitly out of scope and unchanged.

## Decisions made

| Question | Decision |
|---|---|
| Audience | Recruiters and clients, equally |
| Visual direction | Warm Editorial — refine the existing cream/teal/terracotta identity |
| Structure | Long-scroll story home + 2 support routes (down from 9 routes) |
| Animation intensity | Level 3 — Cinematic (pinned, scroll-scrubbed scenes) |
| Animation tech | Framer Motion + Lenis only; no GSAP, no new dependencies |
| Three.js background | Removed, replaced with CSS/Framer parallax color fields |

## 1. Visual language

Keep: background `#f5f1ea`, teal `#2f6f62`, terracotta `#d27a45`, dark ink `#1c1a16`, Fraunces (display serif) + Manrope (body), subtle paper grain, pill buttons.

Refine:

- **Hero typography**: larger editorial headline; name in serif with an italic terracotta accent line (mockup direction: "Pravesh Pandey — *builds systems that scale.*").
- **Numbered section headings**: each home section opens with an editorial label, e.g. "01 — About", "02 — Experience".
- **One card style**: current `.glass-panel` simplified — solid warm-white surface, 1px warm border, soft shadow; drop the heavy `backdrop-filter: blur(18px)` and the multiply-blend gradient overlay.
- **Spacing**: consistent vertical rhythm between sections (one clamp-based scale used everywhere).
- **Background**: delete the Three.js scene (`CreativeBackground`: icosahedron, 1,800-point particle field, torus ring, `OrbitControls`). Replace with 2–3 fixed, blurred radial-gradient color fields (teal/terracotta) that drift at different speeds via scroll-linked transforms. Static for `prefers-reduced-motion`.
- **Dependencies removed**: `three`, `@react-three/fiber`, `@react-three/drei`. Kept: `framer-motion`, `@studio-freight/react-lenis`.
- **Custom cursor**: kept as is.

## 2. Structure and routes

### Routes

| Route | Content |
|---|---|
| `/` | Long-scroll story (sections below) |
| `/projects` | All 8 projects, full grid |
| `/work-with-me` | Client funnel: process steps + project brief form (merges old `/process` + `/brief`) |
| `*` | Existing NotFound page |

### Home sections (in order, with anchor ids)

1. **Hero** — no anchor; name, role line ("Software Development Engineer · Amazon Alexa AI"), headline, sub-line, CTAs: "View work" (→ `#projects`), "Resume" (PDF), "Work with me" (→ `/work-with-me`).
2. **Impact metrics** — `#impact`; count-up metric strip (see content).
3. **About** — `#about`; short narrative + education (B.Tech, MNNIT, 2019–2023) + location (Bangalore).
4. **Experience** — `#experience`; timeline of 3 roles, updated content.
5. **Featured projects** — `#projects`; top 4 projects + "All projects →" link to `/projects`.
6. **Skills** — `#skills`; updated skills matrix.
7. **Awards** — `#awards`; awards and certifications.
8. **Contact** — `#contact`; contact form + email + social links.

Existing section components (`ExperienceTimeline`, `ProjectGrid`, `SkillsColumns`, `AchievementGrid`, `ProcessSteps`, `ProjectBriefForm`, contact form) are reused/adapted as home sections rather than rewritten from scratch.

### Redirects (no broken bookmarks)

| Old route | Redirects to |
|---|---|
| `/about` | `/#about` |
| `/experience` | `/#experience` |
| `/skills` | `/#skills` |
| `/achievements` | `/#awards` |
| `/contact` | `/#contact` |
| `/process` | `/work-with-me` |
| `/brief` | `/work-with-me` |

Home must scroll to the anchor when loaded with a hash (covers redirects and direct links). Everything must work under the GitHub Pages base path `/Portfolio/`.

### Navigation

`NAV_ITEMS` becomes: Home (`#` top), About (`#about`), Experience (`#experience`), Projects (`#projects`), Skills (`#skills`), Contact (`#contact`), Work with me (`/work-with-me`). Resume button stays in the header. Anchor links from other routes navigate home first, then scroll (existing header logic, made reliable).

## 3. Content updates (`client/src/data/profile.js`)

### Experience — Amazon entry rewritten from resume

- LangForge Automation (Alexa AI AIDo Frugal Frontrunner Award): led end-to-end development; CET failure rates 60% → 0% for onboarded expert teams; saved 260 hours across 60+ teams; owned LangForgeSDK.
- Pattern Match i18n expansion: context-based FST binary building/filtering across 4 services; locale-based binary separation cutting binary load and search time; enabled Pattern Match in new regions via S3 replication.
- Clarity Platform: centralized platform providing Classic Alexa NLU signals for deterministic inference (accuracy, latency, capacity).
- JDK8 → JDK17 migration of 9 microservices; 15% compute cost reduction.
- Stack line gains: S3, CDK.

nFolks and Phyt Health entries stay as is (already accurate).

### Impact metrics strip (count-up numbers)

Primary four: **60% → 0%** CET failure rate eliminated · **260 hr** saved across 60+ teams · **15%** compute cost reduction · **68%** faster data retrieval. (Additional available if layout wants 6: 18 locales, 500+ app users.)

### Awards (`achievements`)

- Add: Alexa AI AIDo Frugal Frontrunner Award (2025); Extra Mile Award, Amazon (2025).
- Fix: Prosang Project Exhibition win year 2020 → **2023**.
- Keep: Technex 2020 top-3 (IIT BHU), MongoDB Certification (2023), Stanford Algorithms Specialization (2020).

### Skills (`skillsMatrix`)

Add: LangChain, RAG, C#, .NET, GraphQL, Azure. Reorganize into the same three columns (Systems & Backend / Languages & Frameworks / Data, AI & DevOps).

### Featured projects

Add a `featured` flag in data; initial picks: AI Sudoku Solver, IMME Conference Platform, TamperScripts Collection, Cell Phone Controlled Car. All 8 remain on `/projects`.

### Links and identity fixes

- Contact social links currently `href="#"` (dead) → LinkedIn `https://www.linkedin.com/in/pravesh25/`, GitHub `https://github.com/pravesh-pandey`. Twitter link removed (no handle provided). LeetCode omitted unless a username is supplied later.
- Email stays `pravesh.pandey.mnnit@gmail.com` everywhere.

## 4. Animations (Level 3 — Cinematic)

All built with Framer Motion (`useScroll`, `useTransform`, `whileInView`) over Lenis smooth scroll.

- **Hero (pinned scene)**: sticky container ~200vh; as the user scrolls, the headline scales down/fades and the about-bridge statement rises in — a polished rework of the existing `home-stack`.
- **Impact metrics (pinned scene)**: short sticky scene; numbers count up (ease-out cubic, ~1.2s) when the section enters view; a progress hairline fills with scroll.
- **Experience timeline**: vertical line scales with scroll progress (`scaleY` from scroll); entries fade/slide in alternately left/right.
- **Section reveals**: every section heading and card uses staggered fade-up (`whileInView`, once, threshold ~0.2, 80–120ms stagger).
- **Parallax fields**: background color fields translate at different rates relative to scroll.
- **Project cards**: staggered rise on reveal; hover lift + shadow deepen.
- **Reduced motion**: `prefers-reduced-motion` disables pinning/scrubbing/parallax/counters (numbers render at final values); reveals become instant or simple opacity fades. The existing global media query stays as the safety net, but scroll-driven transforms must also be gated in JS (`useReducedMotion`).

## 5. Error handling & edge cases

- Forms: unchanged behavior (existing fetch + status/feedback states) — contact posts to `/api/contact`, brief to `/api/brief`.
- Hash navigation: unknown hash → no scroll, no crash; hash scroll waits for layout (next frame after mount).
- Small screens (<768px): the hero keeps its pinned scrub but with a shorter track (~150vh); the metrics scene is not pinned (plain section, counters still fire on view); metrics strip wraps to 2×2.

## 6. Verification

1. `cd client && npm run lint && npm run build` (also confirm three.js gone from bundle); `cd server && npm run lint`.
2. Playwright pass on the built/dev site: desktop 1440px and mobile 375px — hero pin, counters, timeline draw, all anchors from nav, all 7 redirects, both forms render, footer/social links correct.
3. Reduced-motion pass: emulate `prefers-reduced-motion` and confirm content is fully readable with no scroll-scrubbing.
4. Production-like build with `BASE_PATH=/Portfolio/` to confirm anchors and redirects work under the base path.
