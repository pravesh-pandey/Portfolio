import { motion } from "framer-motion";
import "./skillsColumns.css";

export const SkillsColumns = ({ skills }) => (
  <div className="skills-grid">
    {skills.map((block, index) => (
      <motion.section
        key={block.title}
        className="skills-card glass-panel"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      >
        <h3>{block.title}</h3>
        <ul>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </motion.section>
    ))}
  </div>
);
