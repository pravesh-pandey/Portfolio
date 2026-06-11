import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useReducedMotion } from "framer-motion";

export const useHashScroll = () => {
  const { hash } = useLocation();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!hash) return undefined;
    const frame = requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({
        behavior: reduceMotion ? "instant" : "smooth",
        block: "start"
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, reduceMotion]);
};
