import { Reveal } from "./Reveal.jsx";

export const SectionHeading = ({ number, label, title, lead }) => (
  <Reveal className="section-heading">
    <span className="section-heading__label">
      {number} — {label}
    </span>
    {title ? <h2 className="section-heading__title">{title}</h2> : null}
    {lead ? <p className="section-heading__lead">{lead}</p> : null}
  </Reveal>
);
