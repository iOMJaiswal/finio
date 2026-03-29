import { useEffect, useState, useRef } from 'react';

export function useCountUp(target: number, duration = 700, enabled = true): number {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const start = prevTarget.current;
    const diff = target - start;
    if (diff === 0) return;

    const startTime = performance.now();

    function easeOutCubic(t: number): number {
      return 1 - Math.pow(1 - t, 3);
    }

    let frameId: number;
    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      setValue(start + diff * eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        prevTarget.current = target;
      }
    }

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration, enabled]);

  return value;
}
