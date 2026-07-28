import { describe, it, expect } from 'vitest';
import { isCorrectAnswer } from './scoreAnswer';

describe('isCorrectAnswer', () => {
  it('matches exact strings', () => {
    expect(isCorrectAnswer('True', 'True')).toBe(true);
  });

  it('is case-insensitive and trims whitespace, for fill-in-the-blank answers', () => {
    expect(isCorrectAnswer('  london ', 'London')).toBe(true);
  });

  it('returns false for a wrong answer', () => {
    expect(isCorrectAnswer('False', 'True')).toBe(false);
  });

  it('returns false when no answer was given', () => {
    expect(isCorrectAnswer(undefined, 'True')).toBe(false);
  });
});
