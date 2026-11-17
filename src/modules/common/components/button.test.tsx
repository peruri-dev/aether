import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from './button';

describe('Button', () => {
  it('defaults to type="button" so it never submits a form by accident', () => {
    render(<Button>Simpan</Button>);

    expect(screen.getByRole('button', { name: 'Simpan' })).toHaveAttribute(
      'type',
      'button',
    );
  });

  it('forwards data-testid to the button element (UI Contract)', () => {
    render(<Button data-testid="user-form.submit.click">Simpan</Button>);

    expect(screen.getByTestId('user-form.submit.click').tagName).toBe('BUTTON');
  });

  it('is disabled and busy while loading, with an accessible name', () => {
    render(<Button isLoading>Simpan</Button>);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAccessibleName('Memuat Simpan');
  });

  it('does not announce the loading text twice', () => {
    render(
      <Button isLoading loadingText="Menyimpan">
        Simpan
      </Button>,
    );

    expect(screen.getByRole('button')).toHaveAccessibleName('Menyimpan');
  });

  it('renders its child when asChild, without a disabled attribute', () => {
    render(
      <Button asChild disabled>
        <a href="/users">Pengguna</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Pengguna' });

    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).not.toHaveAttribute('disabled');
    expect(link.className).toContain('rounded-8');
  });

  it('lets className override token classes', () => {
    render(<Button className="rounded-16">Simpan</Button>);
    const { className } = screen.getByRole('button');

    expect(className).toContain('rounded-16');
    expect(className).not.toContain('rounded-8');
  });
});
