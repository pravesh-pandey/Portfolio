import { PageIntro } from "@components/common/PageIntro.jsx";
import { ProjectGrid } from "@components/projects/ProjectGrid.jsx";
import { projectShowcase } from "@data/profile.js";
import { useHashScroll } from "@hooks/useHashScroll.js";
import { useDocumentTitle } from "@hooks/useDocumentTitle.js";

export const ProjectsPage = () => {
  useHashScroll();
  useDocumentTitle("Projects");

  return (
    <div className="page projects-page">
      <PageIntro
        eyebrow="Projects"
        title="All projects."
        lead="Everything from trading systems and infrastructure to AI, IoT, automation, and full-stack builds."
      />
      <ProjectGrid projects={projectShowcase} />
    </div>
  );
};
