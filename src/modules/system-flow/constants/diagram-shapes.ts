import { DIAGRAM, diagramNode } from './diagram';
import { cuboid, cylinder, frontStrip, iso, isoEllipse, isoPoly } from './iso';

import type {
  IsoEllipse,
  IsoFillKey,
  IsoShape,
  LineSeg,
  StationShapes,
  XY,
} from './iso';
import type { NodeId } from '../types/flow';

/**
 * Palet warna scene via CSS variable token (pola yang sama dengan
 * var(--color-chart-*): satu-satunya cara memakai nilai token mentah untuk SVG).
 * Warna netral sengaja konstan di kedua tema agar diorama terlihat terang di
 * atas pelat yang ikut berubah tema.
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
} as const satisfies Record<IsoFillKey, string>;

const O: XY = DIAGRAM.offset;

/** Polygon berisi kotak isometrik: sisi dulu, atap terakhir (painter's algorithm). */
function box(
  x: number,
  y: number,
  w: number,
  d: number,
  h: number,
  z0: number,
): IsoShape[] {
  const faces = cuboid(x, y, w, d, h, z0, O);
  return [
    { kind: 'polygon', points: faces.right, fill: 'faceRight', stroke: true },
    { kind: 'polygon', points: faces.left, fill: 'faceLeft', stroke: true },
    { kind: 'polygon', points: faces.top, fill: 'faceTop', stroke: true },
  ];
}

function strip(
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
    points: frontStrip(x, y, w, z1, z2, inset, O),
    fill,
    stroke: false,
  };
}

/** Dot di bidang muka depan (+gy): mis. lampu indikator rack dan dot URL browser. */
function faceDot(
  x: number,
  y: number,
  z: number,
  r: number,
  fill: IsoFillKey,
): IsoShape {
  const p = iso(x, y, z, O);
  return { kind: 'circle', cx: p.x, cy: p.y, r, fill, stroke: false };
}

/** Objek di atas pedestal per stasiun, dalam koordinat ground lokal pedestal. */
function buildObject(nodeId: NodeId): IsoShape[] {
  const node = diagramNode(nodeId);
  const ox = node.gx - node.pw / 2;
  const oy = node.gy - DIAGRAM.platform.d / 2;

  if (nodeId === 'user') {
    const sx = ox + 6;
    const faceY = oy + 8;
    return [
      // layar laptop (paling belakang); kakinya tenggelam ke papan ketik agar
      // sambungan terlihat menyatu, lalu papan ketik menutupi bagian bawahnya
      ...box(sx, oy + 8, 84, 8, 56, 20),
      ...box(sx, oy, 84, 50, 8, 16),
      // blok UI di layar
      strip(sx, faceY, 84, 62, 70, 6, 'screenTile'),
      strip(sx, faceY, 56, 50, 54, 6, 'detail'),
      strip(sx, faceY, 56, 42, 46, 6, 'detail'),
      strip(sx + 60, faceY, 24, 30, 48, 0, 'screenTile'),
    ];
  }

  if (nodeId === 'app') {
    const px = ox + 5;
    const faceY = oy + 30;
    return [
      ...box(px, oy + 20, 80, 10, 64, 16),
      strip(px, faceY, 80, 72, 79, 3, 'screenTile'),
      strip(px + 46, faceY, 30, 30, 62, 3, 'detail'),
      strip(px, faceY, 36, 54, 58, 3, 'detail'),
      strip(px, faceY, 36, 46, 50, 3, 'detail'),
      strip(px, faceY, 36, 38, 42, 3, 'detail'),
      faceDot(px + 10, faceY, 75.5, 2.5, 'detail'),
    ];
  }

  if (nodeId === 'server') {
    const rx = ox + 8;
    const faceY = oy + 47;
    return [
      ...box(rx, oy + 3, 64, 44, 78, 16),
      strip(rx, faceY, 64, 26, 30, 4, 'detail'),
      strip(rx, faceY, 64, 40, 44, 4, 'detail'),
      strip(rx, faceY, 64, 54, 58, 4, 'detail'),
      strip(rx, faceY, 64, 68, 72, 4, 'detail'),
      faceDot(rx + 10, faceY, 86, 2.5, 'led'),
      faceDot(rx + 19, faceY, 86, 2.5, 'ledWarm'),
    ];
  }

  // database: tumpukan dua silinder + tutup
  const cx = ox + node.pw / 2;
  const cy = oy + DIAGRAM.platform.d / 2;
  const lower = cylinder(cx, cy, 24, 20, 16, O);
  const upper = cylinder(cx, cy, 24, 20, 36, O);
  const lid = isoEllipse(cx, cy, 16, 58, O);
  return [
    { kind: 'path', d: lower.side, fill: 'faceLeft', stroke: true },
    {
      kind: 'ellipse',
      cx: lower.top.x,
      cy: lower.top.y,
      rx: lower.top.rx,
      ry: lower.top.ry,
      fill: 'faceTop',
      stroke: true,
    },
    { kind: 'path', d: upper.side, fill: 'faceLeft', stroke: true },
    {
      kind: 'ellipse',
      cx: upper.top.x,
      cy: upper.top.y,
      rx: upper.top.rx,
      ry: upper.top.ry,
      fill: 'faceTop',
      stroke: true,
    },
    {
      kind: 'ellipse',
      cx: lid.x,
      cy: lid.y,
      rx: lid.rx,
      ry: lid.ry,
      fill: 'detail',
      stroke: true,
    },
  ];
}

/** Bentuk semua stasiun, dihitung sekali saat modul dimuat. */
export const STATION_SHAPES: Record<NodeId, StationShapes> = Object.fromEntries(
  DIAGRAM.stations.map((node) => {
    const faces = cuboid(
      node.gx - node.pw / 2,
      node.gy - DIAGRAM.platform.d / 2,
      node.pw,
      DIAGRAM.platform.d,
      DIAGRAM.platform.h,
      0,
      O,
    );
    const platform: IsoShape[] = [
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
    return [node.id, { platform, object: buildObject(node.id) }];
  }),
) as Record<NodeId, StationShapes>;

/** Cincin ping isometrik di atas pedestal stasiun aktif. */
export const STATION_PING: Record<NodeId, IsoEllipse> = Object.fromEntries(
  DIAGRAM.stations.map((node) => [
    node.id,
    isoEllipse(node.gx, node.gy, 42, DIAGRAM.platform.h, O),
  ]),
) as Record<NodeId, IsoEllipse>;

/** Pelat dasar scene: sisi extruded + bidang atas. */
const slab = DIAGRAM.slab;
const slabFaces = cuboid(
  slab.x0,
  slab.y0,
  slab.x1 - slab.x0,
  slab.y1 - slab.y0,
  slab.thickness,
  -slab.thickness,
  O,
);

const slabTopPoints = isoPoly(
  [
    [slab.x0, slab.y0, 0],
    [slab.x1, slab.y0, 0],
    [slab.x1, slab.y1, 0],
    [slab.x0, slab.y1, 0],
  ],
  O,
);

export const SLAB_SHAPES: IsoShape[] = [
  { kind: 'polygon', points: slabFaces.right, fill: 'slabSide', stroke: true },
  { kind: 'polygon', points: slabFaces.left, fill: 'slabSide', stroke: true },
  {
    kind: 'polygon',
    points: slabTopPoints,
    fill: 'slabTop',
    stroke: true,
  },
];

export const SLAB_TOP_POINTS = slabTopPoints;

/** Garis grid isometrik di atas pelat, ter-clip oleh polygon pelat. */
export const GRID_LINES: LineSeg[] = (() => {
  const lines: LineSeg[] = [];
  const step = DIAGRAM.gridStep;
  const firstY = Math.ceil(slab.y0 / step) * step;
  for (let gy = firstY; gy <= slab.y1; gy += step) {
    const a = iso(slab.x0, gy, 0, O);
    const b = iso(slab.x1, gy, 0, O);
    lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
  }
  const firstX = Math.ceil(slab.x0 / step) * step;
  for (let gx = firstX; gx <= slab.x1; gx += step) {
    const a = iso(gx, slab.y0, 0, O);
    const b = iso(gx, slab.y1, 0, O);
    lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
  }
  return lines;
})();
