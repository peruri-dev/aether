import { describe, expect, it } from 'vitest';

import { cx } from './cx';
import { focusInput, focusRing, hasErrorInput } from './interactive';

describe('interactive styles', () => {
  it('error state wins over focus state', () => {
    const result = cx(focusInput, hasErrorInput);

    expect(result).toContain('focus:border-negative-500');
    expect(result).toContain('focus:ring-negative-100');
    expect(result).not.toContain('focus:border-stroke-tertiary');
    expect(result).not.toContain('focus:ring-stroke-primary');
  });

  it('focus ring uses a token color, not the Tailwind palette', () => {
    expect(focusRing.join(' ')).not.toMatch(/\b(blue|gray|red|white|black)-/);
  });
});
