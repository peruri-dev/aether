import { describe, expect, it } from 'vitest';

import type { HudMetric } from '@/modules/common/lesson/types';

import { DIAGRAM, edgePairKey } from './diagram';
import { parseStepParam, STEPS } from './steps';
import { DOC_PROGRESSION } from './steps-runtime';

import type { NodeId } from '../types/flow';

const NODE_IDS: readonly NodeId[] = [
  'login',
  'sign',
  'backend',
  'oss',
  'core',
  'soa',
  'kms',
];
const EDGE_PAIRS = new Set(
  DIAGRAM.edges.map((edge) => edgePairKey(edge.from, edge.to)),
);

function metric(stepIndex: number, id: string): HudMetric {
  const metric = STEPS[stepIndex]?.metrics.find((m) => m.id === id);
  if (!metric) {
    throw new Error(`Metric ${id} tidak ada di langkah ${stepIndex + 1}`);
  }
  return metric;
}

describe('STEPS (perjalanan tanda tangan digital)', () => {
  it('memuat sebelas langkah bernomor berurutan', () => {
    expect(STEPS).toHaveLength(11);
    STEPS.forEach((step, index) => {
      expect(step.number).toBe(index + 1);
    });
  });

  it('setiap langkah punya copy lengkap', () => {
    for (const step of STEPS) {
      expect(step.label.length).toBeGreaterThan(0);
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.keyIdea.length).toBeGreaterThan(0);
      expect(step.narration).toHaveLength(2);
      for (const paragraph of step.narration) {
        expect(paragraph.length).toBeGreaterThan(0);
      }
    }
  });

  it('setiap move mengikuti edge yang ada di diagram', () => {
    for (const step of STEPS) {
      for (const move of step.moves) {
        expect(EDGE_PAIRS.has(edgePairKey(move.from, move.to))).toBe(true);
        expect(move.durationMs).toBeGreaterThan(0);
        expect(move.delayMs).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('status dokumen berjalan Belum ada → Terunggah → Terdaftar → Ditandatangani', () => {
    expect(DOC_PROGRESSION[0]).toBe('Belum ada');
    expect(DOC_PROGRESSION[3]).toBe('Terunggah');
    expect(DOC_PROGRESSION[4]).toBe('Terdaftar');
    expect(DOC_PROGRESSION[10]).toBe('Ditandatangani');
    for (const status of DOC_PROGRESSION) {
      expect([
        'Belum ada',
        'Terunggah',
        'Terdaftar',
        'Ditandatangani',
      ]).toContain(status);
    }
  });

  it('unggahan dan tanda tangan mengikuti fase langkah', () => {
    // unggahan: belum ada di langkah 1, siap direct di langkah 3, selesai sejak langkah 5
    expect(metric(0, 'upload').text).toBe('—');
    expect(metric(2, 'upload').text).toBe('Langsung ke OSS');
    for (let index = 4; index < STEPS.length; index += 1) {
      expect(metric(index, 'upload').text).toBe('Selesai');
    }
    // tanda tangan: mulai dilacak di langkah 6, valid di langkah terakhir
    for (let index = 0; index < 5; index += 1) {
      expect(metric(index, 'sign').text).toBe('—');
    }
    expect(metric(5, 'sign').text).toBe('Belum');
    expect(metric(10, 'sign').text).toBe('Valid');
  });

  it('langkah penutup: rantai balik KMS → SOA → API Core → Backend → Halaman', () => {
    const last = STEPS[STEPS.length - 1];
    if (!last) {
      throw new Error('Langkah penutup tidak ada');
    }
    expect(last.moves.map((move) => edgePairKey(move.from, move.to))).toEqual([
      'kms-soa',
      'core-soa',
      'backend-core',
      'backend-sign',
    ]);
    expect(last.moves.map((move) => move.kind)).toEqual([
      'signedDoc',
      'signedDoc',
      'signedDoc',
      'signedDoc',
    ]);
    expect(last.moves.map((move) => move.delayMs)).toEqual([
      0, 650, 1300, 2050,
    ]);
    for (const state of Object.values(last.nodeStates)) {
      expect(state).toBe('done');
    }
  });

  it('setiap stasiun reveal tepat satu kali di seluruh langkah', () => {
    const revealed = STEPS.flatMap((step) => step.reveals);
    expect(new Set(revealed).size).toBe(revealed.length);
    expect(new Set(revealed)).toEqual(new Set(NODE_IDS));
  });

  it('metric tile memuat status dokumen, unggahan, dan tanda tangan', () => {
    for (const step of STEPS) {
      const ids = step.metrics.map((metric) => metric.id);
      expect(ids).toEqual(['doc', 'upload', 'sign']);
      for (const metric of step.metrics) {
        expect(metric.text).toBeTruthy();
        expect(metric.valueMs).toBeUndefined();
      }
    }
  });
});

describe('parseStepParam', () => {
  it('menerima nomor langkah valid', () => {
    expect(parseStepParam('1')).toBe(1);
    expect(parseStepParam('11')).toBe(11);
  });

  it('menolak nilai di luar rentang, non-angka, dan kosong', () => {
    expect(parseStepParam('0')).toBeNull();
    expect(parseStepParam('12')).toBeNull();
    expect(parseStepParam('3x')).toBeNull();
    expect(parseStepParam('abc')).toBeNull();
    expect(parseStepParam(undefined)).toBeNull();
  });
});
