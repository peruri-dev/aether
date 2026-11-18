/**
 * Tipe dasar mesin lesson interaktif. ID node dan kind packet sengaja string
 * agar tiap lesson menyetel tipenya sendiri (union NodeId masing-masing);
 * struktur scene dan chrome tetap satu mesin untuk semua lesson.
 */

/** Visual state node: diam, sedang bekerja, atau selesai. */
export type NodeState = 'idle' | 'active' | 'done';

/** Satu tile di HUD. Nilainya bisa angka ms (animasi count-up) atau teks. */
export interface HudMetric {
  /** Id stabil: key React + kontrak test. */
  id: string;
  /** Label micro uppercase, mis. "DNS LOOKUP". */
  label: string;
  /** Nilai milidetik; HUD menganimasikannya dari 0. */
  valueMs?: number;
  /** Nilai teks statis, mis. status akun atau "0/5". */
  text?: string;
}

/** Perjalanan satu packet: dari node A ke node B. */
export interface PacketMove {
  from: string;
  to: string;
  kind: string;
  /** Durasi perjalanan (transition-duration CSS). */
  durationMs: number;
  /** Tunda mulai, untuk hop berantai dalam satu langkah. */
  delayMs: number;
}

/** Metadata langkah untuk chip timeline. */
export interface LessonStepMeta {
  /** Id stabil untuk key React dan testid timeline. */
  id: string;
  /** Nomor 1-based, dipakai untuk "Langkah X dari N". */
  number: number;
  /** Label pendek di chip timeline. */
  label: string;
}

/** Isi naratif satu langkah untuk panel pembelajaran. */
export interface LessonStepContent {
  number: number;
  title: string;
  narration: readonly string[];
  keyIdea: string;
}
