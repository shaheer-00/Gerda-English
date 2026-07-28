interface BandCutoff {
  minRaw: number;
  band: number;
}

// Commonly published approximate conversion tables. IELTS itself equates
// scores per sitting, so this is an estimate for practice purposes only -
// see docs/superpowers/specs/2026-07-29-mock-exam-design.md.
const LISTENING_BAND_TABLE: BandCutoff[] = [
  { minRaw: 39, band: 9 },
  { minRaw: 37, band: 8.5 },
  { minRaw: 35, band: 8 },
  { minRaw: 32, band: 7.5 },
  { minRaw: 30, band: 7 },
  { minRaw: 26, band: 6.5 },
  { minRaw: 23, band: 6 },
  { minRaw: 18, band: 5.5 },
  { minRaw: 16, band: 5 },
  { minRaw: 13, band: 4.5 },
  { minRaw: 11, band: 4 },
  { minRaw: 9, band: 3.5 },
  { minRaw: 6, band: 3 },
  { minRaw: 4, band: 2.5 },
];

const ACADEMIC_READING_BAND_TABLE: BandCutoff[] = [
  { minRaw: 39, band: 9 },
  { minRaw: 37, band: 8.5 },
  { minRaw: 35, band: 8 },
  { minRaw: 33, band: 7.5 },
  { minRaw: 30, band: 7 },
  { minRaw: 27, band: 6.5 },
  { minRaw: 23, band: 6 },
  { minRaw: 19, band: 5.5 },
  { minRaw: 15, band: 5 },
  { minRaw: 13, band: 4.5 },
  { minRaw: 10, band: 4 },
  { minRaw: 8, band: 3.5 },
  { minRaw: 6, band: 3 },
  { minRaw: 4, band: 2.5 },
];

function rawToBand(raw: number, table: BandCutoff[]): number {
  for (const cutoff of table) {
    if (raw >= cutoff.minRaw) return cutoff.band;
  }
  return 0;
}

export function listeningBand(raw: number): number {
  return rawToBand(raw, LISTENING_BAND_TABLE);
}

export function academicReadingBand(raw: number): number {
  return rawToBand(raw, ACADEMIC_READING_BAND_TABLE);
}

export function roundToNearestHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

export function estimatedOverallBand(listeningRaw: number, readingRaw: number): number {
  const lBand = listeningBand(listeningRaw);
  const rBand = academicReadingBand(readingRaw);
  return roundToNearestHalf((lBand + rBand) / 2);
}
