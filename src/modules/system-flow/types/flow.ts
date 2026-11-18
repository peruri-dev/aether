/** Identitas node dalam diagram alur. */
export type NodeId = 'user' | 'app' | 'server' | 'database';

/** Visual state node: diam, sedang bekerja, atau selesai. */
export type NodeState = 'idle' | 'active' | 'done';

/** Jenis packet yang bergerak antar node. */
export type PacketKind = 'request' | 'response' | 'handshake';

/** Satu stat waktu di HUD, dalam milidetik. */
export interface HudMetric {
  /** Id stabil: key React + kontrak test. */
  id: string;
  /** Label micro uppercase, mis. "DNS LOOKUP". */
  label: string;
  /** Nilai yang ditampilkan, dalam ms. */
  valueMs: number;
}

/** Perjalanan satu packet: dari node A ke node B. */
export interface PacketMove {
  from: NodeId;
  to: NodeId;
  kind: PacketKind;
  /** Durasi perjalanan (transition-duration CSS). */
  durationMs: number;
  /** Tunda mulai, untuk hop berantai dalam satu langkah. */
  delayMs: number;
}

/** Satu langkah pelajaran: copy, animasi, metric, dan state node. */
export interface FlowStep {
  /** Id stabil untuk key React dan testid timeline. */
  id: string;
  /** Nomor 1-based, dipakai untuk "Langkah X dari N". */
  number: number;
  /** Label pendek di chip timeline. */
  label: string;
  title: string;
  narration: string[];
  keyIdea: string;
  moves: PacketMove[];
  /** Metric yang diungkap langkah ini; HUD menampilkan gabungan langkah 0..aktif. */
  metrics: HudMetric[];
  nodeStates: Record<NodeId, NodeState>;
}
