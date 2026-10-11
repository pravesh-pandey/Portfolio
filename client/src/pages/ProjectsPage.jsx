import { PageIntro } from "@components/common/PageIntro.jsx";
import { ProjectGrid } from "@components/projects/ProjectGrid.jsx";
import { projectShowcase } from "@data/profile.js";

export const ProjectsPage = () => (
  <div className="page projects-page">
    <PageIntro
      eyebrow="Projects"
      title="All projects."
      lead="Everything from trading systems and infrastructure to AI, IoT, automation, and full-stack builds."
    />
    <ProjectGrid projects={projectShowcase} />
  </div>
);
