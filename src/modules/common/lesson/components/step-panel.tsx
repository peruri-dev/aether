import { useId } from 'react';
import { TbArrowLeft, TbArrowRight, TbBulb } from 'react-icons/tb';

import { Button } from '@/modules/common/components/button';

import type { LessonStepContent } from '../types';
import type React from 'react';

const kbdClass =
  'rounded-4 border border-stroke-primary bg-background-tertiary px-1.5 py-0.5 text-xs';

interface LessonStepPanelProps {
  content: LessonStepContent;
  stepCount: number;
  canBack: boolean;
  canNext: boolean;
  nextLabel: string;
  onBack: () => void;
  onNext: () => void;
  /** Awalan testid, mis. "system-flow" → "system-flow.button.next.click". */
  testIdPrefix: string;
}

/** Panel kanan lesson: nomor langkah, judul, narasi, key idea, dan navigasi. */
export function LessonStepPanel({
  content,
  stepCount,
  canBack,
  canNext,
  nextLabel,
  onBack,
  onNext,
  testIdPrefix,
}: Readonly<LessonStepPanelProps>): React.JSX.Element {
  const headingId = useId();

  return (
    <section
      key={content.title}
      aria-labelledby={headingId}
      className="flex animate-in flex-col gap-4 rounded-12 border border-stroke-primary bg-background-secondary p-4 duration-300 fade-in slide-in-from-bottom-1"
    >
      <p className="text-xs font-medium tracking-widest text-content-tertiary uppercase">
        Langkah {content.number} dari {stepCount}
      </p>
      <h2 id={headingId} className="text-xl font-bold text-content-primary">
        {content.title}
      </h2>
      <div className="flex flex-col gap-3">
        {content.narration.map((paragraph) => (
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
          {content.keyIdea}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={!canBack}
          data-testid={`${testIdPrefix}.button.back.click`}
        >
          <span className="flex items-center gap-1.5">
            <TbArrowLeft className="size-4" aria-hidden="true" /> Kembali
          </span>
        </Button>
        <Button
          onClick={onNext}
          disabled={!canNext}
          data-testid={`${testIdPrefix}.button.next.click`}
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
        langkah
        <kbd className={kbdClass}>R</kbd>
        ulangi
        <kbd className={kbdClass}>Spasi</kbd>
        jeda
      </p>
    </section>
  );
}
