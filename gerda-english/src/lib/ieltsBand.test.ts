import { describe, it, expect } from 'vitest';
import { listeningBand, academicReadingBand, roundToNearestHalf, estimatedOverallBand } from './ieltsBand';

describe('listeningBand', () => {
  it('returns band 9 for a perfect score', () => {
    expect(listeningBand(40)).toBe(9);
  });

  it('returns band 7.5 at the low end of its bracket', () => {
    expect(listeningBand(32)).toBe(7.5);
  });

  it('returns band 7 just below the 7.5 bracket', () => {
    expect(listeningBand(31)).toBe(7);
  });

  it('returns band 2.5 for a very low score', () => {
    expect(listeningBand(4)).toBe(2.5);
  });

  it('returns 0 for a score below any bracket', () => {
    expect(listeningBand(2)).toBe(0);
  });
});

describe('academicReadingBand', () => {
  it('returns band 9 for a perfect score', () => {
    expect(academicReadingBand(40)).toBe(9);
  });

  it('uses a different cutoff than Listening at the 7.5 boundary', () => {
    // Reading needs 33 for 7.5, Listening only needs 32 - this is the whole
    // reason Listening and Reading get separate tables.
    expect(academicReadingBand(33)).toBe(7.5);
    expect(academicReadingBand(32)).toBe(7);
  });

  it('returns band 6 in the middle of the scale', () => {
    expect(academicReadingBand(25)).toBe(6);
  });
});

describe('roundToNearestHalf', () => {
  it('rounds down within 0.25 of the lower half-band', () => {
    expect(roundToNearestHalf(7.1)).toBe(7);
  });

  it('rounds up within 0.25 of the upper half-band', () => {
    expect(roundToNearestHalf(7.4)).toBe(7.5);
  });

  it('leaves an exact half-band unchanged', () => {
    expect(roundToNearestHalf(7.5)).toBe(7.5);
  });
});

describe('estimatedOverallBand', () => {
  it('averages the two section bands and rounds to the nearest half', () => {
    // listening 32 raw -> 7.5, reading 25 raw -> 6 => avg 6.75 -> 7
    expect(estimatedOverallBand(32, 25)).toBe(7);
  });
});
