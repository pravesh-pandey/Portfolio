import { SectionHeading } from "@components/common/SectionHeading.jsx";
import { AchievementGrid } from "@components/achievements/AchievementGrid.jsx";
import { achievements } from "@data/profile.js";

export const AwardsSection = () => (
  <section id="awards" className="home-section">
    <SectionHeading
      number="05"
      label="Awards"
      title="Recognition and certifications."
      lead="Amazon engineering awards, national competition placements, and professional certifications."
    />
    <AchievementGrid achievements={achievements} />
  </section>
);
