import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Hero } from "@components/hero/Hero.jsx";
import { ProjectsPage } from "@pages/ProjectsPage.jsx";
import { ContactPage } from "@pages/ContactPage.jsx";
import "./homePage.css";

export const HomePage = () => {
  const stackRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.45], ["0%", "-8%"]);

  const nextOpacity = useTransform(scrollYProgress, [0.25, 1], [0, 1]);
  const nextY = useTransform(scrollYProgress, [0.25, 1], ["40vh", "0%"]);

  const taglineOpacity = useTransform(scrollYProgress, [0.75, 1], [0, 1]);
  const taglineY = useTransform(scrollYProgress, [0.75, 1], ["24px", "0px"]);

  return (
    <div className="page home">
      <section className="home-stack" ref={stackRef}>
        <div className="home-stack__sticky">
          <motion.div
            className="home-stack__panel"
            initial={{ opacity: 1, y: "0%" }}
            style={{ opacity: heroOpacity, y: heroY }}
          >
            <Hero />
          </motion.div>

          <motion.div
            className="home-stack__panel home-stack__panel--second"
            initial={{ opacity: 0, y: "40vh" }}
            style={{ opacity: nextOpacity, y: nextY }}
          >
            <div className="home-next glass-panel">
              <span className="home-next__eyebrow">About</span>
              <h2 className="home-next__title">Building reliable systems that deliver results.</h2>
              <p className="home-next__lead">
                I translate complex requirements into scalable, production-ready solutions. The focus is on performance,
                maintainability, and measurable business impact across every system I ship.
              </p>
            </div>

            <motion.p className="home-stack__tagline" style={{ opacity: taglineOpacity, y: taglineY }}>
              Let’s engineer what’s next.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section id="projects" className="home-section">
        <ProjectsPage />
      </section>

      <section id="contact" className="home-section">
        <ContactPage />
      </section>
    </div>
  );
};
