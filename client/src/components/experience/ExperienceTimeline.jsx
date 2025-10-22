import { motion } from "framer-motion";
import "./experienceTimeline.css";

export const ExperienceTimeline = ({ items }) => (
  <div className="timeline">
    {items.map((item, index) => (
      <motion.article
        key={`${item.company}-${item.role}`}
        className="timeline__item glass-panel"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
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
