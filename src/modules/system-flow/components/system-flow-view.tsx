import { useEffect, useMemo } from 'react';
import { TbPlayerPause, TbPlayerPlay, TbRoute, TbRotate } from 'react-icons/tb';

import { Button } from '@/modules/common/components/button';

import FlowDiagram, { FlowLegend } from './flow-diagram';
import FlowHud from './flow-hud';
import FlowTimeline from './flow-timeline';
import StepPanel from './step-panel';
import ThemeToggle from './theme-toggle';
import { STEPS, TOTAL_MS } from '../constants/steps';
import { useFlowMachine } from '../hooks/use-flow-machine';

import type React from 'react';

export interface SystemFlowViewProps {
  /** Nama brand di header; dioper dari .astro (PUBLIC_BRAND). */
  brand?: string;
}

/** Halaman pelajaran interaktif: alur request dari pengguna sampai database. */
export default function SystemFlowView({
  brand = 'Aether',
}: Readonly<SystemFlowViewProps>): React.JSX.Element {
  const machine = useFlowMachine();
  const { step, next, prev, replay, togglePlay } = machine;
  const isLastStep = machine.stepIndex === machine.stepCount - 1;
  const nextStep = STEPS.at(machine.stepIndex + 1);

  const revealedMetrics = useMemo(
    () =>
      STEPS.slice(0, machine.stepIndex + 1).flatMap((entry) => entry.metrics),
    [machine.stepIndex],
  );

  // Pintasan keyboard. Dilewati saat mengetik di input atau dengan modifier,
  // dan Spasi tidak mengambil alih tombol yang sedang difokus.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]'))
        return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === 'ArrowRight') {
        next();
        event.preventDefault();
        return;
      }
      if (event.key === 'ArrowLeft') {
        prev();
        event.preventDefault();
        return;
      }
      if (event.key === 'r' || event.key === 'R') {
        replay();
        return;
      }
      if (event.key === ' ') {
        if (target?.tagName === 'BUTTON') return;
        togglePlay();
        event.preventDefault();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [next, prev, replay, togglePlay]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6">
      {/* Pengumuman perubahan langkah untuk screen reader. */}
      <p role="status" aria-live="polite" className="sr-only">
        {`Langkah ${step.number} dari ${machine.stepCount}: ${step.title}`}
      </p>

      <header className="flex items-center justify-between gap-3 border-b border-stroke-primary pb-3">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-8 bg-brand-primary text-content-on-brand"
          >
            <TbRoute className="size-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-content-primary">{brand}</p>
            <p className="text-xs text-content-tertiary">
              Pelajaran interaktif · alur request
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-12 border border-stroke-primary bg-background-secondary p-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-medium tracking-widest text-content-tertiary uppercase">
              Waktu per hop
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={replay}
                data-testid="system-flow.button.replay.click"
                aria-label="Ulangi dari langkah pertama"
              >
                <span className="flex items-center gap-1.5">
                  <TbRotate className="size-4" aria-hidden="true" /> Ulangi
                </span>
              </Button>
              <Button
                variant="outline"
                onClick={togglePlay}
                disabled={machine.reducedMotion}
                data-testid="system-flow.button.play.click"
                aria-label={
                  machine.playing ? 'Jeda animasi' : 'Jalankan animasi'
                }
              >
                <span className="flex items-center gap-1.5">
                  {machine.playing ? (
                    <TbPlayerPause className="size-4" aria-hidden="true" />
                  ) : (
                    <TbPlayerPlay className="size-4" aria-hidden="true" />
                  )}
                  {machine.playing ? 'Jeda' : 'Jalankan'}
                </span>
              </Button>
            </div>
          </div>
          <FlowHud
            metrics={revealedMetrics}
            showTotal={isLastStep}
            totalMs={TOTAL_MS}
            animate={!machine.reducedMotion}
          />
          <FlowDiagram
            step={step}
            runId={machine.runId}
            reducedMotion={machine.reducedMotion}
          />
          <FlowLegend />
        </div>

        <StepPanel
          step={step}
          stepCount={machine.stepCount}
          canBack={machine.stepIndex > 0}
          canNext={!isLastStep}
          nextLabel={nextStep ? `Lanjut: ${nextStep.label}` : 'Selesai'}
          onBack={prev}
          onNext={next}
        />
      </div>

      <FlowTimeline
        steps={STEPS}
        activeIndex={machine.stepIndex}
        onSelect={machine.goTo}
      />
    </div>
  );
}
