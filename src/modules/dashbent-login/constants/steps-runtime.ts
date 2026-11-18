import { STEPS } from './steps';

import type { AccountStatus, FlowStep } from '../types/flow';

export const LAST_STEP_INDEX = STEPS.length - 1;

/** Ambil langkah dengan indeks yang sudah di-clamp, tanpa nilai undefined. */
export function getStep(index: number): FlowStep {
  const clamped = Math.min(Math.max(index, 0), LAST_STEP_INDEX);
  const step = STEPS[clamped];
  if (!step) {
    throw new Error(`Langkah pada indeks ${clamped} tidak ada`);
  }
  return step;
}

/** Jeda autoplay satu langkah: rantai hop terlama + waktu baca. */
export function stepPaceMs(step: FlowStep): number {
  const moveMs = Math.max(
    0,
    ...step.moves.map((move) => move.durationMs + move.delayMs),
  );
  return moveMs + 1500;
}

/** Status akun yang dilalui lesson, untuk validasi urutan naratif. */
export const STATUS_PROGRESSION: readonly AccountStatus[] = STEPS.map(
  (step) => {
    const statusMetric = step.metrics.find((metric) => metric.id === 'status');
    return (statusMetric?.text ?? 'AKTIF') as AccountStatus;
  },
);
