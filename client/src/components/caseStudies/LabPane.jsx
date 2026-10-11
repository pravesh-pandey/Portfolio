import { Link } from "react-router-dom";

export const LabPane = () => (
  <article className="pane case-pane case-pane--lab">
    <p className="pane__label">lab · simulated data</p>
    <h3 className="case-pane__title">Order-flow playground</h3>
    <p className="case-pane__summary">
      The ideas behind FlowPulse, live in your browser: watch order-flow imbalance, microprice and VPIN react to a
      simulated order book, and inject a large order to see the detector catch it.
    </p>
    <Link className="case-pane__link" to="/lab">
      launch →
    </Link>
  </article>
);
