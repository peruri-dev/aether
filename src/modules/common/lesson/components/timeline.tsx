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
 * Stepper langkah ala course acuan: kartu berbingkai berisi baris header
 * ("Dalam pelajaran ini" + penghitung) dan deretan lingkaran bernomor di atas
 * rail penghubung. Hanya chip aktif berwarna dan berlabel; langkah lewat dan
 * belum dicapai tampil netral seragam. Setiap chip bisa diklik untuk lompat ke
 * langkahnya; hanya chip aktif yang membawa aria-current="step".
 */
export function LessonTimeline({
  steps,
  activeIndex,
  onSelect,
  testIdPrefix,
}: Readonly<LessonTimelineProps>): React.JSX.Element {
  const lastIndex = steps.length - 1;
  const active = steps[activeIndex];

  return (
    <section
      aria-label="Navigasi langkah pelajaran"
      className="flex flex-col gap-2 rounded-12 border border-stroke-primary bg-background-secondary p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium tracking-widest text-content-tertiary uppercase">
          Dalam pelajaran ini
        </p>
        <p
          className="text-xs text-content-tertiary"
          data-testid={`${testIdPrefix}.timeline.counter.text`}
        >
          Langkah {active?.number} dari {steps.length}
        </p>
      </div>
      <ol className="flex w-full items-start">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;

          return (
            <li key={step.id} className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center">
                <span
                  aria-hidden="true"
                  className={cx(
                    'h-0.5 flex-1 rounded-full bg-stroke-primary',
                    index === 0 && 'invisible',
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
                      'grid size-8 place-items-center rounded-full border text-sm font-semibold tabular-nums transition-colors duration-300',
                      isActive
                        ? 'border-guide-500 bg-guide-500 text-content-on-brand'
                        : 'border-stroke-primary bg-background-tertiary text-content-tertiary',
                    )}
                  >
                    {step.number}
                  </span>
                  {/* Slot label setinggi tetap: hanya langkah aktif yang berisi
                      teks, supaya baris chip tidak melompat saat pindah langkah. */}
                  <span
                    className={cx(
                      'max-w-24 truncate text-xs',
                      isActive
                        ? 'font-semibold text-content-primary'
                        : 'invisible',
                    )}
                  >
                    {step.label}
                  </span>
                </button>
                <span
                  aria-hidden="true"
                  className={cx(
                    'h-0.5 flex-1 rounded-full bg-stroke-primary',
                    index === lastIndex && 'invisible',
                  )}
                />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
