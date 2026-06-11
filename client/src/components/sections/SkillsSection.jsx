import { SectionHeading } from "@components/common/SectionHeading.jsx";
import { SkillsColumns } from "@components/skills/SkillsColumns.jsx";
import { skillsMatrix } from "@data/profile.js";

export const SkillsSection = () => (
  <section id="skills" className="home-section">
    <SectionHeading
      number="04"
      label="Skills"
      title="Technical expertise across the stack."
      lead="Strongest in distributed systems, backend development, and cloud infrastructure — with working depth in AI tooling."
    />
    <SkillsColumns skills={skillsMatrix} />
  </section>
);
