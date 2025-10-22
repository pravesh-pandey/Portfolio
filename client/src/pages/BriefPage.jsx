import { PageIntro } from "@components/common/PageIntro.jsx";
import { ProjectBriefForm } from "@components/forms/ProjectBriefForm.jsx";
import "./briefPage.css";

export const BriefPage = () => (
  <div className="page brief">
    <PageIntro
      eyebrow="Client Brief"
      title="Ready to start your next build? Share your requirements."
      lead="Tell me about your goals, constraints, and hopes. I’ll respond within two business days with a tailored roadmap, timeline insights, and recommended engagement model."
    />

    <section className="brief__content">
      <div className="brief__info glass-panel">
        <h2>What happens next</h2>
        <ul>
          <li>Within 48 hours you’ll receive a response outlining clarifying questions and timeline beats.</li>
          <li>We’ll schedule a strategy session to align on scope, success metrics, and delivery cadence.</li>
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
