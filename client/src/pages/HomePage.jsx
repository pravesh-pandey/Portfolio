import { useHashScroll } from "@hooks/useHashScroll.js";
import { HeroSection } from "@components/sections/HeroSection.jsx";
import { ImpactSection } from "@components/sections/ImpactSection.jsx";
import { AboutSection } from "@components/sections/AboutSection.jsx";
import { ExperienceSection } from "@components/sections/ExperienceSection.jsx";
import { FeaturedProjectsSection } from "@components/sections/FeaturedProjectsSection.jsx";
import { SkillsSection } from "@components/sections/SkillsSection.jsx";
import { AwardsSection } from "@components/sections/AwardsSection.jsx";
import { ContactSection } from "@components/sections/ContactSection.jsx";
import "./homePage.css";

export const HomePage = () => {
  useHashScroll();

  return (
    <div className="home">
      <HeroSection />
      <div className="page home__sections">
        <ImpactSection />
        <AboutSection />
        <ExperienceSection />
        <FeaturedProjectsSection />
        <SkillsSection />
        <AwardsSection />
        <ContactSection />
      </div>
    </div>
  );
};
