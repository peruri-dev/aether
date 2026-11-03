import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Nilai theme yang tidak dikenal tailwind-merge secara default.
 * Tanpa ini, `cx('rounded-4', 'rounded-8')` tidak menghapus salah satunya.
 * Sesuaikan bila design-tokens menambah skala baru.
 */
export const twMergeConfig = {
  extend: {
    theme: {
      radius: ['4', '8', '12', '16', '24', '32', 'full'],
    },
  },
};

const twMerge = extendTailwindMerge(twMergeConfig);

/** Gabungkan class Tailwind: kondisional (clsx) lalu hapus yang bentrok (tailwind-merge). */
export function cx(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
