import { PageIntro } from "@components/common/PageIntro.jsx";
import { ExperienceTimeline } from "@components/experience/ExperienceTimeline.jsx";
import { experienceTimeline } from "@data/profile.js";

export const ExperiencePage = () => (
  <div className="page">
    <PageIntro
      eyebrow="Experience"
      title="Professional experience in distributed systems and software engineering."
      lead="Track record of delivering high-impact solutions across search infrastructure, data analytics, and AI-powered applications for companies ranging from startups to large-scale enterprises."
    />

    <ExperienceTimeline items={experienceTimeline} />
  </div>
);
