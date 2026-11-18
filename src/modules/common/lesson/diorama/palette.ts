import type { IsoFillKey } from './iso';

/**
 * Palet warna scene via CSS variable token (pola yang sama dengan
 * var(--color-chart-*): satu-satunya cara memakai nilai token mentah untuk SVG).
 * Warna netral sengaja konstan di kedua tema agar diorama terlihat terang di
 * atas pelat yang ikut berubah tema. Dipakai bersama oleh semua lesson.
 */
export const ISO_FILL = {
  slabTop: 'var(--color-background-primary)',
  slabSide: 'var(--color-background-tertiary)',
  gridLine: 'var(--color-stroke-tertiary)',
  platformTop: 'var(--color-background-tertiary)',
  platformSide: 'var(--color-neutral-200)',
  platformSide2: 'var(--color-neutral-300)',
  faceTop: 'var(--color-neutral-100)',
  faceRight: 'var(--color-neutral-200)',
  faceLeft: 'var(--color-neutral-300)',
  detail: 'var(--color-neutral-50)',
  screenTile: 'var(--color-guide-200)',
  led: 'var(--color-positive-600)',
  ledWarm: 'var(--color-warning-600)',
  ink: 'var(--color-neutral-900)',
  figureShadow: 'var(--color-neutral-900)',
  figureCloth1: 'var(--color-chart-categorical-01)',
  figureCloth2: 'var(--color-chart-categorical-04)',
  figureCloth3: 'var(--color-chart-categorical-07)',
  figureCloth4: 'var(--color-chart-categorical-09)',
  figureCloth5: 'var(--color-chart-categorical-02)',
} as const satisfies Record<IsoFillKey, string>;
