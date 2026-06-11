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
          initial={{
            opacity: reduceMotion ? 1 : 0,
            x: reduceMotion ? 0 : index % 2 === 0 ? -36 : 36
          }}
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
          <ul aria-label={`Highlights at ${item.company}`}>
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
