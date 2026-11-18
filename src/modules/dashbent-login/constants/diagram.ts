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
 * Layout scene lesson login: baris depan berisi halaman yang dikunjungi admin
 * menanjak kiri-bawah (Login) ke kanan-atas (Dashboard); API Identitas berdiri
 * di baris belakang-tengah sebagai hub — semua kredensial dan kode terbang ke
 * sana, sesi penuh terbit untuk membawa admin ke Dashboard.
 */
export const DIAGRAM = {
  width: 900,
  height: 500,
  /** Titik ground (0,0) jatuh di layar. */
  offset: { x: 285, y: 369 } as XY,
  /** Pelat dasar scene di ground: dari (x0,y0) sampai (x1,y1), tebal ke bawah. */
  slab: { x0: -540, y0: -190, x1: 90, y1: 55, thickness: 18 },
  /** Jarak antar garis grid di pelat. */
  gridStep: 40,
  platform: { d: 50, h: 16 },
  /** Jarak label/pill di bawah pusat stasiun. */
  labelGap: 50,
  labelPill: { w: 140, h: 24 },
  /** Trim ujung jalur packet agar tidak menabrak pedestal. */
  edgeTrim: 28,
  stations: [
    {
      id: 'login',
      gx: 45,
      gy: 0,
      pw: 76,
      label: 'Halaman Login',
      sub: 'email dan password',
    },
    {
      id: 'password',
      gx: -165,
      gy: 0,
      pw: 76,
      label: 'Ganti Password',
      sub: 'aturan IDDS',
    },
    {
      id: 'totp',
      gx: -270,
      gy: 0,
      pw: 76,
      label: 'Daftar TOTP',
      sub: 'QR dan kode cadangan',
    },
    {
      id: 'verify',
      gx: -375,
      gy: 0,
      pw: 76,
      label: 'Verifikasi TOTP',
      sub: 'kode 6 digit',
    },
    {
      id: 'dashboard',
      gx: -480,
      gy: 0,
      pw: 76,
      label: 'Dashboard',
      sub: 'sesi penuh',
    },
    {
      id: 'api',
      gx: -217,
      gy: -160,
      pw: 76,
      label: 'API Identitas',
      sub: 'autentikasi dan sesi',
    },
  ] as DiagramNode[],
  edges: [
    { id: 'login-api', from: 'login', to: 'api' },
    { id: 'password-api', from: 'password', to: 'api' },
    { id: 'totp-api', from: 'totp', to: 'api' },
    { id: 'verify-api', from: 'verify', to: 'api' },
    { id: 'verify-dashboard', from: 'verify', to: 'dashboard' },
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
  totp: 'fill-guide-500',
  recovery: 'fill-positive-600',
  session: 'fill-content-primary',
};

/** Dot legend: warna + label teks, agar informasi tidak bergantung warna saja. */
export const PACKET_LEGEND: Record<PacketKind, { dot: string; label: string }> =
  {
    credentials: { dot: 'bg-warning-600', label: 'email dan password' },
    totp: { dot: 'bg-guide-500', label: 'kode TOTP' },
    recovery: { dot: 'bg-positive-600', label: 'kode cadangan' },
    session: { dot: 'bg-content-primary', label: 'sesi' },
  };
