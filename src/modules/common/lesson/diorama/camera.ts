import type { XY } from './iso';

/**
 * Kamera adaptif diorama: tiap langkah membingkai hanya stasiun yang sudah
 * muncul — close-up di awal, zoom-out bertahap saat scene membesar (pola
 * course acuan). Matematika murni, dipakai bersama oleh semua lesson.
 */

/** Bounds satu stasiun dalam koordinat scene (pedestal + objek + label). */
export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** Viewport kamera dalam koordinat scene: scale + translate ke tengah viewBox. */
export interface CameraView {
  scale: number;
  tx: number;
  ty: number;
}

export interface CameraOptions {
  /** ViewBox scene. */
  width: number;
  height: number;
  /** Jarak aman di sekeliling gabungan bounds. */
  pad?: number;
  /** Rentang scale: minimal (selalu pas penuh) sampai maksimal (close-up). */
  minScale?: number;
  maxScale?: number;
}

/**
 * Hitung kamera untuk gabungan bounds stasiun yang terlihat. Pemanggil
 * menentukan anchor (mis. selalu menyertakan stasiun pertama) agar bingkai
 * hanya melebar — zoom-out monoton, tidak bolak-balik.
 */
export function fitCamera(
  visible: readonly Bounds[],
  options: CameraOptions,
): CameraView {
  const { width, height } = options;
  const pad = options.pad ?? 28;
  const minScale = options.minScale ?? 1;
  const maxScale = options.maxScale ?? 1.6;

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const b of visible) {
    minX = Math.min(minX, b.minX - pad);
    minY = Math.min(minY, b.minY - pad);
    maxX = Math.max(maxX, b.maxX + pad);
    maxY = Math.max(maxY, b.maxY + pad);
  }

  const boxW = maxX - minX;
  const boxH = maxY - minY;
  const scale = Math.min(
    maxScale,
    Math.max(minScale, Math.min(width / boxW, height / boxH)),
  );
  const center: XY = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
  return {
    scale,
    tx: width / 2 - scale * center.x,
    ty: height / 2 - scale * center.y,
  };
}
