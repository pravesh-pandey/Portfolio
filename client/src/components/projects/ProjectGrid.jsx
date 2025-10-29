import { motion } from "framer-motion";
import "./projectGrid.css";

export const ProjectGrid = ({ projects }) => (
  <div className="project-grid">
    {projects.map((project, index) => {
      const CardContent = (
        <>
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
          {project.link && (
            <div className="project-card__link">
              <span>View on GitHub →</span>
            </div>
          )}
        </>
      );

      const cardProps = {
        key: project.title,
        className: `project-card glass-panel ${project.link ? "project-card--clickable" : ""}`,
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.6, delay: index * 0.12, ease: "easeOut" },
      };

      return project.link ? (
        <motion.a
          {...cardProps}
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {CardContent}
        </motion.a>
      ) : (
        <motion.article {...cardProps}>
          {CardContent}
        </motion.article>
      );
    })}
  </div>
);
