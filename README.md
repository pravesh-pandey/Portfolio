<div align="center">

<h1>Pravesh Pandey</h1>

<h3>Software Development Engineer · Amazon Alexa AI</h3>

Distributed systems, AI infrastructure, and backend services that hold up in production.

<p>
  <a href="https://pravesh-pandey.github.io/Portfolio/"><strong>Live portfolio</strong></a>
  ·
  <a href="https://pravesh-pandey.github.io/Portfolio/resume.pdf"><strong>Resume</strong></a>
  ·
  <a href="https://www.linkedin.com/in/pravesh25/"><strong>LinkedIn</strong></a>
  ·
  <a href="mailto:pravesh25pandey@gmail.com"><strong>Contact</strong></a>
</p>

<p>
  <img src="https://img.shields.io/github/actions/workflow/status/pravesh-pandey/Portfolio/ci.yml?branch=main&label=CI&logo=github" alt="CI status" />
  <img src="https://img.shields.io/github/actions/workflow/status/pravesh-pandey/Portfolio/deploy-client.yml?branch=main&label=Pages%20deploy&logo=github" alt="Pages deployment status" />
  <img src="https://img.shields.io/github/last-commit/pravesh-pandey/Portfolio?logo=git" alt="Last commit" />
  <img src="https://komarev.com/ghpvc/?username=pravesh-pandey&label=Profile%20views&color=blueviolet" alt="Profile views" />
</p>

</div>

## The idea

This repository is the source for my personal portfolio: a warm, editorial-style React experience for sharing engineering work, measurable outcomes, and ways to collaborate.

I like the space where reliable software meets useful intelligence — from distributed backend services and data platforms to computer vision experiments and robotics.

## What I build

| Focus | What that looks like |
| --- | --- |
| **Systems & backend** | Microservices, APIs, event-driven design, observability, and performance work |
| **AI & data** | NLU infrastructure, RAG workflows, computer vision, data processing, and automation |
| **Product delivery** | Responsive interfaces, clear user journeys, CI/CD, and production-minded iteration |

## Impact snapshot

| Signal | Result |
| --- | ---: |
| Alexa CET failure rate | **60% → 0%** for onboarded expert teams |
| Engineering effort saved | **260 hours** across 60+ teams |
| Compute cost reduction | **15%** across 9 migrated services |
| Database retrieval improvement | **68% faster** through parallel processing |

## Featured work

- **LangForge Automation** — an end-to-end Alexa AI automation system that won the AIDo Frugal Frontrunner Award.
- **AI Sudoku Solver** — camera-based puzzle recognition and solving with TensorFlow, OpenCV, and constraint satisfaction.
- **TamperScripts** — browser automation utilities, including price tracking, shortlink bypassing, and Codeforces helpers.
- **Cell Phone Controlled Car** — a Wi-Fi-controlled robotics project using Arduino, NodeMCU, and smartphone motion data.

## Technology map

<div align="center">

<img src="https://skillicons.dev/icons?i=java,python,javascript,typescript,react,nodejs,aws,docker,git,github,tensorflow,mongodb,mysql,redis&perline=7" alt="Java, Python, JavaScript, TypeScript, React, Node.js, AWS, Docker, Git, GitHub, TensorFlow, MongoDB, MySQL, and Redis" />

</div>

## GitHub analytics

These cards are generated into this repository by [GitHub Actions](.github/workflows/update-readme-analytics.yml), so the README does not depend on the shared public stats endpoint at render time.

<div align="center">
  <img src="./profile/stats.svg" alt="GitHub statistics" width="49%" />
  <img src="./profile/top-langs.svg" alt="Most used programming languages" width="49%" />
</div>

<p align="center">
  <a href="https://github.com/pravesh-pandey?tab=repositories"><img src="https://img.shields.io/github/repos/pravesh-pandey?label=Public%20repositories&logo=github" alt="Public repositories" /></a>
  <a href="https://github.com/pravesh-pandey?tab=followers"><img src="https://img.shields.io/github/followers/pravesh-pandey?label=Followers&logo=github" alt="Followers" /></a>
  <a href="https://github.com/pravesh-pandey/Portfolio"><img src="https://img.shields.io/github/stars/pravesh-pandey/Portfolio?label=Portfolio%20stars&logo=github" alt="Portfolio stars" /></a>
</p>

## Run it locally

```bash
git clone https://github.com/pravesh-pandey/Portfolio.git
cd Portfolio

# Frontend
cd client
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`. The Express API lives in `server/` and runs separately when form submissions need to be tested locally.

## Project shape

```text
client/   React + Vite single-page portfolio
server/   Express API for contact and project-brief submissions
profile/  GitHub analytics SVGs refreshed by Actions
```

## Deployment

- **Frontend:** GitHub Pages — [pravesh-pandey.github.io/Portfolio](https://pravesh-pandey.github.io/Portfolio/)
- **Backend:** Vercel serverless API
- **Automation:** GitHub Actions for linting, builds, Pages deployment, and README analytics

See [Deployment.md](Deployment.md) for environment variables, CI details, and hosting setup.

<div align="center">

_Keep building. Keep learning. Keep shipping._

</div>
