import { CountUp } from "@components/common/CountUp.jsx";
import { Reveal } from "@components/common/Reveal.jsx";
import { impactMetrics } from "@data/profile.js";
import "./impactSection.css";

export const ImpactSection = () => (
  <section id="impact" className="home-section impact">
    <Reveal className="pane">
      <h2 className="pane__label">Impact at Amazon</h2>
      <dl className="impact__grid">
        {impactMetrics.map((metric) => (
          <div className="impact__metric" key={metric.label}>
            <dt>
              <CountUp to={metric.value} suffix={metric.suffix} />
            </dt>
            <dd>{metric.label}</dd>
          </div>
        ))}
      </dl>
    </Reveal>
  </section>
);
