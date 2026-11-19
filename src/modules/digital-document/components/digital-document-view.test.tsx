import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import DigitalDocumentView from './digital-document-view';
import { STEPS } from '../constants/steps';

afterEach(() => {
  document.documentElement.setAttribute('data-theme', 'light');
});

describe('DigitalDocumentView', () => {
  it('merender sebelas chip timeline', () => {
    render(<DigitalDocumentView />);
    for (const step of STEPS) {
      const chip = screen.getByRole('button', {
        name: `Langkah ${step.number}: ${step.label}`,
      });
      expect(chip).toBeInTheDocument();
    }
  });

  it('panel menampilkan langkah aktif dan Back disabled di awal', () => {
    render(<DigitalDocumentView />);
    expect(
      screen.getByRole('heading', { name: 'Pengguna masuk ke akun' }),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('digital-document.button.back.click'),
    ).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Langkah 1 dari 11');
  });

  it('HUD menampilkan kondisi langkah aktif, bukan akumulasi', async () => {
    const user = userEvent.setup();
    render(<DigitalDocumentView />);
    expect(screen.getByText('Belum ada')).toBeInTheDocument();

    // langkah 3: halaman sudah siap unggah langsung ke OSS
    await user.click(screen.getByTestId('digital-document.button.next.click'));
    await user.click(screen.getByTestId('digital-document.button.next.click'));
    expect(screen.getByText('Langsung ke OSS')).toBeInTheDocument();

    // langkah 4: berkas terunggah, status dokumen berubah
    await user.click(screen.getByTestId('digital-document.button.next.click'));
    expect(screen.getByText('Terunggah')).toBeInTheDocument();
    expect(screen.queryByText('Belum ada')).not.toBeInTheDocument();
  });

  it('stasiun diorama muncul bertahap mengikuti langkah', async () => {
    const user = userEvent.setup();
    render(<DigitalDocumentView />);

    // langkah 1: login dan backend tampil bersama
    expect(
      document.querySelectorAll('[data-node-id]:not([aria-hidden="true"])'),
    ).toHaveLength(2);
    expect(
      document.querySelectorAll('[data-node-id][aria-hidden="true"]'),
    ).toHaveLength(5);

    // langkah 4: OSS Alibaba ikut tampil
    for (let count = 0; count < 3; count += 1) {
      await user.click(
        screen.getByTestId('digital-document.button.next.click'),
      );
    }
    expect(
      document.querySelectorAll('[data-node-id][aria-hidden="true"]'),
    ).toHaveLength(3);

    // langkah 10: semua tujuh stasiun sudah tampil
    for (let count = 0; count < 6; count += 1) {
      await user.click(
        screen.getByTestId('digital-document.button.next.click'),
      );
    }
    expect(
      document.querySelectorAll('[data-node-id][aria-hidden="true"]'),
    ).toHaveLength(0);
  });

  it('langkah awal diambil dari prop initialStep (refresh-safe)', () => {
    render(<DigitalDocumentView initialStep={11} />);
    expect(screen.getByRole('status')).toHaveTextContent('Langkah 11 dari 11');
    expect(
      document.querySelectorAll('[data-node-id][aria-hidden="true"]'),
    ).toHaveLength(0);
  });

  it('perubahan langkah tersimpan di URL path', async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, '', '/digital-document/2');
    render(<DigitalDocumentView initialStep={2} />);

    await user.click(screen.getByTestId('digital-document.button.next.click'));
    expect(window.location.pathname).toBe('/digital-document/3');
  });

  it('pintasan keyboard: panah dan R', async () => {
    const user = userEvent.setup();
    render(<DigitalDocumentView />);

    await user.keyboard('{ArrowRight}');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('status')).toHaveTextContent('Langkah 3 dari 11');

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('status')).toHaveTextContent('Langkah 2 dari 11');

    await user.keyboard('r');
    expect(screen.getByRole('status')).toHaveTextContent('Langkah 1 dari 11');
  });

  it('toggle tema mem-flip data-theme di <html>', async () => {
    const user = userEvent.setup();
    render(<DigitalDocumentView />);

    await user.click(screen.getByTestId('digital-document.button.theme.click'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
