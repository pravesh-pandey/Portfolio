import { useRef } from "react";
import { NavLink } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import "./heroSection.css";

const scrollToProjects = (event) => {
  event.preventDefault();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("projects")?.scrollIntoView({ behavior: reduce ? "instant" : "smooth" });
};

const HeroIntro = () => (
  <>
    <span className="hero-scene__eyebrow">Software Development Engineer · Amazon Alexa AI</span>
    <h1 className="hero-scene__title">
      Pravesh Pandey
      <em>builds systems that scale.</em>
    </h1>
    <p className="hero-scene__lead">
      Distributed systems, AI infrastructure, and backend services that hold up in production —
      from Alexa&apos;s NLU pipeline to data platforms processing at scale.
    </p>
    <div className="hero-scene__actions">
      <a className="button button--primary" href="#projects" onClick={scrollToProjects}>
        View my work
      </a>
      <NavLink className="button" to="/work-with-me">
        Work with me
      </NavLink>
      <a
        className="button button--ghost"
        href={`${import.meta.env.BASE_URL}resume.pdf`}
        target="_blank"
        rel="noreferrer"
      >
        Resume
      </a>
    </div>
  </>
);

const HeroBridge = () => (
  <>
    <span className="hero-scene__eyebrow">The short version</span>
    <h2 className="hero-scene__bridge-title">
      I turn complex requirements into <em>reliable, measurable systems</em> — latency, locales,
      and dollars saved.
    </h2>
  </>
);

export const HeroSection = () => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const introOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.4], ["0%", "-10%"]);
  const introScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.94]);
  const bridgeOpacity = useTransform(scrollYProgress, [0.45, 0.8], [0, 1]);
  const bridgeY = useTransform(scrollYProgress, [0.45, 0.8], ["18vh", "0vh"]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  // Faded-out layers still hit-test; gate pointer events so the invisible
  // layer never swallows clicks meant for the visible one.
  const introPointerEvents = useTransform(introOpacity, (v) => (v > 0.05 ? "auto" : "none"));
  const bridgePointerEvents = useTransform(bridgeOpacity, (v) => (v > 0.05 ? "auto" : "none"));

  if (reduceMotion) {
    return (
      <section className="hero-scene hero-scene--static">
        <div className="hero-scene__layer">
          <HeroIntro />
        </div>
        <div className="hero-scene__layer hero-scene__layer--bridge">
          <HeroBridge />
        </div>
      </section>
    );
  }

  return (
    <section className="hero-scene" ref={ref}>
      <div className="hero-scene__sticky">
        <motion.div
          className="hero-scene__layer"
          style={{ opacity: introOpacity, y: introY, scale: introScale, pointerEvents: introPointerEvents }}
        >
          <HeroIntro />
        </motion.div>
        <motion.div
          className="hero-scene__layer hero-scene__layer--bridge"
          style={{ opacity: bridgeOpacity, y: bridgeY, pointerEvents: bridgePointerEvents }}
        >
          <HeroBridge />
        </motion.div>
        <motion.span className="hero-scene__hint" aria-hidden="true" style={{ opacity: hintOpacity }}>
          Scroll
        </motion.span>
      </div>
    </section>
  );
};
