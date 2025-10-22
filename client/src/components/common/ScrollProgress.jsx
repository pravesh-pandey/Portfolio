import { useEffect, useState } from "react";

export const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const percentage = maxScroll > 0 ? Math.min((scrolled / maxScroll) * 100, 100) : 0;
      setProgress(percentage);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "4px",
        width: `${progress}%`,
        background: "linear-gradient(90deg, #7c4dff, #36e0f8)",
        boxShadow: "0 0 18px rgba(124, 77, 255, 0.6)",
        zIndex: 20,
        transition: "width 0.18s ease-out"
      }}
    />
  );
};
