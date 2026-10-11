import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pp-shell";

// Open/maximized state, remembered per visitor. Storage can be blocked (private mode),
// so every access is guarded and the shell simply forgets its state there.
const load = () => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY)) ?? {};
    return { open: saved.open === true, maximized: saved.maximized === true };
  } catch {
    return { open: false, maximized: false };
  }
};

export const useShellState = () => {
  const [state, setState] = useState(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable: state lasts for this page view only.
    }
  }, [state]);

  const setOpen = useCallback((open) => setState((current) => ({ ...current, open })), []);
  const toggleMaximized = useCallback(
    () => setState((current) => ({ ...current, maximized: !current.maximized })),
    []
  );

  return { ...state, setOpen, toggleMaximized };
};
