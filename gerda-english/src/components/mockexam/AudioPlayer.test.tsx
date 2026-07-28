import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AudioPlayer from './AudioPlayer';

class FakeUtterance {
  text: string;
  rate = 1;
  onend: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

describe('AudioPlayer', () => {
  beforeEach(() => {
    // jsdom has no real speechSynthesis - stub it for the test
    window.SpeechSynthesisUtterance = FakeUtterance as unknown as typeof SpeechSynthesisUtterance;
    window.speechSynthesis = {
      speak: vi.fn((utterance: FakeUtterance) => {
        utterance.onend?.();
      }),
    } as unknown as SpeechSynthesis;
  });

  it('speaks the script once when played, then disables the button', () => {
    render(<AudioPlayer script="Hello there" label="Part 1" />);

    fireEvent.click(screen.getByRole('button', { name: /play part 1/i }));

    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1);
    const button = screen.getByRole('button', { name: /played/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('clicking twice only speaks once', () => {
    render(<AudioPlayer script="Hello there" label="Part 1" />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    fireEvent.click(button);

    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1);
  });
});
