import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { useTypewriter } from "@hooks/useTypewriter.js";
import "./heroSection.css";

const TAGLINE = "> pravesh pandey · sde @ amazon alexa ai · quant dev";

const PATHS = [
  { key: "1", to: "/work-with-me", title: "Hire me", detail: "Projects & Upwork" },
  { key: "2", to: "/trading", title: "Trading systems", detail: "Order flow, backtesting" },
  { key: "3", to: { pathname: "/", hash: "#experience" }, title: "Experience", detail: "Track record & CV" }
];

// The tagline types out once per visit; coming back to the home page shows it instantly.
let taglineTyped = false;

export const HeroSection = () => {
  const reduceMotion = useReducedMotion();
  const [firstVisit] = useState(() => !taglineTyped);
  const typed = useTypewriter(TAGLINE, reduceMotion || !firstVisit ? 0 : 35);

  useEffect(() => {
    taglineTyped = true;
  }, []);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <p className="hero__tag">
        <span className="sr-only">{TAGLINE}</span>
        <span aria-hidden="true">{typed}</span>
      </p>
      <h1 className="hero__title" id="hero-title">
        Backend systems at Amazon scale.{" "}
        <span className="hero__accent">
          Trading systems at market speed.
          <span className="hero__cursor" aria-hidden="true" />
        </span>
      </h1>
      <p className="hero__lead">
        I design, build and ship software that has to be fast and correct, for clients, teams and markets.
      </p>
      <nav className="hero__paths" aria-label="Choose a path">
        {PATHS.map((path) => (
          <Link key={path.key} className="hero__path" to={path.to}>
            <span className="hero__path-title">
              <span className="hero__path-key">[{path.key}]</span> {path.title} →
            </span>
            <span className="hero__path-detail">{path.detail}</span>
          </Link>
        ))}
      </nav>
    </section>
  );
};
