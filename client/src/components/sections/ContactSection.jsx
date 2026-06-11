import { useState } from "react";
import { SectionHeading } from "@components/common/SectionHeading.jsx";
import { Reveal } from "@components/common/Reveal.jsx";
import "./contactSection.css";

const initialState = {
  name: "",
  email: "",
  message: ""
};

const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/pravesh25/" },
  { label: "GitHub", href: "https://github.com/pravesh-pandey" },
  { label: "LeetCode", href: "https://leetcode.com/u/pravesh_pandey/" }
];

export const ContactSection = () => {
  const [formValues, setFormValues] = useState(initialState);
  const [status, setStatus] = useState("idle");
  const [feedback, setFeedback] = useState("");
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/$/, "");

  const updateField = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setFeedback("");

    try {
      const response = await fetch(`${apiBaseUrl}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues)
      });

      if (!response.ok) {
        throw new Error("Unexpected response");
      }

      setStatus("success");
      setFeedback("Thanks for reaching out! I'll get back to you soon.");
      setFormValues(initialState);
    } catch (error) {
      console.error("Contact submit error", error);
      setStatus("error");
      setFeedback("Couldn't send right now. Please try again or email me directly.");
    }
  };

  return (
    <section id="contact" className="home-section contact">
      <SectionHeading
        number="06"
        label="Contact"
        title="Get in touch."
        lead="Have a project in mind, a role to discuss, or just want to say hello? I'm always open to new opportunities and ideas."
      />
      <Reveal className="contact__container glass-panel">
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="John Doe"
              autoComplete="name"
              required
              minLength={2}
              maxLength={120}
              value={formValues.name}
              onChange={(event) => updateField("name", event.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="john@example.com"
              autoComplete="email"
              required
              value={formValues.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              placeholder="Tell me about your project..."
              required
              minLength={10}
              maxLength={2000}
              value={formValues.message}
              onChange={(event) => updateField("message", event.target.value)}
            />
          </div>
          <button type="submit" className="submit-btn" disabled={status === "loading"}>
            {status === "loading" ? "Sending..." : "Send Message"}
          </button>
        </form>

        {/* Live region stays mounted so screen readers register it before the
            first status change is announced. */}
        <p
          className={`contact-status${feedback ? ` contact-status--${status}` : ""}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {feedback ? (
            <>
              {feedback} Prefer email?{" "}
              <a href="mailto:pravesh.pandey.mnnit@gmail.com" className="contact-link">
                pravesh.pandey.mnnit@gmail.com
              </a>
            </>
          ) : null}
        </p>

        <div className="contact-info">
          <a href="mailto:pravesh.pandey.mnnit@gmail.com" className="contact-link">
            pravesh.pandey.mnnit@gmail.com
          </a>
          <div className="social-links">
            {socialLinks.map((social) => (
              <a key={social.href} href={social.href} target="_blank" rel="noopener noreferrer">
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
};
