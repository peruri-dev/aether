import { iso } from './iso';

import type { XY } from './iso';
import type { NodeId, NodeState, PacketKind } from '../types/flow';

/** Edge penghubung dua stasiun bertetangga di ground. */
export interface DiagramEdge {
  id: string;
  from: NodeId;
  to: NodeId;
}

/** Satu stasiun diorama: pusat pedestal di ground (gx, gy) + label. */
export interface DiagramNode {
  id: NodeId;
  gx: number;
  gy: number;
  /** Lebar pedestal; kedalaman pedestal sama untuk semua. */
  pw: number;
  label: string;
  sub: string;
}

/**
 * Layout scene isometrik. Stasiun mengalir sepanjang arah menjauh (−gy) sehingga
 * alur menanjak diagonal dari kiri-bawah (pengguna, paling dekat penonton) ke
 * kanan-atas (database, paling jauh) — komposisi yang sama dengan project acuan.
 */
export const DIAGRAM = {
  width: 740,
  height: 400,
  /** Titik ground (0,0) jatuh di layar. */
  offset: { x: 170, y: 285 } as XY,
  /** Pelat dasar scene di ground: dari (x0,y0) sampai (x1,y1), tebal ke bawah. */
  slab: { x0: -60, y0: -480, x1: 60, y1: 85, thickness: 18 },
  /** Jarak antar garis grid di pelat. */
  gridStep: 40,
  platform: { d: 50, h: 16 },
  /** Jarak label/pill di bawah pusat stasiun. */
  labelGap: 44,
  labelPill: { w: 150, h: 24 },
  /** Trim ujung jalur packet agar tidak menabrak pedestal. */
  edgeTrim: 28,
  stations: [
    {
      id: 'user',
      gx: 0,
      gy: 40,
      pw: 96,
      label: 'Pengguna',
      sub: 'shop.example',
    },
    {
      id: 'app',
      gx: 0,
      gy: -120,
      pw: 90,
      label: 'Website',
      sub: 'UI + skeleton',
    },
    {
      id: 'server',
      gx: 0,
      gy: -280,
      pw: 80,
      label: 'Server API',
      sub: 'GET /api/products',
    },
    {
      id: 'database',
      gx: 0,
      gy: -440,
      pw: 80,
      label: 'Database',
      sub: 'SELECT … FROM products',
    },
  ] as DiagramNode[],
  edges: [
    { id: 'user-app', from: 'user', to: 'app' },
    { id: 'app-server', from: 'app', to: 'server' },
    { id: 'server-db', from: 'server', to: 'database' },
  ] as DiagramEdge[],
};

const PLATFORM_BY_ID = new Map<NodeId, DiagramNode>(
  DIAGRAM.stations.map((node) => [node.id, node]),
);

export function diagramNode(id: NodeId): DiagramNode {
  const node = PLATFORM_BY_ID.get(id);
  if (!node) {
    throw new Error(`Stasiun tidak dikenal: ${id}`);
  }
  return node;
}

/** Pusat atas pedestal stasiun, dalam koordinat layar. */
export const STATION_SCREEN: Record<NodeId, XY> = Object.fromEntries(
  DIAGRAM.stations.map((node) => {
    const p = iso(node.gx, node.gy, DIAGRAM.platform.h);
    return [node.id, { x: p.x + DIAGRAM.offset.x, y: p.y + DIAGRAM.offset.y }];
  }),
) as Record<NodeId, XY>;

/**
 * Kunci kanonik pasangan node (arah bebas) untuk mencari edge:
 * packet bisa bergerak dua arah di edge yang sama.
 */
export function edgePairKey(from: NodeId, to: NodeId): string {
  return [from, to].sort().join('-');
}

/** Ujung jalur packet: segmen lurus antar pusat stasiun, dipangkas di kedua ujung. */
export function edgeEnds(from: NodeId, to: NodeId): { start: XY; end: XY } {
  const a = STATION_SCREEN[from];
  const b = STATION_SCREEN[to];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  const trim = DIAGRAM.edgeTrim;
  const ux = dx / length;
  const uy = dy / length;
  return {
    start: { x: a.x + ux * trim, y: a.y + uy * trim },
    end: { x: b.x - ux * trim, y: b.y - uy * trim },
  };
}

/**
 * Class warna packet. Pakai skala status (bukan chart-categorical) agar lolos
 * kontras 3:1 WCAG untuk objek grafis di tema terang maupun gelap.
 */
export const PACKET_FILL: Record<PacketKind, string> = {
  request: 'fill-warning-600',
  response: 'fill-positive-600',
  handshake: 'fill-guide-500',
};

/** Dot legend: warna + label teks, agar informasi tidak bergantung warna saja. */
export const PACKET_LEGEND: Record<PacketKind, { dot: string; label: string }> =
  {
    request: { dot: 'bg-warning-600', label: 'request' },
    response: { dot: 'bg-positive-600', label: 'response' },
    handshake: { dot: 'bg-guide-500', label: 'handshake' },
  };

/** Class garis dan teks node per state. */
export const NODE_STYLE: Record<
  NodeState,
  { stroke: string; label: string; sub: string }
> = {
  idle: {
    stroke: 'stroke-stroke-tertiary',
    label: 'fill-content-secondary',
    sub: 'fill-content-tertiary',
  },
  active: {
    stroke: 'stroke-guide-500',
    label: 'fill-content-primary',
    sub: 'fill-content-secondary',
  },
  done: {
    stroke: 'stroke-stroke-secondary',
    label: 'fill-content-primary',
    sub: 'fill-content-secondary',
  },
};
