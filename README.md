# Pravesh Pandey — Creative Developer Platform

<h2> 👋Hi!</h2>     <p align="right"> <img src="https://komarev.com/ghpvc/?username=pravesh-pandey" alt="pravesh-pandey" /> </p>
<h1> I am Pravesh Pandey</h1>
<br>
<p align="left">
  <h3>
<img src="https://user-images.githubusercontent.com/58443282/114050007-8ac51980-98a9-11eb-8dea-a162f9c69cb6.png" width="20"> &nbsp; I am a web developer and a Robotics Enthusiast and I like to experiment with new technologies.
<br>
<img src="https://user-images.githubusercontent.com/58443282/114054922-e85b6500-98ad-11eb-9394-a59dd6f14a1a.png" width="20"> &nbsp; I have hand on experience in Data Structure and Algorithms.
    </h3>
</p>
<hr>
<h2>🛠&nbsp;Tech Stack</h2>

![C](https://img.shields.io/badge/-C-white?style=flat&logo=C&logoColor=A8B9CC)&nbsp;
![C++](https://img.shields.io/badge/-C++-white?style=flat&logo=C%2B%2B&logoColor=00599C)&nbsp;
![Python](https://img.shields.io/badge/-Python-white?style=flat&logo=python)&nbsp;
![JavaScript](https://img.shields.io/badge/-JavaScript-white?style=flat&logo=javascript&logoColor=F7DF1E)&nbsp;
![react](https://img.shields.io/badge/-React-white?style=flat&logo=React&logoColor=0769AD)&nbsp;
![Express](https://img.shields.io/badge/-Express-white?style=flat&logo=Express&logoColor=000000)&nbsp;
![jquery](https://img.shields.io/badge/-jQuery-white?style=flat&logo=jquery&logoColor=0769AD)&nbsp;\
![Django](https://img.shields.io/badge/-Django-white?style=flat&logo=django&logoColor=brightgreen)&nbsp;
![Sqlite](https://img.shields.io/badge/-SQLite-white?style=flat&logo=SQLite&logoColor=003B57)&nbsp;
![Bootstrap](https://img.shields.io/badge/-Bootstrap4-white?style=flat&logo=bootstrap&logoColor=7952B3)&nbsp;
![HTML](https://img.shields.io/badge/-HTML5-white?style=flat&logo=HTML5&logoColor=E34F26)&nbsp;
![CSS](https://img.shields.io/badge/-CSS-white?style=flat&logo=CSS3&logoColor=1572B6)&nbsp;
![Git](https://img.shields.io/badge/-Git-white?style=flat&logo=git)&nbsp;
![GitHub](https://img.shields.io/badge/-GitHub-white?style=flat&logo=github&logoColor=181717)&nbsp;\
![Markdown](https://img.shields.io/badge/-Markdown-white?style=flat&logo=markdown&logoColor=000000)
![Visual Studio Code](https://img.shields.io/badge/-Visual%20Studio%20Code-white?style=flat&logo=visual-studio-code&logoColor=007ACC)&nbsp;
![Juypter Notebook](https://img.shields.io/badge/-Jupyter%20Notebook-white?style=flat&logo=Jupyter)&nbsp;
![Arduino](https://img.shields.io/badge/-Arduino-white?style=flat&logo=arduino)&nbsp;\
![PhotoShop](https://img.shields.io/badge/-Adobe%20Photoshop-white?style=flat&logo=Adobe%20Photoshop&logoColor=31A8FF)&nbsp;
![ROS](https://img.shields.io/badge/-Robot%20Operating%20System-white?style=flat&logo=ros&logoColor=grey)&nbsp;
![Bash](https://img.shields.io/badge/-Bash-white?style=flat&logo=Windows-Terminal&logoColor=4D4D4D)&nbsp;
![Ubuntu](https://img.shields.io/badge/-Linux-white?style=flat&logo=ubuntu&logoColor=orange)&nbsp;
<hr>
<h2> ⚙️ GitHub Analytics</h2> 

<br>
<img src="https://github-readme-stats.vercel.app/api?username=pravesh-pandey&show_icons=true&theme=radical" />

<a href="https://github-readme-stats.vercel.app/api/top-langs/?username=pravesh-pandey&layout=compact&langs_count=8">
  <img align="center" src="https://github-readme-stats.vercel.app/api/top-langs/?username=pravesh-pandey&layout=compact&langs_count=10&theme=radical" />
</a>

<hr>
<h2> <img src="https://user-images.githubusercontent.com/58443282/114056134-fa89d300-98ae-11eb-885b-a514601bcaa2.png" width="40"> &nbsp;I’m looking to collaborate on Back-end web Development.</h2>
<hr>
<h2> <img src="https://user-images.githubusercontent.com/58443282/114053740-d9c07e00-98ac-11eb-9d3a-0e9264366126.png" width="40"> &nbsp; How to reach me:
</h2>
<p align="center">
<a href="https://www.linkedin.com/in/pravesh25/"><img src="https://img.shields.io/badge/-Pravesh%20Pandey%20-0077B5?style=flat&logo=Linkedin&logoColor=white"/></a>
<a href="mailto:pravesh25pandey@gmail.com"><img src="https://img.shields.io/badge/-pravesh25pandey@gmail.com-D14836?style=flat&logo=Gmail&logoColor=white"/></a>
<a href="https://www.instagram.com/pravesh__pandey_/"><img src="https://img.shields.io/badge/-pravesh__pandey_-e0f8f9?style=flat&logo=instagram&logoColor=darkpink"/></a>
</p>

Modern personal portfolio built with React (Vite) on the frontend and Express on the backend.

## Highlights
- **Frontend:** React 18, Vite, React Router, Framer Motion, @react-three/fiber/@drei.
- **Backend:** Express with Helmet, CORS, Zod validation, Vercel serverless entry point.
- **Automation:** GitHub Actions for lint/build CI and GitHub Pages deployment.
- **Hosting:** SPA at `https://pravesh-pandey.github.io/Portfolio/`; API at `https://portfolio-sooty-three-drsylc0s6l.vercel.app/api/`.

## Deployment & CI
- Continuous integration workflow: `.github/workflows/ci.yml`
- GitHub Pages deployment workflow: `.github/workflows/deploy-client.yml`
- Step-by-step deployment details and environment variables: `Deployment.md`

## Key Routes
- Frontend pages — `client/src/pages/`
- API endpoints — `server/src/routes/` (_notably_ `POST /api/brief`, `GET /api/health`)

## Repository Layout
- `client/` — Vite SPA source
- `server/` — Express API
- `Deployment.md` — full CI/CD + hosting guide

## Maintenance Notes
- Vercel functions use in-memory storage (see `server/src/lib/briefStore.js`); integrate durable storage for production.
- Update GitHub secret `VITE_API_BASE_URL` if the Vercel domain changes.
- After renaming the repo, rerun the Pages deploy so `BASE_PATH` refreshes.
