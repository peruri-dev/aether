import { describe, expect, it } from 'vitest';

import {
  DIAGRAM,
  diagramNode,
  edgeEnds,
  edgePairKey,
  STATION_SCREEN,
} from './diagram';
import {
  GRID_LINES,
  ISO_FILL,
  SLAB_SHAPES,
  SLAB_TOP_POINTS,
  STATION_PING,
  STATION_SHAPES,
} from './diagram-shapes';

import type { NodeId } from '../types/flow';

const NODE_IDS: readonly NodeId[] = ['user', 'app', 'server', 'database'];

function parsePoints(points: string): Array<[number, number]> {
  return points
    .split(' ')
    .map((pair) => pair.split(',').map(Number) as [number, number]);
}

describe('layout scene', () => {
  it('mengenali semua stasiun dan edge bertetangga', () => {
    for (const id of NODE_IDS) {
      expect(diagramNode(id).id).toBe(id);
    }
    expect(DIAGRAM.edges).toHaveLength(3);
    expect(edgePairKey('database', 'server')).toBe('database-server');
  });

  it('semua stasiun, ping, dan label berada di dalam viewBox', () => {
    for (const id of NODE_IDS) {
      const c = STATION_SCREEN[id];
      const pill = DIAGRAM.labelPill;
      expect(c.x - pill.w / 2).toBeGreaterThan(0);
      expect(c.x + pill.w / 2).toBeLessThan(DIAGRAM.width);
      const ping = STATION_PING[id];
      expect(ping.x - ping.rx).toBeGreaterThan(0);
      expect(ping.x + ping.rx).toBeLessThan(DIAGRAM.width);
      // label pill di bawah pusat, tetap dalam kanvas
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

  it('jalur edge bergerak diagonal ke kanan dan tidak nol', () => {
    for (const edge of DIAGRAM.edges) {
      const { start, end } = edgeEnds(edge.from, edge.to);
      expect(end.x).toBeGreaterThan(start.x);
      const length = Math.hypot(end.x - start.x, end.y - start.y);
      expect(length).toBeGreaterThan(20);
    }
  });

  it('garis grid berada di dalam pelat', () => {
    const xs = parsePoints(SLAB_TOP_POINTS).map(([x]) => x);
    const ys = parsePoints(SLAB_TOP_POINTS).map(([, y]) => y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    expect(GRID_LINES.length).toBeGreaterThan(8);
    for (const line of GRID_LINES) {
      for (const [x, y] of [
        [line.x1, line.y1],
        [line.x2, line.y2],
      ] as const) {
        expect(x).toBeGreaterThanOrEqual(minX - 1);
        expect(x).toBeLessThanOrEqual(maxX + 1);
        expect(y).toBeGreaterThanOrEqual(minY - 1);
        expect(y).toBeLessThanOrEqual(maxY + 1);
      }
    }
  });
});

describe('bentuk stasiun', () => {
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

  it('slab terdiri dari tiga sisi dan fill-nya valid', () => {
    expect(SLAB_SHAPES).toHaveLength(3);
    for (const shape of SLAB_SHAPES) {
      expect(ISO_FILL).toHaveProperty(shape.fill);
    }
  });

  it('stasiun user berupa kerumunan lima figur (bayangan, tubuh, kepala)', () => {
    const figures = STATION_SHAPES['user']?.object ?? [];
    expect(figures).toHaveLength(15);
    // kepala = ellipse lingkaran (rx === ry); bayangan = ellipse pipih 2:1
    const heads = figures.filter(
      (shape) => shape.kind === 'ellipse' && shape.rx === shape.ry,
    );
    expect(heads).toHaveLength(5);
    // pakaian figur beragam, tidak semua satu warna
    const clothes = new Set(
      figures
        .filter((shape) => shape.kind === 'path')
        .map((shape) => shape.fill),
    );
    expect(clothes.size).toBeGreaterThanOrEqual(5);
  });
});
