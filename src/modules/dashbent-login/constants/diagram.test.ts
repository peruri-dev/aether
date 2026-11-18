import { describe, expect, it } from 'vitest';

import {
  DIAGRAM,
  diagramNode,
  edgeEnds,
  edgePairKey,
  STATION_SCREEN,
} from './diagram';
import {
  cameraView,
  GRID_LINES,
  ISO_FILL,
  SLAB_SHAPES,
  SLAB_TOP_POINTS,
  STATION_PING,
  STATION_SHAPES,
} from './diagram-shapes';

import type { NodeId } from '../types/flow';

const NODE_IDS: readonly NodeId[] = [
  'login',
  'api',
  'password',
  'totp',
  'verify',
  'dashboard',
];

function parsePoints(points: string): Array<[number, number]> {
  return points
    .split(' ')
    .map((pair) => pair.split(',').map(Number) as [number, number]);
}

describe('layout scene login', () => {
  it('mengenali semua stasiun dan edge bertetangga', () => {
    for (const id of NODE_IDS) {
      expect(diagramNode(id).id).toBe(id);
    }
    expect(DIAGRAM.edges).toHaveLength(5);
    expect(edgePairKey('api', 'login')).toBe('api-login');
  });

  it('semua stasiun, ping, dan pill berada di dalam viewBox', () => {
    for (const id of NODE_IDS) {
      const c = STATION_SCREEN[id];
      const pill = DIAGRAM.labelPill;
      expect(c.x - pill.w / 2).toBeGreaterThan(0);
      expect(c.x + pill.w / 2).toBeLessThan(DIAGRAM.width);
      const ping = STATION_PING[id];
      expect(ping.x - ping.rx).toBeGreaterThan(0);
      expect(ping.x + ping.rx).toBeLessThan(DIAGRAM.width);
      expect(c.y + DIAGRAM.labelGap + pill.h).toBeLessThan(DIAGRAM.height);
    }
  });

  it('pelat dasar berada di dalam viewBox', () => {
    const corners = parsePoints(SLAB_TOP_POINTS);
    for (const [x, y] of corners) {
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(DIAGRAM.width);
      expect(y).toBeGreaterThan(0);
      expect(y + DIAGRAM.slab.thickness).toBeLessThan(DIAGRAM.height);
    }
  });

  it('jalur edge cukup panjang dan terpangkas dari pusat stasiun', () => {
    for (const edge of DIAGRAM.edges) {
      const { start, end } = edgeEnds(edge.from, edge.to);
      // hub layout: edge ke API berlaku dua arah, jadi tanpa asersi arah
      const length = Math.hypot(end.x - start.x, end.y - start.y);
      expect(length).toBeGreaterThan(20);
      const a = STATION_SCREEN[edge.from];
      const b = STATION_SCREEN[edge.to];
      // ujung terpangkas edgeTrim dari masing-masing pusat
      expect(Math.hypot(start.x - a.x, start.y - a.y)).toBeCloseTo(
        DIAGRAM.edgeTrim,
        0,
      );
      expect(Math.hypot(end.x - b.x, end.y - b.y)).toBeCloseTo(
        DIAGRAM.edgeTrim,
        0,
      );
    }
  });
});

describe('bentuk stasiun login', () => {
  it('setiap stasiun punya pedestal dan objek dengan fill yang valid', () => {
    for (const id of NODE_IDS) {
      const station = STATION_SHAPES[id];
      expect(station.platform.length).toBe(3);
      expect(station.object.length).toBeGreaterThan(0);
      for (const shape of [...station.platform, ...station.object]) {
        expect(ISO_FILL).toHaveProperty(shape.fill);
        if (shape.kind === 'polygon') {
          expect(parsePoints(shape.points)).toHaveLength(4);
        }
      }
    }
  });

  it('slab terdiri dari tiga sisi dan grid lebih dari delapan garis', () => {
    expect(SLAB_SHAPES).toHaveLength(3);
    for (const shape of SLAB_SHAPES) {
      expect(ISO_FILL).toHaveProperty(shape.fill);
    }
    expect(GRID_LINES.length).toBeGreaterThan(8);
  });

  it('panel halaman berisi konten layar, rack API berisi lampu status', () => {
    // panel: minimal satu strip screenTile (header halaman)
    for (const id of [
      'login',
      'password',
      'totp',
      'verify',
      'dashboard',
    ] as const) {
      const hasTile = STATION_SHAPES[id]?.object.some(
        (shape) => shape.fill === 'screenTile',
      );
      expect(hasTile).toBe(true);
    }
    // rack API: ada lampu led dan ledWarm
    const apiFills = new Set(STATION_SHAPES['api']?.object.map((s) => s.fill));
    expect(apiFills.has('led')).toBe(true);
    expect(apiFills.has('ledWarm')).toBe(true);
  });
});

describe('cameraView (kamera adaptif login)', () => {
  const SET = (...ids: NodeId[]): Set<NodeId> => new Set<NodeId>(ids);

  it('langkah pertama: close-up di Halaman Login', () => {
    const cam = cameraView(SET('login'));
    expect(cam.scale).toBe(1.5);
    const cx = (DIAGRAM.width / 2 - cam.tx) / cam.scale;
    expect(cx).toBeCloseTo(STATION_SCREEN['login'].x, 0);
  });

  it('zoom-out monoton sampai seluruh scene pas', () => {
    const scales = [
      cameraView(SET('login')).scale,
      cameraView(SET('login', 'api')).scale,
      cameraView(SET('login', 'api', 'password')).scale,
      cameraView(SET('login', 'api', 'password', 'totp', 'verify', 'dashboard'))
        .scale,
    ];
    for (let i = 1; i < scales.length; i += 1) {
      expect(scales[i]).toBeLessThanOrEqual(scales[i - 1] as number);
    }
    expect(scales[scales.length - 1]).toBeGreaterThanOrEqual(1);
  });
});
