import { useCountUp } from '../hooks/use-count-up';

import type { HudMetric } from '../types';
import type React from 'react';

interface HudTileProps {
  metric: HudMetric;
  animate: boolean;
}

function HudTile({
  metric,
  animate,
}: Readonly<HudTileProps>): React.JSX.Element {
  const value = useCountUp(
    metric.valueMs ?? 0,
    animate && metric.valueMs !== undefined,
  );

  return (
    <div className="animate-hud-pop rounded-8 border border-stroke-primary bg-background-secondary p-3">
      <p className="text-xs font-medium tracking-widest text-content-tertiary uppercase">
        {metric.label}
      </p>
      {/* tile ms: angka besar; tile teks: lebih kecil dan boleh wrap agar
          nilai panjang (mis. MENUNGGU_AKTIVASI) tidak terpotong */}
      {metric.valueMs !== undefined ? (
        <p className="mt-1 text-lg font-semibold text-content-primary tabular-nums">
          {value}
          <span className="text-content-tertiary"> ms</span>
        </p>
      ) : (
        <p className="mt-1 text-sm/6 font-semibold wrap-break-word text-content-primary">
          {metric.text}
        </p>
      )}
    </div>
  );
}

interface LessonHudProps {
  metrics: readonly HudMetric[];
  /** Tampilkan tile TOTAL (gabungan semua metric ms) di akhir lesson. */
  showTotal?: boolean;
  totalMs?: number;
  /** Testid tile total, mis. "system-flow.hud.total.text". */
  totalTestId?: string;
  animate: boolean;
}

/** Deretan tile metric di atas diagram: waktu per hop, status akun, counter. */
export function LessonHud({
  metrics,
  showTotal = false,
  totalMs = 0,
  totalTestId,
  animate,
}: Readonly<LessonHudProps>): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {metrics.map((metric) => (
        <HudTile key={metric.id} metric={metric} animate={animate} />
      ))}
      {showTotal ? (
        <div
          className="animate-hud-pop rounded-8 border border-guide-500 bg-background-tertiary p-3"
          data-testid={totalTestId}
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
