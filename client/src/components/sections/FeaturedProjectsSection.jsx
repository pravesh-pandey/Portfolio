import { NavLink } from "react-router-dom";
import { SectionHeading } from "@components/common/SectionHeading.jsx";
import { Reveal } from "@components/common/Reveal.jsx";
import { ProjectGrid } from "@components/projects/ProjectGrid.jsx";
import { projectShowcase } from "@data/profile.js";

export const FeaturedProjectsSection = () => (
  <section id="projects" className="home-section featured-projects">
    <SectionHeading
      number="03"
      label="Projects"
      title="Selected work."
      lead="Four favorites across AI, automation, IoT, and full-stack builds."
    />
    <ProjectGrid projects={projectShowcase.filter((project) => project.featured)} />
    <Reveal className="featured-projects__more" delay={0.1}>
      <NavLink className="button" to="/projects">
        All projects →
      </NavLink>
    </Reveal>
  </section>
);
