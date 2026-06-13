import { useRef } from "react";
import { motion, useScroll, useReducedMotion } from "framer-motion";
import { CountUp } from "@components/common/CountUp.jsx";
import { Reveal } from "@components/common/Reveal.jsx";
import { impactMetrics } from "@data/profile.js";
import "./impactSection.css";

export const ImpactSection = () => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.4"] });

  return (
    <section id="impact" className="home-section impact" ref={ref}>
      <div className="impact__sticky">
        <Reveal className="impact__panel glass-panel">
          <h2 className="section-heading__label">Impact, measured</h2>
          <dl className="impact__grid">
            {impactMetrics.map((metric) => (
              <div className="impact__metric" key={metric.label}>
                <dt>
                  <CountUp to={metric.value} suffix={metric.suffix} />
                </dt>
                <dd>{metric.label}</dd>
              </div>
            ))}
          </dl>
          <motion.span
            className="impact__progress"
            aria-hidden="true"
            style={reduceMotion ? undefined : { scaleX: scrollYProgress }}
          />
        </Reveal>
      </div>
    </section>
  );
};
