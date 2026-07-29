import { useEffect, useRef, useState } from 'react';

export function useCountUp(target: number, durationMs = 600): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const from = fromRef.current;
    if (from === target || prefersReducedMotion) {
      setValue(target);
      fromRef.current = target;
      return;
    }

    startRef.current = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / durationMs, 1);
      setValue(Math.round(from + (target - from) * progress));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, durationMs]);

  return value;
}
