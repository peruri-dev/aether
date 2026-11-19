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
  LABEL_ABOVE_IDS,
  SLAB_SHAPES,
  SLAB_TOP_POINTS,
  STATION_PING,
  STATION_SHAPES,
} from './diagram-shapes';

import type { NodeId } from '../types/flow';

const NODE_IDS: readonly NodeId[] = [
  'login',
  'sign',
  'backend',
  'oss',
  'core',
  'soa',
  'kms',
];

function parsePoints(points: string): Array<[number, number]> {
  return points
    .split(' ')
    .map((pair) => pair.split(',').map(Number) as [number, number]);
}

describe('layout scene tanda tangan digital', () => {
  it('mengenali semua stasiun dan edge bertetangga', () => {
    for (const id of NODE_IDS) {
      expect(diagramNode(id).id).toBe(id);
    }
    expect(DIAGRAM.edges).toHaveLength(6);
    expect(edgePairKey('backend', 'login')).toBe('backend-login');
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
      if (LABEL_ABOVE_IDS.has(id)) {
        // caption menggantung di atas: pill paling atas tidak keluar viewBox
        expect(c.y - DIAGRAM.labelGapAbove - 14 - pill.h).toBeGreaterThan(0);
        expect(c.y + DIAGRAM.platform.h).toBeLessThan(DIAGRAM.height);
      } else {
        expect(c.y + DIAGRAM.labelGap + pill.h).toBeLessThan(DIAGRAM.height);
      }
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
      // packet bergerak dua arah (mis. rantai balik), jadi tanpa asersi arah
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

describe('bentuk stasiun tanda tangan digital', () => {
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

  it('panel halaman berisi konten layar, rack berisi lampu status', () => {
    // panel: minimal satu strip screenTile (header halaman)
    for (const id of ['login', 'sign', 'oss'] as const) {
      const hasTile = STATION_SHAPES[id]?.object.some(
        (shape) => shape.fill === 'screenTile',
      );
      expect(hasTile).toBe(true);
    }
    // Halaman Tanda Tangan Digital punya goresan tinta di kanvas
    const signFills = new Set(
      STATION_SHAPES['sign']?.object.map((s) => s.fill),
    );
    expect(signFills.has('ink')).toBe(true);
    // rack layanan: ada lampu led atau ledWarm
    for (const id of ['backend', 'core', 'soa', 'kms'] as const) {
      const fills = new Set(STATION_SHAPES[id]?.object.map((s) => s.fill));
      expect(fills.has('led') || fills.has('ledWarm')).toBe(true);
    }
  });
});

describe('cameraView (kamera adaptif tanda tangan digital)', () => {
  const SET = (...ids: NodeId[]): Set<NodeId> => new Set<NodeId>(ids);

  it('langkah pertama: close-up di Halaman Login', () => {
    const cam = cameraView(SET('login'));
    expect(cam.scale).toBe(1.5);
    const cx = (DIAGRAM.width / 2 - cam.tx) / cam.scale;
    expect(cx).toBeCloseTo(STATION_SCREEN['login'].x, 0);
  });

  it('zoom-out monoton mengikuti urutan reveal pelajaran', () => {
    const scales = [
      cameraView(SET('login', 'backend')).scale,
      cameraView(SET('login', 'backend', 'sign')).scale,
      cameraView(SET('login', 'backend', 'sign', 'oss')).scale,
      cameraView(SET('login', 'backend', 'sign', 'oss', 'core', 'soa', 'kms'))
        .scale,
    ];
    for (let i = 1; i < scales.length; i += 1) {
      expect(scales[i]).toBeLessThanOrEqual(scales[i - 1] as number);
    }
    expect(scales[scales.length - 1]).toBeGreaterThanOrEqual(1);
  });
});
