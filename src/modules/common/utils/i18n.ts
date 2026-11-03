/**
 * Teks bilingual inline (CONVENTIONS [F2]).
 *
 * Bahasa aktif dibaca dari atribut `lang` di <html>, yang diatur oleh base-layout.astro.
 * Di server (frontmatter, endpoint) belum ada <html>, jadi dipakai DEFAULT_LOCALE.
 *
 * Catatan: schema Zod dievaluasi saat modul dimuat, jadi pergantian bahasa
 * berlaku setelah halaman dimuat ulang. Ini sesuai dengan navigasi full reload kita.
 */
export type Locale = 'id' | 'en';

export const DEFAULT_LOCALE: Locale = 'id';

export function getLocale(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  return document.documentElement.lang.toLowerCase().startsWith('en')
    ? 'en'
    : 'id';
}

export function text(id: string, en: string): string {
  return getLocale() === 'en' ? en : id;
}
