import { SectionHeading } from "@components/common/SectionHeading.jsx";
import { ExperienceTimeline } from "@components/experience/ExperienceTimeline.jsx";
import { experienceTimeline } from "@data/profile.js";

export const ExperienceSection = () => (
  <section id="experience" className="home-section">
    <SectionHeading
      number="02"
      label="Experience"
      title="A track record of measurable outcomes."
      lead="From Amazon's Alexa AI to early-stage startups — search infrastructure, data platforms, and AI applications."
    />
    <ExperienceTimeline items={experienceTimeline} />
  </section>
);
