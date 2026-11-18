import { describe, expect, it } from 'vitest';

import { DIAGRAM, edgePairKey } from './diagram';
import { parseStepParam, STEPS } from './steps';
import { STATUS_PROGRESSION } from './steps-runtime';

import type { NodeId } from '../types/flow';

const NODE_IDS: readonly NodeId[] = [
  'login',
  'api',
  'password',
  'totp',
  'verify',
  'dashboard',
];
const EDGE_PAIRS = new Set(
  DIAGRAM.edges.map((edge) => edgePairKey(edge.from, edge.to)),
);

describe('STEPS (perjalanan login Dashbent)', () => {
  it('memuat sepuluh langkah bernomor berurutan', () => {
    expect(STEPS).toHaveLength(10);
    STEPS.forEach((step, index) => {
      expect(step.number).toBe(index + 1);
    });
  });

  it('setiap langkah punya copy lengkap', () => {
    for (const step of STEPS) {
      expect(step.label.length).toBeGreaterThan(0);
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.keyIdea.length).toBeGreaterThan(0);
      expect(step.narration.length).toBeGreaterThan(0);
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

  it('status akun mengikuti mesin status [BR-003]', () => {
    // MENUNGGU_AKTIVASI -> MENUNGGU_TOTP -> AKTIF, tanpa melompat mundur.
    expect(STATUS_PROGRESSION[0]).toBe('MENUNGGU_AKTIVASI');
    expect(STATUS_PROGRESSION[2]).toBe('MENUNGGU_TOTP');
    expect(STATUS_PROGRESSION[5]).toBe('AKTIF');
    for (const status of STATUS_PROGRESSION) {
      expect(['MENUNGGU_AKTIVASI', 'MENUNGGU_TOTP', 'AKTIF']).toContain(status);
    }
  });

  it('setiap stasiun reveal tepat satu kali di seluruh langkah', () => {
    const revealed = STEPS.flatMap((step) => step.reveals);
    expect(new Set(revealed).size).toBe(revealed.length);
    expect(new Set(revealed)).toEqual(new Set(NODE_IDS));
  });

  it('metric tile memuat teks status, counter gagal, dan sesi', () => {
    for (const step of STEPS) {
      const ids = step.metrics.map((metric) => metric.id);
      expect(ids).toEqual(['status', 'failed', 'session']);
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
    expect(parseStepParam('10')).toBe(10);
  });

  it('menolak nilai di luar rentang, non-angka, dan kosong', () => {
    expect(parseStepParam('0')).toBeNull();
    expect(parseStepParam('11')).toBeNull();
    expect(parseStepParam('3x')).toBeNull();
    expect(parseStepParam('abc')).toBeNull();
    expect(parseStepParam(undefined)).toBeNull();
  });
});
