import { motion } from "framer-motion";
import "./projectGrid.css";

export const ProjectGrid = ({ projects }) => (
  <div className="project-grid">
    {projects.map((project, index) => (
      <motion.article
        key={project.title}
        className="project-card glass-panel"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: index * 0.12, ease: "easeOut" }}
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
      </motion.article>
    ))}
  </div>
);
