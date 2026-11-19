import { parseStepParam as parseStepNumber } from '@/modules/common/lesson/utils';

import { STEPS_DOKUMEN } from './steps-document';
import { STEPS_TANDA_TANGAN } from './steps-signing';

/**
 * Sebelas langkah perjalanan tanda tangan digital dokumen: fase dokumen
 * (steps-document.ts) lalu fase tanda tangan & hasil (steps-signing.ts).
 * Sumber tunggal urutan langkah; helper runtime ada di steps-runtime.ts.
 */
export const STEPS = [...STEPS_DOKUMEN, ...STEPS_TANDA_TANGAN] as const;

/**
 * Parse param path langkah (mis. "4" dari /digital-document/4). null
 * berarti tidak valid — halaman .astro menjawab 404. Aturan parsing bersama
 * ada di common/lesson.
 */
export function parseStepParam(raw: string | undefined): number | null {
  return parseStepNumber(raw, STEPS.length);
}
