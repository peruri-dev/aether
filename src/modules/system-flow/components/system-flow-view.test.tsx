import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import SystemFlowView from './system-flow-view';
import { STEPS } from '../constants/steps';

afterEach(() => {
  document.documentElement.setAttribute('data-theme', 'light');
});

describe('SystemFlowView', () => {
  it('merender keenam chip timeline', () => {
    render(<SystemFlowView />);
    for (const step of STEPS) {
      const chip = screen.getByRole('button', {
        name: `Langkah ${step.number}: ${step.label}`,
      });
      expect(chip).toBeInTheDocument();
    }
  });

  it('panel menampilkan langkah aktif dan Back disabled di awal', () => {
    render(<SystemFlowView />);
    expect(
      screen.getByRole('heading', { name: 'Kamu membuka sebuah website' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('system-flow.button.back.click')).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Langkah 1 dari 6');
  });

  it('tombol Lanjut/Kembali memindah langkah', async () => {
    const user = userEvent.setup();
    render(<SystemFlowView />);

    await user.click(screen.getByTestId('system-flow.button.next.click'));
    expect(screen.getByRole('status')).toHaveTextContent('Langkah 2 dari 6');

    await user.click(screen.getByTestId('system-flow.button.back.click'));
    expect(screen.getByRole('status')).toHaveTextContent('Langkah 1 dari 6');
  });

  it('pintasan keyboard: panah, R, dan Spasi', async () => {
    const user = userEvent.setup();
    render(<SystemFlowView />);

    await user.keyboard('{ArrowRight}');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('status')).toHaveTextContent('Langkah 3 dari 6');

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('status')).toHaveTextContent('Langkah 2 dari 6');

    await user.keyboard('r');
    expect(screen.getByRole('status')).toHaveTextContent('Langkah 1 dari 6');
    // replay sekaligus menjalankan animasi
    expect(
      screen.getByRole('button', { name: 'Jeda animasi' }),
    ).toBeInTheDocument();

    // lengan fokus dari tombol agar Spasi mengatur animasi, bukan menekan tombol
    await user.click(screen.getByText('Waktu per hop'));
    // spasi dikirim sebagai karakter literal: token "{Space}" menghasilkan key "Space"
    await user.keyboard(' ');
    expect(
      screen.getByRole('button', { name: 'Jalankan animasi' }),
    ).toBeInTheDocument();
  });

  it('mengetik di input tidak memicu pintasan', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <SystemFlowView />
        <input aria-label="cari" />
      </div>,
    );

    await user.type(screen.getByRole('textbox'), 'r {ArrowRight}');
    expect(screen.getByRole('status')).toHaveTextContent('Langkah 1 dari 6');
  });

  it('SVG diagram punya accessible name', () => {
    render(<SystemFlowView />);
    const diagram = screen.getByRole('img', { name: /diagram alur request/i });
    expect(diagram).toBeInTheDocument();
  });

  it('TOTAL hanya tampil di langkah terakhir', async () => {
    const user = userEvent.setup();
    render(<SystemFlowView />);
    expect(
      screen.queryByTestId('system-flow.hud.total.text'),
    ).not.toBeInTheDocument();

    for (let count = 0; count < 5; count += 1) {
      await user.click(screen.getByTestId('system-flow.button.next.click'));
    }
    expect(screen.getByTestId('system-flow.hud.total.text')).toHaveTextContent(
      '285 ms',
    );
  });

  it('toggle tema mem-flip data-theme di <html>', async () => {
    const user = userEvent.setup();
    render(<SystemFlowView />);

    await user.click(screen.getByTestId('system-flow.button.theme.click'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('langkah awal diambil dari prop initialStep (refresh-safe)', () => {
    render(<SystemFlowView initialStep={3} />);
    expect(screen.getByRole('status')).toHaveTextContent('Langkah 3 dari 6');
    // langkah 3: tiga stasiun tampil, database masih tersembunyi
    expect(
      document.querySelectorAll('[data-node-id][aria-hidden="true"]'),
    ).toHaveLength(1);
  });

  it('perubahan langkah tersimpan di URL path', async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, '', '/system-flow/2');
    render(<SystemFlowView initialStep={2} />);

    await user.click(screen.getByTestId('system-flow.button.next.click'));
    expect(window.location.pathname).toBe('/system-flow/3');
  });

  it('stasiun diorama muncul bertahap mengikuti langkah', async () => {
    const user = userEvent.setup();
    render(<SystemFlowView />);

    // langkah 1: kamera close-up, baru pengguna yang tampil
    expect(
      document.querySelectorAll('[data-node-id]:not([aria-hidden="true"])'),
    ).toHaveLength(1);
    expect(
      document.querySelectorAll('[data-node-id][aria-hidden="true"]'),
    ).toHaveLength(3);

    await user.click(screen.getByTestId('system-flow.button.next.click'));
    // langkah 2: website muncul, dua stasiun backend masih tersembunyi
    expect(
      document.querySelectorAll('[data-node-id][aria-hidden="true"]'),
    ).toHaveLength(2);

    await user.click(screen.getByTestId('system-flow.button.next.click'));
    // langkah 3: server muncul, database masih tersembunyi
    expect(
      document.querySelectorAll('[data-node-id][aria-hidden="true"]'),
    ).toHaveLength(1);

    await user.click(screen.getByTestId('system-flow.button.next.click'));
    // langkah 4: semua stasiun sudah tampil
    expect(
      document.querySelectorAll('[data-node-id][aria-hidden="true"]'),
    ).toHaveLength(0);
  });
});
