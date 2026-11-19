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
 * Stasiun dengan caption di atas objek: empat rack layanan baris belakang.
 * Zona bawah mereka dipakai stasiun baris depan dan OSS, jadi caption harus
 * menggantung di atas atap rack.
 */
export const LABEL_ABOVE_IDS: ReadonlySet<NodeId> = new Set<NodeId>([
  'backend',
  'core',
  'soa',
  'kms',
]);

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

/** Rack layanan: kotak tinggi + ventilasi + lampu status. */
function buildRack(
  nodeId: NodeId,
  height: number,
  vents: readonly { z1: number; z2: number }[],
  dots: readonly { x: number; z: number; r: number; fill: IsoFillKey }[],
): IsoShape[] {
  const node = diagramNode(nodeId);
  const rx = node.gx - node.pw / 2 + 6;
  const oy = node.gy - D / 2;
  const faceY = oy + 44;
  return [
    ...buildBox(O, rx, oy + 3, 64, 41, height, 16),
    ...vents.map((vent) =>
      buildStrip(O, rx, faceY, 64, vent.z1, vent.z2, 4, 'detail'),
    ),
    ...dots.map((dot) =>
      buildFaceDot(O, rx + dot.x, faceY, dot.z, dot.r, dot.fill),
    ),
  ];
}

/** Objek per stasiun: panel halaman, rack layanan, atau tumpukan OSS. */
function buildObject(nodeId: NodeId): IsoShape[] {
  const node = diagramNode(nodeId);
  const ox = node.gx - node.pw / 2;
  const oy = node.gy - D / 2;

  if (nodeId === 'backend') {
    // Rack backend: ventilasi lebih rapat karena lalu lintas paling ramai.
    return buildRack(
      nodeId,
      78,
      [
        { z1: 26, z2: 30 },
        { z1: 40, z2: 44 },
        { z1: 54, z2: 58 },
        { z1: 68, z2: 72 },
      ],
      [
        { x: 10, z: 86, r: 2.5, fill: 'led' },
        { x: 19, z: 86, r: 2.5, fill: 'ledWarm' },
      ],
    );
  }

  if (nodeId === 'core') {
    return buildRack(
      nodeId,
      74,
      [
        { z1: 24, z2: 28 },
        { z1: 40, z2: 44 },
        { z1: 56, z2: 60 },
      ],
      [{ x: 10, z: 82, r: 2.5, fill: 'led' }],
    );
  }

  if (nodeId === 'soa') {
    // Rack SOA: satu panel orkestrasi di muka atas selain ventilasi.
    return buildRack(
      nodeId,
      74,
      [
        { z1: 24, z2: 28 },
        { z1: 40, z2: 44 },
        { z1: 56, z2: 60 },
      ],
      [
        { x: 10, z: 82, r: 2.5, fill: 'ledWarm' },
        { x: 22, z: 82, r: 2.5, fill: 'screenTile' },
      ],
    );
  }

  if (nodeId === 'kms') {
    // Rack KMS: ventilasi sedikit, satu lubang kunci gelap sebagai motif kunci.
    return buildRack(
      nodeId,
      72,
      [
        { z1: 22, z2: 26 },
        { z1: 36, z2: 40 },
      ],
      [
        { x: 10, z: 80, r: 2.5, fill: 'led' },
        { x: 30, z: 80, r: 3, fill: 'ink' },
      ],
    );
  }

  if (nodeId === 'oss') {
    // Tumpukan dua kotak penyimpanan: kotak bawah lebih lebar dari kotak atas.
    const bx = ox + 4;
    const tx = ox + 10;
    const faceBawah = oy + 49;
    const faceAtas = oy + 45;
    return [
      ...buildBox(O, bx, oy + 8, 64, 41, 34, 16),
      buildStrip(O, bx, faceBawah, 64, 22, 30, 5, 'screenTile'),
      buildFaceDot(O, bx + 10, faceBawah, 38, 2.5, 'led'),
      ...buildBox(O, tx, oy + 12, 52, 33, 26, 50),
      buildStrip(O, tx, faceAtas, 52, 56, 64, 4, 'detail'),
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

  // sign: Halaman Tanda Tangan Digital — zona unggah, kanvas tanda tangan
  // dengan dua goresan tinta, dan tombol kirim.
  return [
    ...buildBox(O, px, oy + 8, 68, 10, 64, 16),
    buildStrip(O, px, faceY, 68, 66, 71, 5, 'screenTile'),
    ...faceStrips(px, faceY, [
      { z1: 52, z2: 58, fill: 'screenTile' },
      { z1: 28, z2: 44, fill: 'detail' },
      { z1: 34, z2: 38, x: px + 14, w: 12, fill: 'ink', inset: 1 },
      { z1: 31, z2: 35, x: px + 24, w: 16, fill: 'ink', inset: 1 },
      { z1: 20, z2: 25, x: px + 18, w: 50, fill: 'screenTile' },
    ]),
  ];
}

/** Tinggi visual objek di atas pedestal per stasiun, dalam koordinat layar. */
const STATION_TOP_ABOVE: Record<NodeId, number> = {
  login: 66,
  sign: 76,
  backend: 78,
  oss: 80,
  core: 74,
  soa: 74,
  kms: 72,
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
 * Stasiun caption-atas (rack layanan) dibingkai dari pill di atasnya sampai
 * kaki pedestal; stasiun biasa dari puncak objek sampai pill di bawah. */
function stationBounds(id: NodeId): Bounds {
  const node = diagramNode(id);
  const c = STATION_SCREEN[id];
  const halfW = (node.pw + D) / 2 + 8;
  const captionAbove = LABEL_ABOVE_IDS.has(id);
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
