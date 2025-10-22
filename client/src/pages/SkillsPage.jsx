import { PageIntro } from "@components/common/PageIntro.jsx";
import { SkillsColumns } from "@components/skills/SkillsColumns.jsx";
import { skillsMatrix } from "@data/profile.js";

export const SkillsPage = () => (
  <div className="page">
    <PageIntro
      eyebrow="Skills"
      title="Technical range tuned for ambitious roadmaps."
      lead="Depth in distributed systems and search, breadth across data, automation, and experience engineering—so strategy, delivery, and reliability stay aligned."
    />
    <SkillsColumns skills={skillsMatrix} />
  </div>
);
