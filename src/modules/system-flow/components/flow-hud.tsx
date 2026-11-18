import { LessonHud } from '@/modules/common/lesson/components/hud';

import type { HudMetric } from '../types/flow';
import type React from 'react';

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
    <LessonHud
      metrics={metrics}
      showTotal={showTotal}
      totalMs={totalMs}
      totalTestId="system-flow.hud.total.text"
      animate={animate}
    />
  );
}
