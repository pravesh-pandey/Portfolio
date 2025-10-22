import { motion } from "framer-motion";
import "./achievementGrid.css";

export const AchievementGrid = ({ achievements }) => (
  <div className="achievement-grid">
    {achievements.map((achievement, index) => (
      <motion.article
        key={achievement.title}
        className="achievement-card glass-panel"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      >
        <span className="achievement-card__year">{achievement.year}</span>
        <h3>{achievement.title}</h3>
        <p>{achievement.summary}</p>
      </motion.article>
    ))}
  </div>
);
