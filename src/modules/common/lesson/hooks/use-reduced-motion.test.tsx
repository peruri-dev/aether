import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useReducedMotion } from './use-reduced-motion';

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
  vi.unstubAllGlobals();
});

describe('useReducedMotion', () => {
  it('false bila matchMedia tidak tersedia (jsdom)', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('false bila preferensi tidak aktif', () => {
    stubMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('true bila preferensi aktif', () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });
});

describe('useReducedMotion listener', () => {
  it('mendaftar listener change dan menghapusnya saat unmount', () => {
    const listeners = new Set<MediaQueryListEvent['type']>();
    const addEventListener = vi.fn((type: MediaQueryListEvent['type']) => {
      listeners.add(type);
    });
    const removeEventListener = vi.fn((type: MediaQueryListEvent['type']) => {
      listeners.delete(type);
    });
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener,
        removeEventListener,
      })),
    );

    const { unmount } = renderHook(() => useReducedMotion());
    expect(addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );

    unmount();
    expect(removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
    expect(listeners.size).toBe(0);
  });
});

describe('useReducedMotion guard', () => {
  it('tidak memasang listener bila matchMedia tidak tersedia', () => {
    const addEventListener = vi.fn();
    vi.stubGlobal('matchMedia', undefined);

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
    expect(addEventListener).not.toHaveBeenCalled();
  });

  it('berubah saat event change diterima', () => {
    let changeHandler: ((event: { matches: boolean }) => void) | null = null;
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(
          (_: string, handler: (event: { matches: boolean }) => void) => {
            changeHandler = handler;
          },
        ),
        removeEventListener: vi.fn(),
      })),
    );

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      changeHandler?.({ matches: true });
    });
    expect(result.current).toBe(true);
  });
});
