import { motion } from "framer-motion";
import { ProjectGrid } from "@components/projects/ProjectGrid.jsx";
import { projectShowcase } from "@data/profile.js";

export const ProjectsPage = () => (
  <div className="page projects-page">
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ marginBottom: "4rem", marginTop: "2rem" }}
    >
      <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", marginBottom: "1rem" }}>Selected Works</h1>
      <p style={{ color: "var(--text-dim)", maxWidth: "600px", fontSize: "1.1rem" }}>
        A collection of projects demonstrating expertise in distributed systems and performance.
      </p>
    </motion.header>
    <ProjectGrid projects={projectShowcase} />
  </div>
);
