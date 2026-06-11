import { SectionHeading } from "@components/common/SectionHeading.jsx";
import { Reveal } from "@components/common/Reveal.jsx";
import "./aboutSection.css";

export const AboutSection = () => (
  <section id="about" className="home-section about">
    <SectionHeading
      number="01"
      label="About"
      title="Building reliable systems that deliver results."
    />
    <div className="about__body glass-panel">
      <Reveal className="about__content">
        <p>
          At Amazon Alexa AI, I lead automation and platform work across the NLU stack — from
          LangForge Automation (which took CET failure rates from 60% to zero for onboarded teams)
          to multi-locale Pattern Match expansion and the Clarity inference platform. I care about
          systems that are measurable: latency budgets, locale coverage, and compute bills.
        </p>
        <p>
          Before Amazon, I built high-performance data processing systems at nFolks Data Solutions
          and AI-powered health applications at Phyt Health. Across all of it, the throughline is
          understanding how systems behave under production load and engineering them to stay
          reliable as they grow.
        </p>
      </Reveal>
      <Reveal className="about__aside" delay={0.15}>
        <aside aria-label="Snapshot">
          <h3>Snapshot</h3>
          <ul>
            <li>
              <strong>Currently</strong> SDE at Amazon, Alexa AI
            </li>
            <li>
              <strong>Education</strong> B.Tech, MNNIT Allahabad (2019–2023)
            </li>
            <li>
              <strong>Based in</strong> Bangalore, India
            </li>
            <li>
              <strong>Focus</strong> Distributed systems · AI infrastructure · Backend services
            </li>
          </ul>
        </aside>
      </Reveal>
    </div>
  </section>
);
