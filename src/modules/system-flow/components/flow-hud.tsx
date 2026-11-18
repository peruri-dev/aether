import { useCountUp } from '../hooks/use-count-up';

import type { HudMetric } from '../types/flow';
import type React from 'react';

interface HudTileProps {
  label: string;
  valueMs: number;
  animate: boolean;
}

function HudTile({
  label,
  valueMs,
  animate,
}: Readonly<HudTileProps>): React.JSX.Element {
  const value = useCountUp(valueMs, animate);

  return (
    <div className="animate-hud-pop rounded-8 border border-stroke-primary bg-background-secondary p-3">
      <p className="text-xs font-medium tracking-widest text-content-tertiary uppercase">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-content-primary tabular-nums">
        {value}
        <span className="text-content-tertiary"> ms</span>
      </p>
    </div>
  );
}

interface FlowHudProps {
  /** Metric yang sudah terungkap (langkah 0..aktif), urut sesuai langkah. */
  metrics: readonly HudMetric[];
  /** Tampilkan tile TOTAL (hanya di langkah terakhir). */
  showTotal: boolean;
  totalMs: number;
  animate: boolean;
}

/** Baris stat waktu di atas diagram: satu tile per metric, plus TOTAL di akhir. */
export default function FlowHud({
  metrics,
  showTotal,
  totalMs,
  animate,
}: Readonly<FlowHudProps>): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {metrics.map((metric) => (
        <HudTile
          key={metric.id}
          label={metric.label}
          valueMs={metric.valueMs}
          animate={animate}
        />
      ))}
      {showTotal ? (
        <div
          className="animate-hud-pop rounded-8 border border-guide-500 bg-background-tertiary p-3"
          data-testid="system-flow.hud.total.text"
        >
          <p className="text-xs font-medium tracking-widest text-content-guide uppercase">
            Total
          </p>
          <p className="mt-1 text-lg font-semibold text-content-primary tabular-nums">
            {totalMs}
            <span className="text-content-tertiary"> ms</span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
