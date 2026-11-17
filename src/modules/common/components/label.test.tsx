import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Label } from './label';

describe('Label', () => {
  it('associates with its control via htmlFor', () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </>,
    );

    expect(screen.getByLabelText('Email').tagName).toBe('INPUT');
  });

  it('forwards data-testid to the label element (UI Contract)', () => {
    render(<Label data-testid="user-form.email.label">Email</Label>);

    expect(screen.getByTestId('user-form.email.label').tagName).toBe('LABEL');
  });

  it('marks itself disabled with the disabled text token', () => {
    render(
      <div>
        <Label disabled>Email</Label>
      </div>,
    );

    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('aria-disabled', 'true');
    expect(label.className).toContain('text-content-disabled');
  });

  it('has no aria-disabled by default', () => {
    render(
      <div>
        <Label>Email</Label>
      </div>,
    );

    expect(screen.getByText('Email')).not.toHaveAttribute('aria-disabled');
  });
});
