import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import "./ambientBackground.css";

export const AmbientBackground = () => {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const tealY = useTransform(scrollY, [0, 2400], [0, -180]);
  const terracottaY = useTransform(scrollY, [0, 2400], [0, 140]);
  const inkY = useTransform(scrollY, [0, 2400], [0, -80]);

  return (
    <div className="ambient" aria-hidden="true">
      <motion.span
        className="ambient__field ambient__field--teal"
        style={reduceMotion ? undefined : { y: tealY }}
      />
      <motion.span
        className="ambient__field ambient__field--terracotta"
        style={reduceMotion ? undefined : { y: terracottaY }}
      />
      <motion.span
        className="ambient__field ambient__field--ink"
        style={reduceMotion ? undefined : { y: inkY }}
      />
    </div>
  );
};
