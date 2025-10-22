import { Routes, Route } from "react-router-dom";
import { HomePage } from "@pages/HomePage.jsx";
import { AboutPage } from "@pages/AboutPage.jsx";
import { ExperiencePage } from "@pages/ExperiencePage.jsx";
import { ProjectsPage } from "@pages/ProjectsPage.jsx";
import { SkillsPage } from "@pages/SkillsPage.jsx";
import { AchievementsPage } from "@pages/AchievementsPage.jsx";
import { ProcessPage } from "@pages/ProcessPage.jsx";
import { BriefPage } from "@pages/BriefPage.jsx";
import { NotFoundPage } from "@pages/NotFoundPage.jsx";

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/experience" element={<ExperiencePage />} />
    <Route path="/projects" element={<ProjectsPage />} />
    <Route path="/skills" element={<SkillsPage />} />
    <Route path="/achievements" element={<AchievementsPage />} />
    <Route path="/process" element={<ProcessPage />} />
    <Route path="/brief" element={<BriefPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);
