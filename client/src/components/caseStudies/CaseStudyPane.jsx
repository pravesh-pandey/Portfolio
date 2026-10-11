import { Link } from "react-router-dom";

export const CaseStudyPane = ({ study }) => (
  <article className="pane case-pane case-pane--study">
    <p className="pane__label">case study · {study.kind}</p>
    <h3 className="case-pane__title">{study.title}</h3>
    <p className="case-pane__summary">{study.summary}</p>
    <div className="chips">
      {study.stack.slice(0, 4).map((tech) => (
        <span className="chip" key={tech}>
          {tech}
        </span>
      ))}
    </div>
    <Link className="case-pane__link" to={`/case-studies/${study.slug}`}>
      read case study →
    </Link>
  </article>
);
