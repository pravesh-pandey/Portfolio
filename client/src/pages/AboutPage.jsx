import { motion } from "framer-motion";
import { PageIntro } from "@components/common/PageIntro.jsx";
import "./aboutPage.css";

export const AboutPage = () => (
  <div className="page about">
    <PageIntro
      eyebrow="About"
      title="Architecting systems that ship with confidence."
      lead="My fuel is translating ambiguous product goals into measurable delivery—balancing latency, maintainability, and user delight to build software that lasts."
    />

    <section className="about__body glass-panel">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <p>
          At Amazon, I lead cross-functional missions for Alexa search. The work ranges from unlocking international
          pattern matching to modernizing Java microservices—all while keeping service budgets honest and customer
          experiences crisp. I thrive partnering across product, data science, and infra to stitch cohesive delivery.
        </p>
        <p>
          Previously at nFolks and Phyt Health, I sped up analytics platforms and crafted AI-first experiences piloted
          by thousands. The throughline: curiosity for how systems behave under real load and empathy for the humans who
          use, operate, and extend them.
        </p>
      </motion.div>

      <motion.aside
        className="about__traits"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
      >
        <h3>What partners rely on</h3>
        <ul>
          <li>Discovery-to-deployment ownership with transparent communication.</li>
          <li>Systems thinking anchored in data, guardrails, and observability.</li>
          <li>Ability to mentor, unblock, and align multi-disciplinary pods.</li>
          <li>Craft that respects both current constraints and future maintainers.</li>
        </ul>
      </motion.aside>
    </section>
  </div>
);
