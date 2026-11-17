/**
 * Class state interaktif bersama (pengganti `tremor.ts` di project acuan).
 * Pakai lewat cx/tv: `cx(focusInput, hasError && hasErrorInput)`.
 * Urutan penting: hasErrorInput ditaruh setelah focusInput agar menang saat bentrok.
 */

/** Input, textarea, select trigger saat fokus. */
export const focusInput = [
  'focus:ring-2',
  'focus:ring-stroke-primary',
  'focus:border-stroke-tertiary',
];

/** Elemen yang fokusnya lewat keyboard: tombol, checkbox, link, trigger. */
export const focusRing = [
  'outline outline-offset-2 outline-0 focus-visible:outline-2',
  // lama: outline-blue-500 (palet bawaan Tailwind, tidak tersedia di Aether)
  'outline-guide-500',
];

/**
 * Input tidak valid. Versi lama hanya mengubah border, sehingga warna merah hilang
 * begitu input difokus. Sekarang state fokus ikut merah.
 */
export const hasErrorInput = [
  'border-negative-500',
  'focus:border-negative-500',
  'focus:ring-negative-100',
];
