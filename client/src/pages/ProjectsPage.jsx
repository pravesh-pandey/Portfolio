import { PageIntro } from "@components/common/PageIntro.jsx";
import { ProjectGrid } from "@components/projects/ProjectGrid.jsx";
import { projectShowcase } from "@data/profile.js";

export const ProjectsPage = () => (
  <div className="page">
    <PageIntro
      eyebrow="Projects"
      title="Selected projects and technical work."
      lead="Key projects demonstrating my experience in distributed systems, performance optimization, and full-stack development—from scaling voice search infrastructure to building AI-powered applications."
    />
    <ProjectGrid projects={projectShowcase} />
  </div>
);
