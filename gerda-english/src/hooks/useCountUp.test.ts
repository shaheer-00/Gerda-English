import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountUp } from './useCountUp';

describe('useCountUp', () => {
  let frameCallbacks: FrameRequestCallback[] = [];
  let now = 0;

  beforeEach(() => {
    frameCallbacks = [];
    now = 0;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      frameCallbacks.push(cb);
      return frameCallbacks.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const flushFrame = (elapsedMs: number) => {
    now += elapsedMs;
    const callbacks = frameCallbacks;
    frameCallbacks = [];
    act(() => {
      callbacks.forEach((cb) => cb(now));
    });
  };

  it('starts at the initial target with no animation', () => {
    const { result } = renderHook(() => useCountUp(5, 100));
    expect(result.current).toBe(5);
    expect(frameCallbacks.length).toBe(0);
  });

  it('animates toward a new target over time, landing exactly on it', () => {
    const { result, rerender } = renderHook(({ target }) => useCountUp(target, 100), {
      initialProps: { target: 0 },
    });

    rerender({ target: 10 });
    flushFrame(0); // first frame establishes the animation's start time
    flushFrame(50); // halfway through the 100ms duration
    expect(result.current).toBe(5);

    flushFrame(50); // elapsed now covers the full duration
    expect(result.current).toBe(10);
  });

  it('jumps directly to the target when prefers-reduced-motion is set', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));

    const { result, rerender } = renderHook(({ target }) => useCountUp(target, 100), {
      initialProps: { target: 0 },
    });
    rerender({ target: 10 });

    expect(result.current).toBe(10);
    expect(frameCallbacks.length).toBe(0);
  });
});
