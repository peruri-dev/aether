import { useId } from 'react';
import { TbArrowLeft, TbArrowRight, TbBulb } from 'react-icons/tb';

import { Button } from '@/modules/common/components/button';

import type { FlowStep } from '../types/flow';
import type React from 'react';

const kbdClass =
  'rounded-4 border border-stroke-primary bg-background-tertiary px-1.5 py-0.5 text-xs';

interface StepPanelProps {
  step: FlowStep;
  stepCount: number;
  canBack: boolean;
  canNext: boolean;
  /** Label tombol lanjut, mis. "Lanjut: Query". */
  nextLabel: string;
  onBack: () => void;
  onNext: () => void;
}

/** Panel narasi langkah: judul, cerita, key idea, navigasi Back/Next, dan hint keyboard. */
export default function StepPanel({
  step,
  stepCount,
  canBack,
  canNext,
  nextLabel,
  onBack,
  onNext,
}: Readonly<StepPanelProps>): React.JSX.Element {
  const headingId = useId();

  return (
    <section
      key={step.id}
      aria-labelledby={headingId}
      className="flex animate-in flex-col gap-4 rounded-12 border border-stroke-primary bg-background-secondary p-4 duration-300 fade-in slide-in-from-bottom-1"
    >
      <p className="text-xs font-medium tracking-widest text-content-tertiary uppercase">
        Langkah {step.number} dari {stepCount}
      </p>
      <h2 id={headingId} className="text-xl font-bold text-content-primary">
        {step.title}
      </h2>
      <div className="flex flex-col gap-3">
        {step.narration.map((paragraph) => (
          <p
            key={paragraph.slice(0, 32)}
            className="text-sm/relaxed text-content-secondary"
          >
            {paragraph}
          </p>
        ))}
      </div>
      <div className="rounded-8 border-s-2 border-guide-500 bg-background-tertiary p-3">
        <p className="flex items-center gap-1.5 text-xs font-medium tracking-widest text-content-guide uppercase">
          <TbBulb className="size-4" aria-hidden="true" /> Key idea
        </p>
        <p className="mt-1.5 text-sm/relaxed text-content-secondary">
          {step.keyIdea}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={!canBack}
          data-testid="system-flow.button.back.click"
        >
          <span className="flex items-center gap-1.5">
            <TbArrowLeft className="size-4" aria-hidden="true" /> Kembali
          </span>
        </Button>
        <Button
          onClick={onNext}
          disabled={!canNext}
          data-testid="system-flow.button.next.click"
        >
          <span className="flex items-center gap-1.5">
            {nextLabel}
            <TbArrowRight className="size-4" aria-hidden="true" />
          </span>
        </Button>
      </div>
      <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-content-tertiary">
        <kbd className={kbdClass}>←</kbd>
        <kbd className={kbdClass}>→</kbd>
        <span>langkah</span>
        <span aria-hidden="true">·</span>
        <kbd className={kbdClass}>R</kbd>
        <span>ulangi</span>
        <span aria-hidden="true">·</span>
        <kbd className={kbdClass}>Spasi</kbd>
        <span>jeda</span>
      </p>
    </section>
  );
}
