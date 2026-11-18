import { useEffect, useState } from 'react';

const TICK_MS = 16;
const RAMP_MS = 600;

/**
 * Naikkan nilai dari 0 ke target dalam ~600 ms untuk efek counter HUD.
 * animate=false (mis. prefers-reduced-motion): nilai final langsung, tanpa interval.
 */
export function useCountUp(target: number, animate: boolean): number {
  const [value, setValue] = useState<number>(() => (animate ? 0 : target));

  useEffect(() => {
    if (!animate) {
      setValue(target);
      return;
    }
    setValue(0);
    const totalTicks = Math.max(1, Math.ceil(RAMP_MS / TICK_MS));
    let tick = 0;
    const timer = window.setInterval(() => {
      tick += 1;
      if (tick >= totalTicks) {
        setValue(target);
        window.clearInterval(timer);
        return;
      }
      setValue(Math.round((target * tick) / totalTicks));
    }, TICK_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, [animate, target]);

  return value;
}
