import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Timer from './Timer';

describe('Timer', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('displays the starting duration as mm:ss', () => {
    render(<Timer durationSeconds={125} onExpire={() => {}} />);
    expect(screen.getByRole('timer').textContent).toBe('2:05');
  });

  it('calls onExpire once the countdown reaches zero', () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    render(<Timer durationSeconds={2} onExpire={onExpire} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});
