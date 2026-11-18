import { parseStepParam as parseStepNumber } from '@/modules/common/lesson/utils';

import { STEPS_AKTIVASI } from './steps-activation';
import { STEPS_SESI } from './steps-session';

/**
 * Sepuluh langkah perjalanan login Dashbent Backoffice: fase aktivasi
 * (steps-activation.ts) lalu fase login & proteksi (steps-session.ts).
 * Sumber tunggal urutan langkah; helper runtime ada di steps-runtime.ts.
 */
export const STEPS = [...STEPS_AKTIVASI, ...STEPS_SESI] as const;

/**
 * Parse param path langkah (mis. "4" dari /dashbent/login-flow/4). null
 * berarti tidak valid — halaman .astro menjawab 404. Aturan parsing bersama
 * ada di common/lesson.
 */
export function parseStepParam(raw: string | undefined): number | null {
  return parseStepNumber(raw, STEPS.length);
}
