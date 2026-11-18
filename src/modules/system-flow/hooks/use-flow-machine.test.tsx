import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useFlowMachine } from './use-flow-machine';

function stubMatchMedia(matches: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useFlowMachine', () => {
  it('mulai di langkah pertama dan tidak sedang berjalan', () => {
    const { result } = renderHook(() => useFlowMachine());
    expect(result.current.stepIndex).toBe(0);
    expect(result.current.playing).toBe(false);
    expect(result.current.stepCount).toBe(6);
    expect(result.current.step.number).toBe(1);
  });

  it('initialStepIndex memulai di langkah tersebut dan tetap di-clamp', () => {
    const { result } = renderHook(() =>
      useFlowMachine({ initialStepIndex: 2 }),
    );
    expect(result.current.stepIndex).toBe(2);
    expect(result.current.step.number).toBe(3);

    const clamped = renderHook(() => useFlowMachine({ initialStepIndex: 99 }));
    expect(clamped.result.current.stepIndex).toBe(5);
  });

  it('langkah aktif disinkronkan ke URL path', () => {
    const { result } = renderHook(() => useFlowMachine());
    expect(window.location.pathname).toBe('/system-flow/1');

    act(() => {
      result.current.goTo(2);
    });
    expect(window.location.pathname).toBe('/system-flow/3');
  });

  it('next dan prev di-clamp di batas', () => {
    const { result } = renderHook(() => useFlowMachine());

    act(() => {
      result.current.prev();
    });
    expect(result.current.stepIndex).toBe(0);

    act(() => {
      result.current.next();
      result.current.next();
    });
    expect(result.current.stepIndex).toBe(2);

    act(() => {
      result.current.goTo(99);
    });
    expect(result.current.stepIndex).toBe(5);

    act(() => {
      result.current.goTo(-3);
    });
    expect(result.current.stepIndex).toBe(0);
  });

  it('goTo menghentikan autoplay', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useFlowMachine());

    act(() => {
      result.current.togglePlay();
    });
    act(() => {
      result.current.goTo(2);
    });
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.stepIndex).toBe(2);
    expect(result.current.playing).toBe(false);
  });

  it('autoplay maju per langkah lalu berhenti di langkah terakhir', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useFlowMachine());

    act(() => {
      result.current.togglePlay();
    });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.stepIndex).toBe(1);

    // act() terpisah per iterasi: efek React menjadwalkan timer berikutnya hanya
    // setelah act sebelumnya selesai, jadi jam harus maju sedikit demi sedikit.
    for (let iteration = 0; iteration < 10; iteration += 1) {
      act(() => {
        vi.advanceTimersByTime(3000);
      });
    }
    expect(result.current.stepIndex).toBe(5);
    expect(result.current.playing).toBe(false);
  });

  it('replay kembali ke awal dan menaikkan runId', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useFlowMachine());

    act(() => {
      result.current.next();
      result.current.next();
    });
    const runIdBefore = result.current.runId;

    act(() => {
      result.current.replay();
    });
    expect(result.current.stepIndex).toBe(0);
    expect(result.current.runId).toBe(runIdBefore + 1);
    expect(result.current.playing).toBe(true);
  });

  it('reduced motion: autoplay tidak pernah berjalan', () => {
    stubMatchMedia(true);
    vi.useFakeTimers();
    const { result } = renderHook(() => useFlowMachine());
    expect(result.current.reducedMotion).toBe(true);

    act(() => {
      result.current.replay();
    });
    expect(result.current.playing).toBe(false);

    act(() => {
      result.current.togglePlay();
    });
    expect(result.current.playing).toBe(false);

    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(result.current.stepIndex).toBe(0);
  });
});
