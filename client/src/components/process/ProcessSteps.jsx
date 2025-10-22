import { motion } from "framer-motion";
import "./processSteps.css";

export const ProcessSteps = ({ steps }) => (
  <div className="process-grid">
    {steps.map((step, index) => (
      <motion.article
        key={step.step}
        className="process-card glass-panel"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      >
        <span className="process-card__step">{step.step}</span>
        <h3>{step.title}</h3>
        <p>{step.description}</p>
      </motion.article>
    ))}
  </div>
);
