import type { HudMetric, PacketMove } from '@/modules/common/lesson/types';

/** Identitas stasiun halaman/sistem dalam lesson login Dashbent. */
export type NodeId =
  'login' | 'api' | 'password' | 'totp' | 'verify' | 'dashboard';

/** Status akun sesuai [BR-003] PRD Dashbent. */
export type AccountStatus =
  'MENUNGGU_AKTIVASI' | 'MENUNGGU_TOTP' | 'AKTIF' | 'TERKUNCI' | 'NONAKTIF';

/** Jenis packet pada alur autentikasi. */
export type PacketKind = 'credentials' | 'totp' | 'recovery' | 'session';

/** Perjalanan satu packet dengan tipe yang sudah menyempit. */
export interface FlowMove {
  from: NodeId;
  to: NodeId;
  kind: PacketKind;
  durationMs: number;
  delayMs: number;
}

/** Satu langkah lesson login: copy, animasi, status akun, dan state node. */
export interface FlowStep {
  /** Id stabil untuk key React dan testid timeline. */
  id: string;
  number: number;
  label: string;
  title: string;
  narration: string[];
  keyIdea: string;
  moves: FlowMove[];
  /** Tile HUD langkah ini (status akun, percobaan gagal, sesi) — nilai kini, bukan akumulasi. */
  metrics: HudMetric[];
  nodeStates: Record<NodeId, 'idle' | 'active' | 'done'>;
  /** Stasiun yang muncul di langkah ini (progressive disclosure). */
  reveals: readonly NodeId[];
}

export type { HudMetric, PacketMove };
