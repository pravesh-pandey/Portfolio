import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { SiteHeader } from "@components/navigation/SiteHeader.jsx";
import { SiteFooter } from "@components/navigation/SiteFooter.jsx";
import { ScrollProgress } from "@components/common/ScrollProgress.jsx";
import { AmbientBackground } from "@components/background/AmbientBackground.jsx";

export const AppLayout = ({ children }) => {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" });
    }
  }, [location.pathname, location.hash, reduceMotion]);

  return (
    <>
      <AmbientBackground />
      <ScrollProgress />
      <div className="site">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </div>
    </>
  );
};
