import { PageIntro } from "@components/common/PageIntro.jsx";
import { ProcessSteps } from "@components/process/ProcessSteps.jsx";
import { ProjectBriefForm } from "@components/forms/ProjectBriefForm.jsx";
import { processSteps } from "@data/profile.js";
import "./workWithMePage.css";

export const WorkWithMePage = () => (
  <div className="page work-with-me">
    <PageIntro
      eyebrow="Work with me"
      title="Ready to start your next build?"
      lead="Tell me about your goals and constraints. I'll respond within two business days with clarifying questions, timeline insights, and a recommended engagement model."
    />

    <section aria-labelledby="process-heading">
      <h2 id="process-heading" className="sr-only">
        How I work
      </h2>
      <ProcessSteps steps={processSteps} />
    </section>

    <div className="section-divider" />

    <section className="brief__content">
      <div className="brief__info glass-panel">
        <h2>What happens next</h2>
        <ul>
          <li>Within 48 hours you&apos;ll receive a response outlining clarifying questions and timeline beats.</li>
          <li>We&apos;ll schedule a strategy session to align on scope, success metrics, and delivery cadence.</li>
          <li>Expect a transparent proposal covering architecture approach, milestones, and investment.</li>
        </ul>
        <div className="brief__contact">
          Prefer direct contact?{" "}
          <a href="mailto:pravesh.pandey.mnnit@gmail.com">pravesh.pandey.mnnit@gmail.com</a>
        </div>
      </div>
      <ProjectBriefForm />
    </section>
  </div>
);
