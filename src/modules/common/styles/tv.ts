import { createTV } from 'tailwind-variants/config';

import { twMergeConfig } from './cx';

/**
 * `tv` dengan konfigurasi merge yang sama dengan `cx`.
 * Jangan impor `tv` langsung dari 'tailwind-variants': tanpa config ini,
 * `rounded-4` dan `rounded-8` tidak dianggap bentrok (ESLint menolaknya).
 */
export const tv = createTV({ twMergeConfig });

export type { VariantProps } from 'tailwind-variants';
