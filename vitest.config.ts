/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// getViteConfig memakai konfigurasi Vite milik Astro, jadi alias @/ dan astro:env ikut terbaca.
export default getViteConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    css: false,
    clearMocks: true,
  },
});
