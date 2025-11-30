import { motion } from "framer-motion";
import "./contactPage.css";

export const ContactPage = () => {
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

                <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input type="text" id="name" name="name" placeholder="John Doe" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" placeholder="john@example.com" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="message">Message</label>
                        <textarea id="message" name="message" rows="5" placeholder="Tell me about your project..." required />
                    </div>
                    <button type="submit" className="submit-btn">
                        Send Message
                    </button>
                </form>

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
