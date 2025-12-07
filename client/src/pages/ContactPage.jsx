import { useState } from "react";
import { motion } from "framer-motion";
import "./contactPage.css";

const initialState = {
    name: "",
    email: "",
    message: "",
};

export const ContactPage = () => {
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
                body: JSON.stringify(formValues),
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
        <div className="page contact-page">
            <motion.div
                className="contact-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="contact-header">
                    <h1>Get in Touch</h1>
                    <p>
                        Have a project in mind or just want to say hello?
                        <br />
                        I&apos;m always open to discussing new opportunities and ideas.
                    </p>
                </div>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            required
                            minLength={2}
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
                            value={formValues.message}
                            onChange={(event) => updateField("message", event.target.value)}
                        />
                    </div>
                    <button type="submit" className="submit-btn" disabled={status === "loading"}>
                        {status === "loading" ? "Sending..." : "Send Message"}
                    </button>
                </form>

                {feedback ? (
                    <p className={`contact-status contact-status--${status}`} role="status" aria-live="polite">
                        {feedback} Prefer email?{" "}
                        <a href="mailto:pravesh.pandey.mnnit@gmail.com" className="contact-link">
                            pravesh.pandey.mnnit@gmail.com
                        </a>
                    </p>
                ) : null}

                <div className="contact-info">
                    <a href="mailto:pravesh.pandey.mnnit@gmail.com" className="contact-link">
                        pravesh.pandey.mnnit@gmail.com
                    </a>
                    <div className="social-links">
                        <a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                        <a href="#" target="_blank" rel="noopener noreferrer">GitHub</a>
                        <a href="#" target="_blank" rel="noopener noreferrer">Twitter</a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
