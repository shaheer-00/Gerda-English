export type LessonContentBlock =
  | { type: 'explanation'; heading: string; body: string }
  | { type: 'example'; label: string; text: string }
  | { type: 'vocab'; words: { word: string; definition: string; example: string }[] }
  | { type: 'reading'; title: string; passage: string; note?: string }
  | { type: 'listening'; title: string; script: string; note?: string }
  | { type: 'writing'; prompt: string; guidance: string }
  | { type: 'speaking'; prompt: string; guidance: string };

export type LessonSkill = 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'writing' | 'speaking' | 'review';

export interface CourseLesson {
  id: string;
  title: string;
  skill: LessonSkill;
  blocks: LessonContentBlock[];
  checkpointQuizId: string;
}

export interface CourseUnit {
  id: string;
  title: string;
  bandRange: string;
  description: string;
  lessons: CourseLesson[];
}
