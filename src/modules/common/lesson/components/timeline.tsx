import { cx } from '@/modules/common/styles/cx';
import { focusRing } from '@/modules/common/styles/interactive';

import type { LessonStepMeta } from '../types';
import type React from 'react';

interface LessonTimelineProps {
  steps: readonly LessonStepMeta[];
  activeIndex: number;
  onSelect: (index: number) => void;
  /** Awalan testid, mis. "system-flow" → "system-flow.timeline.step". */
  testIdPrefix: string;
}

/**
 * Stepper langkah: lingkaran bernomor di atas rail penghubung.
 * Setiap chip bisa diklik untuk lompat ke langkahnya; hanya chip aktif
 * yang membawa aria-current="step".
 */
export function LessonTimeline({
  steps,
  activeIndex,
  onSelect,
  testIdPrefix,
}: Readonly<LessonTimelineProps>): React.JSX.Element {
  const lastIndex = steps.length - 1;

  return (
    <ol className="flex w-full items-start">
      {steps.map((step, index) => {
        const isActive = index === activeIndex;
        const isReached = index <= activeIndex;

        return (
          <li key={step.id} className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center">
              <span
                aria-hidden="true"
                className={cx(
                  'h-0.5 flex-1 rounded-full',
                  index === 0
                    ? 'invisible'
                    : isReached
                      ? 'bg-guide-500'
                      : 'bg-stroke-primary',
                )}
              />
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Langkah ${step.number}: ${step.label}`}
                data-testid={`${testIdPrefix}.timeline.step`}
                data-step-id={step.id}
                className={cx(
                  'z-10 flex cursor-pointer flex-col items-center gap-1 rounded-8 p-1',
                  focusRing,
                )}
              >
                <span
                  className={cx(
                    'grid size-7 place-items-center rounded-full border text-xs font-semibold transition-colors duration-300',
                    isActive
                      ? 'border-guide-500 bg-guide-500 text-content-on-brand'
                      : isReached
                        ? 'border-guide-500 bg-background-tertiary text-content-guide'
                        : 'border-stroke-primary bg-background-secondary text-content-tertiary',
                  )}
                >
                  {step.number}
                </span>
                <span
                  className={cx(
                    // label disembunyikan di layar kecil agar chip tidak bertumpuk;
                    // accessible name tombol tetap memuat label lengkap
                    'hidden max-w-24 truncate text-xs sm:block',
                    isActive
                      ? 'font-semibold text-content-primary'
                      : 'text-content-tertiary',
                  )}
                >
                  {step.label}
                </span>
              </button>
              <span
                aria-hidden="true"
                className={cx(
                  'h-0.5 flex-1 rounded-full',
                  index === lastIndex
                    ? 'invisible'
                    : index < activeIndex
                      ? 'bg-guide-500'
                      : 'bg-stroke-primary',
                )}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
