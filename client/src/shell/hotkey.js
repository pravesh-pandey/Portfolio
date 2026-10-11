const EDITABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

const isTypingIn = (target) => Boolean(target) && (EDITABLE_TAGS.has(target.tagName) || target.isContentEditable);
const hasModifier = (event) => event.ctrlKey || event.metaKey || event.altKey;

// True when a keydown should open/close the shell: a bare backtick outside form fields,
// or inside the shell's own input while that input is empty.
export const isShellToggleKey = (event, shellInput) => {
  if (event.key !== "`" || hasModifier(event)) return false;
  if (shellInput && event.target === shellInput) return shellInput.value === "";
  return !isTypingIn(event.target);
};

// The route for a bare number key matching a nav item's key ("1"–"5"), or null.
// Never fires while typing, so digits still work in forms and in the shell.
export const navShortcut = (event, items) => {
  if (hasModifier(event) || isTypingIn(event.target)) return null;
  return items.find((item) => item.key === event.key)?.path ?? null;
};
