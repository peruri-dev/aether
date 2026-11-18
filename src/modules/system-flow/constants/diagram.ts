import type { NodeId, NodeState, PacketKind } from '../types/flow';

/** Titik dua dimensi dalam koordinat viewBox SVG. */
export interface XY {
  x: number;
  y: number;
}

/** Definisi satu node diagram. `x` adalah pusat kotak. */
export interface DiagramNode {
  id: NodeId;
  x: number;
  label: string;
  sub: string;
}

/** Garis penghubung antar dua node bertetangga. */
export interface DiagramEdge {
  id: string;
  from: NodeId;
  to: NodeId;
}

/**
 * Geometri scene diagram (satuan viewBox, bukan piksel — SVG menskala responsif).
 * Empat node berjajar horizontal, edge menghubungkan tetangga terdekat saja.
 * `overflowPad` melebarkan viewBox: packet pill (lebar 56, setengahnya 28) bisa
 * melewati ujung edge paling luar saat tiba di node terdekat tepi kiri/kanan.
 */
export const DIAGRAM = {
  width: 860,
  height: 280,
  overflowPad: 30,
  nodeWidth: 140,
  nodeHeight: 84,
  centerY: 160,
  nodes: [
    { id: 'user', x: 90, label: 'Pengguna', sub: 'shop.example' },
    { id: 'app', x: 315, label: 'Website', sub: 'UI + skeleton' },
    { id: 'server', x: 540, label: 'Server API', sub: 'GET /api/products' },
    {
      id: 'database',
      x: 765,
      label: 'Database',
      sub: 'SELECT … FROM products',
    },
  ] as const satisfies readonly DiagramNode[],
  edges: [
    { id: 'user-app', from: 'user', to: 'app' },
    { id: 'app-server', from: 'app', to: 'server' },
    { id: 'server-db', from: 'server', to: 'database' },
  ] as const satisfies readonly DiagramEdge[],
};

const NODE_BY_ID = new Map<NodeId, (typeof DIAGRAM.nodes)[number]>(
  DIAGRAM.nodes.map((node) => [node.id, node]),
);

/**
 * Kunci kanonik pasangan node (arah bebas) untuk mencari edge:
 * packet bisa bergerak dua arah di edge yang sama.
 */
export function edgePairKey(from: NodeId, to: NodeId): string {
  return [from, to].sort().join('-');
}

/** Ujung-ujung edge: garis horizontal di antara border dua node bertetangga. */
export function edgeEnds(from: NodeId, to: NodeId): { start: XY; end: XY } {
  const fromNode = NODE_BY_ID.get(from);
  const toNode = NODE_BY_ID.get(to);
  if (!fromNode || !toNode) {
    throw new Error(`Edge tidak dikenal: ${from} -> ${to}`);
  }
  const pad = 10;
  return {
    start: { x: fromNode.x + DIAGRAM.nodeWidth / 2 + pad, y: DIAGRAM.centerY },
    end: { x: toNode.x - DIAGRAM.nodeWidth / 2 - pad, y: DIAGRAM.centerY },
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

/** Class visual kotak, glyph, dan label node per state. */
export const NODE_STYLE: Record<
  NodeState,
  { box: string; glyph: string; label: string }
> = {
  idle: {
    box: 'fill-background-secondary stroke-stroke-tertiary',
    glyph: 'stroke-content-tertiary',
    label: 'fill-content-tertiary',
  },
  active: {
    box: 'fill-background-tertiary stroke-guide-500',
    glyph: 'stroke-content-guide',
    label: 'fill-content-primary',
  },
  done: {
    box: 'fill-background-secondary stroke-stroke-secondary',
    glyph: 'stroke-content-secondary',
    label: 'fill-content-primary',
  },
};
