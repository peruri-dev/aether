import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import DashbentLoginView from './dashbent-login-view';
import { STEPS } from '../constants/steps';

afterEach(() => {
  document.documentElement.setAttribute('data-theme', 'light');
});

describe('DashbentLoginView', () => {
  it('merender sepuluh chip timeline', () => {
    render(<DashbentLoginView />);
    for (const step of STEPS) {
      const chip = screen.getByRole('button', {
        name: `Langkah ${step.number}: ${step.label}`,
      });
      expect(chip).toBeInTheDocument();
    }
  });

  it('panel menampilkan langkah aktif dan Back disabled di awal', () => {
    render(<DashbentLoginView />);
    expect(
      screen.getByRole('heading', { name: 'Akun admin klien lahir di CMP' }),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('dashbent-login.button.back.click'),
    ).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Langkah 1 dari 10');
  });

  it('HUD menampilkan status akun langkah aktif, bukan akumulasi', async () => {
    const user = userEvent.setup();
    render(<DashbentLoginView />);
    expect(screen.getByText('MENUNGGU_AKTIVASI')).toBeInTheDocument();

    await user.click(screen.getByTestId('dashbent-login.button.next.click'));
    await user.click(screen.getByTestId('dashbent-login.button.next.click'));
    expect(screen.getByText('MENUNGGU_TOTP')).toBeInTheDocument();
    expect(screen.queryByText('MENUNGGU_AKTIVASI')).not.toBeInTheDocument();
  });

  it('stasiun diorama muncul bertahap mengikuti langkah', async () => {
    const user = userEvent.setup();
    render(<DashbentLoginView />);

    expect(
      document.querySelectorAll('[data-node-id]:not([aria-hidden="true"])'),
    ).toHaveLength(1);
    expect(
      document.querySelectorAll('[data-node-id][aria-hidden="true"]'),
    ).toHaveLength(5);

    // langkah 4: login, api, ganti password, daftar TOTP sudah tampil
    for (let count = 0; count < 3; count += 1) {
      await user.click(screen.getByTestId('dashbent-login.button.next.click'));
    }
    expect(
      document.querySelectorAll('[data-node-id][aria-hidden="true"]'),
    ).toHaveLength(2);

    // langkah 8: semua enam stasiun sudah tampil
    for (let count = 0; count < 4; count += 1) {
      await user.click(screen.getByTestId('dashbent-login.button.next.click'));
    }
    expect(
      document.querySelectorAll('[data-node-id][aria-hidden="true"]'),
    ).toHaveLength(0);
  });

  it('langkah awal diambil dari prop initialStep (refresh-safe)', () => {
    render(<DashbentLoginView initialStep={8} />);
    expect(screen.getByRole('status')).toHaveTextContent('Langkah 8 dari 10');
    expect(
      document.querySelectorAll('[data-node-id][aria-hidden="true"]'),
    ).toHaveLength(0);
  });

  it('perubahan langkah tersimpan di URL path', async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, '', '/dashbent/login-flow/2');
    render(<DashbentLoginView initialStep={2} />);

    await user.click(screen.getByTestId('dashbent-login.button.next.click'));
    expect(window.location.pathname).toBe('/dashbent/login-flow/3');
  });

  it('pintasan keyboard: panah dan R', async () => {
    const user = userEvent.setup();
    render(<DashbentLoginView />);

    await user.keyboard('{ArrowRight}');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('status')).toHaveTextContent('Langkah 3 dari 10');

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('status')).toHaveTextContent('Langkah 2 dari 10');

    await user.keyboard('r');
    expect(screen.getByRole('status')).toHaveTextContent('Langkah 1 dari 10');
  });

  it('toggle tema mem-flip data-theme di <html>', async () => {
    const user = userEvent.setup();
    render(<DashbentLoginView />);

    await user.click(screen.getByTestId('dashbent-login.button.theme.click'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
