import { describe, expect, it } from 'vitest';

import { cx } from './cx';

describe('cx', () => {
  it('membuang nilai falsy dan menggabungkan kondisional', () => {
    const withClasses = (isHidden: boolean): string =>
      cx('p-4', isHidden && 'hidden', undefined, {
        'font-bold': true,
        italic: false,
      });

    expect(withClasses(false)).toBe('p-4 font-bold');
    expect(withClasses(true)).toBe('p-4 hidden font-bold');
  });

  it('class terakhir menang saat bentrok', () => {
    expect(cx('p-2', 'p-4')).toBe('p-4');
  });

  it('mengenali warna token semantic', () => {
    expect(cx('text-content-primary', 'text-content-secondary')).toBe(
      'text-content-secondary',
    );
    expect(cx('bg-background-primary', 'bg-brand-primary')).toBe(
      'bg-brand-primary',
    );
  });

  it('tidak menganggap ukuran teks dan warna teks bentrok', () => {
    expect(cx('text-sm', 'text-content-primary')).toBe(
      'text-sm text-content-primary',
    );
  });

  it('mengenali radius dari token Figma', () => {
    expect(cx('rounded-4', 'rounded-8')).toBe('rounded-8');
  });
});
