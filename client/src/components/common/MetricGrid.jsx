import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const MetricGrid = ({ metrics }) => (
  <motion.dl className="metric-grid" variants={container} initial="hidden" animate="show">
    {metrics.map((metric) => (
      <motion.div key={metric.metric} variants={item}>
        <dt>{metric.metric}</dt>
        <dd>{metric.description}</dd>
      </motion.div>
    ))}
  </motion.dl>
);
