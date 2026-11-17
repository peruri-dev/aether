import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Input } from './input';

describe('Input', () => {
  it('forwards data-testid to the input element (UI Contract)', () => {
    render(<Input data-testid="login-form.email.input" />);

    expect(screen.getByTestId('login-form.email.input').tagName).toBe('INPUT');
  });

  it('marks the input aria-invalid when hasError', () => {
    render(<Input hasError />);

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('toggles password visibility with a bilingual dynamic label', async () => {
    const user = userEvent.setup();
    render(<Input type="password" data-testid="login-form.password.input" />);

    const input = screen.getByTestId('login-form.password.input');
    expect(input).toHaveAttribute('type', 'password');

    await user.click(
      screen.getByRole('button', { name: 'Tampilkan kata sandi' }),
    );

    expect(input).toHaveAttribute('type', 'text');
    expect(
      screen.getByRole('button', { name: 'Sembunyikan kata sandi' }),
    ).toBeInTheDocument();
  });

  it('indents the text to make room for the search icon', () => {
    render(<Input type="search" />);

    expect(screen.getByRole('searchbox').className).toContain('pl-10');
  });

  it('accepts ref as a normal prop (React 19, tanpa forwardRef)', () => {
    let inputElement: HTMLInputElement | null = null;
    render(
      <Input
        ref={(node) => {
          inputElement = node;
        }}
      />,
    );

    expect(inputElement).toBeInstanceOf(HTMLInputElement);
  });
});
