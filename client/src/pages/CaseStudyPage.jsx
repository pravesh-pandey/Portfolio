import { useParams } from "react-router-dom";
import { PageIntro } from "@components/common/PageIntro.jsx";
import { Pipeline } from "@components/caseStudies/Pipeline.jsx";
import { HireCta } from "@components/caseStudies/HireCta.jsx";
import { findCaseStudy } from "@data/caseStudies.js";
import { useDocumentTitle } from "@hooks/useDocumentTitle.js";
import { NotFoundPage } from "./NotFoundPage.jsx";
import "@components/caseStudies/caseStudies.css";

const KIND_LABEL = { trading: "Trading systems", infrastructure: "Infrastructure" };

export const CaseStudyPage = () => {
  const { slug } = useParams();
  const study = findCaseStudy(slug);
  useDocumentTitle(study ? study.title : "Not found");
  if (!study) return <NotFoundPage />;

  return (
    <article className="page case-study">
      <PageIntro eyebrow={`${KIND_LABEL[study.kind]} / case study`} title={study.title} lead={study.summary} />
      <div className="case-study__sections">
        <section className="pane">
          <h2 className="pane__label">The problem</h2>
          <p>{study.problem}</p>
        </section>
        <section className="pane">
          <h2 className="pane__label">How it works</h2>
          <Pipeline stages={study.pipeline} />
          {study.approach.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
        <section className="pane">
          <h2 className="pane__label">Decision log</h2>
          <table className="decision-table">
            <thead>
              <tr>
                <th scope="col">Decision</th>
                <th scope="col">Chosen</th>
                <th scope="col">Rejected, and why</th>
              </tr>
            </thead>
            <tbody>
              {study.decisions.map((row) => (
                <tr key={row.decision}>
                  <th scope="row">{row.decision}</th>
                  <td data-label="Chosen">{row.chosen}</td>
                  <td data-label="Rejected">{row.rejected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="pane">
          <h2 className="pane__label">Engineering highlights</h2>
          <ul>
            {study.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="pane">
          <h2 className="pane__label">{"Limits and what's next"}</h2>
          <ul>
            {study.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="pane">
          <h2 className="pane__label">Stack</h2>
          <div className="chips">
            {study.stack.map((tech) => (
              <span className="chip" key={tech}>
                {tech}
              </span>
            ))}
          </div>
          <p className="case-study__code">
            {study.codeLink ? (
              <a href={study.codeLink} target="_blank" rel="noopener noreferrer">
                view the code on GitHub →
              </a>
            ) : (
              "Code available on request."
            )}
          </p>
        </section>
        <HireCta topic={study.title} />
      </div>
    </article>
  );
};
