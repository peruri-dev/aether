import { describe, expect, it } from 'vitest';

import { cameraView } from './diagram-shapes';

import type { NodeId } from '../types/flow';

const SET = (...ids: NodeId[]): Set<NodeId> => new Set<NodeId>(ids);

describe('cameraView (kamera adaptif)', () => {
  it('langkah pertama: close-up penuh di stasiun pengguna', () => {
    const cam = cameraView(SET('user'));
    expect(cam.scale).toBe(1.6);
    // pusat bingkai jatuh di sekitar stasiun pengguna
    const cx = (370 - cam.tx) / cam.scale;
    expect(cx).toBeCloseTo(130, 0);
  });

  it('zoom-out monoton seiring stasiun muncul', () => {
    const scales = [
      cameraView(SET('user')).scale,
      cameraView(SET('user', 'app')).scale,
      cameraView(SET('user', 'app', 'server')).scale,
      cameraView(SET('user', 'app', 'server', 'database')).scale,
    ];
    for (let i = 1; i < scales.length; i += 1) {
      expect(scales[i]).toBeLessThanOrEqual(scales[i - 1] as number);
    }
    expect(scales[0]).toBe(1.6);
    expect(scales[1]).toBeCloseTo(1.32, 1);
    expect(scales[scales.length - 1]).toBe(1);
  });

  it('kembali ke langkah awal tetap membingkai user walaupun set aneh', () => {
    // anchor user selalu disertakan
    const cam = cameraView(SET());
    expect(cam.scale).toBe(1.6);
    expect(Number.isFinite(cam.tx)).toBe(true);
    expect(Number.isFinite(cam.ty)).toBe(true);
  });
});
