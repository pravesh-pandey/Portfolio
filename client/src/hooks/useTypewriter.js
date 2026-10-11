import { useEffect, useState } from "react";

// Reveals `text` one character every `msPerChar` ms; msPerChar <= 0 returns the full text.
export const useTypewriter = (text, msPerChar) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (msPerChar <= 0 || count >= text.length) return undefined;
    const id = setTimeout(() => setCount(count + 1), msPerChar);
    return () => clearTimeout(id);
  }, [count, text, msPerChar]);

  return msPerChar <= 0 ? text : text.slice(0, count);
};
