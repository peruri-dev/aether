import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import FlowTimeline from './flow-timeline';
import { STEPS } from '../constants/steps';

function setup(activeIndex: number): { onSelect: ReturnType<typeof vi.fn> } {
  const onSelect = vi.fn();
  render(
    <FlowTimeline
      steps={STEPS}
      activeIndex={activeIndex}
      onSelect={onSelect}
    />,
  );
  return { onSelect };
}

describe('FlowTimeline', () => {
  it('hanya chip aktif yang membawa aria-current="step"', () => {
    setup(2);
    const current = screen
      .getAllByRole('button')
      .filter((chip) => chip.getAttribute('aria-current') === 'step');
    expect(current).toHaveLength(1);
    expect(current[0]?.getAttribute('aria-label')).toBe('Langkah 3: Request');
  });

  it('setiap chip punya accessible name berupa "Langkah N: label"', () => {
    setup(0);
    for (const step of STEPS) {
      expect(
        screen.getByRole('button', {
          name: `Langkah ${step.number}: ${step.label}`,
        }),
      ).toBeInTheDocument();
    }
  });

  it('klik chip memanggil onSelect dengan indeksnya', async () => {
    const user = userEvent.setup();
    const { onSelect } = setup(0);
    await user.click(screen.getByRole('button', { name: 'Langkah 4: Query' }));
    expect(onSelect).toHaveBeenCalledWith(3);
  });

  it('warna chip: aktif solid, tercapai tint guide, mendatang netral', () => {
    setup(2);

    const active = screen.getByRole('button', { name: 'Langkah 3: Request' });
    expect(active.firstElementChild).toHaveClass('bg-guide-500/85');
    expect(active.firstElementChild).toHaveClass('border-guide-500/70');

    const reached = screen.getByRole('button', {
      name: 'Langkah 1: Buka situs',
    });
    expect(reached.firstElementChild).toHaveClass('border-guide-500/50');
    expect(reached.firstElementChild).toHaveClass('text-content-guide');

    const upcoming = screen.getByRole('button', {
      name: 'Langkah 6: Response',
    });
    expect(upcoming.firstElementChild).toHaveClass('border-stroke-primary');
    expect(upcoming.firstElementChild).toHaveClass('text-content-tertiary');
  });
});
