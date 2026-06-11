import { PageIntro } from "@components/common/PageIntro.jsx";
import { ProjectGrid } from "@components/projects/ProjectGrid.jsx";
import { projectShowcase } from "@data/profile.js";

export const ProjectsPage = () => (
  <div className="page projects-page">
    <PageIntro
      eyebrow="Projects"
      title="All projects."
      lead="Everything from AI and computer vision to IoT, automation, and full-stack builds."
    />
    <ProjectGrid projects={projectShowcase} />
  </div>
);
