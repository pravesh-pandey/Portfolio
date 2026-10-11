// Single-key shortcuts (` and 1–5) can be switched off, as WCAG 2.1.4 requires:
// speech-input users can otherwise trigger them by accident.
const STORAGE_KEY = "pp-shortcuts";
let fallback = true; // used when storage is blocked

export const shortcutsEnabled = () => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === null ? fallback : saved === "on";
  } catch {
    return fallback;
  }
};

export const setShortcutsEnabled = (enabled) => {
  fallback = enabled;
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // Storage unavailable: the choice lasts for this page view.
  }
};
