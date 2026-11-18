import { buildSystemFlowStepUrl } from '@/modules/common/auth/route-permissions';
import { useStepMachine } from '@/modules/common/lesson/hooks/use-step-machine';

import { getStep, STEPS, stepPaceMs } from '../constants/steps';

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

export interface FlowMachineOptions {
  /** Indeks langkah awal dari URL (dioper .astro); default langkah pertama. */
  initialStepIndex?: number;
}

/**
 * Mesin state lesson alur request: tipis di atas mesin langkah bersama
 * (common/lesson) dengan pace, URL langkah, dan langkah aktif milik modul ini.
 */
export function useFlowMachine({
  initialStepIndex = 0,
}: FlowMachineOptions = {}): FlowMachine {
  const machine = useStepMachine({
    stepCount: STEPS.length,
    initialStepIndex,
    paceMs: (stepIndex) => stepPaceMs(getStep(stepIndex)),
    urlForStep: buildSystemFlowStepUrl,
  });

  return { ...machine, step: getStep(machine.stepIndex) };
}
