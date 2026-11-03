import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

// Memastikan jsdom, Testing Library, dan jest-dom terpasang dengan benar.
// Hapus file ini setelah ada test komponen sungguhan di src/modules.
function Counter(): React.ReactNode {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount((c) => c + 1)}>
      Klik {count}
    </button>
  );
}

describe('setup React testing', () => {
  it('merender dan merespons klik', async () => {
    render(<Counter />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('Klik 1');
  });
});
