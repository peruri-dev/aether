/**
 * Parse param path langkah (mis. "3" dari /lesson/3) menjadi nomor langkah
 * 1..max. null berarti tidak valid — halaman .astro menjawab 404.
 */
export function parseStepParam(
  raw: string | undefined,
  max: number,
): number | null {
  if (raw === undefined || !/^\d+$/.test(raw)) return null;
  const value = Number.parseInt(raw, 10);
  if (value < 1 || value > max) return null;
  return value;
}
