import { CourseUnit } from './types';

export function isUnitUnlocked(units: CourseUnit[], unitIndex: number, completedQuizzes: string[]): boolean {
  if (unitIndex === 0) return true;
  const prevUnit = units[unitIndex - 1];
  const prevLastLesson = prevUnit.lessons[prevUnit.lessons.length - 1];
  return completedQuizzes.includes(prevLastLesson.checkpointQuizId);
}

export function isLessonUnlocked(
  units: CourseUnit[],
  unitIndex: number,
  lessonIndex: number,
  completedQuizzes: string[]
): boolean {
  if (lessonIndex > 0) {
    const prevLesson = units[unitIndex].lessons[lessonIndex - 1];
    return completedQuizzes.includes(prevLesson.checkpointQuizId);
  }
  return isUnitUnlocked(units, unitIndex, completedQuizzes);
}

export function unitProgress(unit: CourseUnit, completedQuizzes: string[]): number {
  return unit.lessons.filter((lesson) => completedQuizzes.includes(lesson.checkpointQuizId)).length;
}
