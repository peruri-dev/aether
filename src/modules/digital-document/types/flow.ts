import type { HudMetric, PacketMove } from '@/modules/common/lesson/types';

/** Identitas stasiun halaman/sistem dalam lesson tanda tangan digital. */
export type NodeId =
  'login' | 'sign' | 'backend' | 'oss' | 'core' | 'soa' | 'kms';

/** Status dokumen yang dilalui lesson, dibaca HUD dari metric id 'doc'. */
export type DocStatus =
  'Belum ada' | 'Terunggah' | 'Terdaftar' | 'Ditandatangani';

/** Jenis packet pada alur tanda tangan digital dokumen. Teks kind dirender
 * verbatim di pill packet (lebar 56px), jadi maksimum sekitar 11 karakter. */
export type PacketKind =
  | 'credentials'
  | 'file'
  | 'signedUrl'
  | 'document'
  | 'signature'
  | 'signing'
  | 'signedDoc';

/** Perjalanan satu packet dengan tipe yang sudah menyempit. */
export interface FlowMove {
  from: NodeId;
  to: NodeId;
  kind: PacketKind;
  durationMs: number;
  delayMs: number;
}

/** Satu langkah lesson tanda tangan digital: copy, animasi, dan state node. */
export interface FlowStep {
  /** Id stabil untuk key React dan testid timeline. */
  id: string;
  number: number;
  label: string;
  title: string;
  narration: string[];
  keyIdea: string;
  moves: FlowMove[];
  /** Tile HUD langkah ini (status dokumen, unggahan, tanda tangan) — nilai kini, bukan akumulasi. */
  metrics: HudMetric[];
  nodeStates: Record<NodeId, 'idle' | 'active' | 'done'>;
  /** Stasiun yang muncul di langkah ini (progressive disclosure). */
  reveals: readonly NodeId[];
}

export type { HudMetric, PacketMove };
