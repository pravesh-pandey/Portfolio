import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { StatusBar } from "@components/navigation/StatusBar.jsx";
import { ChunkErrorBoundary } from "@components/common/ChunkErrorBoundary.jsx";
import { useShellState } from "./useShellState.js";
import { isShellToggleKey } from "./hotkey.js";
import { shortcutsEnabled } from "./shortcuts.js";
import "./shell.css";

const ShellDrawer = lazy(() => import("./ShellDrawer.jsx"));

export const ShellHost = () => {
  const { open, maximized, setOpen, toggleMaximized } = useShellState();
  // Only a visitor's own click or keypress moves focus into the shell; a drawer restored
  // from an earlier visit must not steal focus on page load.
  const [focusOnOpen, setFocusOnOpen] = useState(false);
  const buttonRef = useRef(null);
  const inputRef = useRef(null);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, [setOpen]);

  const toggle = useCallback(() => {
    if (open) {
      close();
    } else {
      setFocusOnOpen(true);
      setOpen(true);
    }
  }, [open, close, setOpen]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!isShellToggleKey(event, inputRef.current)) return;
      if (event.target !== inputRef.current && !shortcutsEnabled()) return;
      event.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  // shell.css sizes the drawer and pads the page from this attribute, so content stays reachable.
  useEffect(() => {
    document.body.dataset.shell = open ? (maximized ? "max" : "open") : "";
  }, [open, maximized]);

  return (
    <>
      {open && (
        <ChunkErrorBoundary className="pane shell-error">
          <Suspense fallback={null}>
            <ShellDrawer
              inputRef={inputRef}
              autoFocus={focusOnOpen}
              maximized={maximized}
              onToggleMaximize={toggleMaximized}
              onClose={close}
            />
          </Suspense>
        </ChunkErrorBoundary>
      )}
      <StatusBar>
        <button
          ref={buttonRef}
          type="button"
          className={`status-bar__shell${open ? " status-bar__shell--on" : ""}`}
          aria-expanded={open}
          aria-controls={open ? "shell" : undefined}
          onClick={toggle}
        >
          {">_ Shell"}
        </button>
        <span className="status-bar__hint">` shell · 1–5 menu</span>
      </StatusBar>
    </>
  );
};
