import { motion } from "framer-motion";
import { PageIntro } from "@components/common/PageIntro.jsx";
import "./aboutPage.css";

export const AboutPage = () => (
  <div className="page about">
    <PageIntro
      eyebrow="About"
      title="Building reliable systems that deliver results."
      lead="I specialize in translating complex requirements into scalable, production-ready solutions. My focus is on performance, maintainability, and delivering measurable business impact."
    />

    <section className="about__body glass-panel">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <p>
          At Amazon, I work on Alexa&apos;s hotfix infrastructure, focusing on international expansion and performance optimization.
          My responsibilities include architecting microservices, and modernizing legacy
          systems. I collaborate with cross-functional teams including product managers, data scientists, and infrastructure
          engineers to deliver reliable, high-performance solutions.
        </p>
        <p>
          Previously, I built high-performance data processing systems at nFolks Data Solutions and developed AI-powered health
          applications at Phyt Health. Throughout my career, I&apos;ve focused on understanding system behavior under production load,
          optimizing performance bottlenecks, and building software that&apos;s maintainable and scalable.
        </p>
      </motion.div>

      <motion.aside
        className="about__traits"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
      >
        <h3>Key Strengths</h3>
        <ul>
          <li>End-to-end project ownership from requirements to production deployment.</li>
          <li>Data-driven decision making with comprehensive system monitoring and metrics.</li>
          <li>Effective collaboration and communication across technical and non-technical teams.</li>
          <li>Writing clean, maintainable code with consideration for future scalability.</li>
        </ul>
      </motion.aside>
    </section>
  </div>
);
