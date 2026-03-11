import { useState, useEffect, useRef } from 'react';

/**
 * useTimer – countdown timer hook
 * @param {number} initialSeconds  – starting seconds (e.g. 1800 for 30 min)
 * @param {boolean} running        – start/stop
 * @param {Function} onComplete    – called when timer reaches 0
 */
export function useTimer(initialSeconds, running = false, onComplete) {
  const [secs, setSecs] = useState(initialSeconds);
  const ref = useRef(null);

  useEffect(() => {
    setSecs(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!running) { clearInterval(ref.current); return; }
    ref.current = setInterval(() => {
      setSecs(s => {
        if (s <= 1) {
          clearInterval(ref.current);
          onComplete?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [running]);

  const minutes = Math.floor(secs / 60);
  const seconds = secs % 60;
  const display = `${minutes}:${String(seconds).padStart(2, '0')}`;
  const progress = secs / initialSeconds; // 1 → 0

  return { secs, minutes, seconds, display, progress };
}
