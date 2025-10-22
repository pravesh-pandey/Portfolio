import { motion } from "framer-motion";

export const PageIntro = ({ eyebrow, title, lead, actions }) => (
  <motion.header
    className="page__header"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    {eyebrow ? <span className="page__eyebrow">{eyebrow}</span> : null}
    {title ? <h1 className="page__title">{title}</h1> : null}
    {lead ? <p className="page__lead">{lead}</p> : null}
    {actions ? <div className="page__actions">{actions}</div> : null}
  </motion.header>
);
