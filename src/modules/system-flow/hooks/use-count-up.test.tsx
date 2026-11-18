import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useCountUp } from './use-count-up';

afterEach(() => {
  vi.useRealTimers();
});

describe('useCountUp', () => {
  it('animate=false langsung mengembalikan nilai final tanpa interval', () => {
    const intervalSpy = vi.spyOn(window, 'setInterval');
    const { result } = renderHook(() => useCountUp(120, false));
    expect(result.current).toBe(120);
    expect(intervalSpy).not.toHaveBeenCalled();
  });

  it('naik dari 0 ke target lalu berhenti', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCountUp(120, true));
    expect(result.current).toBe(0);

    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(result.current).toBe(120);

    const settled = result.current;
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(settled);
  });
});
