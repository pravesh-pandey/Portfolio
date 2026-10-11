import { useEffect, useState } from "react";

// Steps `session` every `intervalMs` while `running` and the tab is visible; returns the latest snapshot.
// A hidden tab stops the interval outright, so there is no burst of catch-up steps on return.
export const useSimulation = (session, intervalMs, running = true) => {
  const [snapshot, setSnapshot] = useState(() => session.current());

  useEffect(() => {
    setSnapshot(session.current());
    if (!running) return undefined;

    let id = null;
    const start = () => {
      if (id === null && document.visibilityState === "visible") {
        id = setInterval(() => setSnapshot(session.next()), intervalMs);
      }
    };
    const stop = () => {
      clearInterval(id);
      id = null;
    };
    const onVisibilityChange = () => (document.visibilityState === "visible" ? start() : stop());

    start();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [session, intervalMs, running]);

  return snapshot;
};
