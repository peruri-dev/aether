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
import { cylinder, isoEllipse } from '@/modules/common/lesson/diorama/iso';
import type {
  IsoFillKey,
  IsoShape,
  StationShapes,
  XY,
} from '@/modules/common/lesson/diorama/iso';
import { ISO_FILL as SCENE_FILL } from '@/modules/common/lesson/diorama/palette';

import { DIAGRAM, diagramNode, STATION_SCREEN } from './diagram';
import { userCrowdShapes } from './diagram-figures';

import type { NodeId } from '../types/flow';

// Palet scene bersama di common/lesson; re-export agar kontrak modul tetap.
export const ISO_FILL = SCENE_FILL;
export type { IsoFillKey };

const O: XY = DIAGRAM.offset;

/** Objek di atas pedestal per stasiun, dalam koordinat ground lokal pedestal. */
function buildObject(nodeId: NodeId): IsoShape[] {
  const node = diagramNode(nodeId);

  if (nodeId === 'user') {
    // Kerumunan pengunjung kecil menggantikan satu laptop — mengikuti gaya
    // lesson acuan yang menggambarkan pengguna sebagai massa orang.
    return userCrowdShapes(node);
  }

  const ox = node.gx - node.pw / 2;
  const oy = node.gy - DIAGRAM.platform.d / 2;

  if (nodeId === 'app') {
    const px = ox + 5;
    const faceY = oy + 30;
    return [
      ...buildBox(O, px, oy + 20, 80, 10, 64, 16),
      buildStrip(O, px, faceY, 80, 72, 79, 3, 'screenTile'),
      buildStrip(O, px + 46, faceY, 30, 30, 62, 3, 'detail'),
      buildStrip(O, px, faceY, 36, 54, 58, 3, 'detail'),
      buildStrip(O, px, faceY, 36, 46, 50, 3, 'detail'),
      buildStrip(O, px, faceY, 36, 38, 42, 3, 'detail'),
      buildFaceDot(O, px + 10, faceY, 75.5, 2.5, 'detail'),
    ];
  }

  if (nodeId === 'server') {
    const rx = ox + 8;
    const faceY = oy + 47;
    return [
      ...buildBox(O, rx, oy + 3, 64, 44, 78, 16),
      buildStrip(O, rx, faceY, 64, 26, 30, 4, 'detail'),
      buildStrip(O, rx, faceY, 64, 40, 44, 4, 'detail'),
      buildStrip(O, rx, faceY, 64, 54, 58, 4, 'detail'),
      buildStrip(O, rx, faceY, 64, 68, 72, 4, 'detail'),
      buildFaceDot(O, rx + 10, faceY, 86, 2.5, 'led'),
      buildFaceDot(O, rx + 19, faceY, 86, 2.5, 'ledWarm'),
    ];
  }

  // database: tumpukan dua silinder + tutup
  return buildDatabase(ox, oy);
}

function buildDatabase(ox: number, oy: number): IsoShape[] {
  const cx = ox + diagramNode('database').pw / 2;
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
    const platform = buildPlatform(
      O,
      node.gx,
      node.gy,
      node.pw,
      DIAGRAM.platform.d,
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

const slab = DIAGRAM.slab;
const built = buildSlab(O, slab);

export const SLAB_SHAPES: IsoShape[] = built.shapes;
export const SLAB_TOP_POINTS = built.topPoints;

/** Garis grid isometrik di atas pelat, ter-clip oleh polygon pelat. */
export const GRID_LINES = buildGridLines(O, slab, DIAGRAM.gridStep);

/**
 * Kamera adaptif: tiap langkah membingkai hanya stasiun yang sudah muncul —
 * close-up di awal, zoom-out bertahap saat diorama membesar (pola course acuan).
 */

/** Tinggi visual objek di atas pedestal per stasiun, dalam koordinat layar. */
const STATION_TOP_ABOVE: Record<NodeId, number> = {
  user: 36, // kepala figur kerumunan ~25px di atas pedestal
  app: 64, // panel browser: z 16..80
  server: 78, // rack: z 16..94
  database: 56, // tutup silinder z 58 + tinggi ellipse-nya
};

/** Bounds satu stasiun di layar: pedestal + objek di atasnya + label + pill. */
function stationBounds(id: NodeId): Bounds {
  const node = diagramNode(id);
  const c = STATION_SCREEN[id];
  const halfW = (node.pw + DIAGRAM.platform.d) / 2 + 8;
  return {
    minX: c.x - halfW,
    minY: c.y - STATION_TOP_ABOVE[id] - 10,
    maxX: c.x + halfW,
    maxY: c.y + DIAGRAM.labelGap + 14 + DIAGRAM.labelPill.h + 12,
  };
}

/**
 * Hitung kamera untuk gabungan stasiun yang terlihat. Stasiun pertama selalu
 * disertakan agar bingkai hanya melebar (zoom-out monoton), tidak bolak-balik.
 */
export function cameraView(revealed: ReadonlySet<NodeId>): CameraView {
  const bounds = DIAGRAM.stations
    .map((node) => node.id)
    .filter((id) => revealed.has(id) || id === 'user')
    .map((id) => stationBounds(id));
  return fitCamera(bounds, {
    width: DIAGRAM.width,
    height: DIAGRAM.height,
  });
}
