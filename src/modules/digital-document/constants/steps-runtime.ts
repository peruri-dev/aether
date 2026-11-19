import { STEPS } from './steps';

import type { DocStatus, FlowStep } from '../types/flow';

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

/** Status dokumen yang dilalui lesson, untuk validasi urutan naratif. */
export const DOC_PROGRESSION: readonly DocStatus[] = STEPS.map((step) => {
  const docMetric = step.metrics.find((metric) => metric.id === 'doc');
  return (docMetric?.text ?? 'Ditandatangani') as DocStatus;
});
