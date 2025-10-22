import { useLocation } from "react-router-dom";
import { SiteHeader } from "@components/navigation/SiteHeader.jsx";
import { SiteFooter } from "@components/navigation/SiteFooter.jsx";
import { ScrollProgress } from "@components/common/ScrollProgress.jsx";
import { CreativeBackground } from "@components/hero/CreativeBackground.jsx";
import { useEffect } from "react";

export const AppLayout = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <>
      <CreativeBackground />
      <ScrollProgress />
      <div className="site">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </div>
    </>
  );
};
