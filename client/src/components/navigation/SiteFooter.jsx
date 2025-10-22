import "./siteFooter.css";

const footerLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/pravesh25/" },
  { label: "GitHub", href: "https://github.com/pravesh-pandey" },
  { label: "LeetCode", href: "https://leetcode.com/u/pravesh_pandey/" },
  { label: "Email", href: "mailto:pravesh.pandey.mnnit@gmail.com" }
];

export const SiteFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__content">
        <h3>Let’s engineer what’s next.</h3>
        <p>
          Software Development Engineer at Amazon with a passion for resilient systems, intelligent search, and AI-led
          experiences that scale globally.
        </p>
      </div>
      <ul className="site-footer__links">
        {footerLinks.map((item) => (
          <li key={item.href}>
            <a href={item.href} target="_blank" rel="noopener">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <p className="site-footer__copy">© {year} Pravesh Pandey. All rights reserved.</p>
    </footer>
  );
};
