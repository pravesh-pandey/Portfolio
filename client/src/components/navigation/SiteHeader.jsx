import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { NAV_ITEMS } from "@data/navigation.js";
import "./siteHeader.css";

const cls = (...classes) => classes.filter(Boolean).join(" ");

export const SiteHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  });

  const handleToggle = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e, path) => {
    e.preventDefault();
    closeMenu();

    if (path.startsWith("#")) {
      if (location.pathname === "/") {
        // On home page, just scroll
        const element = document.querySelector(path === "#" ? "body" : path);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Not on home page, go home then scroll (handled by useEffect or hash)
        // For simplicity, we'll navigate to "/" + path which might not work if it's just #id
        // Better: navigate to "/" and let a useEffect handle the hash, or navigate to "/#id"
        navigate("/" + path);
        // Note: React Router might not handle scrolling to hash automatically on transition.
        // We might need a separate mechanism, but for now this is better than full reload.
        // Actually, let's just use window.location.hash logic if we navigate to home.
        setTimeout(() => {
          const element = document.querySelector(path === "#" ? "body" : path);
          if (element) element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } else {
      navigate(path);
    }
  };

  return (
    <motion.header
      className={cls("site-header", isHidden && "site-header--hidden")}
      initial={{ y: 0 }}
      animate={{ y: isHidden ? "-100%" : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="site-header__container">
        <NavLink to="/" className="site-header__logo" onClick={closeMenu}>
          <span className="logo-text">PP</span>
        </NavLink>

        <nav className={cls("site-nav", isOpen && "site-nav--open")} aria-label="Primary">
          <div className="site-nav__inner">
            <ul className="site-nav__list">
              {NAV_ITEMS.map((item) => (
                <li key={item.path} className="site-nav__item">
                  <a
                    href={item.path}
                    onClick={(e) => handleNavClick(e, item.path)}
                    className={cls("site-nav__link")}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="site-header__actions">
          <a
            className="button button--ghost"
            href="resume.pdf"
            target="_blank"
            rel="noopener"
          >
            Resume
          </a>
          <button
            className={cls("site-header__toggle", isOpen && "site-header__toggle--open")}
            type="button"
            aria-expanded={isOpen}
            onClick={handleToggle}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span className="sr-only">Toggle navigation</span>
          </button>
        </div>
      </div>
      <div
        className={cls("site-header__scrim", isOpen && "site-header__scrim--visible")}
        aria-hidden="true"
        onClick={closeMenu}
      />
    </motion.header>
  );
};
