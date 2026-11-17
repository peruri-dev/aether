import { describe, expect, it } from 'vitest';

import { tv } from './tv';

describe('tv', () => {
  it('merges token radius classes', () => {
    const box = tv({ base: 'rounded-4 p-2' });

    expect(box({ class: 'rounded-8' })).toBe('p-2 rounded-8');
  });

  it('lets a variant override base color', () => {
    const badge = tv({
      base: 'bg-neutral-100 text-content-primary',
      variants: { tone: { negative: 'bg-negative-100 text-content-negative' } },
    });

    expect(badge({ tone: 'negative' })).toBe(
      'bg-negative-100 text-content-negative',
    );
  });
});
