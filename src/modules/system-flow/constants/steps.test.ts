import { describe, expect, it } from 'vitest';

import { DIAGRAM, edgePairKey } from './diagram';
import { STEPS, TOTAL_MS } from './steps';

import type { NodeId } from '../types/flow';

const NODE_IDS: readonly NodeId[] = ['user', 'app', 'server', 'database'];
const EDGE_PAIRS = new Set(
  DIAGRAM.edges.map((edge) => edgePairKey(edge.from, edge.to)),
);

describe('STEPS', () => {
  it('memuat enam langkah bernomor berurutan', () => {
    expect(STEPS).toHaveLength(6);
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

  it('id metric unik di seluruh langkah dan totalnya konsisten', () => {
    const ids = STEPS.flatMap((step) =>
      step.metrics.map((metric) => metric.id),
    );
    expect(new Set(ids).size).toBe(ids.length);

    const sum = STEPS.reduce(
      (acc, step) =>
        acc + step.metrics.reduce((acc2, metric) => acc2 + metric.valueMs, 0),
      0,
    );
    expect(TOTAL_MS).toBe(sum);
    expect(TOTAL_MS).toBe(285);
  });

  it('nodeStates mencakup semua node', () => {
    for (const step of STEPS) {
      expect(Object.keys(step.nodeStates)).toEqual([...NODE_IDS]);
    }
  });
});
