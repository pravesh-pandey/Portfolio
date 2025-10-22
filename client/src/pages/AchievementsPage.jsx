import { PageIntro } from "@components/common/PageIntro.jsx";
import { AchievementGrid } from "@components/achievements/AchievementGrid.jsx";
import { achievements } from "@data/profile.js";

export const AchievementsPage = () => (
  <div className="page">
    <PageIntro
      eyebrow="Highlights"
      title="Recognition that reflects momentum."
      lead="From competition podiums to global certifications, these highlights underline a commitment to both craft and community."
    />
    <AchievementGrid achievements={achievements} />
  </div>
);
