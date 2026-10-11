import { Link } from "react-router-dom";
import { EMAIL } from "@data/links.js";

export const HireCta = ({ topic }) => (
  <aside className="pane hire-cta" aria-label="Work with me">
    <p className="pane__label">next step</p>
    <p className="hire-cta__title">Need something like this?</p>
    <div className="hire-cta__actions">
      <Link className="button button--primary" to="/work-with-me">
        → hire me
      </Link>
      <a className="button" href={`mailto:${EMAIL}?subject=${encodeURIComponent(`Walkthrough: ${topic}`)}`}>
        ask for a walkthrough
      </a>
    </div>
  </aside>
);
