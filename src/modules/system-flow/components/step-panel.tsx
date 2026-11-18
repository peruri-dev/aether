import { LessonStepPanel } from '@/modules/common/lesson/components/step-panel';

import type { FlowStep } from '../types/flow';
import type React from 'react';

interface StepPanelProps {
  step: FlowStep;
  stepCount: number;
  canBack: boolean;
  canNext: boolean;
  nextLabel: string;
  onBack: () => void;
  onNext: () => void;
}

/** Panel kanan lesson alur request (chrome bersama di common/lesson). */
export default function StepPanel({
  step,
  stepCount,
  canBack,
  canNext,
  nextLabel,
  onBack,
  onNext,
}: Readonly<StepPanelProps>): React.JSX.Element {
  return (
    <LessonStepPanel
      content={step}
      stepCount={stepCount}
      canBack={canBack}
      canNext={canNext}
      nextLabel={nextLabel}
      onBack={onBack}
      onNext={onNext}
      testIdPrefix="system-flow"
    />
  );
}
