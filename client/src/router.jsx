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
