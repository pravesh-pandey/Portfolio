import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { caseStudies } from "@data/caseStudies.js";
import "./projectGrid.css";

const caseStudySlugs = new Set(caseStudies.map((study) => study.slug));

export const ProjectGrid = ({ projects }) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="project-grid">
      {projects.map((project, index) => (
        <motion.article
          key={project.slug}
          id={project.slug}
          className="project-card"
          initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, delay: (index % 3) * 0.08, ease: "easeOut" }}
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
          <div className="project-card__links">
            {caseStudySlugs.has(project.slug) && (
              <Link className="project-card__link" to={`/case-studies/${project.slug}`}>
                read case study →
              </Link>
            )}
            {project.link && (
              <a className="project-card__link" href={project.link} target="_blank" rel="noopener noreferrer">
                view on GitHub →
              </a>
            )}
            <Link className="project-card__hire" to="/work-with-me">
              need this? → hire
            </Link>
          </div>
        </motion.article>
      ))}
    </div>
  );
};
