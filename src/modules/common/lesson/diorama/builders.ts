import { cuboid, frontStrip, iso, isoEllipse, isoPoly } from './iso';

import type { IsoEllipse, IsoFillKey, IsoShape, LineSeg, XY } from './iso';

/** Persegi panjang di bidang ground, mis. pelat dasar scene. */
export interface GroundRect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** Polygon berisi kotak isometrik: sisi dulu, atap terakhir (painter's algorithm). */
export function buildBox(
  offset: XY,
  x: number,
  y: number,
  w: number,
  d: number,
  h: number,
  z0: number,
): IsoShape[] {
  const faces = cuboid(x, y, w, d, h, z0, offset);
  return [
    { kind: 'polygon', points: faces.right, fill: 'faceRight', stroke: true },
    { kind: 'polygon', points: faces.left, fill: 'faceLeft', stroke: true },
    { kind: 'polygon', points: faces.top, fill: 'faceTop', stroke: true },
  ];
}

/** Strip konten di bidang depan (+gy) sebuah kotak: layar, field, ventilasi. */
export function buildStrip(
  offset: XY,
  x: number,
  y: number,
  w: number,
  z1: number,
  z2: number,
  inset: number,
  fill: IsoFillKey,
): IsoShape {
  return {
    kind: 'polygon',
    points: frontStrip(x, y, w, z1, z2, inset, offset),
    fill,
    stroke: false,
  };
}

/** Dot di bidang muka depan (+gy): lampu indikator, dot URL. */
export function buildFaceDot(
  offset: XY,
  x: number,
  y: number,
  z: number,
  r: number,
  fill: IsoFillKey,
): IsoShape {
  const p = iso(x, y, z, offset);
  return { kind: 'circle', cx: p.x, cy: p.y, r, fill, stroke: false };
}

/**
 * Pedestal stasiun: pusat ground (gx, gy), lebar pw (arah gx), kedalaman d,
 * tinggi h. Tiga sisi terurut painter's algorithm.
 */
export function buildPlatform(
  offset: XY,
  gx: number,
  gy: number,
  pw: number,
  d: number,
  h: number,
): IsoShape[] {
  const faces = cuboid(gx - pw / 2, gy - d / 2, pw, d, h, 0, offset);
  return [
    {
      kind: 'polygon',
      points: faces.right,
      fill: 'platformSide',
      stroke: true,
    },
    {
      kind: 'polygon',
      points: faces.left,
      fill: 'platformSide2',
      stroke: true,
    },
    { kind: 'polygon', points: faces.top, fill: 'platformTop', stroke: true },
  ];
}

/** Cincin ping isometrik di atas pedestal stasiun aktif. */
export function buildPing(
  offset: XY,
  gx: number,
  gy: number,
  r: number,
  z: number,
): IsoEllipse {
  return isoEllipse(gx, gy, r, z, offset);
}

/** Pusat atas pedestal stasiun, dalam koordinat layar. */
export function stationCenter(
  offset: XY,
  gx: number,
  gy: number,
  z: number,
): XY {
  const p = iso(gx, gy, z, offset);
  return { x: p.x, y: p.y };
}

/** Pelat dasar scene: sisi extruded + bidang atas, plus points polygon atasnya. */
export function buildSlab(
  offset: XY,
  slab: GroundRect & { thickness: number },
): { shapes: IsoShape[]; topPoints: string } {
  const faces = cuboid(
    slab.x0,
    slab.y0,
    slab.x1 - slab.x0,
    slab.y1 - slab.y0,
    slab.thickness,
    -slab.thickness,
    offset,
  );
  const topPoints = isoPoly(
    [
      [slab.x0, slab.y0, 0],
      [slab.x1, slab.y0, 0],
      [slab.x1, slab.y1, 0],
      [slab.x0, slab.y1, 0],
    ],
    offset,
  );
  return {
    shapes: [
      { kind: 'polygon', points: faces.right, fill: 'slabSide', stroke: true },
      { kind: 'polygon', points: faces.left, fill: 'slabSide', stroke: true },
      { kind: 'polygon', points: topPoints, fill: 'slabTop', stroke: true },
    ],
    topPoints,
  };
}

/** Garis grid isometrik di atas pelat (diraster oleh clip polygon pelat). */
export function buildGridLines(
  offset: XY,
  slab: GroundRect,
  step: number,
): LineSeg[] {
  const lines: LineSeg[] = [];
  const firstY = Math.ceil(slab.y0 / step) * step;
  for (let gy = firstY; gy <= slab.y1; gy += step) {
    const a = iso(slab.x0, gy, 0, offset);
    const b = iso(slab.x1, gy, 0, offset);
    lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
  }
  const firstX = Math.ceil(slab.x0 / step) * step;
  for (let gx = firstX; gx <= slab.x1; gx += step) {
    const a = iso(gx, slab.y0, 0, offset);
    const b = iso(gx, slab.y1, 0, offset);
    lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
  }
  return lines;
}
