import { PageIntro } from "@components/common/PageIntro.jsx";
import { AchievementGrid } from "@components/achievements/AchievementGrid.jsx";
import { achievements } from "@data/profile.js";

export const AchievementsPage = () => (
  <div className="page">
    <PageIntro
      eyebrow="Highlights"
      title="Achievements and certifications."
      lead="Recognition from technical competitions, professional certifications, and academic achievements demonstrating continuous learning and technical excellence."
    />
    <AchievementGrid achievements={achievements} />
  </div>
);
