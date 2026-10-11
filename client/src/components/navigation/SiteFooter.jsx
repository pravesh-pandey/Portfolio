import { EMAIL, socialLinks } from "@data/links.js";
import "./siteFooter.css";

const footerLinks = [...socialLinks, { label: "Email", href: `mailto:${EMAIL}` }];

export const SiteFooter = () => (
  <footer className="site-footer">
    <div className="site-footer__content">
      <h3>Let’s engineer what’s next.</h3>
      <p>
        Software engineer at Amazon Alexa AI, building backend systems at scale and trading systems at
        market speed.
      </p>
    </div>
    <ul className="site-footer__links">
      {footerLinks.map((item) => (
        <li key={item.href}>
          <a href={item.href} target="_blank" rel="noopener noreferrer">
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  </footer>
);
