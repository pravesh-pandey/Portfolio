import { useState } from "react";
import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "@data/navigation.js";
import "./siteHeader.css";

const cls = (...classes) => classes.filter(Boolean).join(" ");

export const SiteHeader = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="site-header">
      <div className="site-header__container">
        <NavLink to="/" className="site-header__logo" onClick={closeMenu}>
          <span className="sr-only">Pravesh Pandey</span>
          <span>PP</span>
        </NavLink>

        <nav className={cls("site-nav", isOpen && "site-nav--open")} aria-label="Primary">
          <div className="site-nav__inner">
            <p className="site-nav__label">Navigate</p>
            <ul className="site-nav__list">
              {NAV_ITEMS.map((item) => (
                <li key={item.path} className="site-nav__item">
                  <NavLink
                    to={item.path}
                    onClick={closeMenu}
                    className={({ isActive }) => cls("site-nav__link", isActive && "site-nav__link--active")}
                  >
                    <span>{item.label}</span>
                    <span className="site-nav__link-indicator" aria-hidden="true" />
                  </NavLink>
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
          <NavLink className="button button--primary" to="/brief" onClick={closeMenu}>
            Start a Project
          </NavLink>
          <button
            className={cls("site-header__toggle", isOpen && "site-header__toggle--open")}
            type="button"
            aria-expanded={isOpen}
            onClick={handleToggle}
          >
            <span aria-hidden="true" />
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
    </header>
  );
};
