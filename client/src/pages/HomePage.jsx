import { motion } from "framer-motion";
import { PageIntro } from "@components/common/PageIntro.jsx";
import { MetricGrid } from "@components/common/MetricGrid.jsx";
import { heroHighlights, inspirationSources } from "@data/profile.js";
import { NavLink } from "react-router-dom";
import "./homePage.css";

export const HomePage = () => (
  <div className="page home">
    <PageIntro
      eyebrow="Software Development Engineer • Amazon"
      title="Engineering resilient platforms and frictionless experiences."
      lead="I’m Pravesh Pandey—an SDE who turns complex, distributed challenges into intuitive, measurable outcomes. From Alexa’s global search to AI-powered wellness, I architect systems that earn trust."
      actions={
        <>
          <NavLink className="button button--primary" to="/projects">
            Explore builds
          </NavLink>
          <NavLink className="button" to="/brief">
            Launch your build
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
        <h2>Building for scale, speed, and soul.</h2>
        <p>
          I craft search, automation, and AI products that feel effortless on the surface and battle-tested underneath.
          Performance budgets, distributed architectures, and empathetic hand-offs anchor every engagement.
        </p>
        <ul className="home-hero__bullets">
          <li>• Relentless focus on latency, reliability, and observability.</li>
          <li>• Strategy-to-ship ownership with transparent stakeholder loops.</li>
          <li>• Crafted through inspirations from the world’s most creative studios.</li>
        </ul>
      </motion.div>
      <MetricGrid metrics={heroHighlights} />
    </section>

    <section className="home-inspirations">
      <h2>Creative playbook powering this experience</h2>
      <p>
        Design language draws on ten standout studios and makers—digesting their WebGL storytelling, glassy depth, and
        editorial pacing into a developer-first narrative that signals diligence and imagination.
      </p>
      <div className="home-inspirations__grid">
        {inspirationSources.map((source) => (
          <motion.a
            key={source.name}
            href={source.url}
            target="_blank"
            rel="noopener"
            className="home-inspirations__card glass-panel"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <span>{source.name}</span>
            <p>{source.influence}</p>
          </motion.a>
        ))}
      </div>
    </section>
  </div>
);
