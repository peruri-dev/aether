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
  const active = steps[activeIndex];
  /** Rail harus berhenti tepat di pusat lingkaran pertama dan terakhir. */
  const railInset = `${100 / (steps.length * 2)}%`;
  /** Pusat lingkaran dari atas chip: padding p-1 (4px) + setengah size-8 (16px). */
  const railTop = 19;

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
      <ol className="relative flex w-full items-start">
        {/* Rail kontinu di belakang semua chip: menyentuh tepi setiap lingkaran
            karena lingkaran (opaque, lapisan atas) menutupinya di tengah chip. */}
        <span
          aria-hidden="true"
          className="absolute h-0.5 rounded-full bg-stroke-primary"
          style={{ top: railTop, left: railInset, right: railInset }}
        />
        {steps.map((step, index) => {
          const isActive = index === activeIndex;

          return (
            <li
              key={step.id}
              className="relative z-10 flex min-w-0 flex-1 flex-col"
            >
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Langkah ${step.number}: ${step.label}`}
                data-testid={`${testIdPrefix}.timeline.step`}
                data-step-id={step.id}
                className={cx(
                  'flex cursor-pointer flex-col items-center gap-1 rounded-8 p-1',
                  focusRing,
                )}
              >
                <span
                  className={cx(
                    'grid size-8 place-items-center rounded-full border text-sm font-semibold tabular-nums transition-colors duration-300',
                    isActive
                      ? 'animate-hud-pop border-guide-500 bg-guide-500 text-content-on-brand'
                      : 'border-stroke-primary bg-background-tertiary text-content-tertiary',
                  )}
                >
                  {step.number}
                </span>
                {/* Slot label setinggi tetap: hanya langkah aktif yang berisi
                    teks (animasi masuk saat pindah langkah), supaya baris chip
                    tidak melompat. */}
                <span className="flex h-4 max-w-24 items-center justify-center text-xs">
                  {isActive ? (
                    <span className="animate-in truncate font-semibold text-content-primary duration-300 fade-in slide-in-from-bottom-1">
                      {step.label}
                    </span>
                  ) : (
                    <span className="invisible">{step.label}</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
