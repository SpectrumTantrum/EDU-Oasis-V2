import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_TIMEOUT = 60000;

export function useIdleTimer(timeout = DEFAULT_TIMEOUT) {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<number | null>(null);

  const resetTimer = useCallback(() => {
    setIsIdle(false);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => setIsIdle(true), timeout);
  }, [timeout]);

  useEffect(() => {
    resetTimer();
    const events = ["mousemove", "keydown", "touchstart", "scroll"];
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [resetTimer]);

  return { isIdle, resetTimer };
}
