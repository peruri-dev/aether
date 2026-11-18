import { useCallback, useEffect, useState } from 'react';

import { useReducedMotion } from './use-reduced-motion';

export interface StepMachine {
  stepIndex: number;
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

export interface StepMachineOptions {
  /** Jumlah seluruh langkah lesson. */
  stepCount: number;
  /** Indeks langkah awal dari URL (dioper .astro); default langkah pertama. */
  initialStepIndex?: number;
  /** Jeda autoplay (ms) untuk langkah pada indeks tertentu. */
  paceMs: (stepIndex: number) => number;
  /**
   * URL kanonik untuk nomor langkah (1-based). Bila diberikan, setiap
   * perubahan langkah disinkronkan ke URL via history.replaceState: refresh
   * tidak mengembalikan pelajar ke awal, dan autoplay tidak membanjiri riwayat.
   */
  urlForStep?: (stepNumber: number) => string;
}

/**
 * Mesin state pelajaran: langkah aktif, autoplay, dan kontrolnya.
 * Autoplay memajukan langkah per langkah lalu berhenti di langkah terakhir;
 * `goTo` menghentikan autoplay agar pelajar tetap memegang kendali.
 */
export function useStepMachine({
  stepCount,
  initialStepIndex = 0,
  paceMs,
  urlForStep,
}: StepMachineOptions): StepMachine {
  const reducedMotion = useReducedMotion();
  const lastIndex = stepCount - 1;
  const [stepIndex, setStepIndex] = useState(() =>
    Math.min(Math.max(initialStepIndex, 0), lastIndex),
  );
  const [playing, setPlaying] = useState(false);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    if (stepIndex >= lastIndex) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setStepIndex((current) => Math.min(current + 1, lastIndex));
    }, paceMs(stepIndex));
    return () => {
      window.clearTimeout(timer);
    };
    // paceMs stabil di sisi pemanggil (fungsi murni dari konstanta lesson).
  }, [playing, reducedMotion, stepIndex, lastIndex, paceMs]);

  // Langkah aktif disimpan di URL path (aturan state di URL). replaceState agar
  // tombol Back tetap keluar dari halaman seperti biasa.
  useEffect(() => {
    if (!urlForStep) return;
    window.history.replaceState(null, '', urlForStep(stepIndex + 1));
  }, [stepIndex, urlForStep]);

  const next = useCallback((): void => {
    setStepIndex((current) => Math.min(current + 1, lastIndex));
  }, [lastIndex]);

  const prev = useCallback((): void => {
    setStepIndex((current) => Math.max(current - 1, 0));
  }, []);

  const goTo = useCallback(
    (index: number): void => {
      setStepIndex(Math.min(Math.max(index, 0), lastIndex));
      setPlaying(false);
    },
    [lastIndex],
  );

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
    stepCount,
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
