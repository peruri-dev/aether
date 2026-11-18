import { describe, expect, it } from 'vitest';

import { cuboid, cylinder, frontStrip, iso, isoEllipse, isoPoly } from './iso';

describe('iso (proyeksi isometrik 2:1, cermin kanan)', () => {
  it('memetakan sumbu ground sesuai matriks (-1 -0.5 1 0.5)', () => {
    expect(iso(0, 0)).toEqual({ x: 0, y: 0 });
    // +x: kiri-bawah
    expect(iso(10, 0)).toEqual({ x: -10, y: 5 });
    // +y: kanan-bawah — muka depan objek menghadap kanan-bawah penonton
    expect(iso(0, 10)).toEqual({ x: 10, y: 5 });
    // +z: ke atas
    expect(iso(0, 0, 10)).toEqual({ x: 0, y: -10 });
  });

  it('menerapkan offset scene bila diberikan', () => {
    const p = iso(10, 0, 0, { x: 100, y: 50 });
    expect(p).toEqual({ x: 90, y: 55 });
  });

  it('isoPoly menghasilkan atribut points yang bisa di-parse', () => {
    const points = isoPoly([
      [0, 0],
      [10, 0, 5],
    ]);
    const pairs = points.split(' ').map((pair) => pair.split(',').map(Number));
    expect(pairs).toEqual([
      [0, 0],
      [-10, 0],
    ]);
  });
});

describe('cuboid', () => {
  const faces = cuboid(0, 0, 10, 8, 6);

  it('setiap sisi terdiri dari empat titik', () => {
    for (const face of [faces.top, faces.right, faces.left]) {
      expect(face.split(' ')).toHaveLength(4);
    }
  });

  it('sisi kanan adalah parallelogram pada ground gx konstan', () => {
    const xs = faces.right.split(' ').map((pair) => Number(pair.split(',')[0]));
    // screen x = gy − gx: bervariasi sepanjang kedalaman, tepat dua nilai
    const unique = new Set(xs);
    expect(unique.size).toBe(2);
    expect(Math.max(...xs)).toBe(-(10 - 8));
    expect(Math.min(...xs)).toBe(-10);
  });

  it('atap berada pada ketinggian z0 + h', () => {
    const ys = faces.top.split(' ').map((pair) => Number(pair.split(',')[1]));
    // z konstan 6 → selisih y antar titik hanya dari (gx+gy)/2
    const point0 = iso(0, 0, 6);
    const point1 = iso(10, 0, 6);
    expect(ys).toEqual([point0.y, point1.y, iso(10, 8, 6).y, iso(0, 8, 6).y]);
  });
});

describe('frontStrip', () => {
  it('inset memperkecil strip dari kedua sisi', () => {
    const outer = frontStrip(0, 4, 20, 1, 2, 0);
    const inner = frontStrip(0, 4, 20, 1, 2, 3);
    const width = (points: string): number => {
      const xs = points.split(' ').map((pair) => Number(pair.split(',')[0]));
      return Math.max(...xs) - Math.min(...xs);
    };
    expect(width(outer)).toBeCloseTo(width(inner) + 6, 5);
  });
});

describe('isoEllipse', () => {
  it('berasad rasio 2:1 (iso 2:1)', () => {
    const e = isoEllipse(0, 0, 10);
    expect(e.rx).toBeCloseTo(10 * Math.SQRT2, 5);
    expect(e.ry).toBeCloseTo(e.rx / 2, 5);
  });
});

describe('cylinder', () => {
  it('dinding berupa path dengan busur bawah dan tutup ellipse', () => {
    const c = cylinder(0, 0, 10, 20, 0);
    expect(c.side).toMatch(/^M /);
    expect(c.side).toContain('A ');
    expect(c.side.endsWith('Z')).toBe(true);
    // bibir atas dan dinding berbagi tinggi ellipse yang sama
    expect(c.side).toContain(`L ${c.top.x - c.top.rx} ${c.top.y + 20}`);
  });
});
