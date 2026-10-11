export const Pipeline = ({ stages }) => (
  <ol className="pipeline" aria-label="How it works, step by step">
    {stages.map((stage) => (
      <li className="pipeline__stage" key={stage}>
        <span className="pipeline__box">{stage}</span>
      </li>
    ))}
  </ol>
);
