import { PageIntro } from "@components/common/PageIntro.jsx";
import { ProjectGrid } from "@components/projects/ProjectGrid.jsx";
import { projectShowcase } from "@data/profile.js";

export const ProjectsPage = () => (
  <div className="page">
    <PageIntro
      eyebrow="Projects"
      title="Selected builds and experiments."
      lead="A curated look at systems I’ve crafted—from real-time voice search to AI-guided health experiences—each balancing performance, empathy, and maintainability."
    />
    <ProjectGrid projects={projectShowcase} />
  </div>
);
