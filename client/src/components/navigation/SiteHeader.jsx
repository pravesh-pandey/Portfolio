import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { NAV_ITEMS } from "@data/navigation.js";
import "./siteHeader.css";

const cls = (...classes) => classes.filter(Boolean).join(" ");

// A terminal keeps its chrome on screen, so the header no longer hides on scroll.
export const SiteHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const resumeHref = `${import.meta.env.BASE_URL}resume.pdf`;
  const closeMenu = () => setIsOpen(false);

  // Paths starting with "#" are home-page sections; everything else is a route.
  const goTo = (path) => {
    closeMenu();
    if (!path.startsWith("#")) {
      navigate(path);
    } else if (location.pathname !== "/") {
      navigate(`/${path}`);
    } else if (location.hash === path) {
      // Same hash: navigation would be a no-op, so scroll directly.
      document.getElementById(path.slice(1))?.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth" });
    } else {
      // Keep the URL hash in sync; useHashScroll performs the scroll.
      navigate(path);
    }
  };

  return (
    <header className="site-header">
      <div className="site-header__container">
        <NavLink to="/" className="site-header__logo" onClick={closeMenu}>
          PP_
        </NavLink>

        <nav className={cls("site-nav", isOpen && "site-nav--open")} aria-label="Primary">
          <ul className="site-nav__list">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <a
                  href={item.path}
                  className="site-nav__link"
                  aria-current={location.pathname === item.path ? "page" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    goTo(item.path);
                  }}
                >
                  <span className="site-nav__key">[{item.key}]</span> {item.label}
                </a>
              </li>
            ))}
            <li className="site-nav__pdf">
              <a href={resumeHref} className="site-nav__link" target="_blank" rel="noreferrer">
                cv.pdf
              </a>
            </li>
          </ul>
        </nav>

        <div className="site-header__actions">
          <a className="button button--ghost" href={resumeHref} target="_blank" rel="noreferrer">
            cv.pdf
          </a>
          <button
            className="site-header__toggle"
            type="button"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
          >
            <span aria-hidden="true">[≡]</span> menu
          </button>
        </div>
      </div>
      <div
        className={cls("site-header__scrim", isOpen && "site-header__scrim--visible")}
        aria-hidden="true"
        onClick={closeMenu}
      />
    </header>
  );
};
