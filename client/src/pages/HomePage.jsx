import { motion } from "framer-motion";
import { PageIntro } from "@components/common/PageIntro.jsx";
import { MetricGrid } from "@components/common/MetricGrid.jsx";
import { heroHighlights } from "@data/profile.js";
import { NavLink } from "react-router-dom";
import "./homePage.css";

export const HomePage = () => (
  <div className="page home">
    <PageIntro
      eyebrow="Software Development Engineer • Amazon"
      title="Building scalable systems that solve real problems."
      lead="I'm Pravesh Pandey—a Software Development Engineer focused on distributed systems, performance optimization, and delivering measurable impact. I create software that performs at scale."
      actions={
        <>
          <NavLink className="button button--primary" to="/projects">
            View Projects
          </NavLink>
          <NavLink className="button" to="/experience">
            See Experience
          </NavLink>
        </>
      }
    />

    <section className="home-hero glass-panel">
      <motion.div
        className="home-hero__copy"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
      >
        <h2>Engineering excellence through proven impact.</h2>
        <p>
          I build search systems, automation pipelines, and AI-powered applications that deliver measurable results.
          My approach combines deep technical expertise with a focus on performance, reliability, and user experience.
        </p>
        <ul className="home-hero__bullets">
          <li>• Performance optimization and distributed systems architecture</li>
          <li>• End-to-end ownership from design to production deployment</li>
          <li>• Data-driven decision making with comprehensive monitoring</li>
        </ul>
      </motion.div>
      <MetricGrid metrics={heroHighlights} />
    </section>
  </div>
);
