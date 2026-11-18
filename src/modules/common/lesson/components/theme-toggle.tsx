import { TbMoon, TbSun } from 'react-icons/tb';

import { Button } from '@/modules/common/components/button';

import { useTheme } from '../hooks/use-theme';

import type React from 'react';

interface LessonThemeToggleProps {
  /** Testid tombol, mis. "system-flow.button.theme.click". */
  testId: string;
}

/** Tombol flip tema gelap/terang untuk header lesson. */
export function LessonThemeToggle({
  testId,
}: Readonly<LessonThemeToggleProps>): React.JSX.Element {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
      data-testid={testId}
      className="size-9 p-0"
    >
      {isDark ? (
        <TbSun className="size-4" aria-hidden="true" />
      ) : (
        <TbMoon className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}
