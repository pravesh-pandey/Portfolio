import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { runCommand, complete } from "./commands.js";
import { setShortcutsEnabled } from "./shortcuts.js";

const SUGGESTIONS = ["help", "hire", "trading", "resume", "lab"];
const WELCOME = { kind: "out", text: "Type help for commands. The site follows what you type." };

const resolveHref = (href) => (/^https?:/.test(href) ? href : `${import.meta.env.BASE_URL}${href}`);

const ShellDrawer = ({ inputRef, autoFocus, maximized, onToggleMaximize, onClose }) => {
  const navigate = useNavigate();
  const [lines, setLines] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [past, setPast] = useState([]);
  const [cursor, setCursor] = useState(null);
  const sectionRef = useRef(null);
  const logRef = useRef(null);

  // On touch screens, focusing the input would pop the keyboard over half the page; chips are the main input there.
  useEffect(() => {
    if (!autoFocus) return;
    if (window.matchMedia("(pointer: coarse)").matches) sectionRef.current?.focus();
    else inputRef.current?.focus();
  }, [autoFocus, inputRef]);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [lines]);

  const execute = (raw) => {
    const result = runCommand(raw);
    const entries = [{ kind: "in", text: raw }, ...result.lines.map((text) => ({ kind: "out", text }))];
    setLines((current) => (result.clear ? [] : [...current, ...entries]));
    if (raw.trim()) setPast((current) => [...current, raw]);
    setCursor(null);
    setInput("");
    if (typeof result.shortcuts === "boolean") setShortcutsEnabled(result.shortcuts);
    if (result.navigate) navigate(result.navigate);
    if (result.href) window.open(resolveHref(result.href), "_blank", "noopener,noreferrer");
    if (result.close) onClose();
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      execute(input);
    } else if (event.key === "Tab" && !event.shiftKey && input.trim()) {
      // Only completes when there's something to complete; otherwise Tab moves focus as usual (no keyboard trap).
      event.preventDefault();
      const options = complete(input);
      if (options.length === 1) setInput(`${options[0]} `);
      else if (options.length > 1) setLines((current) => [...current, { kind: "out", text: options.join("   ") }]);
    } else if (event.key === "ArrowUp" && past.length > 0) {
      event.preventDefault();
      const next = cursor === null ? past.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setInput(past[next]);
    } else if (event.key === "ArrowDown" && cursor !== null) {
      event.preventDefault();
      const next = cursor + 1;
      setCursor(next < past.length ? next : null);
      setInput(next < past.length ? past[next] : "");
    }
  };

  return (
    <section
      id="shell"
      ref={sectionRef}
      tabIndex={-1}
      className="shell"
      aria-label="Shell"
      onKeyDown={(event) => {
        // Esc closes from anywhere in the drawer: the prompt, the window buttons or a chip.
        if (event.key !== "Escape") return;
        event.preventDefault();
        onClose();
      }}
    >
      <header className="shell__bar">
        <span>pravesh@desk:~</span>
        <span className="shell__actions">
          <button type="button" onClick={onToggleMaximize} aria-pressed={maximized}>
            {maximized ? "restore" : "maximize"}
          </button>
          <button type="button" onClick={onClose} aria-label="Close shell">
            ✕
          </button>
        </span>
      </header>
      <div className="shell__log" ref={logRef} role="log" aria-live="polite">
        {lines.map((line, index) => (
          <div key={index} className={`shell__line shell__line--${line.kind}`}>
            {line.kind === "in" && <span className="shell__prompt">$ </span>}
            {line.text}
          </div>
        ))}
      </div>
      <div className="shell__chips">
        {SUGGESTIONS.map((name) => (
          <button key={name} type="button" className="chip" onClick={() => execute(name)}>
            {name}
          </button>
        ))}
      </div>
      <label className="shell__input-row">
        <span className="shell__prompt" aria-hidden="true">
          $
        </span>
        <span className="sr-only">Shell command</span>
        <input
          ref={inputRef}
          className="shell__input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
        />
      </label>
    </section>
  );
};

export default ShellDrawer;
