import { LessonThemeToggle } from '@/modules/common/lesson/components/theme-toggle';

import type React from 'react';

/** Toggle tema header lesson alur request (chrome bersama di common/lesson). */
export default function ThemeToggle(): React.JSX.Element {
  return <LessonThemeToggle testId="system-flow.button.theme.click" />;
}
