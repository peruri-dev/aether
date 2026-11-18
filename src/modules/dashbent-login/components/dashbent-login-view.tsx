import { useEffect, useMemo } from 'react';
import {
  TbPlayerPause,
  TbPlayerPlay,
  TbShieldLock,
  TbRotate,
} from 'react-icons/tb';

import { buildDashbentLoginStepUrl } from '@/modules/common/auth/route-permissions';
import { Button } from '@/modules/common/components/button';
import { LessonHud } from '@/modules/common/lesson/components/hud';
import { LessonStepPanel } from '@/modules/common/lesson/components/step-panel';
import { LessonThemeToggle } from '@/modules/common/lesson/components/theme-toggle';
import { LessonTimeline } from '@/modules/common/lesson/components/timeline';
import { useStepMachine } from '@/modules/common/lesson/hooks/use-step-machine';

import LoginDiagram, { LoginLegend } from './login-diagram';
import { STEPS } from '../constants/steps';
import { getStep, stepPaceMs } from '../constants/steps-runtime';

import type React from 'react';

export interface DashbentLoginViewProps {
  /** Nama brand di header; dioper dari .astro (PUBLIC_BRAND). */
  brand?: string;
  /** Nomor langkah awal dari URL (1..10); dioper .astro agar refresh tidak reset. */
  initialStep?: number;
}

const TEST_ID_PREFIX = 'dashbent-login';

/**
 * Halaman lesson interaktif perjalanan login Dashbent Backoffice: dari akun
 * provisioning CMP dengan password sementara sampai sesi penuh di Dashboard.
 */
export default function DashbentLoginView({
  brand = 'Aether',
  initialStep = 1,
}: Readonly<DashbentLoginViewProps>): React.JSX.Element {
  const machine = useStepMachine({
    stepCount: STEPS.length,
    initialStepIndex: initialStep - 1,
    paceMs: (stepIndex) => stepPaceMs(getStep(stepIndex)),
    urlForStep: buildDashbentLoginStepUrl,
  });
  const step = getStep(machine.stepIndex);
  const { next, prev, replay, togglePlay } = machine;
  const isLastStep = machine.stepIndex === machine.stepCount - 1;
  const nextStep = STEPS.at(machine.stepIndex + 1);

  // HUD login menampilkan nilai kini (status akun, counter), bukan akumulasi.
  const metrics = step.metrics;

  // Progressive disclosure: stasiun baru muncul saat pertama terlibat alur.
  const revealedNodes = useMemo(
    () =>
      new Set(
        STEPS.slice(0, machine.stepIndex + 1).flatMap((entry) => entry.reveals),
      ),
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
            <TbShieldLock className="size-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-content-primary">{brand}</p>
            <p className="text-xs text-content-tertiary">
              Pelajaran interaktif · alur login Dashbent
            </p>
          </div>
        </div>
        <LessonThemeToggle testId="dashbent-login.button.theme.click" />
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-12 border border-stroke-primary bg-background-secondary p-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-medium tracking-widest text-content-tertiary uppercase">
              Kondisi kini
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={replay}
                data-testid="dashbent-login.button.replay.click"
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
                data-testid="dashbent-login.button.play.click"
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
          <LessonHud metrics={metrics} animate={!machine.reducedMotion} />
          <LoginDiagram
            step={step}
            runId={machine.runId}
            revealedNodes={revealedNodes}
            reducedMotion={machine.reducedMotion}
          />
          <LoginLegend />
        </div>

        <LessonStepPanel
          content={step}
          stepCount={machine.stepCount}
          canBack={machine.stepIndex > 0}
          canNext={!isLastStep}
          nextLabel={nextStep ? `Lanjut: ${nextStep.label}` : 'Selesai'}
          onBack={prev}
          onNext={next}
          testIdPrefix={TEST_ID_PREFIX}
        />
      </div>

      <LessonTimeline
        steps={STEPS}
        activeIndex={machine.stepIndex}
        onSelect={machine.goTo}
        testIdPrefix={TEST_ID_PREFIX}
      />
    </div>
  );
}
