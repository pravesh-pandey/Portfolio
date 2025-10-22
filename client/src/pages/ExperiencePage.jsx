import { PageIntro } from "@components/common/PageIntro.jsx";
import { ExperienceTimeline } from "@components/experience/ExperienceTimeline.jsx";
import { experienceTimeline } from "@data/profile.js";

export const ExperiencePage = () => (
  <div className="page">
    <PageIntro
      eyebrow="Experience"
      title="Impact across search, analytics, and AI-driven products."
      lead="Every role sharpened my toolkit: shipping for millions, modernizing legacy stacks, and cultivating velocity in distributed teams."
    />

    <ExperienceTimeline items={experienceTimeline} />
  </div>
);
