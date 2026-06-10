# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio client as a 3-route warm-editorial site with a cinematic long-scroll home, per `docs/superpowers/specs/2026-06-10-portfolio-redesign-design.md`.

**Architecture:** The home page becomes a composition of section components (`client/src/components/sections/`), each owning its anchor id and animations. Shared animation primitives (`Reveal`, `CountUp`, `SectionHeading`) live in `components/common/`. The Three.js background is replaced by a CSS/Framer `AmbientBackground`. Old routes become `<Navigate>` redirects; a `useHashScroll` hook scrolls to anchors after redirect/navigation.

**Tech Stack:** React 18, Vite 5, Framer Motion 11 (`useScroll`, `useTransform`, `useInView`, `useReducedMotion`, `animate`), Lenis smooth scroll, React Router v6 (`BrowserRouter` with `basename={import.meta.env.BASE_URL}` — already set in `main.jsx`). Verification via `playwright-chromium` (already a devDependency).

**Testing note:** This repo has no unit-test infrastructure (lint + build only). Per spec §6, TDD steps are replaced by lint/build verification per task and a scripted Playwright pass in Task 11. Run all `npm` commands from `client/` unless stated otherwise.

**Spec deviation (approved rationale):** Spec said omit LeetCode from contact links unless a username is supplied — the username already exists in `SiteFooter.jsx` (`https://leetcode.com/u/pravesh_pandey/`), so contact social links include it for consistency.

---

## File map

| Action | Path |
|---|---|
| Create | `client/src/components/background/AmbientBackground.jsx` + `ambientBackground.css` |
| Create | `client/src/components/common/Reveal.jsx`, `CountUp.jsx`, `SectionHeading.jsx` |
| Create | `client/src/components/sections/HeroSection.jsx` + `heroSection.css` |
| Create | `client/src/components/sections/ImpactSection.jsx` + `impactSection.css` |
| Create | `client/src/components/sections/AboutSection.jsx` + `aboutSection.css` |
| Create | `client/src/components/sections/ExperienceSection.jsx`, `FeaturedProjectsSection.jsx`, `SkillsSection.jsx`, `AwardsSection.jsx` |
| Create | `client/src/components/sections/ContactSection.jsx` + `contactSection.css` |
| Create | `client/src/hooks/useHashScroll.js` |
| Create | `client/src/pages/WorkWithMePage.jsx` + `workWithMePage.css` |
| Create | `client/scripts/verify-redesign.mjs` |
| Rewrite | `client/src/data/profile.js`, `client/src/data/navigation.js`, `client/src/router.jsx`, `client/src/pages/HomePage.jsx`, `client/src/pages/homePage.css`, `client/src/pages/ProjectsPage.jsx`, `client/src/layout/AppLayout.jsx`, `client/index.html` |
| Modify | `client/src/styles/global.css`, `client/src/components/experience/ExperienceTimeline.jsx` + `experienceTimeline.css`, `client/src/components/navigation/SiteHeader.jsx`, `client/package.json` |
| Delete | `client/src/components/hero/` (all 4 files), `client/src/components/common/MetricGrid.jsx`, `client/src/pages/{AboutPage,ExperiencePage,SkillsPage,AchievementsPage,ProcessPage,BriefPage,ContactPage}.jsx`, `client/src/pages/{aboutPage,briefPage,contactPage}.css` |

Unchanged: `server/` entirely, `SiteFooter.jsx`, `ScrollProgress.jsx`, `Cursor.jsx`, `ProjectBriefForm.jsx`, `ProcessSteps.jsx`, `SkillsColumns.jsx`, `AchievementGrid.jsx`, `ProjectGrid.jsx`, `PageIntro.jsx`, `NotFoundPage.jsx`, `main.jsx`, `App.jsx`, `vite.config.js`.

---

### Task 1: Replace Three.js background with AmbientBackground

**Files:**
- Create: `client/src/components/background/AmbientBackground.jsx`
- Create: `client/src/components/background/ambientBackground.css`
- Rewrite: `client/src/layout/AppLayout.jsx`
- Modify: `client/src/styles/global.css` (remove `.three-wrapper`)
- Delete: `client/src/components/hero/CreativeBackground.jsx`, `client/src/components/hero/creativeBackground.css`
- Modify: `client/package.json` (via `npm uninstall`)

- [ ] **Step 1: Create `client/src/components/background/AmbientBackground.jsx`**

```jsx
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import "./ambientBackground.css";

export const AmbientBackground = () => {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const tealY = useTransform(scrollY, [0, 2400], [0, -180]);
  const terracottaY = useTransform(scrollY, [0, 2400], [0, 140]);
  const inkY = useTransform(scrollY, [0, 2400], [0, -80]);

  return (
    <div className="ambient" aria-hidden="true">
      <motion.span
        className="ambient__field ambient__field--teal"
        style={reduceMotion ? undefined : { y: tealY }}
      />
      <motion.span
        className="ambient__field ambient__field--terracotta"
        style={reduceMotion ? undefined : { y: terracottaY }}
      />
      <motion.span
        className="ambient__field ambient__field--ink"
        style={reduceMotion ? undefined : { y: inkY }}
      />
    </div>
  );
};
```

- [ ] **Step 2: Create `client/src/components/background/ambientBackground.css`**

```css
.ambient {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.ambient__field {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  will-change: transform;
}

.ambient__field--teal {
  width: 48vw;
  height: 48vw;
  top: -12vw;
  left: -10vw;
  background: radial-gradient(circle, rgba(var(--accent-rgb), 0.2), transparent 65%);
}

.ambient__field--terracotta {
  width: 42vw;
  height: 42vw;
  top: 30vh;
  right: -12vw;
  background: radial-gradient(circle, rgba(var(--accent-2-rgb), 0.18), transparent 65%);
}

.ambient__field--ink {
  width: 40vw;
  height: 40vw;
  bottom: -15vw;
  left: 20vw;
  background: radial-gradient(circle, rgba(28, 55, 60, 0.12), transparent 65%);
}
```

- [ ] **Step 3: Rewrite `client/src/layout/AppLayout.jsx`** (background swap + hash-aware scroll-to-top so redirects with hashes don't get yanked to top)

```jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SiteHeader } from "@components/navigation/SiteHeader.jsx";
import { SiteFooter } from "@components/navigation/SiteFooter.jsx";
import { ScrollProgress } from "@components/common/ScrollProgress.jsx";
import { AmbientBackground } from "@components/background/AmbientBackground.jsx";

export const AppLayout = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname, location.hash]);

  return (
    <>
      <AmbientBackground />
      <ScrollProgress />
      <div className="site">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </div>
    </>
  );
};
```

- [ ] **Step 4: Delete the old background and its CSS**

```bash
rm client/src/components/hero/CreativeBackground.jsx client/src/components/hero/creativeBackground.css
```

- [ ] **Step 5: Remove the `.three-wrapper` block from `client/src/styles/global.css`** (lines 289–295 in the current file)

```css
.three-wrapper {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.55;
}
```
Delete this entire block.

- [ ] **Step 6: Uninstall Three.js packages**

Run: `cd client && npm uninstall three @react-three/fiber @react-three/drei`
Expected: `package.json` dependencies reduced to `@studio-freight/react-lenis`, `framer-motion`, `react`, `react-dom`, `react-router-dom`.

- [ ] **Step 7: Verify lint and build**

Run: `cd client && npm run lint && npm run build`
Expected: both pass; build output no longer contains a three.js-sized chunk (previously the largest chunk).

- [ ] **Step 8: Commit**

```bash
git add -A client
git commit -m "feat: replace Three.js background with lightweight ambient parallax fields"
```

---

### Task 2: Content refresh — profile data, fonts, page title

**Files:**
- Rewrite: `client/src/data/profile.js`
- Rewrite: `client/index.html`

- [ ] **Step 1: Confirm `heroHighlights` and `MetricGrid` have no consumers** (informs this task and Task 10)

Run: `grep -rn "heroHighlights\|MetricGrid" client/src --include="*.jsx" --include="*.js" | grep -v "data/profile.js" | grep -v "common/MetricGrid.jsx"`
Expected: no output. (If something imports them, keep that export and adapt — do not break the build.)

- [ ] **Step 2: Rewrite `client/src/data/profile.js`** (drops unused `heroHighlights`, adds `impactMetrics` + `featured` flags, refreshes Amazon experience/awards/skills from resume)

```js
export const impactMetrics = [
  { value: 60, suffix: "% → 0%", label: "Alexa CET failure rate eliminated for onboarded teams" },
  { value: 260, suffix: " hr", label: "Engineering effort saved across 60+ teams" },
  { value: 15, suffix: "%", label: "Compute costs cut by migrating 9 services to JDK17" },
  { value: 68, suffix: "%", label: "Faster database retrieval via parallel processing" }
];

export const experienceTimeline = [
  {
    role: "Software Development Engineer",
    company: "Amazon",
    period: "May 2024 – Present",
    location: "Bangalore, India",
    outcomes: [
      "Led end-to-end development of LangForge Automation — winner of the Alexa AI AIDo Frugal Frontrunner Award — cutting CET failure rates from 60% to 0% for onboarded expert teams and saving 260 hours of effort across 60+ teams.",
      "Enabled Pattern Match support for multi-locale Alexa+ expansion by implementing context-based FST binary building and filtering across 4 services, with locale-based binary separation to reduce binary load and search time.",
      "Contributing to the Clarity platform, which provides Classic Alexa NLU signals for deterministic inference — improving accuracy, latency, and capacity usage.",
      "Led migration of 9 microservices from JDK8 to JDK17, reducing compute costs by 15% through modern JVM features."
    ],
    stack: ["Java", "AWS", "DynamoDB", "S3", "CDK", "Microservices", "Distributed Systems"]
  },
  {
    role: "Software Engineer",
    company: "nFolks Data Solutions",
    period: "Oct 2023 – Apr 2024",
    location: "Remote, India",
    outcomes: [
      "Developed a multi-threaded data processing framework that improved database retrieval performance by 68%.",
      "Optimized data pipeline architecture and CI/CD workflows to improve system reliability and response times."
    ],
    stack: ["Python", "Flask", "REST APIs", "Jenkins", "SQL"]
  },
  {
    role: "Software Development Intern",
    company: "Phyt Health",
    period: "Jan 2022 – Mar 2022",
    location: "Pune, India",
    outcomes: [
      "Built an AI-powered fitness application with real-time posture correction, serving 500+ users with a 4.2-star rating.",
      "Implemented WebRTC-based video consultation feature enabling real-time communication between physiotherapists and patients."
    ],
    stack: ["React", "Node.js", "TensorFlow", "WebRTC", "C++"]
  }
];

export const projectShowcase = [
  {
    title: "AI Sudoku Solver",
    tagline: "Computer vision-based puzzle recognition and solving.",
    description:
      "Developed end-to-end system using TensorFlow and OpenCV to detect, recognize, and solve Sudoku puzzles from camera input with high accuracy.",
    bullets: [
      "Trained custom convolutional neural network to recognize handwritten and printed digits across multiple fonts and writing styles.",
      "Integrated computer vision preprocessing with constraint satisfaction algorithms for reliable puzzle solving."
    ],
    stack: ["Python", "TensorFlow", "OpenCV", "Deep Learning"],
    featured: true
  },
  {
    title: "IMME Conference Platform",
    tagline: "Full-stack conference management system.",
    description:
      "Built comprehensive conference management platform serving 1,000+ attendees with real-time session updates, speaker profiles, and attendee feedback system.",
    bullets: [
      "Developed modular CMS enabling non-technical staff to manage content and schedules.",
      "Created responsive front-end optimized for mobile devices and varying network conditions."
    ],
    stack: ["HTML", "CSS", "JavaScript", "Bootstrap", "Python", "SQL"],
    featured: true
  },
  {
    title: "TamperScripts Collection",
    tagline: "Browser automation scripts for enhanced web functionality.",
    description:
      "Developed collection of userscripts enhancing browser functionality across popular websites, supporting Chrome, Firefox, Edge, Safari, and Opera.",
    bullets: [
      "Built Amazon/Flipkart price tracking widget, shortlink bypass for 100+ services, and web restriction remover.",
      "Created Codeforces optimization helper displaying solutions sorted by execution time."
    ],
    stack: ["JavaScript", "Tampermonkey", "Browser APIs"],
    link: "https://github.com/pravesh-pandey/TamperScripts",
    featured: true
  },
  {
    title: "Cell Phone Controlled Car",
    tagline: "IoT-based robotic car with smartphone control.",
    description:
      "Designed three-wheeled robotic car controlled via smartphone accelerometer data transmitted over WiFi, demonstrating practical IoT integration.",
    bullets: [
      "Integrated Arduino UNO and NodeMCU with L298N motor driver for real-time wireless motor control.",
      "Developed MIT App Inventor mobile application transmitting accelerometer data every 100ms for responsive steering."
    ],
    stack: ["Arduino", "NodeMCU", "MIT App Inventor", "C++", "IoT"],
    link: "https://github.com/pravesh-pandey/Cell_Phone_Controlled_car",
    featured: true
  },
  {
    title: "Digital Marketing Portfolio Website",
    tagline: "Modern single-page portfolio with JSON-based content management.",
    description:
      "Built a responsive, mobile-first portfolio website featuring content management through JSON configuration, optimized for performance without external dependencies.",
    bullets: [
      "Implemented vanilla JavaScript architecture with smooth scrolling and animated testimonial carousel.",
      "Designed honeypot spam protection system for contact forms and configured for GitHub Pages deployment."
    ],
    stack: ["JavaScript", "CSS", "HTML", "GitHub Pages"],
    link: "https://github.com/pravesh-pandey/Digital-Marketing-Website"
  },
  {
    title: "Covin Web Application",
    tagline: "Full-stack web application with Vite and Node.js.",
    description:
      "Built modern web application with separate frontend and backend architecture, utilizing Vite for optimized frontend build process.",
    bullets: [
      "Implemented frontend using Vite build tool for fast development and optimized production builds.",
      "Developed backend API server with Node.js/Express for data management and business logic."
    ],
    stack: ["JavaScript", "Vite", "Node.js", "Express", "CSS", "HTML"],
    link: "https://github.com/pravesh-pandey/covin"
  },
  {
    title: "STOCKHOLM_PARING",
    tagline: "Web application with social authentication integration.",
    description:
      "Developed web application featuring multiple authentication systems including Facebook and Google sign-in, with user management capabilities.",
    bullets: [
      "Implemented social authentication integration with Facebook and Google OAuth providers.",
      "Built random user card generation feature with database models for data management."
    ],
    stack: ["JavaScript", "HTML", "CSS", "Node.js", "API Development"],
    link: "https://github.com/pravesh-pandey/STOCKHOLM_PARING"
  },
  {
    title: "Curves - Mathematical Visualization",
    tagline: "MATLAB implementation of mathematical curves.",
    description:
      "Created MATLAB project exploring mathematical curve representations including Hermite, Bézier, and B-spline curves in 2D and 3D space.",
    bullets: [
      "Implemented Hermite curve algorithms for 2D and 3D coordinate systems.",
      "Developed Bézier and B-spline curve functionality with cubic curve processing utilities."
    ],
    stack: ["MATLAB", "Computational Geometry"],
    link: "https://github.com/pravesh-pandey/curves"
  }
];

export const skillsMatrix = [
  {
    title: "Systems & Backend",
    items: [
      "Microservices architecture • Distributed systems • Event-driven design",
      "RESTful & GraphQL APIs • CI/CD pipelines • AWS & Azure",
      "Performance optimization • System observability • Cost reduction"
    ]
  },
  {
    title: "Languages & Frameworks",
    items: [
      "Java • Python • C/C++ • C#/.NET • JavaScript/TypeScript",
      "React • Node.js • Express • Flask",
      "SQL • Automation scripting"
    ]
  },
  {
    title: "Data, AI & DevOps",
    items: [
      "MySQL • DynamoDB • MongoDB • Redis",
      "LangChain • RAG • TensorFlow • OpenCV",
      "Docker • Jenkins • GitHub Actions"
    ]
  }
];

export const achievements = [
  {
    title: "Alexa AI AIDo Frugal Frontrunner Award",
    summary: "Amazon recognition for leading LangForge Automation end to end.",
    year: "2025"
  },
  {
    title: "Extra Mile Award — Amazon",
    summary: "Recognized for exceptional customer obsession and delivery excellence.",
    year: "2025"
  },
  {
    title: "Winner — Prosang Project Exhibition",
    summary: "First place at MNNIT Allahabad's project exhibition for an innovative technical solution.",
    year: "2023"
  },
  {
    title: "MongoDB Certified Developer",
    summary: "Completed MongoDB specialization certification (MongoDB, Inc).",
    year: "2023"
  },
  {
    title: "Top 3 — IIT BHU Technex Maze Explorer",
    summary: "Developed autonomous robot navigation system, placing in top 3 at national robotics competition.",
    year: "2020"
  },
  {
    title: "Algorithms Specialization",
    summary: "Completed Stanford University's comprehensive algorithms specialization course.",
    year: "2020"
  }
];

export const processSteps = [
  {
    step: "01",
    title: "Requirements & Planning",
    description: "Define project scope, technical requirements, success metrics, and identify constraints."
  },
  {
    step: "02",
    title: "System Design",
    description: "Design scalable architecture with clear service boundaries, data models, and deployment strategy."
  },
  {
    step: "03",
    title: "Implementation",
    description: "Build iteratively with continuous testing, code reviews, and performance monitoring."
  },
  {
    step: "04",
    title: "Deployment & Maintenance",
    description: "Deploy to production, establish monitoring, document systems, and plan future improvements."
  }
];
```

- [ ] **Step 3: Rewrite `client/index.html`** — Fraunces currently loads without italics; the new hero needs the italic axis. Also refresh title + add meta description.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta
      name="description"
      content="Portfolio of Pravesh Pandey, Software Development Engineer at Amazon Alexa AI — distributed systems, backend infrastructure, and AI tooling."
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500..700;1,9..144,500..700&family=Manrope:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <title>Pravesh Pandey — Software Development Engineer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Verify lint and build**

Run: `cd client && npm run lint && npm run build`
Expected: both pass (old pages still import the kept exports; `heroHighlights` had no consumers).

- [ ] **Step 5: Commit**

```bash
git add client/src/data/profile.js client/index.html
git commit -m "feat: refresh profile content from resume, add impact metrics and featured flags"
```

---

### Task 3: Animation primitives + global style refinements

**Files:**
- Create: `client/src/components/common/Reveal.jsx`
- Create: `client/src/components/common/CountUp.jsx`
- Create: `client/src/components/common/SectionHeading.jsx`
- Modify: `client/src/styles/global.css`

- [ ] **Step 1: Create `client/src/components/common/Reveal.jsx`**

```jsx
import { motion, useReducedMotion } from "framer-motion";

export const Reveal = ({ children, className, delay = 0, y = 28, once = true }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduceMotion ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};
```

- [ ] **Step 2: Create `client/src/components/common/CountUp.jsx`**

```jsx
import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

export const CountUp = ({ to, suffix = "", prefix = "", duration = 1.2 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView || reduceMotion) return undefined;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setValue(Math.round(latest))
    });
    return () => controls.stop();
  }, [inView, reduceMotion, to, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {reduceMotion ? to : value}
      {suffix}
    </span>
  );
};
```

- [ ] **Step 3: Create `client/src/components/common/SectionHeading.jsx`**

```jsx
import { Reveal } from "./Reveal.jsx";

export const SectionHeading = ({ number, label, title, lead }) => (
  <Reveal className="section-heading">
    <span className="section-heading__label">
      {number} — {label}
    </span>
    {title ? <h2 className="section-heading__title">{title}</h2> : null}
    {lead ? <p className="section-heading__lead">{lead}</p> : null}
  </Reveal>
);
```

- [ ] **Step 4: Simplify `.glass-panel` in `client/src/styles/global.css`** — replace the existing `.glass-panel` block AND delete the entire `.glass-panel::after` block:

```css
.glass-panel {
  background: var(--card);
  border-radius: var(--corner-xl);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-2);
  padding: clamp(1.8rem, 4vw, 2.6rem);
  position: relative;
}
```

(Removed: `backdrop-filter: blur(18px)`, `overflow: hidden`, `box-shadow: var(--shadow-1)` heavy variant, and the `::after` multiply-blend gradient overlay.)

- [ ] **Step 5: Add section-heading styles to `client/src/styles/global.css`** (insert after the `.page__lead` block)

```css
.section-heading {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-bottom: clamp(1.8rem, 4vw, 2.8rem);
}

.section-heading__label {
  font-size: 0.8rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--accent);
  font-weight: 600;
}

.section-heading__title {
  font-size: clamp(1.9rem, 4.2vw, 3rem);
  margin: 0;
  max-width: 22ch;
}

.section-heading__lead {
  font-size: 1.08rem;
  color: var(--text-dim);
  max-width: 640px;
  margin: 0;
}
```

- [ ] **Step 6: Verify lint and build**

Run: `cd client && npm run lint && npm run build`
Expected: both pass (new components are not yet imported; Vite only bundles imports, ESLint lints all of `src/`).

- [ ] **Step 7: Commit**

```bash
git add client/src/components/common client/src/styles/global.css
git commit -m "feat: add Reveal, CountUp, SectionHeading primitives; simplify panel style"
```

---

### Task 4: Hero scene (pinned scroll-scrubbed intro)

**Files:**
- Create: `client/src/components/sections/HeroSection.jsx`
- Create: `client/src/components/sections/heroSection.css`

- [ ] **Step 1: Create `client/src/components/sections/HeroSection.jsx`**

All hooks run before the reduced-motion branch (rules-of-hooks). The static variant renders both layers as normal flow — no pinning.

```jsx
import { useRef } from "react";
import { NavLink } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import "./heroSection.css";

const scrollToProjects = (event) => {
  event.preventDefault();
  document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
};

const HeroIntro = () => (
  <>
    <span className="hero-scene__eyebrow">Software Development Engineer · Amazon Alexa AI</span>
    <h1 className="hero-scene__title">
      Pravesh Pandey
      <em>builds systems that scale.</em>
    </h1>
    <p className="hero-scene__lead">
      Distributed systems, AI infrastructure, and backend services that hold up in production —
      from Alexa&apos;s NLU pipeline to data platforms processing at scale.
    </p>
    <div className="hero-scene__actions">
      <a className="button button--primary" href="#projects" onClick={scrollToProjects}>
        View my work
      </a>
      <NavLink className="button" to="/work-with-me">
        Work with me
      </NavLink>
      <a
        className="button button--ghost"
        href={`${import.meta.env.BASE_URL}resume.pdf`}
        target="_blank"
        rel="noreferrer"
      >
        Resume
      </a>
    </div>
  </>
);

const HeroBridge = () => (
  <>
    <span className="hero-scene__eyebrow">The short version</span>
    <h2 className="hero-scene__bridge-title">
      I turn complex requirements into <em>reliable, measurable systems</em> — latency, locales,
      and dollars saved.
    </h2>
  </>
);

export const HeroSection = () => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const introOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.4], ["0%", "-10%"]);
  const introScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.94]);
  const bridgeOpacity = useTransform(scrollYProgress, [0.45, 0.8], [0, 1]);
  const bridgeY = useTransform(scrollYProgress, [0.45, 0.8], ["18vh", "0vh"]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  if (reduceMotion) {
    return (
      <section className="hero-scene hero-scene--static">
        <div className="hero-scene__layer">
          <HeroIntro />
        </div>
        <div className="hero-scene__layer hero-scene__layer--bridge">
          <HeroBridge />
        </div>
      </section>
    );
  }

  return (
    <section className="hero-scene" ref={ref}>
      <div className="hero-scene__sticky">
        <motion.div
          className="hero-scene__layer"
          style={{ opacity: introOpacity, y: introY, scale: introScale }}
        >
          <HeroIntro />
        </motion.div>
        <motion.div
          className="hero-scene__layer hero-scene__layer--bridge"
          style={{ opacity: bridgeOpacity, y: bridgeY }}
        >
          <HeroBridge />
        </motion.div>
        <motion.span className="hero-scene__hint" style={{ opacity: hintOpacity }}>
          Scroll
        </motion.span>
      </div>
    </section>
  );
};
```

- [ ] **Step 2: Create `client/src/components/sections/heroSection.css`**

```css
.hero-scene {
  position: relative;
  height: 200vh;
}

.hero-scene__sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

.hero-scene__layer {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  width: min(100%, var(--max-width));
  margin: 0 auto;
  padding: 0 clamp(1.6rem, 7vw, 4.5rem);
}

.hero-scene__layer--bridge {
  align-items: center;
  text-align: center;
}

.hero-scene__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.85rem;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--accent);
  border-radius: 999px;
  background: rgba(var(--accent-rgb), 0.12);
  width: fit-content;
  margin-bottom: 1.4rem;
}

.hero-scene__title {
  font-size: clamp(2.9rem, 8vw, 6.4rem);
  line-height: 1.02;
  letter-spacing: -0.035em;
  margin: 0 0 1.4rem;
}

.hero-scene__title em {
  display: block;
  font-style: italic;
  color: var(--accent-2);
  font-size: 0.72em;
  margin-top: 0.18em;
}

.hero-scene__lead {
  max-width: 580px;
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  margin: 0;
}

.hero-scene__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2rem;
}

.hero-scene__bridge-title {
  font-size: clamp(1.9rem, 4.6vw, 3.4rem);
  max-width: 24ch;
  margin: 0;
}

.hero-scene__bridge-title em {
  font-style: italic;
  color: var(--accent);
}

.hero-scene__hint {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.78rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.hero-scene--static {
  height: auto;
  display: grid;
  gap: 3rem;
  padding: clamp(3rem, 8vw, 5rem) 0;
}

.hero-scene--static .hero-scene__layer {
  position: static;
}

@media (max-width: 768px) {
  .hero-scene {
    height: 150vh;
  }
}
```

- [ ] **Step 3: Verify lint and build**

Run: `cd client && npm run lint && npm run build`
Expected: both pass.

- [ ] **Step 4: Commit**

```bash
git add client/src/components/sections
git commit -m "feat: add cinematic pinned hero scene"
```

---

### Task 5: Impact metrics section (pinned counters)

**Files:**
- Create: `client/src/components/sections/ImpactSection.jsx`
- Create: `client/src/components/sections/impactSection.css`

- [ ] **Step 1: Create `client/src/components/sections/ImpactSection.jsx`**

```jsx
import { useRef } from "react";
import { motion, useScroll, useReducedMotion } from "framer-motion";
import { CountUp } from "@components/common/CountUp.jsx";
import { Reveal } from "@components/common/Reveal.jsx";
import { impactMetrics } from "@data/profile.js";
import "./impactSection.css";

export const ImpactSection = () => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.4"] });

  return (
    <section id="impact" className="home-section impact" ref={ref}>
      <div className="impact__sticky">
        <Reveal className="impact__panel glass-panel">
          <span className="section-heading__label">Impact, measured</span>
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
          <motion.span
            className="impact__progress"
            aria-hidden="true"
            style={reduceMotion ? undefined : { scaleX: scrollYProgress }}
          />
        </Reveal>
      </div>
    </section>
  );
};
```

- [ ] **Step 2: Create `client/src/components/sections/impactSection.css`** (pinned on desktop, plain flow on mobile per spec §5)

```css
.impact {
  position: relative;
  height: 150vh;
}

.impact__sticky {
  position: sticky;
  top: clamp(4.5rem, 14vh, 8rem);
}

.impact__panel {
  overflow: hidden;
}

.impact__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(1.2rem, 3vw, 2rem);
  margin: 1.6rem 0 0;
}

.impact__metric dt {
  font-family: var(--font-display);
  font-size: clamp(1.7rem, 3.4vw, 2.6rem);
  color: var(--accent);
  line-height: 1.1;
}

.impact__metric dd {
  margin: 0.45rem 0 0;
  color: var(--text-dim);
  font-size: 0.92rem;
}

.impact__progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  display: block;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  transform-origin: left;
}

@media (max-width: 900px) {
  .impact__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .impact {
    height: auto;
  }

  .impact__sticky {
    position: static;
  }
}
```

- [ ] **Step 3: Verify lint and build**

Run: `cd client && npm run lint && npm run build`
Expected: both pass.

- [ ] **Step 4: Commit**

```bash
git add client/src/components/sections/ImpactSection.jsx client/src/components/sections/impactSection.css
git commit -m "feat: add pinned impact metrics section with count-up numbers"
```

---

### Task 6: About section

**Files:**
- Create: `client/src/components/sections/AboutSection.jsx`
- Create: `client/src/components/sections/aboutSection.css`

- [ ] **Step 1: Create `client/src/components/sections/AboutSection.jsx`**

```jsx
import { SectionHeading } from "@components/common/SectionHeading.jsx";
import { Reveal } from "@components/common/Reveal.jsx";
import "./aboutSection.css";

export const AboutSection = () => (
  <section id="about" className="home-section about">
    <SectionHeading
      number="01"
      label="About"
      title="Building reliable systems that deliver results."
    />
    <div className="about__body glass-panel">
      <Reveal className="about__content">
        <p>
          At Amazon Alexa AI, I lead automation and platform work across the NLU stack — from
          LangForge Automation (which took CET failure rates from 60% to zero for onboarded teams)
          to multi-locale Pattern Match expansion and the Clarity inference platform. I care about
          systems that are measurable: latency budgets, locale coverage, and compute bills.
        </p>
        <p>
          Before Amazon, I built high-performance data processing systems at nFolks Data Solutions
          and AI-powered health applications at Phyt Health. Across all of it, the throughline is
          understanding how systems behave under production load and engineering them to stay
          reliable as they grow.
        </p>
      </Reveal>
      <Reveal className="about__aside" delay={0.15}>
        <h3>Snapshot</h3>
        <ul>
          <li>
            <strong>Currently</strong> SDE at Amazon, Alexa AI
          </li>
          <li>
            <strong>Education</strong> B.Tech, MNNIT Allahabad (2019–2023)
          </li>
          <li>
            <strong>Based in</strong> Bangalore, India
          </li>
          <li>
            <strong>Focus</strong> Distributed systems · AI infrastructure · Backend services
          </li>
        </ul>
      </Reveal>
    </div>
  </section>
);
```

- [ ] **Step 2: Create `client/src/components/sections/aboutSection.css`**

```css
.about__body {
  display: grid;
  gap: clamp(1.4rem, 4vw, 2.4rem);
  grid-template-columns: minmax(0, 1.65fr) minmax(280px, 1fr);
  align-items: start;
}

.about__content {
  display: grid;
  gap: 1rem;
  max-width: 78ch;
}

.about__content p {
  margin: 0;
  font-size: clamp(1rem, 1.25vw, 1.08rem);
}

.about__aside {
  background: var(--surface-alt);
  border-radius: var(--corner-lg);
  border: 1px solid rgba(var(--accent-rgb), 0.2);
  padding: clamp(1.2rem, 3.8vw, 1.9rem);
}

.about__aside h3 {
  margin: 0 0 1rem;
}

.about__aside ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
  color: var(--text-dim);
}

.about__aside strong {
  color: var(--text);
  display: block;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  margin-bottom: 0.15rem;
}

@media (max-width: 880px) {
  .about__body {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Verify lint and build**

Run: `cd client && npm run lint && npm run build`
Expected: both pass.

- [ ] **Step 4: Commit**

```bash
git add client/src/components/sections/AboutSection.jsx client/src/components/sections/aboutSection.css
git commit -m "feat: add about section with snapshot card"
```

---

### Task 7: Experience timeline rework + section

**Files:**
- Modify: `client/src/components/experience/ExperienceTimeline.jsx`
- Modify: `client/src/components/experience/experienceTimeline.css`
- Create: `client/src/components/sections/ExperienceSection.jsx`

- [ ] **Step 1: Rewrite `client/src/components/experience/ExperienceTimeline.jsx`** — adds a scroll-drawn rail and alternating slide-ins; props unchanged (old `ExperiencePage` keeps working until Task 10 deletes it)

```jsx
import { useRef } from "react";
import { motion, useScroll, useReducedMotion } from "framer-motion";
import "./experienceTimeline.css";

export const ExperienceTimeline = ({ items }) => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.55"]
  });

  return (
    <div className="timeline" ref={ref}>
      <motion.span
        className="timeline__rail"
        aria-hidden="true"
        style={reduceMotion ? undefined : { scaleY: scrollYProgress }}
      />
      {items.map((item, index) => (
        <motion.article
          key={`${item.company}-${item.role}`}
          className="timeline__item glass-panel"
          initial={{ opacity: 0, x: reduceMotion ? 0 : index % 2 === 0 ? -36 : 36 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="timeline__meta">
            <h3>{item.role}</h3>
            <span>{item.company}</span>
          </div>
          <p className="timeline__period">
            {item.period} • {item.location}
          </p>
          <ul>
            {item.outcomes.map((outcome) => (
              <li key={outcome}>{outcome}</li>
            ))}
          </ul>
          <div className="timeline__stack">
            {item.stack.map((tech) => (
              <span className="pill" key={tech}>
                {tech}
              </span>
            ))}
          </div>
        </motion.article>
      ))}
    </div>
  );
};
```

- [ ] **Step 2: Rewrite `client/src/components/experience/experienceTimeline.css`** (adds rail + dots; existing rules kept)

```css
.timeline {
  position: relative;
  display: grid;
  gap: clamp(1.8rem, 5vw, 2.6rem);
  padding-left: clamp(1.8rem, 4vw, 2.6rem);
}

.timeline__rail {
  position: absolute;
  left: 0;
  top: 0.5rem;
  bottom: 0.5rem;
  width: 2px;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--accent), var(--accent-2));
  transform-origin: top;
}

.timeline__item {
  position: relative;
  display: grid;
  gap: 1rem;
}

.timeline__item::before {
  content: "";
  position: absolute;
  top: 2.2rem;
  left: calc(-1 * clamp(1.8rem, 4vw, 2.6rem) - 4px);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent-2);
  box-shadow: 0 0 0 4px rgba(var(--accent-2-rgb), 0.18);
}

.timeline__meta {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.timeline__meta h3 {
  margin: 0;
  font-size: clamp(1.4rem, 3vw, 1.9rem);
  color: var(--text);
}

.timeline__meta span {
  font-weight: 600;
  color: var(--accent);
}

.timeline__period {
  font-size: 0.95rem;
  color: var(--text-dim);
  margin: 0;
}

.timeline__item ul {
  padding-left: 1.1rem;
}

.timeline__stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}
```

- [ ] **Step 3: Create `client/src/components/sections/ExperienceSection.jsx`**

```jsx
import { SectionHeading } from "@components/common/SectionHeading.jsx";
import { ExperienceTimeline } from "@components/experience/ExperienceTimeline.jsx";
import { experienceTimeline } from "@data/profile.js";

export const ExperienceSection = () => (
  <section id="experience" className="home-section">
    <SectionHeading
      number="02"
      label="Experience"
      title="A track record of measurable outcomes."
      lead="From Amazon's Alexa AI to early-stage startups — search infrastructure, data platforms, and AI applications."
    />
    <ExperienceTimeline items={experienceTimeline} />
  </section>
);
```

- [ ] **Step 4: Verify lint and build**

Run: `cd client && npm run lint && npm run build`
Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/experience client/src/components/sections/ExperienceSection.jsx
git commit -m "feat: scroll-drawn experience timeline with alternating reveals"
```

---

### Task 8: Featured projects, skills, awards, and contact sections

**Files:**
- Create: `client/src/components/sections/FeaturedProjectsSection.jsx`
- Create: `client/src/components/sections/SkillsSection.jsx`
- Create: `client/src/components/sections/AwardsSection.jsx`
- Create: `client/src/components/sections/ContactSection.jsx`
- Create: `client/src/components/sections/contactSection.css`

- [ ] **Step 1: Create `client/src/components/sections/FeaturedProjectsSection.jsx`**

```jsx
import { NavLink } from "react-router-dom";
import { SectionHeading } from "@components/common/SectionHeading.jsx";
import { Reveal } from "@components/common/Reveal.jsx";
import { ProjectGrid } from "@components/projects/ProjectGrid.jsx";
import { projectShowcase } from "@data/profile.js";

export const FeaturedProjectsSection = () => (
  <section id="projects" className="home-section featured-projects">
    <SectionHeading
      number="03"
      label="Projects"
      title="Selected work."
      lead="Four favorites across AI, automation, IoT, and full-stack builds."
    />
    <ProjectGrid projects={projectShowcase.filter((project) => project.featured)} />
    <Reveal className="featured-projects__more" delay={0.1}>
      <NavLink className="button" to="/projects">
        All projects →
      </NavLink>
    </Reveal>
  </section>
);
```

- [ ] **Step 2: Create `client/src/components/sections/SkillsSection.jsx`**

```jsx
import { SectionHeading } from "@components/common/SectionHeading.jsx";
import { SkillsColumns } from "@components/skills/SkillsColumns.jsx";
import { skillsMatrix } from "@data/profile.js";

export const SkillsSection = () => (
  <section id="skills" className="home-section">
    <SectionHeading
      number="04"
      label="Skills"
      title="Technical expertise across the stack."
      lead="Strongest in distributed systems, backend development, and cloud infrastructure — with working depth in AI tooling."
    />
    <SkillsColumns skills={skillsMatrix} />
  </section>
);
```

- [ ] **Step 3: Create `client/src/components/sections/AwardsSection.jsx`**

```jsx
import { SectionHeading } from "@components/common/SectionHeading.jsx";
import { AchievementGrid } from "@components/achievements/AchievementGrid.jsx";
import { achievements } from "@data/profile.js";

export const AwardsSection = () => (
  <section id="awards" className="home-section">
    <SectionHeading
      number="05"
      label="Awards"
      title="Recognition and certifications."
      lead="Amazon engineering awards, national competition placements, and professional certifications."
    />
    <AchievementGrid achievements={achievements} />
  </section>
);
```

- [ ] **Step 4: Create `client/src/components/sections/ContactSection.jsx`** (logic from old `ContactPage`, dead `href="#"` social links fixed)

```jsx
import { useState } from "react";
import { SectionHeading } from "@components/common/SectionHeading.jsx";
import { Reveal } from "@components/common/Reveal.jsx";
import "./contactSection.css";

const initialState = {
  name: "",
  email: "",
  message: ""
};

const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/pravesh25/" },
  { label: "GitHub", href: "https://github.com/pravesh-pandey" },
  { label: "LeetCode", href: "https://leetcode.com/u/pravesh_pandey/" }
];

export const ContactSection = () => {
  const [formValues, setFormValues] = useState(initialState);
  const [status, setStatus] = useState("idle");
  const [feedback, setFeedback] = useState("");
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/$/, "");

  const updateField = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setFeedback("");

    try {
      const response = await fetch(`${apiBaseUrl}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues)
      });

      if (!response.ok) {
        throw new Error("Unexpected response");
      }

      setStatus("success");
      setFeedback("Thanks for reaching out! I'll get back to you soon.");
      setFormValues(initialState);
    } catch (error) {
      console.error("Contact submit error", error);
      setStatus("error");
      setFeedback("Couldn't send right now. Please try again or email me directly.");
    }
  };

  return (
    <section id="contact" className="home-section contact">
      <SectionHeading
        number="06"
        label="Contact"
        title="Get in touch."
        lead="Have a project in mind, a role to discuss, or just want to say hello? I'm always open to new opportunities and ideas."
      />
      <Reveal className="contact__container glass-panel">
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="John Doe"
              required
              minLength={2}
              value={formValues.name}
              onChange={(event) => updateField("name", event.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="john@example.com"
              required
              value={formValues.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              placeholder="Tell me about your project..."
              required
              minLength={10}
              value={formValues.message}
              onChange={(event) => updateField("message", event.target.value)}
            />
          </div>
          <button type="submit" className="submit-btn" disabled={status === "loading"}>
            {status === "loading" ? "Sending..." : "Send Message"}
          </button>
        </form>

        {feedback ? (
          <p className={`contact-status contact-status--${status}`} role="status" aria-live="polite">
            {feedback} Prefer email?{" "}
            <a href="mailto:pravesh.pandey.mnnit@gmail.com" className="contact-link">
              pravesh.pandey.mnnit@gmail.com
            </a>
          </p>
        ) : null}

        <div className="contact-info">
          <a href="mailto:pravesh.pandey.mnnit@gmail.com" className="contact-link">
            pravesh.pandey.mnnit@gmail.com
          </a>
          <div className="social-links">
            {socialLinks.map((social) => (
              <a key={social.href} href={social.href} target="_blank" rel="noopener noreferrer">
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
};
```

- [ ] **Step 5: Create `client/src/components/sections/contactSection.css`** (from old `contactPage.css`: drops the `.contact-page` viewport-centering block and `backdrop-filter`, renames `.contact-container` → `.contact__container`)

```css
.contact__container {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  color: var(--text-dim);
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 0.85rem 1rem;
  color: var(--text);
  font-family: var(--font-body);
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.2);
}

.submit-btn {
  align-self: flex-start;
  background: linear-gradient(120deg, var(--accent), var(--accent-2));
  border: none;
  color: #fff8f0;
  padding: 0.8rem 2rem;
  border-radius: 999px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(var(--accent-2-rgb), 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.contact-status {
  margin: 0;
  color: var(--text-dim);
}

.contact-status--success {
  color: var(--accent);
}

.contact-status--error {
  color: #b42318;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-top: 1px solid var(--border);
  padding-top: 2rem;
}

.contact-link {
  color: var(--text);
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.contact-link:hover {
  color: var(--accent);
}

.social-links {
  display: flex;
  gap: 1.5rem;
}

.social-links a {
  color: var(--text-dim);
  font-size: 0.95rem;
  transition: color 0.3s ease;
}

.social-links a:hover {
  color: var(--accent);
}
```

- [ ] **Step 6: Verify lint and build**

Run: `cd client && npm run lint && npm run build`
Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add client/src/components/sections
git commit -m "feat: add featured projects, skills, awards, and contact sections"
```

---

### Task 9: Home page composition + hash scrolling

**Files:**
- Create: `client/src/hooks/useHashScroll.js`
- Rewrite: `client/src/pages/HomePage.jsx`
- Rewrite: `client/src/pages/homePage.css`
- Delete: `client/src/components/hero/Hero.jsx`, `client/src/components/hero/Hero.css`

- [ ] **Step 1: Create `client/src/hooks/useHashScroll.js`**

```js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useHashScroll = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return undefined;
    const frame = requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash]);
};
```

- [ ] **Step 2: Rewrite `client/src/pages/HomePage.jsx`**

```jsx
import { useHashScroll } from "@hooks/useHashScroll.js";
import { HeroSection } from "@components/sections/HeroSection.jsx";
import { ImpactSection } from "@components/sections/ImpactSection.jsx";
import { AboutSection } from "@components/sections/AboutSection.jsx";
import { ExperienceSection } from "@components/sections/ExperienceSection.jsx";
import { FeaturedProjectsSection } from "@components/sections/FeaturedProjectsSection.jsx";
import { SkillsSection } from "@components/sections/SkillsSection.jsx";
import { AwardsSection } from "@components/sections/AwardsSection.jsx";
import { ContactSection } from "@components/sections/ContactSection.jsx";
import "./homePage.css";

export const HomePage = () => {
  useHashScroll();

  return (
    <div className="home">
      <HeroSection />
      <div className="page home__sections">
        <ImpactSection />
        <AboutSection />
        <ExperienceSection />
        <FeaturedProjectsSection />
        <SkillsSection />
        <AwardsSection />
        <ContactSection />
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Rewrite `client/src/pages/homePage.css`**

```css
.home {
  width: 100%;
}

.home__sections {
  display: flex;
  flex-direction: column;
  gap: clamp(4rem, 9vw, 7rem);
}

.home-section {
  scroll-margin-top: clamp(4.5rem, 10vw, 6.5rem);
}

.featured-projects__more {
  display: flex;
  justify-content: center;
  margin-top: clamp(1.6rem, 4vw, 2.4rem);
}
```

- [ ] **Step 4: Delete the old hero** (nothing imports it after Step 2; `components/hero/` is now empty and disappears)

```bash
rm client/src/components/hero/Hero.jsx client/src/components/hero/Hero.css
```

- [ ] **Step 5: Verify lint, build, and visually smoke-test**

Run: `cd client && npm run lint && npm run build`
Expected: both pass.
Then: `cd client && npm run dev` and load `http://localhost:5173` — hero pins and scrubs into the bridge statement, all 7 sections render in order, counters animate at `#impact`.

- [ ] **Step 6: Commit**

```bash
git add -A client/src
git commit -m "feat: compose long-scroll home from sections with hash scrolling"
```

---

### Task 10: Routes, navigation, support pages, deletions

**Files:**
- Create: `client/src/pages/WorkWithMePage.jsx`
- Create: `client/src/pages/workWithMePage.css`
- Rewrite: `client/src/pages/ProjectsPage.jsx`
- Rewrite: `client/src/router.jsx`
- Rewrite: `client/src/data/navigation.js`
- Modify: `client/src/components/navigation/SiteHeader.jsx` (lines 30–57, `handleNavClick`)
- Delete: 7 old pages + 3 page CSS files + `MetricGrid.jsx` + `.metric-grid` CSS

- [ ] **Step 1: Create `client/src/pages/WorkWithMePage.jsx`** (merges old `/process` + `/brief`)

```jsx
import { PageIntro } from "@components/common/PageIntro.jsx";
import { ProcessSteps } from "@components/process/ProcessSteps.jsx";
import { ProjectBriefForm } from "@components/forms/ProjectBriefForm.jsx";
import { processSteps } from "@data/profile.js";
import "./workWithMePage.css";

export const WorkWithMePage = () => (
  <div className="page work-with-me">
    <PageIntro
      eyebrow="Work with me"
      title="Ready to start your next build?"
      lead="Tell me about your goals and constraints. I'll respond within two business days with clarifying questions, timeline insights, and a recommended engagement model."
    />

    <ProcessSteps steps={processSteps} />

    <div className="section-divider" />

    <section className="brief__content">
      <div className="brief__info glass-panel">
        <h2>What happens next</h2>
        <ul>
          <li>Within 48 hours you&apos;ll receive a response outlining clarifying questions and timeline beats.</li>
          <li>We&apos;ll schedule a strategy session to align on scope, success metrics, and delivery cadence.</li>
          <li>Expect a transparent proposal covering architecture approach, milestones, and investment.</li>
        </ul>
        <div className="brief__contact">
          Prefer direct contact?{" "}
          <a href="mailto:pravesh.pandey.mnnit@gmail.com">pravesh.pandey.mnnit@gmail.com</a>
        </div>
      </div>
      <ProjectBriefForm />
    </section>
  </div>
);
```

- [ ] **Step 2: Create `client/src/pages/workWithMePage.css`** (content of old `briefPage.css`, unchanged class names so `ProjectBriefForm` styling keeps working)

```css
.brief__content {
  display: grid;
  gap: clamp(1.6rem, 5vw, 2.6rem);
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
}

.brief__info {
  display: grid;
  gap: 1rem;
}

.brief__info h2 {
  margin: 0;
  font-size: clamp(1.4rem, 3vw, 1.9rem);
}

.brief__info ul {
  padding-left: 1.1rem;
}

.brief__contact {
  font-weight: 500;
  color: var(--text);
}

@media (max-width: 980px) {
  .brief__content {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Rewrite `client/src/pages/ProjectsPage.jsx`** (all 8 projects, consistent `PageIntro` header)

```jsx
import { PageIntro } from "@components/common/PageIntro.jsx";
import { ProjectGrid } from "@components/projects/ProjectGrid.jsx";
import { projectShowcase } from "@data/profile.js";

export const ProjectsPage = () => (
  <div className="page projects-page">
    <PageIntro
      eyebrow="Projects"
      title="All projects."
      lead="Everything from AI and computer vision to IoT, automation, and full-stack builds."
    />
    <ProjectGrid projects={projectShowcase} />
  </div>
);
```

- [ ] **Step 4: Rewrite `client/src/router.jsx`** (3 routes + 7 redirects + 404)

```jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "@pages/HomePage.jsx";
import { ProjectsPage } from "@pages/ProjectsPage.jsx";
import { WorkWithMePage } from "@pages/WorkWithMePage.jsx";
import { NotFoundPage } from "@pages/NotFoundPage.jsx";

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/projects" element={<ProjectsPage />} />
    <Route path="/work-with-me" element={<WorkWithMePage />} />
    <Route path="/about" element={<Navigate to="/#about" replace />} />
    <Route path="/experience" element={<Navigate to="/#experience" replace />} />
    <Route path="/skills" element={<Navigate to="/#skills" replace />} />
    <Route path="/achievements" element={<Navigate to="/#awards" replace />} />
    <Route path="/contact" element={<Navigate to="/#contact" replace />} />
    <Route path="/process" element={<Navigate to="/work-with-me" replace />} />
    <Route path="/brief" element={<Navigate to="/work-with-me" replace />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);
```

- [ ] **Step 5: Rewrite `client/src/data/navigation.js`**

```js
export const NAV_ITEMS = [
  { path: "#", label: "Home" },
  { path: "#about", label: "About" },
  { path: "#experience", label: "Experience" },
  { path: "#projects", label: "Projects" },
  { path: "#skills", label: "Skills" },
  { path: "#contact", label: "Contact" },
  { path: "/work-with-me", label: "Work with me" }
];
```

- [ ] **Step 6: Replace `handleNavClick` in `client/src/components/navigation/SiteHeader.jsx`** — replace the existing function (current lines 30–57, including its stale comments) with:

```jsx
  const handleNavClick = (e, path) => {
    e.preventDefault();
    closeMenu();

    if (!path.startsWith("#")) {
      navigate(path);
      return;
    }

    if (path === "#") {
      if (location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate("/");
      }
      return;
    }

    if (location.pathname === "/") {
      document.getElementById(path.slice(1))?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/${path}`);
    }
  };
```

(`navigate("/#about")` updates `location.hash`; `useHashScroll` on the home page performs the scroll.)

- [ ] **Step 7: Delete the old pages, their CSS, and the unused MetricGrid**

```bash
rm client/src/pages/AboutPage.jsx client/src/pages/aboutPage.css \
   client/src/pages/ExperiencePage.jsx client/src/pages/SkillsPage.jsx \
   client/src/pages/AchievementsPage.jsx client/src/pages/ProcessPage.jsx \
   client/src/pages/BriefPage.jsx client/src/pages/briefPage.css \
   client/src/pages/ContactPage.jsx client/src/pages/contactPage.css \
   client/src/components/common/MetricGrid.jsx
```

- [ ] **Step 8: Remove the `.metric-grid` CSS block from `client/src/styles/global.css`** (the `.metric-grid`, `.metric-grid dt`, and `.metric-grid dd` rules — currently lines 270–287)

- [ ] **Step 9: Verify no dangling imports, lint, build**

Run: `grep -rn "AboutPage\|ExperiencePage\|SkillsPage\|AchievementsPage\|ProcessPage\|BriefPage\|ContactPage\|MetricGrid\|components/hero" client/src`
Expected: no output.
Run: `cd client && npm run lint && npm run build`
Expected: both pass.

- [ ] **Step 10: Commit**

```bash
git add -A client/src
git commit -m "feat: consolidate to 3 routes with redirects; add work-with-me page"
```

---

### Task 11: Full verification (lint, build, base path, Playwright)

**Files:**
- Create: `client/scripts/verify-redesign.mjs`

- [ ] **Step 1: Lint and build both workspaces**

Run: `cd client && npm run lint && npm run build && cd ../server && npm run lint`
Expected: all pass.

- [ ] **Step 2: Create `client/scripts/verify-redesign.mjs`**

```js
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
```

- [ ] **Step 3: Run against the standard build**

```bash
cd client && npm run build
npx vite preview --port 4173 &   # leave running in background
node scripts/verify-redesign.mjs
```
Expected: every line `PASS`, exit code 0. Kill the preview server after.

- [ ] **Step 4: Run against the GitHub Pages base path** (spec §6.4)

```bash
cd client && BASE_PATH=/Portfolio/ npm run build
BASE_PATH=/Portfolio/ npx vite preview --port 4174 &   # leave running in background
VERIFY_BASE_URL=http://localhost:4174/Portfolio node scripts/verify-redesign.mjs
```
Expected: every line `PASS`, exit code 0. Kill the preview server after.

- [ ] **Step 5: Review screenshots** — open `/tmp/portfolio-desktop.png` and `/tmp/portfolio-mobile.png`; confirm warm-editorial look, numbered sections, no layout breakage at 375px.

- [ ] **Step 6: Rebuild without BASE_PATH** (so no stale `/Portfolio/` build sits in `dist/`): `cd client && npm run build`

- [ ] **Step 7: Commit**

```bash
git add client/scripts/verify-redesign.mjs
git commit -m "test: add Playwright verification script for redesign"
```

---

## Spec coverage map

| Spec section | Tasks |
|---|---|
| §1 Visual language (palette kept, hero typography, numbered headings, panel simplification, background swap, deps removed, cursor kept) | 1, 2 (fonts), 3, 4 |
| §2 Structure (3 routes, home sections + anchors, redirects, nav) | 9, 10 |
| §3 Content (experience, metrics, awards, skills, featured, links, email) | 2, 8 (links) |
| §4 Animations (pinned hero, pinned metrics, timeline draw, reveals, parallax, hover lift*, reduced motion) | 1, 3, 4, 5, 7, 8 |
| §5 Edge cases (forms unchanged, hash safety, small screens) | 5 (mobile unpin), 8 (forms), 9 (hash), 4 (150vh mobile hero) |
| §6 Verification (lint/build, Playwright desktop+mobile, reduced motion, base path) | 11 |

*Project-card hover lift already exists in `projectGrid.css` (`translateY(-5px)` + shadow) — no change needed.
