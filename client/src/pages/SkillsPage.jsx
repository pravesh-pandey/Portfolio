import { PageIntro } from "@components/common/PageIntro.jsx";
import { SkillsColumns } from "@components/skills/SkillsColumns.jsx";
import { skillsMatrix } from "@data/profile.js";

export const SkillsPage = () => (
  <div className="page">
    <PageIntro
      eyebrow="Skills"
      title="Technical expertise in modern software development."
      lead="Strong foundation in distributed systems, backend development, and cloud infrastructure, with experience across the full software development lifecycle from design to deployment."
    />
    <SkillsColumns skills={skillsMatrix} />
  </div>
);
