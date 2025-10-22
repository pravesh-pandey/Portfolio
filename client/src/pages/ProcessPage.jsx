import { PageIntro } from "@components/common/PageIntro.jsx";
import { ProcessSteps } from "@components/process/ProcessSteps.jsx";
import { processSteps } from "@data/profile.js";

export const ProcessPage = () => (
  <div className="page">
    <PageIntro
      eyebrow="Approach"
      title="A four-part playbook from discovery through growth."
      lead="Borrowing cues from world-class studios, each engagement layers strategic alignment, architectural clarity, iterative momentum, and thoughtful launch support."
    />
    <ProcessSteps steps={processSteps} />
  </div>
);
