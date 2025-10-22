import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

export const NotFoundPage = () => (
  <div className="page">
    <motion.div
      className="glass-panel"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ display: "grid", gap: "1rem", textAlign: "center" }}
    >
      <h1 style={{ margin: 0 }}>404</h1>
      <p>Looks like we drifted off-course. Let’s guide you back.</p>
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
        <NavLink className="button button--primary" to="/">
          Back to Home
        </NavLink>
        <NavLink className="button" to="/projects">
          Explore Projects
        </NavLink>
      </div>
    </motion.div>
  </div>
);
