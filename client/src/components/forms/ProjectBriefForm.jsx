import { useState } from "react";
import "./projectBriefForm.css";

const initialState = {
  name: "",
  email: "",
  company: "",
  focus: "",
  budget: "",
  timeline: "",
  overview: "",
  deliverables: "",
  references: "",
  consent: false
};

export const ProjectBriefForm = () => {
  const [formValues, setFormValues] = useState(initialState);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const updateField = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues)
      });

      if (!response.ok) {
        throw new Error("Unexpected response");
      }

      setStatus("success");
      setMessage("Thanks for reaching out! I'll respond within two business days with next steps.");
      setFormValues(initialState);
    } catch (error) {
      setStatus("error");
      setMessage("Something went wrong. Please try again or email me directly.");
      console.error("Brief submit error", error);
    }
  };

  return (
    <form className="brief-form glass-panel" onSubmit={handleSubmit}>
      <div className="brief-form__grid">
        <div className="brief-form__field">
          <label htmlFor="name">Your name *</label>
          <input
            id="name"
            name="name"
            value={formValues.name}
            onChange={(event) => updateField("name", event.target.value)}
            required
            placeholder="Jane Doe"
          />
        </div>
        <div className="brief-form__field">
          <label htmlFor="email">Work email *</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formValues.email}
            onChange={(event) => updateField("email", event.target.value)}
            required
            placeholder="jane@company.com"
          />
        </div>
        <div className="brief-form__field">
          <label htmlFor="company">Company / organization</label>
          <input
            id="company"
            name="company"
            value={formValues.company}
            onChange={(event) => updateField("company", event.target.value)}
            placeholder="Company name"
          />
        </div>
        <div className="brief-form__field">
          <label htmlFor="focus">Project focus *</label>
          <select
            id="focus"
            name="focus"
            value={formValues.focus}
            onChange={(event) => updateField("focus", event.target.value)}
            required
          >
            <option value="">Select a focus</option>
            <option value="Platform architecture & migration">Platform architecture & migration</option>
            <option value="Search & personalization">Search & personalization</option>
            <option value="AI/ML product build">AI/ML product build</option>
            <option value="Full-stack web experience">Full-stack web experience</option>
            <option value="Automation & DevOps">Automation & DevOps</option>
            <option value="Something else">Something else</option>
          </select>
        </div>
        <div className="brief-form__field">
          <label htmlFor="budget">Budget range (USD)</label>
          <input
            id="budget"
            name="budget"
            value={formValues.budget}
            onChange={(event) => updateField("budget", event.target.value)}
            placeholder="25k – 60k"
          />
        </div>
        <div className="brief-form__field">
          <label htmlFor="timeline">Target launch / timeline</label>
          <input
            id="timeline"
            name="timeline"
            value={formValues.timeline}
            onChange={(event) => updateField("timeline", event.target.value)}
            placeholder="Q2 2025 / ASAP / Flexible"
          />
        </div>
      </div>

      <div className="brief-form__field">
        <label htmlFor="overview">Project overview *</label>
        <textarea
          id="overview"
          name="overview"
          rows="4"
          value={formValues.overview}
          onChange={(event) => updateField("overview", event.target.value)}
          required
          placeholder="What problem are we solving? Who are the users? What does success look like?"
        />
      </div>
      <div className="brief-form__field">
        <label htmlFor="deliverables">Key deliverables & integrations</label>
        <textarea
          id="deliverables"
          name="deliverables"
          rows="3"
          value={formValues.deliverables}
          onChange={(event) => updateField("deliverables", event.target.value)}
          placeholder="APIs, dashboards, data pipelines, CI/CD, mobile apps, integrations, etc."
        />
      </div>
      <div className="brief-form__field">
        <label htmlFor="references">Existing assets to reference</label>
        <textarea
          id="references"
          name="references"
          rows="3"
          value={formValues.references}
          onChange={(event) => updateField("references", event.target.value)}
          placeholder="Codebases, design systems, product specs, analytics reports, etc."
        />
      </div>
      <label className="brief-form__consent" htmlFor="consent">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          checked={formValues.consent}
          onChange={(event) => updateField("consent", event.target.checked)}
          required
        />
        I agree to be contacted about this inquiry.
      </label>
      <button className="button button--primary" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : "Submit requirements"}
      </button>
      {message ? (
        <p className={`brief-form__status brief-form__status--${status}`}>
          {message} Prefer email?{" "}
          <a href="mailto:pravesh.pandey.mnnit@gmail.com">pravesh.pandey.mnnit@gmail.com</a>
        </p>
      ) : null}
    </form>
  );
};
