export function isCorrectAnswer(given: string | undefined, correct: string): boolean {
  if (given === undefined) return false;
  return given.trim().toLowerCase() === correct.trim().toLowerCase();
}
