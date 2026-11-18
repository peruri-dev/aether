import { useCallback, useState } from 'react';

export type Theme = 'light' | 'dark';

function readTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'dark'
    : 'light';
}

/**
 * Baca/flip atribut `data-theme` di <html>. Tanpa persistensi: base-layout.astro
 * menentukan nilai awal per render server, jadi pilihan kembali setelah navigasi
 * penuh. Follow-up bila perlu: simpan preferensi di cookie, bukan localStorage.
 */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(readTheme);

  const toggle = useCallback((): void => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
