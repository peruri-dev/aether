import { useCallback, useEffect, useState } from 'react';

import { useReducedMotion } from './use-reduced-motion';
import {
  getStep,
  LAST_STEP_INDEX,
  STEPS,
  stepPaceMs,
} from '../constants/steps';

import type { FlowStep } from '../types/flow';

export interface FlowMachine {
  stepIndex: number;
  step: FlowStep;
  stepCount: number;
  playing: boolean;
  /** Naik setiap replay; dipakai sebagai key agar packet di-remount dan animasi restart. */
  runId: number;
  reducedMotion: boolean;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  replay: () => void;
  togglePlay: () => void;
}

/**
 * Mesin state pelajaran: langkah aktif, autoplay, dan kontrolnya.
 * Autoplay memajukan langkah per langkah lalu berhenti di langkah terakhir;
 * `goTo` menghentikan autoplay agar pelajar tetap memegang kendali.
 */
export function useFlowMachine(): FlowMachine {
  const reducedMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    if (stepIndex >= LAST_STEP_INDEX) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(
      () => {
        setStepIndex((current) => Math.min(current + 1, LAST_STEP_INDEX));
      },
      stepPaceMs(getStep(stepIndex)),
    );
    return () => {
      window.clearTimeout(timer);
    };
  }, [playing, reducedMotion, stepIndex]);

  const next = useCallback((): void => {
    setStepIndex((current) => Math.min(current + 1, LAST_STEP_INDEX));
  }, []);

  const prev = useCallback((): void => {
    setStepIndex((current) => Math.max(current - 1, 0));
  }, []);

  const goTo = useCallback((index: number): void => {
    setStepIndex(Math.min(Math.max(index, 0), LAST_STEP_INDEX));
    setPlaying(false);
  }, []);

  const replay = useCallback((): void => {
    setStepIndex(0);
    setRunId((current) => current + 1);
    setPlaying(!reducedMotion);
  }, [reducedMotion]);

  const togglePlay = useCallback((): void => {
    if (reducedMotion) return;
    setPlaying((current) => !current);
  }, [reducedMotion]);

  return {
    stepIndex,
    step: getStep(stepIndex),
    stepCount: STEPS.length,
    playing,
    runId,
    reducedMotion,
    next,
    prev,
    goTo,
    replay,
    togglePlay,
  };
}
