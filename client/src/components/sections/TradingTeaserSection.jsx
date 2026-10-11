import { Link } from "react-router-dom";
import { SectionHeading } from "@components/common/SectionHeading.jsx";
import { CaseStudyPane } from "@components/caseStudies/CaseStudyPane.jsx";
import { LabPane } from "@components/caseStudies/LabPane.jsx";
import { caseStudies } from "@data/caseStudies.js";
import "@components/caseStudies/caseStudies.css";

export const TradingTeaserSection = () => (
  <section id="trading" className="home-section">
    <SectionHeading
      number="01"
      label="Trading systems"
      title="Built for markets that don't wait."
      lead="Order-flow detection and options research for Indian markets, engineered like production software."
    />
    <div className="case-grid">
      {caseStudies
        .filter((study) => study.kind === "trading")
        .map((study) => (
          <CaseStudyPane key={study.slug} study={study} />
        ))}
      <LabPane />
    </div>
    <div className="featured-projects__more">
      <Link className="button" to="/trading">
        all trading work →
      </Link>
    </div>
  </section>
);
