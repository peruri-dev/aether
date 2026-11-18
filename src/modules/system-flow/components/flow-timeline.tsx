import { LessonTimeline } from '@/modules/common/lesson/components/timeline';

import type { FlowStep } from '../types/flow';
import type React from 'react';

interface FlowTimelineProps {
  steps: readonly FlowStep[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

/** Stepper langkah lesson alur request (chrome bersama di common/lesson). */
export default function FlowTimeline({
  steps,
  activeIndex,
  onSelect,
}: Readonly<FlowTimelineProps>): React.JSX.Element {
  return (
    <LessonTimeline
      steps={steps}
      activeIndex={activeIndex}
      onSelect={onSelect}
      testIdPrefix="system-flow"
    />
  );
}
