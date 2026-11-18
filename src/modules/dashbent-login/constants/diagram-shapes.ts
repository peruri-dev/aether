import {
  buildBox,
  buildFaceDot,
  buildGridLines,
  buildPing,
  buildPlatform,
  buildSlab,
  buildStrip,
} from '@/modules/common/lesson/diorama/builders';
import { fitCamera } from '@/modules/common/lesson/diorama/camera';
import type {
  Bounds,
  CameraView,
} from '@/modules/common/lesson/diorama/camera';
import type {
  IsoFillKey,
  IsoShape,
  StationShapes,
  XY,
} from '@/modules/common/lesson/diorama/iso';
import { ISO_FILL as SCENE_FILL } from '@/modules/common/lesson/diorama/palette';

import { DIAGRAM, diagramNode, STATION_SCREEN } from './diagram';

import type { NodeId } from '../types/flow';

// Palet scene bersama di common/lesson; re-export agar kontrak modul tetap.
export const ISO_FILL = SCENE_FILL;
export type { IsoFillKey };

const O: XY = DIAGRAM.offset;
const D = DIAGRAM.platform.d;

/**
 * Panel layar UI di atas pedestal: kotak tipis berdiri (68 lebar, 10 tebal),
 * muka depan (+gy) berisi strip field/tombol sesuai halaman.
 */

/** Helper strip konten pada muka depan panel dengan plane (px, faceY). */
function faceStrips(
  px: number,
  faceY: number,
  rows: readonly {
    z1: number;
    z2: number;
    x?: number;
    w?: number;
    fill: IsoFillKey;
    inset?: number;
  }[],
): IsoShape[] {
  return rows.map((row) =>
    buildStrip(
      O,
      row.x ?? px,
      faceY,
      row.w ?? 68,
      row.z1,
      row.z2,
      row.inset ?? 5,
      row.fill,
    ),
  );
}

/** Objek per stasiun: panel layar halaman, atau rack untuk API Identitas. */
function buildObject(nodeId: NodeId): IsoShape[] {
  const node = diagramNode(nodeId);
  const ox = node.gx - node.pw / 2;
  const oy = node.gy - D / 2;

  if (nodeId === 'api') {
    // Rack layanan identitas: kotak tinggi + ventilasi + dua lampu status.
    const rx = ox + 6;
    const faceY = oy + 44;
    return [
      ...buildBox(O, rx, oy + 3, 64, 41, 78, 16),
      buildStrip(O, rx, faceY, 64, 26, 30, 4, 'detail'),
      buildStrip(O, rx, faceY, 64, 40, 44, 4, 'detail'),
      buildStrip(O, rx, faceY, 64, 54, 58, 4, 'detail'),
      buildStrip(O, rx, faceY, 64, 68, 72, 4, 'detail'),
      buildFaceDot(O, rx + 10, faceY, 86, 2.5, 'led'),
      buildFaceDot(O, rx + 19, faceY, 86, 2.5, 'ledWarm'),
    ];
  }

  const px = ox + 4;
  const faceY = oy + 18;

  if (nodeId === 'login') {
    return [
      ...buildBox(O, px, oy + 8, 68, 10, 56, 16),
      buildStrip(O, px, faceY, 68, 60, 65, 5, 'screenTile'),
      ...faceStrips(px, faceY, [
        { z1: 48, z2: 54, fill: 'detail' },
        { z1: 36, z2: 42, fill: 'detail' },
        { z1: 24, z2: 30, x: px + 18, w: 50, fill: 'screenTile' },
      ]),
      buildFaceDot(O, px + 10, faceY, 71, 2.5, 'detail'),
    ];
  }

  if (nodeId === 'password') {
    return [
      ...buildBox(O, px, oy + 8, 68, 10, 62, 16),
      buildStrip(O, px, faceY, 68, 66, 71, 5, 'screenTile'),
      ...faceStrips(px, faceY, [
        { z1: 52, z2: 58, fill: 'detail' },
        { z1: 40, z2: 46, fill: 'detail' },
        { z1: 28, z2: 31, x: px + 14, w: 40, fill: 'screenTile', inset: 0 },
        { z1: 22, z2: 25, x: px + 14, w: 40, fill: 'screenTile', inset: 0 },
        { z1: 16, z2: 19, x: px + 14, w: 40, fill: 'screenTile', inset: 0 },
      ]),
    ];
  }

  if (nodeId === 'totp') {
    // Panel QR: bingkai gelap berisi petak hitam-putih + baris 6 kotak kode.
    const qr: IsoShape[] = [];
    const cells = [
      [0, 0],
      [2, 0],
      [1, 1],
      [0, 2],
      [2, 2],
    ] as const;
    for (const [col, row] of cells) {
      qr.push(
        buildStrip(
          O,
          px + 6 + col * 8,
          faceY,
          8,
          46 + row * 8,
          52 + row * 8,
          1,
          'ink',
        ),
      );
    }
    return [
      ...buildBox(O, px, oy + 8, 68, 10, 60, 16),
      buildStrip(O, px, faceY, 68, 70, 75, 5, 'screenTile'),
      ...qr,
      ...faceStrips(px, faceY, [
        { z1: 30, z2: 36, x: px + 18, w: 50, fill: 'detail' },
      ]),
    ];
  }

  if (nodeId === 'verify') {
    // Baris enam kotak kode + tombol verifikasi.
    const boxes: IsoShape[] = [];
    for (let i = 0; i < 6; i += 1) {
      boxes.push(buildStrip(O, px + 4 + i * 10, faceY, 8, 42, 50, 1, 'detail'));
    }
    return [
      ...buildBox(O, px, oy + 8, 68, 10, 60, 16),
      buildStrip(O, px, faceY, 68, 64, 69, 5, 'screenTile'),
      ...boxes,
      ...faceStrips(px, faceY, [
        { z1: 28, z2: 34, x: px + 18, w: 50, fill: 'screenTile' },
      ]),
    ];
  }

  // dashboard: header + tiga kartu + dua bar grafik
  return [
    ...buildBox(O, px, oy + 8, 68, 10, 74, 16),
    buildStrip(O, px, faceY, 68, 78, 83, 5, 'screenTile'),
    ...faceStrips(px, faceY, [
      { z1: 62, z2: 70, x: px + 4, w: 18, fill: 'detail' },
      { z1: 62, z2: 70, x: px + 26, w: 18, fill: 'detail' },
      { z1: 62, z2: 70, x: px + 48, w: 16, fill: 'detail' },
      { z1: 30, z2: 52, x: px + 6, w: 12, fill: 'screenTile', inset: 0 },
      { z1: 30, z2: 44, x: px + 22, w: 12, fill: 'screenTile', inset: 0 },
      { z1: 30, z2: 58, x: px + 38, w: 12, fill: 'screenTile', inset: 0 },
    ]),
  ];
}

/** Tinggi visual objek di atas pedestal per stasiun, dalam koordinat layar. */
const STATION_TOP_ABOVE: Record<NodeId, number> = {
  login: 66,
  api: 78,
  password: 72,
  totp: 72,
  verify: 72,
  dashboard: 86,
};

/** Bentuk semua stasiun, dihitung sekali saat modul dimuat. */
export const STATION_SHAPES: Record<NodeId, StationShapes> = Object.fromEntries(
  DIAGRAM.stations.map((node) => {
    const platform = buildPlatform(
      O,
      node.gx,
      node.gy,
      node.pw,
      D,
      DIAGRAM.platform.h,
    );
    return [node.id, { platform, object: buildObject(node.id) }];
  }),
) as Record<NodeId, StationShapes>;

/** Cincin ping isometrik di atas pedestal stasiun aktif. */
export const STATION_PING: Record<
  NodeId,
  ReturnType<typeof buildPing>
> = Object.fromEntries(
  DIAGRAM.stations.map((node) => [
    node.id,
    buildPing(O, node.gx, node.gy, 42, DIAGRAM.platform.h),
  ]),
) as Record<NodeId, ReturnType<typeof buildPing>>;

const built = buildSlab(O, DIAGRAM.slab);

export const SLAB_SHAPES: IsoShape[] = built.shapes;
export const SLAB_TOP_POINTS = built.topPoints;

/** Garis grid isometrik di atas pelat, ter-clip oleh polygon pelat. */
export const GRID_LINES = buildGridLines(O, DIAGRAM.slab, DIAGRAM.gridStep);

/** Bounds satu stasiun di layar: pedestal + objek + caption (label + pill).
 * Stasiun caption-atas (rack API) dibingkai dari pill di atasnya sampai
 * kaki pedestal; stasiun biasa dari puncak objek sampai pill di bawah. */
function stationBounds(id: NodeId): Bounds {
  const node = diagramNode(id);
  const c = STATION_SCREEN[id];
  const halfW = (node.pw + D) / 2 + 8;
  const captionAbove = id === 'api';
  const shift = DIAGRAM.captionShift[id];
  return {
    minX: c.x - halfW,
    minY:
      c.y -
      (captionAbove
        ? DIAGRAM.labelGapAbove + 14 + DIAGRAM.labelPill.h + 12
        : STATION_TOP_ABOVE[id] + 10),
    maxX: c.x + halfW + (shift?.x ?? 0),
    maxY:
      c.y +
      (captionAbove
        ? DIAGRAM.platform.h + 32
        : DIAGRAM.labelGap + 14 + DIAGRAM.labelPill.h + 12) +
      (shift?.y ?? 0),
  };
}

/**
 * Hitung kamera untuk gabungan stasiun yang terlihat. Stasiun pertama
 * (Halaman Login) selalu disertakan agar zoom-out monoton.
 */
export function cameraView(revealed: ReadonlySet<NodeId>): CameraView {
  const bounds = DIAGRAM.stations
    .map((node) => node.id)
    .filter((id) => revealed.has(id) || id === 'login')
    .map((id) => stationBounds(id));
  return fitCamera(bounds, {
    width: DIAGRAM.width,
    height: DIAGRAM.height,
    maxScale: 1.5,
  });
}
