import { TbMoon, TbSun } from 'react-icons/tb';

import { Button } from '@/modules/common/components/button';

import { useTheme } from '../hooks/use-theme';

import type React from 'react';

/**
 * Toggle tema terang/gelap via atribut data-theme di <html>.
 * Tanpa persistensi di iterasi ini (lihat use-theme).
 */
export default function ThemeToggle(): React.JSX.Element {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
      data-testid="system-flow.button.theme.click"
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
