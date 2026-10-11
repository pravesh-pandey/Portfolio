import { lazy, Suspense, useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { NAV_ITEMS } from "@data/navigation.js";
import { navShortcut } from "@/shell/hotkey.js";
import { shortcutsEnabled } from "@/shell/shortcuts.js";
import { ChunkErrorBoundary } from "@components/common/ChunkErrorBoundary.jsx";
import "./siteHeader.css";
import "./tickerStrip.css";

// The ticker and its simulation load right after first paint: they're decoration, and this keeps the
// initial bundle in budget. The placeholder holds the strip's height so nothing shifts when it arrives.
const TickerStrip = lazy(() => import("./TickerStrip.jsx").then((module) => ({ default: module.TickerStrip })));
const tickerPlaceholder = <div className="ticker" aria-hidden="true" />;

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

  // Number keys follow the menu ([1] hire … [4] projects); goTo changes every render, so re-subscribe each time.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (!shortcutsEnabled()) return;
      const path = navShortcut(event, NAV_ITEMS);
      if (!path) return;
      event.preventDefault();
      goTo(path);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <header className="site-header">
      <ChunkErrorBoundary fallback={tickerPlaceholder}>
        <Suspense fallback={tickerPlaceholder}>
          <TickerStrip />
        </Suspense>
      </ChunkErrorBoundary>
      <div className="site-header__container">
        <NavLink to="/" className="site-header__logo" onClick={closeMenu}>
          PP_
        </NavLink>

        <nav className={cls("site-nav", isOpen && "site-nav--open")} aria-label="Primary">
          <ul className="site-nav__list">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                {/* Real router links, so the base path is in the href and middle/Ctrl-click work. */}
                <Link
                  to={item.path.startsWith("#") ? { pathname: "/", hash: item.path } : item.path}
                  className="site-nav__link"
                  aria-current={location.pathname === item.path ? "page" : undefined}
                  onClick={(event) => {
                    closeMenu();
                    // Already on this section: navigating would be a no-op, so scroll instead.
                    if (item.path.startsWith("#") && location.pathname === "/" && location.hash === item.path) {
                      event.preventDefault();
                      goTo(item.path);
                    }
                  }}
                >
                  <span className="site-nav__key">[{item.key}]</span> {item.label}
                </Link>
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
