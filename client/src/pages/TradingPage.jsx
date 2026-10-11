import { PageIntro } from "@components/common/PageIntro.jsx";
import { CaseStudyPane } from "@components/caseStudies/CaseStudyPane.jsx";
import { LabPane } from "@components/caseStudies/LabPane.jsx";
import { HireCta } from "@components/caseStudies/HireCta.jsx";
import { caseStudies } from "@data/caseStudies.js";
import { useDocumentTitle } from "@hooks/useDocumentTitle.js";
import "@components/caseStudies/caseStudies.css";

export const TradingPage = () => {
  useDocumentTitle("Trading systems");

  return (
    <div className="page trading-page">
      <PageIntro
        eyebrow="Trading systems"
        title="Market software, engineered like production systems."
        lead="Order-flow detection and options research for Indian markets, built with the same rigor as large-scale backend services."
      />
      <div className="case-grid">
        {caseStudies
          .filter((study) => study.kind === "trading")
          .map((study) => (
            <CaseStudyPane key={study.slug} study={study} />
          ))}
        <LabPane />
      </div>
      <section className="pane not-published" aria-labelledby="not-published-title">
        <h2 className="pane__label" id="not-published-title">
          {"What I don't publish, and why"}
        </h2>
        <ul>
          <li>
            No P&amp;L, win rates or Sharpe ratios. Backtest figures are easy to overfit and impossible to verify from a
            web page, so a number here would prove nothing.
          </li>
          <li>No live-trading claims. FlowPulse paper-trades its signals; nothing here routes real capital.</li>
          <li>No strategy parameters. The engineering is open to discuss; the edge stays private.</li>
        </ul>
        <p>Want to judge the rigor yourself? Ask for a walkthrough of the code and the method.</p>
      </section>
      <HireCta topic="trading systems" />
    </div>
  );
};
