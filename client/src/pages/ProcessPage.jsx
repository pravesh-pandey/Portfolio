import { PageIntro } from "@components/common/PageIntro.jsx";
import { ProcessSteps } from "@components/process/ProcessSteps.jsx";
import { processSteps } from "@data/profile.js";

export const ProcessPage = () => (
  <div className="page">
    <PageIntro
      eyebrow="Approach"
      title="Structured development process for reliable delivery."
      lead="My approach to software development emphasizes clear planning, scalable architecture, iterative implementation, and production-ready deployment with ongoing support."
    />
    <ProcessSteps steps={processSteps} />
  </div>
);
