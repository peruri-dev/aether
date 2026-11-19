import { iso } from '@/modules/common/lesson/diorama/iso';
import type { XY } from '@/modules/common/lesson/diorama/iso';

import type { NodeId, PacketKind } from '../types/flow';

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
 * Layout scene lesson tanda tangan digital: baris depan berisi dua halaman
 * yang dikunjungi pengguna (Login, Tanda Tangan Digital); baris belakang
 * berisi rantai layanan — Backend, API Core, SOA, dan KMS — naik ke kanan-
 * atas, dengan OSS Alibaba berdiri di kanan-tengah karena hanya browser yang
 * memanggilnya langsung. Dokumen bertanda tangan menempuh jalur yang sama
 * secara terbalik di langkah penutup.
 */
export const DIAGRAM = {
  width: 900,
  height: 500,
  /** Titik ground (0,0) jatuh di layar. */
  offset: { x: 300, y: 375 } as XY,
  /** Pelat dasar scene di ground: dari (x0,y0) sampai (x1,y1), tebal ke bawah. */
  slab: { x0: -455, y0: -190, x1: 100, y1: 100, thickness: 18 },
  /** Jarak antar garis grid di pelat. */
  gridStep: 40,
  platform: { d: 50, h: 16 },
  /** Jarak label/pill di bawah pusat stasiun. Ujung bawah pedestal mencapai
   * +47,5 dari pusat; 60 memberi jarak bersih sebelum puncak teks label. */
  labelGap: 60,
  /**
   * Jarak label/pill di atas pusat stasiun untuk stasiun label-atas (rack
   * layanan). Harus melewati sudut belakang atap rack (~78 dari pusat) agar
   * caption tidak menempel atap; pill lalu menggantung di atas label.
   */
  labelGapAbove: 110,
  labelPill: { w: 140, h: 24 },
  /**
   * Geser caption ke kiri untuk backend: tanpa geser, pojok kanan caption
   * menempel muka rack API Core yang berdiri tepat di kanan-belakangnya.
   */
  captionShift: {
    backend: { x: -20, y: 0 },
  } as Partial<Record<NodeId, XY>>,
  /** Trim ujung jalur packet agar tidak menabrak pedestal. */
  edgeTrim: 28,
  stations: [
    {
      id: 'login',
      gx: 40,
      gy: -20,
      pw: 76,
      label: 'Halaman Login',
      sub: 'email dan password',
    },
    {
      id: 'sign',
      gx: -105,
      gy: 5,
      pw: 76,
      label: 'Tanda Tangan Digital',
      sub: 'unggah dan tanda tangan',
    },
    {
      id: 'backend',
      gx: -110,
      gy: -140,
      pw: 76,
      label: 'Backend',
      sub: 'REST API aplikasi',
    },
    {
      id: 'oss',
      gx: -245,
      gy: 55,
      pw: 76,
      label: 'OSS Alibaba',
      sub: 'object storage',
    },
    {
      id: 'core',
      gx: -220,
      gy: -120,
      pw: 76,
      label: 'API Core',
      sub: 'layanan inti',
    },
    {
      id: 'soa',
      gx: -315,
      gy: -65,
      pw: 76,
      label: 'SOA',
      sub: 'orkestrasi layanan',
    },
    {
      id: 'kms',
      gx: -395,
      gy: 5,
      pw: 76,
      label: 'KMS',
      sub: 'kunci tanda tangan',
    },
  ] as DiagramNode[],
  edges: [
    { id: 'login-backend', from: 'login', to: 'backend' },
    { id: 'sign-oss', from: 'sign', to: 'oss' },
    { id: 'sign-backend', from: 'sign', to: 'backend' },
    { id: 'backend-core', from: 'backend', to: 'core' },
    { id: 'core-soa', from: 'core', to: 'soa' },
    { id: 'soa-kms', from: 'soa', to: 'kms' },
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
 * Class warna packet. Pakai skala status agar lolos kontras 3:1 WCAG di
 * tema terang maupun gelap.
 */
export const PACKET_FILL: Record<PacketKind, string> = {
  credentials: 'fill-warning-600',
  file: 'fill-chart-categorical-04',
  signedUrl: 'fill-guide-500',
  document: 'fill-chart-categorical-01',
  signature: 'fill-chart-categorical-08',
  signing: 'fill-chart-categorical-02',
  signedDoc: 'fill-positive-600',
};

/** Dot legend: warna + label teks, agar informasi tidak bergantung warna saja. */
export const PACKET_LEGEND: Record<PacketKind, { dot: string; label: string }> =
  {
    credentials: { dot: 'bg-warning-600', label: 'email dan password' },
    file: { dot: 'bg-chart-categorical-04', label: 'berkas dokumen' },
    signedUrl: { dot: 'bg-guide-500', label: 'signedUrl' },
    document: { dot: 'bg-chart-categorical-01', label: 'data dokumen' },
    signature: { dot: 'bg-chart-categorical-08', label: 'data tanda tangan' },
    signing: {
      dot: 'bg-chart-categorical-02',
      label: 'permintaan penandatanganan',
    },
    signedDoc: { dot: 'bg-positive-600', label: 'dokumen bertanda tangan' },
  };
