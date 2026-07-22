# IELTS Course Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full gamified IELTS course (Band 4 → 6.5) to the Gerda English app: 4 units of ~7 lessons each (~28 lessons), real teaching content, checkpoint quizzes gating progress, in a new "Warm Cozy Notebook" visual style scoped to the Course pages only.

**Architecture:** Zero new Supabase tables. Curriculum content lives in code (`src/course/units/*.ts`), typed via a small discriminated-union content-block model. Each lesson's checkpoint is a real row in the existing `quizzes` table (fixed UUID, seeded via SQL), so checkpoints reuse the already-built `getQuizzes`/`submitQuizAttempt`/`addXP` pipeline with one new read function (`getQuizById`). Lesson completion reuses the existing (currently-unused) `user_progress.completed_quizzes` array — no new field, no new table.

**Tech Stack:** Same as the rest of the app — React 18, TypeScript (strict, `noUnusedLocals`/`noUnusedParameters`), Vite, Tailwind, `@supabase/supabase-js`, `lucide-react`. New: the browser's built-in `window.speechSynthesis` (Web Speech API) for listening playback — no new dependency.

## Global Constraints

- No test framework exists in this project. Verification is manual: `npm run build`, `npm run dev`, and direct Supabase REST checks for the one new backend piece, same pattern as the earlier backend-wiring plan.
- `tsconfig.json` has `strict`, `noUnusedLocals`, `noUnusedParameters` on — dead imports are hard build errors.
- The new "Warm Cozy Notebook" visual style (cream/tan/terracotta/sage palette, Georgia serif headings) applies **only** to Course pages (`src/pages/Course.tsx`, `CourseUnit.tsx`, `CourseLesson.tsx`, `CourseCheckpoint.tsx`) and the new `src/course/` support files. Do not touch the visual style of any existing page (Dashboard, Notebook, Calendar, Mistakes, Quiz, Rewards, AdminDashboard) or the `Layout.tsx` sidebar shell itself — those stay in the current `cute-*` theme until a later retrofit pass. Add new `warm-*` Tailwind tokens and CSS classes additively; do not rename or remove any existing `cute-*` token or class.
- `USER_ID = 'gerda'` is hardcoded in `db.ts` — this plan doesn't change that.
- RLS is open (`USING (true)`) on all tables including `quizzes` — no auth headers needed for the checkpoint seed inserts.
- Checkpoint quiz IDs use the fixed scheme `{unit}0000000-0000-4000-8000-00000000000{lesson}` (unit 1-4, lesson 1-7) — e.g. Unit 1 Lesson 3's checkpoint is `10000000-0000-4000-8000-000000000003`, Unit 4 Lesson 7's is `40000000-0000-4000-8000-000000000007`. Use these exact IDs verbatim everywhere they appear (lesson content's `checkpointQuizId` field and the matching SQL `INSERT`) — a mismatch breaks the unlock chain silently.
- XP reward per checkpoint is fixed per unit tier: Unit 1 = 30, Unit 2 = 40, Unit 3 = 50, Unit 4 = 60.
- Commit after every task. Do not push — push only on the user's explicit word, per this project's established workflow.
- Working directory for all app file paths below: `F:\Claude\Projects\Gerda-English-main\Gerda-English-main\gerda-english`. Git repo root: `F:\Claude\Projects\Gerda-English-main\Gerda-English-main`.

---

### Task 1: Warm design tokens + Course types + progress helpers

**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/index.css`
- Create: `src/course/types.ts`
- Create: `src/course/progress.ts`

**Interfaces:**
- Produces: Tailwind tokens `warm-cream`, `warm-tan`, `warm-terracotta`, `warm-sage`, `warm-brown` (each a 50-900 scale) and `fontFamily.warm`. CSS classes `.card-warm`, `.btn-warm`, `.btn-warm-primary`, `.btn-warm-secondary`, `.input-warm`, `.progress-warm`, `.progress-warm-fill`, `.badge-warm`, `.badge-warm-terracotta`, `.badge-warm-sage`.
- Produces: types `LessonContentBlock`, `CourseLesson`, `CourseUnit` from `src/course/types.ts`. Functions `isLessonUnlocked(units, unitIndex, lessonIndex, completedQuizzes)`, `isUnitUnlocked(units, unitIndex, completedQuizzes)`, `unitProgress(unit, completedQuizzes)` from `src/course/progress.ts` — these take `units: CourseUnit[]` as an explicit parameter (not imported internally) so they work before any unit content exists and stay easily testable.

- [ ] **Step 1: Add warm color tokens to `tailwind.config.js`**

Add these entries to `theme.extend.colors`, alongside the existing `cute-*` entries (don't remove or reorder those):

```js
        'warm-cream': {
          50: '#fefcf8',
          100: '#fdf8f0',
          200: '#f8ecd8',
          300: '#f3dfc0',
          400: '#eecda0',
          500: '#e6b87a',
          600: '#c99a5c',
          700: '#a67b45',
          800: '#7d5c33',
          900: '#5c4324',
        },
        'warm-tan': {
          50: '#faf5ea',
          100: '#f3e5c8',
          200: '#e8ddc8',
          300: '#ddd0b0',
          400: '#d0bd90',
          500: '#c0a86e',
          600: '#a88f56',
          700: '#8a7444',
          800: '#6d5b36',
          900: '#57472b',
        },
        'warm-terracotta': {
          50: '#fdf3ec',
          100: '#fae4d3',
          200: '#f3c7a3',
          300: '#eaa876',
          400: '#d98f5c',
          500: '#c17a4a',
          600: '#a8613a',
          700: '#8a4d2f',
          800: '#6d3c25',
          900: '#55301e',
        },
        'warm-sage': {
          50: '#f2f5f0',
          100: '#e3ead8',
          200: '#c8d6b8',
          300: '#a8bf94',
          400: '#8fac78',
          500: '#7a9b6e',
          600: '#63805a',
          700: '#4f6748',
          800: '#3f5239',
          900: '#33422f',
        },
        'warm-brown': {
          50: '#f7f2ec',
          100: '#ece0d0',
          200: '#d9c4a3',
          300: '#c2a274',
          400: '#a67f52',
          500: '#8a6540',
          600: '#705133',
          700: '#5c4426',
          800: '#46331c',
          900: '#332513',
        },
```

Add this to `theme.extend.fontFamily`, alongside the existing `cute`/`rounded` entries:

```js
        'warm': ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
```

- [ ] **Step 2: Add warm component classes to `src/index.css`**

Append this block at the end of the file (after the existing `.badge-mint` rule):

```css

/* Warm Cozy Notebook theme — used only by Course pages, additive to the cute-* theme above */
.card-warm {
  @apply bg-white rounded-2xl shadow-md p-6 border border-warm-tan-200;
}

.btn-warm {
  @apply px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm;
}

.btn-warm-primary {
  @apply bg-warm-terracotta-500 text-white hover:bg-warm-terracotta-600;
}

.btn-warm-secondary {
  @apply bg-warm-sage-500 text-white hover:bg-warm-sage-600;
}

.input-warm {
  @apply w-full px-4 py-3 rounded-xl border border-warm-tan-300 focus:border-warm-terracotta-400 focus:outline-none focus:ring-2 focus:ring-warm-terracotta-100 transition-all duration-200 bg-white;
}

.progress-warm {
  @apply h-3 rounded-full overflow-hidden bg-warm-tan-100;
}

.progress-warm-fill {
  @apply h-full rounded-full transition-all duration-500 ease-out bg-warm-terracotta-500;
}

.badge-warm {
  @apply inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold;
}

.badge-warm-terracotta {
  @apply bg-warm-terracotta-100 text-warm-terracotta-700;
}

.badge-warm-sage {
  @apply bg-warm-sage-100 text-warm-sage-700;
}
```

- [ ] **Step 3: Create `src/course/types.ts`**

```ts
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
```

- [ ] **Step 4: Create `src/course/progress.ts`**

```ts
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
```

- [ ] **Step 5: Manual verification**

Run `npm run build` from `gerda-english/` — should still pass clean (these are new, unused-by-anything-yet files and additive config, so nothing existing should break). Since `progress.ts`'s functions aren't called anywhere yet, TypeScript will not flag them as unused (they're exported, not local unused bindings) — confirm the build output has zero errors.

- [ ] **Step 6: Commit**

```bash
git add gerda-english/tailwind.config.js gerda-english/src/index.css gerda-english/src/course/types.ts gerda-english/src/course/progress.ts
git commit -m "feat: add warm design tokens and course data model"
```

---

### Task 2: getQuizById + checkpoint seed file skeleton

**Files:**
- Modify: `src/lib/db.ts`
- Create: `course-quizzes-seed.sql` (at the repo root alongside `supabase-schema.sql`, i.e. `gerda-english/course-quizzes-seed.sql`)

**Interfaces:**
- Produces: `getQuizById(id: string): Promise<Quiz | null>` in `src/lib/db.ts`, following the same null-on-no-row pattern as the existing `getUserProgress`.
- Produces: `gerda-english/course-quizzes-seed.sql` — a file that Tasks 3-6 each append 7 `INSERT` statements to (one per lesson's checkpoint). This task creates it with just a header comment; do not add any `INSERT` statements yet, there's no lesson content to reference until Task 3.

- [ ] **Step 1: Add `getQuizById` to `src/lib/db.ts`**

Insert this function directly after `getQuizzes` (before `export async function createQuiz`):

```ts
export async function getQuizById(id: string): Promise<Quiz | null> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}
```

- [ ] **Step 2: Create `gerda-english/course-quizzes-seed.sql`**

```sql
-- IELTS Course checkpoint quizzes
-- Run this in Supabase's SQL Editor AFTER supabase-schema.sql has already been run.
-- Each INSERT below uses a fixed id matching a lesson's checkpointQuizId in
-- src/course/units/*.ts — the id must match exactly, or that lesson's
-- checkpoint will silently fail to load (getQuizById returns null).
--
-- Populated by later tasks in docs/superpowers/plans/2026-07-23-ielts-course.md
-- (Tasks 3-6), one unit's worth of INSERTs per task, appended below in order.
```

- [ ] **Step 3: Manual verification**

Run `npm run build` — should pass clean (new function isn't called by anything yet, but it's exported so `noUnusedLocals` won't flag it). Separately, verify via REST that `getQuizById`'s query shape works against the live database: `curl "$VITE_SUPABASE_URL/rest/v1/quizzes?id=eq.00000000-0000-0000-0000-000000000000&select=*"` (a nonexistent id) should return `200` with an empty array `[]`, matching what `.single()` + the `PGRST116` handling expects (no row found is not treated as an error).

- [ ] **Step 4: Commit**

```bash
git add gerda-english/src/lib/db.ts gerda-english/course-quizzes-seed.sql
git commit -m "feat: add getQuizById and checkpoint seed file skeleton"
```

---

### Task 3: Unit 1 content — Foundations (Band 4 → 4.5)

**Files:**
- Create: `src/course/units/unit1.ts`
- Modify: `gerda-english/course-quizzes-seed.sql` (append Unit 1's 7 checkpoint `INSERT`s)

**Interfaces:**
- Consumes: `CourseUnit`, `CourseLesson`, `LessonContentBlock` from `../types` (Task 1).
- Produces: `unit1: CourseUnit`, default export from `src/course/units/unit1.ts`. Consumed by Task 6 (`src/course/units/index.ts`) and by any page reading course content later.

- [ ] **Step 1: Create `src/course/units/unit1.ts`**

```ts
import { CourseUnit } from '../types';

const unit1: CourseUnit = {
  id: 'unit-1',
  title: 'Foundations',
  bandRange: 'Band 4 → 4.5',
  description: 'Core grammar, everyday vocabulary, and the reading/listening basics everything else builds on.',
  lessons: [
    {
      id: 'unit-1-lesson-1',
      title: 'Present Simple vs Present Continuous',
      skill: 'grammar',
      checkpointQuizId: '10000000-0000-4000-8000-000000000001',
      blocks: [
        {
          type: 'explanation',
          heading: 'Habits vs right now',
          body: "Present Simple describes habits, facts, and routines (I study English every day). Present Continuous describes actions happening right now or temporary situations (I am studying English this week). The most common IELTS mistake at this level is using Present Continuous for permanent facts, or Present Simple for right-now actions.",
        },
        { type: 'example', label: 'Habit vs right now', text: "Habit: 'She works at a hospital.' Right now: 'She is working late tonight because of a deadline.'" },
        { type: 'example', label: 'Fact vs temporary', text: "Fact: 'Water boils at 100°C.' Temporary: 'The kettle is boiling right now.'" },
      ],
    },
    {
      id: 'unit-1-lesson-2',
      title: 'Past Simple',
      skill: 'grammar',
      checkpointQuizId: '10000000-0000-4000-8000-000000000002',
      blocks: [
        {
          type: 'explanation',
          heading: 'Finished actions in the past',
          body: 'Past Simple describes finished actions at a specific time in the past. Regular verbs add -ed (study→studied, watch→watched). Many common verbs are irregular and must be memorized (go→went, have→had, do→did, see→saw).',
        },
        {
          type: 'vocab',
          words: [
            { word: 'go → went', definition: 'irregular past tense', example: 'She went to the market yesterday.' },
            { word: 'have → had', definition: 'irregular past tense', example: 'They had a great trip last year.' },
            { word: 'do → did', definition: 'irregular past tense', example: 'He did his homework before dinner.' },
            { word: 'see → saw', definition: 'irregular past tense', example: 'I saw an old friend at the station.' },
            { word: 'take → took', definition: 'irregular past tense', example: 'We took the early train.' },
            { word: 'make → made', definition: 'irregular past tense', example: 'She made a great presentation.' },
          ],
        },
      ],
    },
    {
      id: 'unit-1-lesson-3',
      title: 'Everyday Life & Routines Vocabulary',
      skill: 'vocabulary',
      checkpointQuizId: '10000000-0000-4000-8000-000000000003',
      blocks: [
        {
          type: 'explanation',
          heading: 'Why everyday vocabulary matters',
          body: 'IELTS often tests everyday vocabulary in Listening Section 1 (booking a hotel, describing a job) and Speaking Part 1 (talking about your daily life). Building a strong base of common words makes these sections much easier.',
        },
        {
          type: 'vocab',
          words: [
            { word: 'commute', definition: 'the journey to and from work', example: 'My commute takes 40 minutes by bus.' },
            { word: 'household chores', definition: 'jobs done at home like cleaning', example: 'We share the household chores equally.' },
            { word: 'part-time', definition: 'working fewer hours than full-time', example: 'She has a part-time job at a café.' },
            { word: 'colleague', definition: 'a person you work with', example: 'My colleague helped me finish the report.' },
            { word: 'errand', definition: 'a short trip to do a task', example: 'I need to run an errand before lunch.' },
          ],
        },
      ],
    },
    {
      id: 'unit-1-lesson-4',
      title: 'Skimming & Scanning Basics',
      skill: 'reading',
      checkpointQuizId: '10000000-0000-4000-8000-000000000004',
      blocks: [
        {
          type: 'explanation',
          heading: 'Two different reading speeds',
          body: 'Skimming means reading quickly to get the general idea of a passage. Scanning means searching quickly for a specific piece of information (a date, a name, a number) without reading every word. In IELTS Reading, you rarely have time to read every word carefully — skim first to understand the topic, then scan for answers.',
        },
        {
          type: 'reading',
          title: 'A Short Passage: City Libraries',
          passage: "Many cities are redesigning their public libraries. Instead of only offering books, modern libraries now provide free internet access, quiet study rooms, and spaces for community events. In 2019, the city of Riverdale opened a new library with a rooftop garden and a children's reading area. The library recorded over 500,000 visitors in its first year alone.",
          note: 'Practice: scan for the number of visitors without reading every sentence.',
        },
      ],
    },
    {
      id: 'unit-1-lesson-5',
      title: 'Listening for Numbers, Dates & Times',
      skill: 'listening',
      checkpointQuizId: '10000000-0000-4000-8000-000000000005',
      blocks: [
        {
          type: 'explanation',
          heading: 'The most common Section 1 trap',
          body: "IELTS Listening Section 1 almost always includes numbers — phone numbers, prices, dates, and times. A common mistake is confusing similar-sounding numbers, like 'fifteen' (15) and 'fifty' (50). Listen for the stress: FIF-teen has stress on the second part, FIF-ty has stress on the first part.",
        },
        {
          type: 'listening',
          title: 'Booking a Hotel Room',
          script: "Good morning, Sunrise Hotel, how can I help you? Hi, I'd like to book a room for three nights, starting on the 13th of May. That's fine — we have a double room available for 95 dollars per night. Could I get your phone number, please? Yes, it's oh-seven-nine-double-five-one-three-two-oh.",
          note: 'Listen for the date, the price, and the phone number.',
        },
      ],
    },
    {
      id: 'unit-1-lesson-6',
      title: 'Articles & Prepositions',
      skill: 'grammar',
      checkpointQuizId: '10000000-0000-4000-8000-000000000006',
      blocks: [
        {
          type: 'explanation',
          heading: 'a/an/the and in/on/at',
          body: "Use 'a/an' for one non-specific thing (a book, an apple), and 'the' for something specific or already mentioned (the book on the table). Common prepositions of place include 'in' (a room, a city), 'on' (a table, a street), and 'at' (a specific point, like 'at the door'). Prepositions of time: 'in' (months/years), 'on' (days/dates), 'at' (clock times).",
        },
        { type: 'example', label: 'Getting more specific', text: "'I live in London, on Baker Street, at number 12.' — notice how in/on/at get more specific." },
      ],
    },
    {
      id: 'unit-1-lesson-7',
      title: 'Common IELTS Topics & Unit Review',
      skill: 'vocabulary',
      checkpointQuizId: '10000000-0000-4000-8000-000000000007',
      blocks: [
        {
          type: 'explanation',
          heading: 'The recurring IELTS topics',
          body: 'IELTS reading, listening, and speaking regularly return to a small set of topics: education, health, environment, technology, and work. Learning core vocabulary for these topics early pays off across the whole test, not just one section.',
        },
        {
          type: 'vocab',
          words: [
            { word: 'curriculum', definition: 'subjects taught in a school', example: 'The school updated its curriculum.' },
            { word: 'wellbeing', definition: 'health and happiness', example: 'Exercise improves your wellbeing.' },
            { word: 'sustainable', definition: 'able to continue without harming the environment', example: 'Solar power is a sustainable energy source.' },
            { word: 'workplace', definition: 'the place where you work', example: 'Our workplace has flexible hours.' },
            { word: 'innovation', definition: 'a new idea or method', example: 'The company is known for innovation.' },
          ],
        },
        {
          type: 'explanation',
          heading: 'Unit 1 recap',
          body: "You've covered Present Simple/Continuous, Past Simple, everyday and topic vocabulary, skimming/scanning, listening for numbers, and articles/prepositions — the foundation for everything in Unit 2.",
        },
      ],
    },
  ],
};

export default unit1;
```

- [ ] **Step 2: Append Unit 1's checkpoint quizzes to `gerda-english/course-quizzes-seed.sql`**

Append this block at the end of the file:

```sql

-- Unit 1: Foundations (Band 4 → 4.5) — xp_reward 30 each
INSERT INTO quizzes (id, title, description, questions, xp_reward, created_by) VALUES
('10000000-0000-4000-8000-000000000001', 'Checkpoint: Present Simple vs Present Continuous', 'Unit 1, Lesson 1 checkpoint', '[
  {"id":"1","quiz_id":"10000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Choose the correct sentence.","options":["She study English every day.","She studies English every day.","She is study English every day.","She studying English every day."],"correct_answer":"She studies English every day."},
  {"id":"2","quiz_id":"10000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Fill the gap: Right now, I ___ my homework.","options":["do","does","am doing","did"],"correct_answer":"am doing"},
  {"id":"3","quiz_id":"10000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Which sentence describes a permanent fact?","options":["I am living in London this month.","I live in London.","I am living.","I lived in London."],"correct_answer":"I live in London."},
  {"id":"4","quiz_id":"10000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Choose the correct question.","options":["Does she works on Sundays?","Do she work on Sundays?","Does she work on Sundays?","Is she works on Sundays?"],"correct_answer":"Does she work on Sundays?"},
  {"id":"5","quiz_id":"10000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Which is a common IELTS listening test topic that uses Present Simple?","options":["Daily routines and habits","A story that already finished","A plan for next year only","A dream from last night"],"correct_answer":"Daily routines and habits"}
]'::jsonb, 30, 'course'),
('10000000-0000-4000-8000-000000000002', 'Checkpoint: Past Simple', 'Unit 1, Lesson 2 checkpoint', '[
  {"id":"1","quiz_id":"10000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Choose the correct past form of ''go''.","options":["goed","went","gone","going"],"correct_answer":"went"},
  {"id":"2","quiz_id":"10000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Choose the correct sentence.","options":["I studyed for the test yesterday.","I studied for the test yesterday.","I have study for the test yesterday.","I am studied for the test yesterday."],"correct_answer":"I studied for the test yesterday."},
  {"id":"3","quiz_id":"10000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Past tense of ''see''?","options":["seed","seen","saw","sawed"],"correct_answer":"saw"},
  {"id":"4","quiz_id":"10000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Which sentence is correct?","options":["She did not went to school.","She did not go to school.","She not went to school.","She didn''t went to school."],"correct_answer":"She did not go to school."},
  {"id":"5","quiz_id":"10000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Which time word usually signals Past Simple?","options":["every day","right now","yesterday","at the moment"],"correct_answer":"yesterday"}
]'::jsonb, 30, 'course'),
('10000000-0000-4000-8000-000000000003', 'Checkpoint: Everyday Life & Routines Vocabulary', 'Unit 1, Lesson 3 checkpoint', '[
  {"id":"1","quiz_id":"10000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"What does ''commute'' mean?","options":["A type of food","The journey to and from work","A household chore","A day off work"],"correct_answer":"The journey to and from work"},
  {"id":"2","quiz_id":"10000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"Choose the correct word: ''I have to run an ___ to the post office.''","options":["errand","colleague","commute","chore"],"correct_answer":"errand"},
  {"id":"3","quiz_id":"10000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"A ''colleague'' is...","options":["your neighbor","a person you work with","your boss only","a family member"],"correct_answer":"a person you work with"},
  {"id":"4","quiz_id":"10000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"''Part-time'' means...","options":["working full hours","not working at all","working fewer hours than full-time","working only on weekends"],"correct_answer":"working fewer hours than full-time"},
  {"id":"5","quiz_id":"10000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"''Household chores'' are...","options":["jobs done at home like cleaning","meals you cook","holidays you take","money you save"],"correct_answer":"jobs done at home like cleaning"}
]'::jsonb, 30, 'course'),
('10000000-0000-4000-8000-000000000004', 'Checkpoint: Skimming & Scanning Basics', 'Unit 1, Lesson 4 checkpoint', '[
  {"id":"1","quiz_id":"10000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"What is ''skimming''?","options":["Reading every word carefully","Reading quickly for the general idea","Memorizing a passage","Translating a passage"],"correct_answer":"Reading quickly for the general idea"},
  {"id":"2","quiz_id":"10000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"What is ''scanning'' used for?","options":["Understanding grammar","Finding specific information quickly","Writing a summary","Learning new vocabulary"],"correct_answer":"Finding specific information quickly"},
  {"id":"3","quiz_id":"10000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"According to the passage, how many visitors did the library have in its first year?","options":["50,000","100,000","500,000","5,000"],"correct_answer":"500,000"},
  {"id":"4","quiz_id":"10000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"What year did the Riverdale library open?","options":["2018","2019","2020","2021"],"correct_answer":"2019"},
  {"id":"5","quiz_id":"10000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"Why is scanning useful in the IELTS Reading test?","options":["You have plenty of time to read everything","You often need to find answers quickly under time pressure","It replaces the need to understand the passage","It is only used for Listening"],"correct_answer":"You often need to find answers quickly under time pressure"}
]'::jsonb, 30, 'course'),
('10000000-0000-4000-8000-000000000005', 'Checkpoint: Listening for Numbers, Dates & Times', 'Unit 1, Lesson 5 checkpoint', '[
  {"id":"1","quiz_id":"10000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"What date does the booking start?","options":["3rd of May","13th of May","30th of May","15th of May"],"correct_answer":"13th of May"},
  {"id":"2","quiz_id":"10000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"How many nights is the room booked for?","options":["Two","Three","Thirteen","Thirty"],"correct_answer":"Three"},
  {"id":"3","quiz_id":"10000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"What is the price per night?","options":["$59","$95","$105","$15"],"correct_answer":"$95"},
  {"id":"4","quiz_id":"10000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"Which number is often confused with ''fifty''?","options":["Fifteen","Fifth","Fifty-five","Five"],"correct_answer":"Fifteen"},
  {"id":"5","quiz_id":"10000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"What kind of room is available?","options":["Single room","Double room","Family room","Suite"],"correct_answer":"Double room"}
]'::jsonb, 30, 'course'),
('10000000-0000-4000-8000-000000000006', 'Checkpoint: Articles & Prepositions', 'Unit 1, Lesson 6 checkpoint', '[
  {"id":"1","quiz_id":"10000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"Choose the correct article: ''She bought ___ umbrella.''","options":["a","an","the","no article"],"correct_answer":"an"},
  {"id":"2","quiz_id":"10000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"Choose the correct preposition: ''The meeting is ___ Monday.''","options":["in","on","at","by"],"correct_answer":"on"},
  {"id":"3","quiz_id":"10000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"Choose the correct preposition: ''We arrived ___ 6 o''clock.''","options":["in","on","at","for"],"correct_answer":"at"},
  {"id":"4","quiz_id":"10000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"Choose the correct preposition: ''He was born ___ 1995.''","options":["in","on","at","since"],"correct_answer":"in"},
  {"id":"5","quiz_id":"10000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"Choose the correct sentence.","options":["I saw a elephant at the zoo.","I saw an elephant at the zoo.","I saw the elephant on the zoo.","I saw elephant at the zoo."],"correct_answer":"I saw an elephant at the zoo."}
]'::jsonb, 30, 'course'),
('10000000-0000-4000-8000-000000000007', 'Checkpoint: Common IELTS Topics & Unit Review', 'Unit 1, Lesson 7 checkpoint', '[
  {"id":"1","quiz_id":"10000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"''Sustainable'' means...","options":["expensive","able to continue without harming the environment","old-fashioned","difficult to use"],"correct_answer":"able to continue without harming the environment"},
  {"id":"2","quiz_id":"10000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"''Curriculum'' refers to...","options":["a type of exam","subjects taught in a school","a school building","a teacher''s salary"],"correct_answer":"subjects taught in a school"},
  {"id":"3","quiz_id":"10000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"''Wellbeing'' means...","options":["a type of job","health and happiness","a school subject","a kind of exam"],"correct_answer":"health and happiness"},
  {"id":"4","quiz_id":"10000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"''Innovation'' means...","options":["an old tradition","a new idea or method","a type of building","a health problem"],"correct_answer":"a new idea or method"},
  {"id":"5","quiz_id":"10000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"Which topic is NOT commonly tested in IELTS?","options":["Education","Environment","Technology","Professional cooking techniques for restaurants"],"correct_answer":"Professional cooking techniques for restaurants"}
]'::jsonb, 30, 'course');
```

- [ ] **Step 3: Manual verification**

Run `npm run build` — `unit1.ts` isn't imported by anything yet, but should still type-check cleanly on its own (verify no TS errors reference this file). Do not run the SQL yet — it'll be run once, after Task 6 appends the final unit's INSERTs (running it 4 times separately is unnecessary and the file isn't valid to run partially since later `ALTER`/other statements aren't present — it's pure `INSERT`s, so partial runs are actually harmless if you want to sanity-check the SQL syntax on Unit 1 alone in the Supabase SQL Editor's "New Query" as a dry run, but not required by this task).

- [ ] **Step 4: Commit**

```bash
git add gerda-english/src/course/units/unit1.ts gerda-english/course-quizzes-seed.sql
git commit -m "feat: add Unit 1 (Foundations) course content and checkpoint quizzes"
```

---

### Task 4: Unit 2 content — Building Up (Band 4.5 → 5.5)

**Files:**
- Create: `src/course/units/unit2.ts`
- Modify: `gerda-english/course-quizzes-seed.sql` (append Unit 2's 7 checkpoint `INSERT`s)

**Interfaces:**
- Consumes: `CourseUnit`, `CourseLesson`, `LessonContentBlock` from `../types` (Task 1).
- Produces: `unit2: CourseUnit`, default export from `src/course/units/unit2.ts`. Consumed by Task 6's `src/course/units/index.ts`.

- [ ] **Step 1: Create `src/course/units/unit2.ts`**

```ts
import { CourseUnit } from '../types';

const unit2: CourseUnit = {
  id: 'unit-2',
  title: 'Building Up',
  bandRange: 'Band 4.5 → 5.5',
  description: 'Intermediate grammar, exam-specific reading/listening strategy, and your first Writing Task 1/2 and Speaking Part 1 practice.',
  lessons: [
    {
      id: 'unit-2-lesson-1',
      title: 'Comparatives & Superlatives',
      skill: 'grammar',
      checkpointQuizId: '20000000-0000-4000-8000-000000000001',
      blocks: [
        {
          type: 'explanation',
          heading: 'Comparing two things vs three or more',
          body: "Comparatives compare two things (bigger, more interesting, better). Superlatives compare three or more things, showing the extreme (biggest, most interesting, best). Short adjectives add -er/-est (big→bigger→biggest); longer adjectives use more/most (interesting→more interesting→most interesting); some are irregular (good→better→best, bad→worse→worst).",
        },
        { type: 'example', label: 'Comparative vs superlative', text: "'This city is bigger than my hometown, but Tokyo is the biggest city I've ever visited.'" },
      ],
    },
    {
      id: 'unit-2-lesson-2',
      title: 'Passive Voice',
      skill: 'grammar',
      checkpointQuizId: '20000000-0000-4000-8000-000000000002',
      blocks: [
        {
          type: 'explanation',
          heading: 'When the doer matters less than the action',
          body: "Active voice focuses on who does an action ('Scientists conducted the study'). Passive voice focuses on the action or the receiver, often when the doer is unknown or unimportant ('The study was conducted in 2020'). Passive voice is very common in IELTS Reading (academic/news texts) and useful in Writing Task 1 when describing processes.",
        },
        { type: 'example', label: 'Active vs passive', text: "Active: 'They built the bridge in 1990.' Passive: 'The bridge was built in 1990.'" },
      ],
    },
    {
      id: 'unit-2-lesson-3',
      title: 'Reading: True / False / Not Given',
      skill: 'reading',
      checkpointQuizId: '20000000-0000-4000-8000-000000000003',
      blocks: [
        {
          type: 'explanation',
          heading: "Don't confuse False with Not Given",
          body: "In True/False/Not Given questions: TRUE means the statement matches the passage; FALSE means the statement contradicts the passage; NOT GIVEN means the information isn't mentioned at all — don't use outside knowledge or guess. The biggest mistake is confusing FALSE (contradicted) with NOT GIVEN (simply absent).",
        },
        {
          type: 'reading',
          title: 'Passage: Urban Bees',
          passage: 'Beekeeping has become increasingly popular in cities over the last decade. Rooftop hives now exist in many major cities, and some studies suggest urban honey can be as high quality as rural honey because cities often have a wider variety of flowering plants. However, urban beekeepers must follow strict local regulations, which vary significantly between cities.',
          note: "Practice: 'Urban honey is always better than rural honey.' Is this True, False, or Not Given? (It's False — the passage says 'can be as high quality', not 'always better'.)",
        },
      ],
    },
    {
      id: 'unit-2-lesson-4',
      title: 'Listening for Specific Detail',
      skill: 'listening',
      checkpointQuizId: '20000000-0000-4000-8000-000000000004',
      blocks: [
        {
          type: 'explanation',
          heading: 'Watch for corrections',
          body: "IELTS Listening multiple-choice questions often include distractors — options that sound correct but are corrected later in the audio. Listen for words like 'actually', 'but', 'on second thought' that signal a change in information. Always listen to the whole sentence before choosing an answer.",
        },
        {
          type: 'listening',
          title: 'Choosing a Course',
          script: "So, I was thinking of joining the photography course on Tuesdays. Actually, it's been moved to Thursdays now, starting next week. Oh, and the beginner course is full, but there's still space in the intermediate one. That works better for me anyway, since I've done some photography before.",
          note: 'Listen for the correction: the day changes, and the level changes.',
        },
      ],
    },
    {
      id: 'unit-2-lesson-5',
      title: 'Writing Task 1: Describing a Bar Chart',
      skill: 'writing',
      checkpointQuizId: '20000000-0000-4000-8000-000000000005',
      blocks: [
        {
          type: 'explanation',
          heading: 'Introduction, overview, body',
          body: "Writing Task 1 (Academic) asks you to describe a chart, graph, or diagram in your own words — not give opinions. A strong response has: an introduction (paraphrase the question), an overview (the 1-2 biggest trends), and body paragraphs with specific data. Useful language: 'increased/decreased', 'the highest/lowest proportion', 'in contrast', 'whereas'.",
        },
        {
          type: 'writing',
          prompt: 'The bar chart shows the percentage of households with internet access in four countries in 2010 and 2020. Summarize the information by selecting and reporting the main features.',
          guidance: "Structure: 1) Introduction — paraphrase the chart's topic. 2) Overview — state the 1-2 clearest overall trends (e.g. 'internet access rose in all four countries'). 3) Body — compare specific figures using comparative language. Aim for at least 150 words. Write your response below as practice — it isn't graded automatically, but writing it out builds the habit.",
        },
      ],
    },
    {
      id: 'unit-2-lesson-6',
      title: 'Writing Task 2: Opinion Essay',
      skill: 'writing',
      checkpointQuizId: '20000000-0000-4000-8000-000000000006',
      blocks: [
        {
          type: 'explanation',
          heading: 'State it, support it, restate it',
          body: 'Writing Task 2 asks for a 250+ word essay responding to a question, often asking for your opinion. A clear structure: introduction (paraphrase + state your opinion), 2 body paragraphs (one main idea each, with an example), and a conclusion (restate your opinion). Always answer the exact question asked.',
        },
        {
          type: 'writing',
          prompt: 'Some people think technology has made life easier. Others believe it has made life more complicated. Discuss both views and give your own opinion.',
          guidance: '1) Introduction — paraphrase the topic, state you\'ll discuss both views, give your opinion. 2) Body 1 — technology makes life easier (with an example). 3) Body 2 — technology makes life complicated (with an example). 4) Conclusion — restate your opinion clearly. Aim for 250+ words.',
        },
      ],
    },
    {
      id: 'unit-2-lesson-7',
      title: 'Speaking Part 1 & Unit Review',
      skill: 'speaking',
      checkpointQuizId: '20000000-0000-4000-8000-000000000007',
      blocks: [
        {
          type: 'explanation',
          heading: 'Extend every answer',
          body: 'IELTS Speaking Part 1 asks simple personal questions about familiar topics (your home, work/study, hobbies, daily routine) for 4-5 minutes. Aim for natural, extended answers — not one-word replies, but not a memorized speech either. Add a reason or example to each answer.',
        },
        {
          type: 'speaking',
          prompt: 'Practice these Part 1 questions out loud: 1) Do you work or study? 2) What do you usually do in your free time? 3) Do you prefer mornings or evenings? Why?',
          guidance: "For each question, give a direct answer PLUS one extra sentence (a reason, example, or detail). Example: 'I usually read in my free time, because it helps me relax after a busy day.' Avoid memorized-sounding answers — sound natural.",
        },
        {
          type: 'explanation',
          heading: 'Unit 2 recap',
          body: "You've covered comparatives/superlatives, passive voice, True/False/Not Given reading, listening for corrections, Writing Task 1 & 2 structures, and Speaking Part 1 — you're building real exam skills now, not just grammar.",
        },
      ],
    },
  ],
};

export default unit2;
```

- [ ] **Step 2: Append Unit 2's checkpoint quizzes to `gerda-english/course-quizzes-seed.sql`**

Append this block at the end of the file:

```sql

-- Unit 2: Building Up (Band 4.5 → 5.5) — xp_reward 40 each
INSERT INTO quizzes (id, title, description, questions, xp_reward, created_by) VALUES
('20000000-0000-4000-8000-000000000001', 'Checkpoint: Comparatives & Superlatives', 'Unit 2, Lesson 1 checkpoint', '[
  {"id":"1","quiz_id":"20000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Comparative of ''expensive''?","options":["expensiver","more expensive","most expensive","expensivest"],"correct_answer":"more expensive"},
  {"id":"2","quiz_id":"20000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Superlative of ''good''?","options":["gooder","most good","best","goodest"],"correct_answer":"best"},
  {"id":"3","quiz_id":"20000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Choose the correct sentence.","options":["She is the more intelligent student in class.","She is the most intelligent student in class.","She is intelligenter than the class.","She is most intelligenter in class."],"correct_answer":"She is the most intelligent student in class."},
  {"id":"4","quiz_id":"20000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Comparative of ''bad''?","options":["badder","more bad","worse","worst"],"correct_answer":"worse"},
  {"id":"5","quiz_id":"20000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Choose the correct sentence.","options":["This test was harder than the last one.","This test was more harder than the last one.","This test was hardest than the last one.","This test was hard than the last one."],"correct_answer":"This test was harder than the last one."}
]'::jsonb, 40, 'course'),
('20000000-0000-4000-8000-000000000002', 'Checkpoint: Passive Voice', 'Unit 2, Lesson 2 checkpoint', '[
  {"id":"1","quiz_id":"20000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Which is passive voice?","options":["The chef cooked the meal.","The meal was cooked by the chef.","The chef is cooking the meal.","The chef will cook the meal."],"correct_answer":"The meal was cooked by the chef."},
  {"id":"2","quiz_id":"20000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Change to passive: ''They clean the office every day.''","options":["The office is cleaned every day.","The office cleans every day.","The office was clean every day.","The office cleaning every day."],"correct_answer":"The office is cleaned every day."},
  {"id":"3","quiz_id":"20000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Passive voice is especially common in...","options":["casual text messages","academic and news writing","children''s songs","spoken slang"],"correct_answer":"academic and news writing"},
  {"id":"4","quiz_id":"20000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Choose the correct passive sentence for ''Someone stole my bike.''","options":["My bike was stolen.","My bike stole.","My bike is stealing.","My bike has steal."],"correct_answer":"My bike was stolen."},
  {"id":"5","quiz_id":"20000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Passive voice is useful in Writing Task 1 for...","options":["describing your opinion","describing a process where the doer isn''t important","writing a personal letter","telling a joke"],"correct_answer":"describing a process where the doer isn''t important"}
]'::jsonb, 40, 'course'),
('20000000-0000-4000-8000-000000000003', 'Checkpoint: True / False / Not Given', 'Unit 2, Lesson 3 checkpoint', '[
  {"id":"1","quiz_id":"20000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"''Urban honey is sometimes as high quality as rural honey.'' — True, False, or Not Given?","options":["True","False","Not Given","Cannot be determined"],"correct_answer":"True"},
  {"id":"2","quiz_id":"20000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"''All cities have the same beekeeping regulations.'' — True, False, or Not Given?","options":["True","False","Not Given","Cannot be determined"],"correct_answer":"False"},
  {"id":"3","quiz_id":"20000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"''Beekeeping began in cities in 2010.'' — True, False, or Not Given?","options":["True","False","Not Given","Cannot be determined"],"correct_answer":"Not Given"},
  {"id":"4","quiz_id":"20000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"NOT GIVEN means...","options":["the statement is wrong","the statement is right","the information isn''t mentioned in the passage","the passage is unclear"],"correct_answer":"the information isn''t mentioned in the passage"},
  {"id":"5","quiz_id":"20000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"The most common mistake with this question type is...","options":["reading too slowly","confusing False with Not Given","skipping the passage entirely","translating word by word"],"correct_answer":"confusing False with Not Given"}
]'::jsonb, 40, 'course'),
('20000000-0000-4000-8000-000000000004', 'Checkpoint: Listening for Specific Detail', 'Unit 2, Lesson 4 checkpoint', '[
  {"id":"1","quiz_id":"20000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"What day is the photography course actually on?","options":["Tuesday","Wednesday","Thursday","Friday"],"correct_answer":"Thursday"},
  {"id":"2","quiz_id":"20000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"Which course level has space available?","options":["Beginner","Intermediate","Advanced","None"],"correct_answer":"Intermediate"},
  {"id":"3","quiz_id":"20000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"Why does the speaker prefer the intermediate course?","options":["It''s cheaper","It''s on a better day","They''ve done some photography before","It''s shorter"],"correct_answer":"They''ve done some photography before"},
  {"id":"4","quiz_id":"20000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"Words like ''actually'' often signal...","options":["the end of the conversation","a correction to earlier information","a new topic entirely","that the speaker is confused"],"correct_answer":"a correction to earlier information"},
  {"id":"5","quiz_id":"20000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"What should you do when you hear a correction in Listening?","options":["Ignore it and keep your first answer","Update your answer to match the new information","Ask the speaker to repeat","Skip the question"],"correct_answer":"Update your answer to match the new information"}
]'::jsonb, 40, 'course'),
('20000000-0000-4000-8000-000000000005', 'Checkpoint: Writing Task 1 — Bar Chart', 'Unit 2, Lesson 5 checkpoint', '[
  {"id":"1","quiz_id":"20000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"Writing Task 1 should mainly...","options":["give your personal opinion","describe the data objectively","tell a personal story","argue for or against something"],"correct_answer":"describe the data objectively"},
  {"id":"2","quiz_id":"20000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"What should the ''overview'' contain?","options":["Every single number from the chart","The 1-2 most important overall trends","Your opinion on the data","A conclusion about the future"],"correct_answer":"The 1-2 most important overall trends"},
  {"id":"3","quiz_id":"20000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"Which phrase is useful for comparing data?","options":["I think that...","In contrast...","Once upon a time...","In my opinion..."],"correct_answer":"In contrast..."},
  {"id":"4","quiz_id":"20000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"What is the recommended minimum word count for Task 1?","options":["100 words","150 words","250 words","400 words"],"correct_answer":"150 words"},
  {"id":"5","quiz_id":"20000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"A good Task 1 introduction should...","options":["copy the question exactly, word for word","paraphrase the question in your own words","start with ''In conclusion''","list every data point"],"correct_answer":"paraphrase the question in your own words"}
]'::jsonb, 40, 'course'),
('20000000-0000-4000-8000-000000000006', 'Checkpoint: Writing Task 2 — Opinion Essay', 'Unit 2, Lesson 6 checkpoint', '[
  {"id":"1","quiz_id":"20000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"Writing Task 2 requires at least how many words?","options":["150","200","250","300"],"correct_answer":"250"},
  {"id":"2","quiz_id":"20000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"''Discuss both views and give your own opinion'' means you should...","options":["only give your opinion, ignore other views","discuss both sides AND state your own opinion","write two separate essays","avoid stating an opinion"],"correct_answer":"discuss both sides AND state your own opinion"},
  {"id":"3","quiz_id":"20000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"Each body paragraph should ideally have...","options":["five unrelated ideas","one main idea with an example","only a list of vocabulary","no examples at all"],"correct_answer":"one main idea with an example"},
  {"id":"4","quiz_id":"20000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"What goes in the conclusion?","options":["A brand new argument","A restatement of your opinion","A list of all data used","A question to the reader"],"correct_answer":"A restatement of your opinion"},
  {"id":"5","quiz_id":"20000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"Why is it important to answer the exact question asked?","options":["It isn''t important","Straying off-topic lowers your Task Response score","The examiner won''t read the whole essay anyway","Only grammar is scored"],"correct_answer":"Straying off-topic lowers your Task Response score"}
]'::jsonb, 40, 'course'),
('20000000-0000-4000-8000-000000000007', 'Checkpoint: Speaking Part 1 & Unit Review', 'Unit 2, Lesson 7 checkpoint', '[
  {"id":"1","quiz_id":"20000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"IELTS Speaking Part 1 mainly asks about...","options":["abstract social issues","familiar, personal topics","academic research","a cue card topic"],"correct_answer":"familiar, personal topics"},
  {"id":"2","quiz_id":"20000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"A strong Part 1 answer should...","options":["be a single word","be an extended answer with a reason or example","last five minutes","be memorized word-for-word"],"correct_answer":"be an extended answer with a reason or example"},
  {"id":"3","quiz_id":"20000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"How long does Speaking Part 1 usually last?","options":["1 minute","4-5 minutes","10 minutes","20 minutes"],"correct_answer":"4-5 minutes"},
  {"id":"4","quiz_id":"20000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"Which is the best example of an extended answer?","options":["''Yes.''","''I like reading.''","''I like reading, especially mystery novels, because they keep me guessing.''","''Books are good.''"],"correct_answer":"''I like reading, especially mystery novels, because they keep me guessing.''"},
  {"id":"5","quiz_id":"20000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"What should you avoid in Part 1 answers?","options":["Giving reasons","Sounding memorized and unnatural","Speaking clearly","Using full sentences"],"correct_answer":"Sounding memorized and unnatural"}
]'::jsonb, 40, 'course');
```

- [ ] **Step 3: Manual verification**

Run `npm run build` — confirm zero TS errors involving `unit2.ts`.

- [ ] **Step 4: Commit**

```bash
git add gerda-english/src/course/units/unit2.ts gerda-english/course-quizzes-seed.sql
git commit -m "feat: add Unit 2 (Building Up) course content and checkpoint quizzes"
```

---

### Task 5: Unit 3 content — Exam Skills (Band 5.5 → 6)

**Files:**
- Create: `src/course/units/unit3.ts`
- Modify: `gerda-english/course-quizzes-seed.sql` (append Unit 3's 7 checkpoint `INSERT`s)

**Interfaces:**
- Consumes: `CourseUnit`, `CourseLesson`, `LessonContentBlock` from `../types` (Task 1).
- Produces: `unit3: CourseUnit`, default export from `src/course/units/unit3.ts`. Consumed by Task 6's `src/course/units/index.ts`.

- [ ] **Step 1: Create `src/course/units/unit3.ts`**

```ts
import { CourseUnit } from '../types';

const unit3: CourseUnit = {
  id: 'unit-3',
  title: 'Exam Skills',
  bandRange: 'Band 5.5 → 6',
  description: 'Complex grammar, harder reading/listening question types, full Writing Task 1/2 structures, and Speaking Parts 2-3.',
  lessons: [
    {
      id: 'unit-3-lesson-1',
      title: 'Conditionals (1st & 2nd)',
      skill: 'grammar',
      checkpointQuizId: '30000000-0000-4000-8000-000000000001',
      blocks: [
        {
          type: 'explanation',
          heading: 'Realistic vs unreal situations',
          body: "First conditional describes realistic future possibilities: 'If it rains, I will stay home' (if + present simple, will + base verb). Second conditional describes unreal or unlikely situations: 'If I had more time, I would travel more' (if + past simple, would + base verb). Using conditionals correctly is a strong sign of grammatical range in IELTS Writing and Speaking.",
        },
        {
          type: 'example',
          label: 'First vs second',
          text: "First: 'If she studies hard, she will pass the exam.' Second: 'If she studied harder, she would pass the exam.' (implies she currently isn't studying enough)",
        },
      ],
    },
    {
      id: 'unit-3-lesson-2',
      title: 'Relative Clauses',
      skill: 'grammar',
      checkpointQuizId: '30000000-0000-4000-8000-000000000002',
      blocks: [
        {
          type: 'explanation',
          heading: 'Combining ideas smoothly',
          body: "Relative clauses add extra information about a noun without starting a new sentence, using who (people), which (things), or that (people or things). 'The book that I read was excellent' vs two separate sentences: 'I read a book. It was excellent.' Combining ideas this way makes your writing more sophisticated.",
        },
        {
          type: 'example',
          label: 'Who / which',
          text: "'The scientist who discovered the vaccine won an award.' / 'The city, which has a population of 2 million, is growing quickly.'",
        },
      ],
    },
    {
      id: 'unit-3-lesson-3',
      title: 'Reading: Matching Headings',
      skill: 'reading',
      checkpointQuizId: '30000000-0000-4000-8000-000000000003',
      blocks: [
        {
          type: 'explanation',
          heading: 'Main idea, not detail',
          body: 'Matching Headings questions ask you to match a heading to each paragraph, testing whether you understand the main idea of each paragraph — not just details. Strategy: read the first and last sentence of each paragraph first (they usually summarize the main point), then match. Watch out for headings that use similar words but describe a different idea (distractors).',
        },
        {
          type: 'reading',
          title: 'Passage: Remote Work Trends',
          passage: 'Paragraph A: Since 2020, many companies have shifted to allowing employees to work from home permanently. This shift was driven initially by necessity but has since proven popular with staff. Paragraph B: However, remote work isn\'t without its challenges. Employees often report feelings of isolation, and collaboration on complex projects can be more difficult without face-to-face contact.',
          note: "Practice: which heading fits Paragraph A — 'The Rise of Permanent Remote Work' or 'The Drawbacks of Working From Home'? (The first — Paragraph B covers the drawbacks.)",
        },
      ],
    },
    {
      id: 'unit-3-lesson-4',
      title: 'Listening: Map Labeling & Implied Meaning',
      skill: 'listening',
      checkpointQuizId: '30000000-0000-4000-8000-000000000004',
      blocks: [
        {
          type: 'explanation',
          heading: 'Direction words and tone',
          body: 'Map labeling questions ask you to follow directions and mark locations on a map — listen carefully for direction words (left, right, opposite, next to, between) and reference points (starting from the entrance, near the car park). Implied meaning means understanding what a speaker means even when they don\'t say it directly — for example, hesitation or a change in tone can suggest doubt.',
        },
        {
          type: 'listening',
          title: 'Campus Directions',
          script: 'Okay, so from the main entrance, walk straight ahead past the library on your right. Take the first left, and the science building will be directly opposite the cafeteria. The lab you\'re looking for is on the second floor, next to the stairs.',
          note: 'Practice tracing this route on an imagined map: entrance → past library (right) → left turn → science building (opposite cafeteria) → 2nd floor, next to stairs.',
        },
      ],
    },
    {
      id: 'unit-3-lesson-5',
      title: 'Writing Task 1: Line Graphs & Trends',
      skill: 'writing',
      checkpointQuizId: '30000000-0000-4000-8000-000000000005',
      blocks: [
        {
          type: 'explanation',
          heading: 'Trend vocabulary',
          body: 'Line graphs usually show change over time. Key trend vocabulary: rise/increase, fall/decrease, fluctuate (go up and down repeatedly), remain stable/steady, peak (reach the highest point), and plummet (fall sharply). Also use adverbs to describe the speed and size of change: dramatically, gradually, slightly, significantly.',
        },
        {
          type: 'writing',
          prompt: 'The line graph shows the number of visitors to three museums between 2000 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
          guidance: "Structure: introduction (paraphrase) → overview (which museum grew most, which declined, any notable pattern) → body paragraphs comparing specific figures with trend vocabulary. Try describing at least one 'fluctuation' and one 'steady' trend using the vocabulary above.",
        },
      ],
    },
    {
      id: 'unit-3-lesson-6',
      title: 'Writing Task 2: Advantages/Disadvantages Essay',
      skill: 'writing',
      checkpointQuizId: '30000000-0000-4000-8000-000000000006',
      blocks: [
        {
          type: 'explanation',
          heading: 'Weighing both sides',
          body: 'This essay type asks you to discuss the advantages and disadvantages of a situation, sometimes also asking which outweighs the other. Structure: introduction (paraphrase + outline your approach), body 1 (advantages, with examples), body 2 (disadvantages, with examples), conclusion (your overall judgment if the question asks for one).',
        },
        {
          type: 'writing',
          prompt: 'In some countries, more people are choosing to live alone. What are the advantages and disadvantages of this trend?',
          guidance: "Structure: intro → body 1: advantages (independence, personal space, flexibility — with an example) → body 2: disadvantages (loneliness, higher cost, less support in emergencies — with an example) → conclusion (balanced final thought). Use linking words like 'on the one hand... on the other hand' to organize clearly.",
        },
      ],
    },
    {
      id: 'unit-3-lesson-7',
      title: 'Speaking Part 2 & 3 & Unit Review',
      skill: 'speaking',
      checkpointQuizId: '30000000-0000-4000-8000-000000000007',
      blocks: [
        {
          type: 'explanation',
          heading: 'Cue card, then discussion',
          body: "Speaking Part 2 gives you a 'cue card' topic with 1 minute to prepare and 1-2 minutes to speak, covering all the bullet points given. Part 3 follows with more abstract discussion questions related to the Part 2 topic, expecting longer, more analytical answers.",
        },
        {
          type: 'speaking',
          prompt: 'Cue card: Describe a skill you would like to learn. You should say: what the skill is, why you want to learn it, how you would learn it, and explain how this skill would help you. Practice speaking about this for 1-2 minutes.',
          guidance: 'Use the 1-minute prep time to jot quick notes for each bullet point, then speak naturally without reading word-for-word. Aim to cover all four points and use varied vocabulary and tenses (e.g. present, future, conditional).',
        },
        {
          type: 'explanation',
          heading: 'Unit 3 recap',
          body: 'Conditionals, relative clauses, matching headings, map labeling, Task 1 line graphs, Task 2 advantages/disadvantages, and Speaking Parts 2-3 — you now have the core skill set for Band 5.5-6. Unit 4 pushes toward 6.5 with more advanced language and exam strategy.',
        },
      ],
    },
  ],
};

export default unit3;
```

- [ ] **Step 2: Append Unit 3's checkpoint quizzes to `gerda-english/course-quizzes-seed.sql`**

Append this block at the end of the file:

```sql

-- Unit 3: Exam Skills (Band 5.5 → 6) — xp_reward 50 each
INSERT INTO quizzes (id, title, description, questions, xp_reward, created_by) VALUES
('30000000-0000-4000-8000-000000000001', 'Checkpoint: Conditionals', 'Unit 3, Lesson 1 checkpoint', '[
  {"id":"1","quiz_id":"30000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Choose the correct first conditional sentence.","options":["If I have time, I will call you.","If I had time, I will call you.","If I have time, I would call you.","If I will have time, I call you."],"correct_answer":"If I have time, I will call you."},
  {"id":"2","quiz_id":"30000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Choose the correct second conditional sentence.","options":["If I win the lottery, I will buy a house.","If I won the lottery, I would buy a house.","If I would win the lottery, I buy a house.","If I win the lottery, I would bought a house."],"correct_answer":"If I won the lottery, I would buy a house."},
  {"id":"3","quiz_id":"30000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Second conditional is used for...","options":["definite future plans","unreal or unlikely situations","past completed actions","instructions"],"correct_answer":"unreal or unlikely situations"},
  {"id":"4","quiz_id":"30000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"''If it rains tomorrow, we ___ the picnic.''","options":["cancel","will cancel","would cancel","cancelled"],"correct_answer":"will cancel"},
  {"id":"5","quiz_id":"30000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Why are conditionals useful in IELTS?","options":["They are required for every sentence","They show grammatical range and complexity","They make sentences shorter","They are only used in Listening"],"correct_answer":"They show grammatical range and complexity"}
]'::jsonb, 50, 'course'),
('30000000-0000-4000-8000-000000000002', 'Checkpoint: Relative Clauses', 'Unit 3, Lesson 2 checkpoint', '[
  {"id":"1","quiz_id":"30000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Choose the correct relative pronoun: ''The man ___ called yesterday is my teacher.''","options":["which","who","whose","where"],"correct_answer":"who"},
  {"id":"2","quiz_id":"30000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Choose the correct relative pronoun: ''The book ___ I borrowed was fascinating.''","options":["who","which","whom","whose"],"correct_answer":"which"},
  {"id":"3","quiz_id":"30000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Combine: ''I met a woman. Her son is a doctor.''","options":["I met a woman who son is a doctor.","I met a woman whose son is a doctor.","I met a woman which son is a doctor.","I met a woman that son is a doctor."],"correct_answer":"I met a woman whose son is a doctor."},
  {"id":"4","quiz_id":"30000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Relative clauses are useful because they...","options":["shorten every sentence","combine ideas smoothly into one sentence","are only used in speaking","remove the need for adjectives"],"correct_answer":"combine ideas smoothly into one sentence"},
  {"id":"5","quiz_id":"30000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Choose the correct sentence.","options":["This is the house where I grew up.","This is the house which I grew up.","This is the house who I grew up.","This is the house whose I grew up."],"correct_answer":"This is the house where I grew up."}
]'::jsonb, 50, 'course'),
('30000000-0000-4000-8000-000000000003', 'Checkpoint: Matching Headings', 'Unit 3, Lesson 3 checkpoint', '[
  {"id":"1","quiz_id":"30000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"What does Paragraph A mainly discuss?","options":["The drawbacks of remote work","The rise of permanent remote work","How to collaborate remotely","The history of offices"],"correct_answer":"The rise of permanent remote work"},
  {"id":"2","quiz_id":"30000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"What does Paragraph B mainly discuss?","options":["The benefits of commuting","The challenges of remote work","How to hire remote staff","Office building design"],"correct_answer":"The challenges of remote work"},
  {"id":"3","quiz_id":"30000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"A good strategy for Matching Headings is to...","options":["read every word of every paragraph in full detail first","read first and last sentences to find the main idea","guess without reading","only read the headings"],"correct_answer":"read first and last sentences to find the main idea"},
  {"id":"4","quiz_id":"30000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"Matching Headings tests your understanding of...","options":["specific numbers only","the main idea of each paragraph","the author''s name","grammar rules"],"correct_answer":"the main idea of each paragraph"},
  {"id":"5","quiz_id":"30000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"Distractor headings usually...","options":["are obviously wrong","use similar words but describe a different idea","are always the correct answer","don''t appear in this question type"],"correct_answer":"use similar words but describe a different idea"}
]'::jsonb, 50, 'course'),
('30000000-0000-4000-8000-000000000004', 'Checkpoint: Map Labeling & Implied Meaning', 'Unit 3, Lesson 4 checkpoint', '[
  {"id":"1","quiz_id":"30000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"Which building is on the right as you walk from the entrance?","options":["Science building","Library","Cafeteria","Lab"],"correct_answer":"Library"},
  {"id":"2","quiz_id":"30000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"Where is the science building located?","options":["Next to the library","Opposite the cafeteria","Behind the entrance","On the second floor"],"correct_answer":"Opposite the cafeteria"},
  {"id":"3","quiz_id":"30000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"Where is the lab?","options":["Ground floor, near the entrance","Second floor, next to the stairs","First floor, opposite the library","Third floor, near the cafeteria"],"correct_answer":"Second floor, next to the stairs"},
  {"id":"4","quiz_id":"30000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"Which word signals a direction change?","options":["Straight ahead","Left","Opposite","Directly"],"correct_answer":"Left"},
  {"id":"5","quiz_id":"30000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"''Implied meaning'' in listening means...","options":["only understanding exact words spoken","understanding what''s suggested but not directly stated","ignoring the speaker''s tone","translating word for word"],"correct_answer":"understanding what''s suggested but not directly stated"}
]'::jsonb, 50, 'course'),
('30000000-0000-4000-8000-000000000005', 'Checkpoint: Writing Task 1 — Line Graphs', 'Unit 3, Lesson 5 checkpoint', '[
  {"id":"1","quiz_id":"30000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"''Fluctuate'' means...","options":["to stay exactly the same","to go up and down repeatedly","to increase only","to decrease sharply"],"correct_answer":"to go up and down repeatedly"},
  {"id":"2","quiz_id":"30000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"''Plummet'' describes...","options":["a slow steady rise","a sudden sharp fall","no change at all","a small fluctuation"],"correct_answer":"a sudden sharp fall"},
  {"id":"3","quiz_id":"30000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"Which word describes the highest point on a graph?","options":["Trough","Peak","Plateau","Base"],"correct_answer":"Peak"},
  {"id":"4","quiz_id":"30000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"''Remain stable'' means the data...","options":["changes dramatically","stays roughly the same","disappears","increases slowly"],"correct_answer":"stays roughly the same"},
  {"id":"5","quiz_id":"30000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"Which adverb pair correctly describes speed of change?","options":["dramatically / gradually","large / small","many / few","high / low"],"correct_answer":"dramatically / gradually"}
]'::jsonb, 50, 'course'),
('30000000-0000-4000-8000-000000000006', 'Checkpoint: Writing Task 2 — Advantages/Disadvantages', 'Unit 3, Lesson 6 checkpoint', '[
  {"id":"1","quiz_id":"30000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"This essay type asks you to discuss...","options":["only advantages","only disadvantages","both advantages and disadvantages","neither, just facts"],"correct_answer":"both advantages and disadvantages"},
  {"id":"2","quiz_id":"30000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"A useful linking phrase for this essay type is...","options":["Once upon a time","On the one hand... on the other hand","Firstly, secondly, thirdly, fourthly, fifthly","I don''t know"],"correct_answer":"On the one hand... on the other hand"},
  {"id":"3","quiz_id":"30000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"Each body paragraph should include...","options":["random unrelated facts","a clear point with a supporting example","only vocabulary lists","the examiner''s opinion"],"correct_answer":"a clear point with a supporting example"},
  {"id":"4","quiz_id":"30000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"What might go in the conclusion of this essay type?","options":["A brand new advantage not mentioned before","An overall balanced judgment","A list of every point again in detail","Nothing — conclusions aren''t needed"],"correct_answer":"An overall balanced judgment"},
  {"id":"5","quiz_id":"30000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"''Living alone'' as an essay topic would likely mention which disadvantage?","options":["More money saved","Loneliness","More friends","Less freedom to travel"],"correct_answer":"Loneliness"}
]'::jsonb, 50, 'course'),
('30000000-0000-4000-8000-000000000007', 'Checkpoint: Speaking Part 2 & 3', 'Unit 3, Lesson 7 checkpoint', '[
  {"id":"1","quiz_id":"30000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"How much preparation time do you get for Speaking Part 2?","options":["No preparation time","30 seconds","1 minute","5 minutes"],"correct_answer":"1 minute"},
  {"id":"2","quiz_id":"30000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"Speaking Part 3 questions are typically...","options":["simpler than Part 1","more abstract and analytical than Part 2","not related to Part 2 at all","only yes/no questions"],"correct_answer":"more abstract and analytical than Part 2"},
  {"id":"3","quiz_id":"30000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"How long should you speak for in Part 2?","options":["10-15 seconds","1-2 minutes","5 minutes","As long as you want"],"correct_answer":"1-2 minutes"},
  {"id":"4","quiz_id":"30000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"A cue card gives you...","options":["a list of grammar rules","a topic with bullet points to cover","the correct answer to memorize","a picture to describe only"],"correct_answer":"a topic with bullet points to cover"},
  {"id":"5","quiz_id":"30000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"During prep time, it''s best to...","options":["write a full script word-for-word","jot quick notes for each bullet point","say nothing and think silently only","skip preparation entirely"],"correct_answer":"jot quick notes for each bullet point"}
]'::jsonb, 50, 'course');
```

- [ ] **Step 3: Manual verification**

Run `npm run build` — confirm zero TS errors involving `unit3.ts`.

- [ ] **Step 4: Commit**

```bash
git add gerda-english/src/course/units/unit3.ts gerda-english/course-quizzes-seed.sql
git commit -m "feat: add Unit 3 (Exam Skills) course content and checkpoint quizzes"
```

---

### Task 6: Unit 4 content — Band 6.5 Push, plus the units index

**Files:**
- Create: `src/course/units/unit4.ts`
- Create: `src/course/units/index.ts`
- Modify: `gerda-english/course-quizzes-seed.sql` (append Unit 4's 7 checkpoint `INSERT`s — this is the last append, the seed file is complete after this task)

**Interfaces:**
- Consumes: `CourseUnit`, `CourseLesson`, `LessonContentBlock` from `../types` (Task 1); `unit1`, `unit2`, `unit3` default exports from `./unit1`, `./unit2`, `./unit3` (Tasks 3-5).
- Produces: `unit4: CourseUnit` from `src/course/units/unit4.ts`. `units: CourseUnit[]` (array of all 4, in order) from `src/course/units/index.ts` — this is what every later page/task imports, not the individual unit files directly.

- [ ] **Step 1: Create `src/course/units/unit4.ts`**

```ts
import { CourseUnit } from '../types';

const unit4: CourseUnit = {
  id: 'unit-4',
  title: 'Band 6.5 Push',
  bandRange: 'Band 6 → 6.5',
  description: 'Academic collocations, cohesive devices, inference reading, multi-speaker listening, and higher-band writing/speaking practice.',
  lessons: [
    {
      id: 'unit-4-lesson-1',
      title: 'Academic Collocations & Paraphrasing',
      skill: 'vocabulary',
      checkpointQuizId: '40000000-0000-4000-8000-000000000001',
      blocks: [
        {
          type: 'explanation',
          heading: 'Words that go together',
          body: "Collocations are words that naturally go together (make a decision, not 'do a decision'). Paraphrasing — expressing the same idea with different words — is essential for IELTS Reading (matching information) and Writing/Speaking (avoiding repetition and showing range). Practice paraphrasing by replacing key words with synonyms and changing sentence structure.",
        },
        {
          type: 'vocab',
          words: [
            { word: 'make a decision', definition: 'not "do a decision"', example: 'We need to make a decision by Friday.' },
            { word: 'conduct research', definition: 'not "make research"', example: 'The university conducted research into sleep patterns.' },
            { word: 'have an impact on', definition: 'not "make an impact to"', example: 'Diet has a big impact on health.' },
            { word: 'raise awareness', definition: 'not "increase awareness"', example: 'The campaign aims to raise awareness of recycling.' },
            { word: 'play a role in', definition: 'not "do a role in"', example: 'Genetics play a role in many illnesses.' },
          ],
        },
        { type: 'example', label: 'Paraphrasing', text: "Original: 'Pollution is a big problem in cities.' Paraphrased: 'Urban pollution poses a significant challenge.'" },
      ],
    },
    {
      id: 'unit-4-lesson-2',
      title: 'Complex Sentences & Cohesive Devices',
      skill: 'grammar',
      checkpointQuizId: '40000000-0000-4000-8000-000000000002',
      blocks: [
        {
          type: 'explanation',
          heading: 'Linking ideas at a higher level',
          body: "Cohesive devices link ideas clearly across sentences and paragraphs: 'however' and 'nevertheless' show contrast; 'furthermore' and 'moreover' add information; 'consequently' and 'as a result' show cause and effect; 'in other words' clarifies a point. Overusing simple linkers like 'and' and 'but' limits your score — mix in more sophisticated connectors, but don't force them into every sentence.",
        },
        {
          type: 'example',
          label: 'Chaining ideas',
          text: "'The policy was expensive to implement. However, it significantly reduced traffic congestion, and consequently, air quality improved across the city.'",
        },
      ],
    },
    {
      id: 'unit-4-lesson-3',
      title: 'Reading: Inference & Matching Sentence Endings',
      skill: 'reading',
      checkpointQuizId: '40000000-0000-4000-8000-000000000003',
      blocks: [
        {
          type: 'explanation',
          heading: 'Reading between the lines',
          body: "Inference questions ask what the passage suggests without stating directly — read between the lines using tone and context clues. Matching Sentence Endings requires finding the correct ending for a sentence beginning based on precise logical and grammatical fit, not just similar vocabulary — one of the hardest IELTS Reading question types.",
        },
        {
          type: 'reading',
          title: 'Passage: The Decline of Handwriting',
          passage: 'As digital devices dominate daily communication, fewer people regularly write by hand. Some researchers argue this may affect memory retention, since studies have linked handwriting with stronger recall than typing. Despite this, schools continue to reduce time spent teaching cursive writing, reflecting a broader shift in educational priorities.',
          note: "Inference practice: the passage doesn't say 'schools are wrong to do this' directly — but the tone (contrasting research findings with school policy) implies mild criticism of the trend.",
        },
      ],
    },
    {
      id: 'unit-4-lesson-4',
      title: 'Listening: Multi-speaker Discussions',
      skill: 'listening',
      checkpointQuizId: '40000000-0000-4000-8000-000000000004',
      blocks: [
        {
          type: 'explanation',
          heading: 'Tracking who thinks what',
          body: "IELTS Listening Sections 3 and 4 often involve multiple speakers (like students discussing an assignment) or a single academic lecture. With multiple speakers, track who holds which opinion — speakers often disagree or build on each other's points. Listen for signposting language like 'I agree, but...' or 'that's a good point, however...'",
        },
        {
          type: 'listening',
          title: 'Group Project Discussion',
          script: "Student A: I think we should focus our presentation on renewable energy in general. Student B: That's a good point, but I think we should narrow it down — maybe just solar power, since we have more research on that. Student A: Fair enough, that would make it more focused. Student B: Great, so let's also split the workload — I'll cover the technical side, and you can cover the environmental impact.",
          note: 'Track: whose idea changed, and what was the final agreement.',
        },
      ],
    },
    {
      id: 'unit-4-lesson-5',
      title: 'Writing Task 2: Discussion Essay (Both Views)',
      skill: 'writing',
      checkpointQuizId: '40000000-0000-4000-8000-000000000005',
      blocks: [
        {
          type: 'explanation',
          heading: 'Precision over simplicity',
          body: 'This essay type differs slightly from advantages/disadvantages: it asks you to discuss two given opinions and give your own. Use higher-level vocabulary and complex sentence structures to reach Band 6.5+ — precise word choice, varied sentence length, and accurate use of cohesive devices from Lesson 4.2 all matter here.',
        },
        {
          type: 'writing',
          prompt: 'Some people believe that unpaid community service should be a compulsory part of high school programs. Others believe students should be free to choose their own extracurricular activities. Discuss both views and give your own opinion.',
          guidance: 'Structure: intro (paraphrase + state you\'ll cover both views + your opinion) → body 1: the case for compulsory service (with an example) → body 2: the case for free choice (with an example) → conclusion (clear final opinion). Try using at least 2 cohesive devices from Lesson 4.2 and 2 collocations from Lesson 4.1.',
        },
      ],
    },
    {
      id: 'unit-4-lesson-6',
      title: 'Speaking Part 3: Abstract Discussion',
      skill: 'speaking',
      checkpointQuizId: '40000000-0000-4000-8000-000000000006',
      blocks: [
        {
          type: 'explanation',
          heading: 'Beyond personal experience',
          body: 'Part 3 questions move beyond personal experience to broader, more abstract ideas related to the Part 2 topic — often about society, trends, or hypothetical situations. Extend your answers with reasons, examples, and sometimes counterarguments, rather than short, simple responses.',
        },
        {
          type: 'speaking',
          prompt: "Practice these Part 3 questions (following on from 'describe a skill you'd like to learn'): 1) Do you think schools should teach more practical skills? 2) How has the importance of certain skills changed over time? 3) What skills do you think will be important in the future?",
          guidance: 'For each question, structure your answer as: direct response → reason → example → (optional) a brief counterpoint. This shows the analytical depth examiners look for at higher bands.',
        },
      ],
    },
    {
      id: 'unit-4-lesson-7',
      title: 'Full Review: Exam Strategy',
      skill: 'review',
      checkpointQuizId: '40000000-0000-4000-8000-000000000007',
      blocks: [
        {
          type: 'explanation',
          heading: 'Time management matters as much as language',
          body: "Final review before your target band: time management matters as much as language ability. In Reading, don't spend more than ~20 minutes per passage. In Writing, aim to spend 20 minutes on Task 1 and 40 on Task 2 (Task 2 is worth more). In Listening, use the time between sections to check answers, not to relax. In Speaking, remember that fluency and coherence matter as much as perfect grammar — natural pauses are fine, but avoid long silences.",
        },
        {
          type: 'example',
          label: 'Pre-exam checklist',
          text: '1) Reading — skim first, manage time per passage. 2) Listening — predict answers before audio starts. 3) Writing — plan for 2 minutes before writing either task. 4) Speaking — extend every answer with a reason or example.',
        },
        {
          type: 'explanation',
          heading: 'Course complete',
          body: "You've built grammar (tenses, conditionals, relative clauses, cohesion), vocabulary (everyday, academic, collocations), reading strategy (skimming, T/F/NG, headings, inference), listening strategy (numbers, detail, maps, multi-speaker), writing structure (Task 1 and Task 2, several essay types), and speaking practice (all 3 parts) — the full path from Band 4 toward Band 6.5. Keep practicing regularly, and use the Mistakes Bank to track what still needs work.",
        },
      ],
    },
  ],
};

export default unit4;
```

- [ ] **Step 2: Create `src/course/units/index.ts`**

```ts
import unit1 from './unit1';
import unit2 from './unit2';
import unit3 from './unit3';
import unit4 from './unit4';
import { CourseUnit } from '../types';

export const units: CourseUnit[] = [unit1, unit2, unit3, unit4];
```

- [ ] **Step 3: Append Unit 4's checkpoint quizzes to `gerda-english/course-quizzes-seed.sql`**

Append this block at the end of the file:

```sql

-- Unit 4: Band 6.5 Push (Band 6 → 6.5) — xp_reward 60 each
INSERT INTO quizzes (id, title, description, questions, xp_reward, created_by) VALUES
('40000000-0000-4000-8000-000000000001', 'Checkpoint: Academic Collocations & Paraphrasing', 'Unit 4, Lesson 1 checkpoint', '[
  {"id":"1","quiz_id":"40000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Choose the correct collocation.","options":["do a decision","make a decision","take a decision","have a decision"],"correct_answer":"make a decision"},
  {"id":"2","quiz_id":"40000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Choose the correct collocation.","options":["do research","conduct research","make research","take research"],"correct_answer":"conduct research"},
  {"id":"3","quiz_id":"40000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"''Paraphrasing'' means...","options":["copying text exactly","expressing the same idea in different words","translating into another language","writing longer sentences"],"correct_answer":"expressing the same idea in different words"},
  {"id":"4","quiz_id":"40000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Choose the correct collocation: ''The campaign aims to ___ awareness about climate change.''","options":["increase","raise","make","do"],"correct_answer":"raise"},
  {"id":"5","quiz_id":"40000000-0000-4000-8000-000000000001","type":"multiple_choice","question_text":"Why is paraphrasing important in IELTS?","options":["It isn''t important","It shows vocabulary range and helps in Reading matching questions","It makes essays shorter","It replaces the need for grammar"],"correct_answer":"It shows vocabulary range and helps in Reading matching questions"}
]'::jsonb, 60, 'course'),
('40000000-0000-4000-8000-000000000002', 'Checkpoint: Complex Sentences & Cohesive Devices', 'Unit 4, Lesson 2 checkpoint', '[
  {"id":"1","quiz_id":"40000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Which word shows contrast?","options":["Furthermore","However","Consequently","Additionally"],"correct_answer":"However"},
  {"id":"2","quiz_id":"40000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Which phrase shows cause and effect?","options":["In other words","As a result","On the other hand","For example"],"correct_answer":"As a result"},
  {"id":"3","quiz_id":"40000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Which word adds extra information?","options":["Nevertheless","Moreover","Although","Despite"],"correct_answer":"Moreover"},
  {"id":"4","quiz_id":"40000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"Overusing simple linkers like ''and''/''but'' can...","options":["improve your grammar score","limit your grammar/vocabulary range score","have no effect on scoring","only affect Speaking, not Writing"],"correct_answer":"limit your grammar/vocabulary range score"},
  {"id":"5","quiz_id":"40000000-0000-4000-8000-000000000002","type":"multiple_choice","question_text":"''In other words'' is used to...","options":["introduce a contrast","clarify or restate a point","show a cause","list examples"],"correct_answer":"clarify or restate a point"}
]'::jsonb, 60, 'course'),
('40000000-0000-4000-8000-000000000003', 'Checkpoint: Inference & Matching Sentence Endings', 'Unit 4, Lesson 3 checkpoint', '[
  {"id":"1","quiz_id":"40000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"What does the passage imply about schools reducing cursive teaching?","options":["It strongly agrees with the decision","It suggests mild criticism, given the research mentioned","It has no opinion at all","It celebrates the decision"],"correct_answer":"It suggests mild criticism, given the research mentioned"},
  {"id":"2","quiz_id":"40000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"According to the passage, handwriting is linked to...","options":["worse memory","stronger recall than typing","faster typing speed","better handwriting only"],"correct_answer":"stronger recall than typing"},
  {"id":"3","quiz_id":"40000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"Matching Sentence Endings requires matching based on...","options":["similar-sounding words only","precise logical and grammatical fit","random guessing","the shortest ending available"],"correct_answer":"precise logical and grammatical fit"},
  {"id":"4","quiz_id":"40000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"Inference questions test your ability to...","options":["find directly stated facts only","understand what''s suggested but not directly stated","memorize the passage","translate vocabulary"],"correct_answer":"understand what''s suggested but not directly stated"},
  {"id":"5","quiz_id":"40000000-0000-4000-8000-000000000003","type":"multiple_choice","question_text":"Why is Matching Sentence Endings considered difficult?","options":["It requires no reading at all","Endings can be grammatically similar but logically wrong","There''s only one possible ending","It doesn''t appear in real IELTS tests"],"correct_answer":"Endings can be grammatically similar but logically wrong"}
]'::jsonb, 60, 'course'),
('40000000-0000-4000-8000-000000000004', 'Checkpoint: Multi-speaker Discussions', 'Unit 4, Lesson 4 checkpoint', '[
  {"id":"1","quiz_id":"40000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"What topic does Student B suggest narrowing down to?","options":["Wind power","Solar power","Nuclear power","Hydroelectric power"],"correct_answer":"Solar power"},
  {"id":"2","quiz_id":"40000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"Does Student A agree with the narrower focus?","options":["No, they strongly disagree","Yes, they agree it would be more focused","They don''t respond","They suggest a third topic instead"],"correct_answer":"Yes, they agree it would be more focused"},
  {"id":"3","quiz_id":"40000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"Who will cover the technical side of the presentation?","options":["Student A","Student B","Both together","Neither"],"correct_answer":"Student B"},
  {"id":"4","quiz_id":"40000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"''That''s a good point, but...'' signals...","options":["complete agreement","a polite disagreement or addition","the end of the conversation","confusion"],"correct_answer":"a polite disagreement or addition"},
  {"id":"5","quiz_id":"40000000-0000-4000-8000-000000000004","type":"multiple_choice","question_text":"In multi-speaker listening, it''s important to...","options":["ignore who is speaking","track which speaker holds which opinion","assume both speakers always agree","only listen to the first speaker"],"correct_answer":"track which speaker holds which opinion"}
]'::jsonb, 60, 'course'),
('40000000-0000-4000-8000-000000000005', 'Checkpoint: Writing Task 2 — Discussion Essay', 'Unit 4, Lesson 5 checkpoint', '[
  {"id":"1","quiz_id":"40000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"This essay type is different from advantages/disadvantages because it...","options":["never asks for your opinion","asks you to discuss two given opinions and give your own","only requires one paragraph","doesn''t require an introduction"],"correct_answer":"asks you to discuss two given opinions and give your own"},
  {"id":"2","quiz_id":"40000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"To reach Band 6.5+, you should focus on...","options":["using only simple vocabulary","precise word choice and varied sentence structure","writing as fast as possible","avoiding all linking words"],"correct_answer":"precise word choice and varied sentence structure"},
  {"id":"3","quiz_id":"40000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"How many main viewpoints does this essay type require you to address?","options":["One","Two, plus your own opinion","Four","None — just facts"],"correct_answer":"Two, plus your own opinion"},
  {"id":"4","quiz_id":"40000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"Which of these is a cohesive device from Lesson 4.2?","options":["''Once upon a time''","''Furthermore''","''The end''","''By the way''"],"correct_answer":"''Furthermore''"},
  {"id":"5","quiz_id":"40000000-0000-4000-8000-000000000005","type":"multiple_choice","question_text":"A strong conclusion for this essay type should...","options":["introduce a brand new argument","clearly state your final opinion","repeat the introduction word for word","avoid giving any opinion"],"correct_answer":"clearly state your final opinion"}
]'::jsonb, 60, 'course'),
('40000000-0000-4000-8000-000000000006', 'Checkpoint: Speaking Part 3 — Abstract Discussion', 'Unit 4, Lesson 6 checkpoint', '[
  {"id":"1","quiz_id":"40000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"Speaking Part 3 questions are usually about...","options":["your personal daily routine only","broader, more abstract topics related to Part 2","a picture you must describe","simple yes/no facts"],"correct_answer":"broader, more abstract topics related to Part 2"},
  {"id":"2","quiz_id":"40000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"A strong Part 3 answer structure includes...","options":["a one-word answer only","direct response, reason, example, and optionally a counterpoint","memorized phrases with no structure","repeating the question back"],"correct_answer":"direct response, reason, example, and optionally a counterpoint"},
  {"id":"3","quiz_id":"40000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"Part 3 answers should generally be...","options":["shorter than Part 1 answers","more extended and analytical than Part 1","identical in length to Part 2","completely memorized"],"correct_answer":"more extended and analytical than Part 1"},
  {"id":"4","quiz_id":"40000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"Including a counterargument in your answer shows...","options":["that you''re confused","analytical depth and balanced thinking","that you disagree with the examiner","nothing useful"],"correct_answer":"analytical depth and balanced thinking"},
  {"id":"5","quiz_id":"40000000-0000-4000-8000-000000000006","type":"multiple_choice","question_text":"Part 3 questions typically follow on from...","options":["a completely unrelated topic","the Part 2 cue card topic","Part 1 questions only","no particular topic"],"correct_answer":"the Part 2 cue card topic"}
]'::jsonb, 60, 'course'),
('40000000-0000-4000-8000-000000000007', 'Checkpoint: Full Review — Exam Strategy', 'Unit 4, Lesson 7 checkpoint', '[
  {"id":"1","quiz_id":"40000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"In IELTS Writing, which task should you spend more time on?","options":["Task 1, spend 40 minutes","Task 2, spend 40 minutes","Both equally, 30 minutes each","Task 1 only, skip Task 2 if short on time"],"correct_answer":"Task 2, spend 40 minutes"},
  {"id":"2","quiz_id":"40000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"In Listening, what should you do between sections?","options":["Relax and stop concentrating","Check your answers so far","Leave the room","Start the next section''s audio yourself"],"correct_answer":"Check your answers so far"},
  {"id":"3","quiz_id":"40000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"In Speaking, natural pauses are...","options":["always penalized heavily","generally fine, but long silences should be avoided","not allowed at all","only allowed in Part 1"],"correct_answer":"generally fine, but long silences should be avoided"},
  {"id":"4","quiz_id":"40000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"Roughly how long should you spend per Reading passage?","options":["5 minutes","~20 minutes","45 minutes","However long you want"],"correct_answer":"~20 minutes"},
  {"id":"5","quiz_id":"40000000-0000-4000-8000-000000000007","type":"multiple_choice","question_text":"What''s a good way to keep improving after finishing this course?","options":["Stop practicing immediately","Use the Mistakes Bank to track ongoing weak points","Only study the night before the exam","Avoid speaking practice entirely"],"correct_answer":"Use the Mistakes Bank to track ongoing weak points"}
]'::jsonb, 60, 'course');
```

- [ ] **Step 4: Manual verification**

Run `npm run build` — confirm zero TS errors. This is the first task where `units/index.ts` actually imports all 4 unit files together, so this is the first real chance for a cross-file type mismatch to surface (e.g. a typo'd `type:` discriminant) — read the build output carefully, not just check the exit code.

- [ ] **Step 5: Commit**

```bash
git add gerda-english/src/course/units/unit4.ts gerda-english/src/course/units/index.ts gerda-english/course-quizzes-seed.sql
git commit -m "feat: add Unit 4 (Band 6.5 Push) course content, checkpoint quizzes, and units index"
```

---

### Task 7: Course.tsx (unit grid) + nav + route

**Files:**
- Create: `src/pages/Course.tsx`
- Modify: `src/components/Layout.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `units: CourseUnit[]` from `../course/units` (Task 6); `isUnitUnlocked`, `unitProgress` from `../course/progress` (Task 1); `getUserProgress(): Promise<UserProgress | null>` from `../lib/db` (existing); `UserProgress.completed_quizzes: string[]` (existing field, now actually used for the first time).

- [ ] **Step 1: Create `src/pages/Course.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';
import { units } from '../course/units';
import { getUserProgress } from '../lib/db';
import { isUnitUnlocked, unitProgress } from '../course/progress';

const unitIcons = ['📗', '📙', '📘', '📕'];

const Course = () => {
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProgress()
      .then((progress) => setCompletedQuizzes(progress?.completed_quizzes ?? []))
      .catch((err) => console.error('Failed to load course progress:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center text-warm-brown-600 font-warm py-12">Loading your course...</p>;
  }

  return (
    <div className="space-y-6 font-warm">
      <div>
        <h2 className="text-3xl font-bold text-warm-brown-800">📚 Your IELTS Course</h2>
        <p className="text-warm-brown-500 mt-1">Band 4 → Band 6.5, one unit at a time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {units.map((unit, index) => {
          const unlocked = isUnitUnlocked(units, index, completedQuizzes);
          const progress = unitProgress(unit, completedQuizzes);
          const total = unit.lessons.length;
          const complete = progress === total;

          const card = (
            <div
              className={`card-warm transition-all duration-200 ${
                unlocked ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">
                  {unlocked ? unitIcons[index] : <Lock className="w-8 h-8 text-warm-tan-500" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-warm-brown-800">{unit.title}</h3>
                  <p className="text-sm text-warm-terracotta-600 font-semibold">{unit.bandRange}</p>
                  <p className="text-sm text-warm-brown-500 mt-1">{unit.description}</p>
                  {unlocked && (
                    <div className="mt-3">
                      <div className="progress-warm">
                        <div className="progress-warm-fill" style={{ width: `${(progress / total) * 100}%` }} />
                      </div>
                      <p className="text-xs text-warm-brown-500 mt-1">
                        {complete ? '✓ Complete' : `${progress}/${total} lessons`}
                      </p>
                    </div>
                  )}
                </div>
                {complete && <CheckCircle className="w-6 h-6 text-warm-sage-500 flex-shrink-0" />}
              </div>
            </div>
          );

          return unlocked ? (
            <Link key={unit.id} to={`/course/${unit.id}`}>
              {card}
            </Link>
          ) : (
            <div key={unit.id}>{card}</div>
          );
        })}
      </div>
    </div>
  );
};

export default Course;
```

- [ ] **Step 2: Add "Course" to the sidebar in `src/components/Layout.tsx`**

Change the lucide-react import line from:
```tsx
import { BookOpen, Calendar, Trophy, Gift, Settings, Home, Book, XCircle } from 'lucide-react';
```
to:
```tsx
import { BookOpen, Calendar, Trophy, Gift, Settings, Home, Book, XCircle, GraduationCap } from 'lucide-react';
```

Change the `menuItems` array from:
```tsx
  const menuItems = [
    { path: '/', icon: Home, label: 'Home', color: 'from-cute-pink-400 to-cute-purple-400' },
    { path: '/notebook', icon: BookOpen, label: 'Notebook', color: 'from-cute-blue-400 to-cute-mint-400' },
```
to:
```tsx
  const menuItems = [
    { path: '/', icon: Home, label: 'Home', color: 'from-cute-pink-400 to-cute-purple-400' },
    { path: '/course', icon: GraduationCap, label: 'Course', color: 'from-cute-mint-400 to-cute-purple-400' },
    { path: '/notebook', icon: BookOpen, label: 'Notebook', color: 'from-cute-blue-400 to-cute-mint-400' },
```

- [ ] **Step 3: Add the `/course` route to `src/App.tsx`**

Add the import:
```tsx
import Course from './pages/Course';
```

Add the route (inside the existing `<Route path="/" element={<Layout />}>` block, anywhere among the other routes — placing it right after the `index` route is a reasonable spot):
```tsx
          <Route path="course" element={<Course />} />
```

- [ ] **Step 4: Manual verification**

Run `npm run build` — clean. Run `npm run dev`, visit `/course`: with an empty `completed_quizzes` array (fresh user), Unit 1 should show unlocked (bookshelf card, clickable, "0/7 lessons"), Units 2-4 should show locked (opacity-reduced, lock icon, not clickable — clicking should do nothing since they're plain `<div>`s, not links). Confirm the sidebar shows the new "Course" nav item and it's clickable.

- [ ] **Step 5: Commit**

```bash
git add gerda-english/src/pages/Course.tsx gerda-english/src/components/Layout.tsx gerda-english/src/App.tsx
git commit -m "feat: add Course page (unit grid) with nav and route"
```

---

### Task 8: CourseUnit.tsx (lesson list) + route

**Files:**
- Create: `src/pages/CourseUnit.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `units: CourseUnit[]` from `../course/units`; `isLessonUnlocked` from `../course/progress`; `getUserProgress` from `../lib/db`. Reads `unitId` from the URL via `useParams<{ unitId: string }>()` (react-router-dom, already a project dependency).

- [ ] **Step 1: Create `src/pages/CourseUnit.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, CheckCircle, ChevronRight } from 'lucide-react';
import { units } from '../course/units';
import { getUserProgress } from '../lib/db';
import { isLessonUnlocked } from '../course/progress';

const CourseUnit = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProgress()
      .then((progress) => setCompletedQuizzes(progress?.completed_quizzes ?? []))
      .catch((err) => console.error('Failed to load course progress:', err))
      .finally(() => setLoading(false));
  }, []);

  const unitIndex = units.findIndex((u) => u.id === unitId);
  const unit = units[unitIndex];

  if (loading) {
    return <p className="text-center text-warm-brown-600 font-warm py-12">Loading unit...</p>;
  }

  if (!unit) {
    return (
      <div className="font-warm text-center py-12">
        <p className="text-warm-brown-600">Unit not found.</p>
        <Link to="/course" className="text-warm-terracotta-600 underline">
          Back to course
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-warm">
      <Link to="/course" className="inline-flex items-center gap-2 text-warm-terracotta-600 hover:text-warm-terracotta-700">
        <ArrowLeft className="w-4 h-4" /> Back to course
      </Link>

      <div>
        <h2 className="text-3xl font-bold text-warm-brown-800">{unit.title}</h2>
        <p className="text-warm-terracotta-600 font-semibold">{unit.bandRange}</p>
        <p className="text-warm-brown-500 mt-1">{unit.description}</p>
      </div>

      <div className="space-y-3">
        {unit.lessons.map((lesson, lessonIndex) => {
          const unlocked = isLessonUnlocked(units, unitIndex, lessonIndex, completedQuizzes);
          const complete = completedQuizzes.includes(lesson.checkpointQuizId);

          const row = (
            <div
              className={`card-warm flex items-center justify-between transition-all duration-200 ${
                unlocked ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-warm-tan-100 flex items-center justify-center text-warm-brown-700 font-bold">
                  {lessonIndex + 1}
                </div>
                <div>
                  <p className="font-semibold text-warm-brown-800">{lesson.title}</p>
                  <p className="text-xs text-warm-brown-400 capitalize">{lesson.skill}</p>
                </div>
              </div>
              {complete ? (
                <CheckCircle className="w-5 h-5 text-warm-sage-500" />
              ) : unlocked ? (
                <ChevronRight className="w-5 h-5 text-warm-terracotta-500" />
              ) : (
                <Lock className="w-5 h-5 text-warm-tan-500" />
              )}
            </div>
          );

          return unlocked ? (
            <Link key={lesson.id} to={`/course/${unit.id}/${lesson.id}`}>
              {row}
            </Link>
          ) : (
            <div key={lesson.id}>{row}</div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseUnit;
```

- [ ] **Step 2: Add the `/course/:unitId` route to `src/App.tsx`**

Add the import:
```tsx
import CourseUnit from './pages/CourseUnit';
```

Add the route, directly after the `course` route added in Task 7:
```tsx
          <Route path="course/:unitId" element={<CourseUnit />} />
```

- [ ] **Step 3: Manual verification**

Run `npm run build` — clean. `npm run dev`, click into Unit 1 from `/course`: should show its 7 lessons, Lesson 1 unlocked (clickable, chevron icon), Lessons 2-7 locked (lock icon, not clickable) since no checkpoints are completed yet. Directly visiting `/course/unit-2` should show Unit 2's lessons all locked, since Unit 1 isn't complete yet. Visiting `/course/does-not-exist` should show the "Unit not found" state, not crash.

- [ ] **Step 4: Commit**

```bash
git add gerda-english/src/pages/CourseUnit.tsx gerda-english/src/App.tsx
git commit -m "feat: add CourseUnit page (lesson list) with route"
```

---

### Task 9: CourseLesson.tsx (content renderer + TTS) + route

**Files:**
- Create: `src/pages/CourseLesson.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `units: CourseUnit[]` from `../course/units`; `LessonContentBlock` type from `../course/types`. Reads `unitId`/`lessonId` from the URL via `useParams<{ unitId: string; lessonId: string }>()`. Uses the browser-native `window.speechSynthesis` / `SpeechSynthesisUtterance` (no import — global browser API).
- Produces: navigates to `/course/:unitId/:lessonId/checkpoint` on "Start Checkpoint" — that route is added in Task 10; until Task 10 lands, this button will 404 if clicked, which is expected and fine mid-plan (each task's manual verification only tests what exists so far).

- [ ] **Step 1: Create `src/pages/CourseLesson.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Play, Square } from 'lucide-react';
import { units } from '../course/units';
import { LessonContentBlock } from '../course/types';

const ListeningBlock = ({ block }: { block: Extract<LessonContentBlock, { type: 'listening' }> }) => {
  const [speaking, setSpeaking] = useState(false);

  const handlePlay = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(block.script);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="card-warm">
      <h4 className="font-bold text-warm-brown-800 mb-2">🎧 {block.title}</h4>
      <button onClick={handlePlay} className="btn-warm btn-warm-secondary flex items-center gap-2 mb-3">
        {speaking ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        {speaking ? 'Stop' : 'Play Audio'}
      </button>
      <p className="text-warm-brown-700 italic leading-relaxed">{block.script}</p>
      {block.note && <p className="text-sm text-warm-terracotta-600 mt-3">💡 {block.note}</p>}
    </div>
  );
};

const CourseLesson = () => {
  const { unitId, lessonId } = useParams<{ unitId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Record<number, string>>({});

  const unit = units.find((u) => u.id === unitId);
  const lesson = unit?.lessons.find((l) => l.id === lessonId);

  if (!unit || !lesson) {
    return (
      <div className="font-warm text-center py-12">
        <p className="text-warm-brown-600">Lesson not found.</p>
        <Link to="/course" className="text-warm-terracotta-600 underline">
          Back to course
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-warm">
      <Link
        to={`/course/${unit.id}`}
        className="inline-flex items-center gap-2 text-warm-terracotta-600 hover:text-warm-terracotta-700"
      >
        <ArrowLeft className="w-4 h-4" /> Back to {unit.title}
      </Link>

      <div>
        <p className="text-sm text-warm-terracotta-600 font-semibold capitalize">{lesson.skill}</p>
        <h2 className="text-3xl font-bold text-warm-brown-800">{lesson.title}</h2>
      </div>

      <div className="space-y-4">
        {lesson.blocks.map((block, index) => {
          switch (block.type) {
            case 'explanation':
              return (
                <div key={index} className="card-warm">
                  <h4 className="font-bold text-warm-brown-800 mb-2">{block.heading}</h4>
                  <p className="text-warm-brown-700 leading-relaxed">{block.body}</p>
                </div>
              );
            case 'example':
              return (
                <div key={index} className="bg-warm-tan-50 border border-warm-tan-200 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-warm-terracotta-600 uppercase mb-1">{block.label}</p>
                  <p className="text-warm-brown-700">{block.text}</p>
                </div>
              );
            case 'vocab':
              return (
                <div key={index} className="card-warm">
                  <h4 className="font-bold text-warm-brown-800 mb-3">📖 Vocabulary</h4>
                  <div className="space-y-3">
                    {block.words.map((w) => (
                      <div key={w.word} className="border-b border-warm-tan-100 pb-2 last:border-0">
                        <p className="font-semibold text-warm-brown-800">{w.word}</p>
                        <p className="text-sm text-warm-brown-600">{w.definition}</p>
                        <p className="text-sm text-warm-brown-400 italic">"{w.example}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            case 'reading':
              return (
                <div key={index} className="card-warm">
                  <h4 className="font-bold text-warm-brown-800 mb-2">📄 {block.title}</h4>
                  <p className="text-warm-brown-700 leading-relaxed">{block.passage}</p>
                  {block.note && <p className="text-sm text-warm-terracotta-600 mt-3">💡 {block.note}</p>}
                </div>
              );
            case 'listening':
              return <ListeningBlock key={index} block={block} />;
            case 'writing':
            case 'speaking':
              return (
                <div key={index} className="card-warm">
                  <h4 className="font-bold text-warm-brown-800 mb-2">
                    {block.type === 'writing' ? '✍️' : '🗣️'} Practice
                  </h4>
                  <p className="text-warm-brown-700 font-semibold mb-2">{block.prompt}</p>
                  <p className="text-sm text-warm-brown-500 mb-3">{block.guidance}</p>
                  <textarea
                    className="input-warm min-h-[120px]"
                    placeholder="Practice space — not graded, just for you."
                    value={notes[index] ?? ''}
                    onChange={(e) => setNotes({ ...notes, [index]: e.target.value })}
                  />
                </div>
              );
            default:
              return null;
          }
        })}
      </div>

      <button
        onClick={() => navigate(`/course/${unit.id}/${lesson.id}/checkpoint`)}
        className="btn-warm btn-warm-primary w-full"
      >
        Start Checkpoint →
      </button>
    </div>
  );
};

export default CourseLesson;
```

- [ ] **Step 2: Add the `/course/:unitId/:lessonId` route to `src/App.tsx`**

Add the import:
```tsx
import CourseLesson from './pages/CourseLesson';
```

Add the route, directly after the `course/:unitId` route added in Task 8:
```tsx
          <Route path="course/:unitId/:lessonId" element={<CourseLesson />} />
```

- [ ] **Step 3: Manual verification**

Run `npm run build` — clean. `npm run dev`, click into Unit 1 → Lesson 1: confirm the explanation and example blocks render. Click into Unit 1 → Lesson 5 (the listening lesson): click "Play Audio" — the browser should read the script aloud via its built-in voice (works in Chrome/Edge/Safari without any setup), and the button should switch to "Stop" while speaking. Click into Unit 2 → Lesson 5 (a writing lesson): confirm the prompt/guidance render and the textarea accepts typed text. Clicking "Start Checkpoint" will currently 404 (expected — Task 10 adds that route).

- [ ] **Step 4: Commit**

```bash
git add gerda-english/src/pages/CourseLesson.tsx gerda-english/src/App.tsx
git commit -m "feat: add CourseLesson page (content renderer + text-to-speech) with route"
```

---

### Task 10: CourseCheckpoint.tsx (checkpoint quiz flow) + route

**Files:**
- Create: `src/pages/CourseCheckpoint.tsx`
- Modify: `src/lib/db.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `units: CourseUnit[]` from `../course/units`; `getQuizById`, `submitQuizAttempt` (existing, from Task 2 / earlier plan) from `../lib/db`. Reads `unitId`/`lessonId` from the URL.
- Produces: `markQuizCompleted(quizId: string): Promise<void>` in `src/lib/db.ts`.

**Note on a design refinement found while planning this task:** the existing `submitQuizAttempt` (used by the standalone Quiz page) only awards XP — it never touches `user_progress.completed_quizzes`, so that field really is fully unused today, exactly as the design spec assumed. But nothing currently *writes* to it either. Rather than change `submitQuizAttempt`'s behavior (which the standalone Quiz page already relies on and was already reviewed/approved earlier in a different plan), this task adds a small dedicated function, `markQuizCompleted`, mirroring the existing `unlockReward` pattern (read `user_progress`, append to the array if not already present, write it back). Only the course checkpoint flow calls it — the standalone Quiz page is untouched, matching the plan's "no changes to the existing Quiz page" scope note.

**Pass threshold:** a checkpoint must score **60% or higher** to unlock the next lesson and to award XP. Scoring below 60% still lets you see your results and retry, but does not call `markQuizCompleted` and passes `xp_earned: 0` to `submitQuizAttempt` — this prevents the XP-farming loophole (repeatedly submitting for free XP without actually passing) that the standalone Quiz page has, without touching that page's already-accepted behavior.

- [ ] **Step 1: Add `markQuizCompleted` to `src/lib/db.ts`**

Insert this function directly after `unlockReward` (before the `// Calendar Functions` comment):

```ts
export async function markQuizCompleted(quizId: string): Promise<void> {
  const progress = await getUserProgress();
  if (!progress) return;

  const completedQuizzes = progress.completed_quizzes || [];
  if (!completedQuizzes.includes(quizId)) {
    completedQuizzes.push(quizId);

    const { error } = await supabase
      .from('user_progress')
      .update({ completed_quizzes: completedQuizzes })
      .eq('user_id', USER_ID);

    if (error) throw error;
  }
}
```

- [ ] **Step 2: Create `src/pages/CourseCheckpoint.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { units } from '../course/units';
import { getQuizById, submitQuizAttempt, markQuizCompleted } from '../lib/db';
import { Quiz as QuizType } from '../lib/supabase';

const PASS_THRESHOLD = 60;

const CourseCheckpoint = () => {
  const { unitId, lessonId } = useParams<{ unitId: string; lessonId: string }>();

  const unit = units.find((u) => u.id === unitId);
  const lesson = unit?.lessons.find((l) => l.id === lessonId);

  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!lesson) {
      setLoading(false);
      return;
    }
    getQuizById(lesson.checkpointQuizId)
      .then(setQuiz)
      .catch((err) => console.error('Failed to load checkpoint:', err))
      .finally(() => setLoading(false));
  }, [lesson]);

  const handleAnswer = (questionId: string, answer: string) => {
    if (!showResults) setAnswers({ ...answers, [questionId]: answer });
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    return quiz.questions.filter((q) => answers[q.id] === q.correct_answer).length;
  };

  const handleSubmit = async () => {
    if (!quiz || submitting) return;
    setSubmitting(true);
    const score = calculateScore();
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const passed = percentage >= PASS_THRESHOLD;
    try {
      await submitQuizAttempt({
        quiz_id: quiz.id,
        score,
        total_questions: quiz.questions.length,
        answers,
        xp_earned: passed ? quiz.xp_reward : 0,
      });
      if (passed) {
        await markQuizCompleted(quiz.id);
      }
      setShowResults(true);
    } catch (err) {
      console.error('Failed to submit checkpoint:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-center text-warm-brown-600 font-warm py-12">Loading checkpoint...</p>;
  }

  if (!unit || !lesson || !quiz) {
    return (
      <div className="font-warm text-center py-12">
        <p className="text-warm-brown-600">Checkpoint not found.</p>
        <Link to="/course" className="text-warm-terracotta-600 underline">
          Back to course
        </Link>
      </div>
    );
  }

  const score = calculateScore();
  const percentage = Math.round((score / quiz.questions.length) * 100);
  const passed = percentage >= PASS_THRESHOLD;

  return (
    <div className="space-y-6 font-warm">
      <div>
        <p className="text-sm text-warm-terracotta-600 font-semibold">{lesson.title}</p>
        <h2 className="text-3xl font-bold text-warm-brown-800">Checkpoint</h2>
      </div>

      {showResults && (
        <div className="card-warm text-center py-8">
          <div className="text-5xl mb-3">{passed ? '🎉' : '💪'}</div>
          <h3 className="text-2xl font-bold text-warm-brown-800">
            {score}/{quiz.questions.length} correct ({percentage}%)
          </h3>
          <p className="text-warm-brown-500 mt-2">
            {passed
              ? `Nice work — this lesson is complete, and the next one is unlocked. +${quiz.xp_reward} XP earned.`
              : `You'll need ${PASS_THRESHOLD}% or more to unlock the next lesson — review the material above and try again.`}
          </p>
          <div className="flex gap-3 justify-center mt-6">
            {passed ? (
              <Link to={`/course/${unit.id}`} className="btn-warm btn-warm-primary">
                Back to {unit.title}
              </Link>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAnswers({});
                    setShowResults(false);
                  }}
                  className="btn-warm btn-warm-primary"
                >
                  Try Again
                </button>
                <Link to={`/course/${unit.id}/${lesson.id}`} className="btn-warm btn-warm-secondary">
                  Review Lesson
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {!showResults && (
        <>
          <div className="space-y-4">
            {quiz.questions.map((q, index) => (
              <div key={q.id} className="card-warm">
                <p className="font-semibold text-warm-brown-800 mb-3">
                  {index + 1}. {q.question_text}
                </p>
                <div className="space-y-2">
                  {(q.options ?? []).map((option) => {
                    const isSelected = answers[q.id] === option;
                    return (
                      <button
                        key={option}
                        onClick={() => handleAnswer(q.id, option)}
                        className={`w-full p-3 rounded-xl text-left border transition-colors ${
                          isSelected
                            ? 'bg-warm-terracotta-50 border-warm-terracotta-400 text-warm-brown-800'
                            : 'bg-white border-warm-tan-200 hover:border-warm-terracotta-300'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {Object.keys(answers).length === quiz.questions.length && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-warm btn-warm-primary w-full disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Checkpoint'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default CourseCheckpoint;
```

- [ ] **Step 3: Add the checkpoint route to `src/App.tsx`**

Add the import:
```tsx
import CourseCheckpoint from './pages/CourseCheckpoint';
```

Add the route, directly after the `course/:unitId/:lessonId` route added in Task 9:
```tsx
          <Route path="course/:unitId/:lessonId/checkpoint" element={<CourseCheckpoint />} />
```

- [ ] **Step 4: Manual verification**

Run `npm run build` — clean. This is the first task where the full loop can be tested end to end, but it requires the checkpoint quiz rows to actually exist in Supabase — **run `gerda-english/course-quizzes-seed.sql` in the Supabase SQL Editor now if you haven't yet** (it's complete as of Task 6). Then: `npm run dev`, go to Unit 1 → Lesson 1 → Start Checkpoint, answer all 5 questions, submit. Verify via REST (`curl "$VITE_SUPABASE_URL/rest/v1/user_progress?select=completed_quizzes,total_xp" ...`) that `completed_quizzes` now contains `10000000-0000-4000-8000-000000000001` and `total_xp` increased by 30 if you scored ≥60%, or stayed the same with `completed_quizzes` unchanged if you deliberately scored below 60%. Confirm Lesson 2 is now unlocked on the Unit 1 page after a passing attempt.

- [ ] **Step 5: Commit**

```bash
git add gerda-english/src/pages/CourseCheckpoint.tsx gerda-english/src/lib/db.ts gerda-english/src/App.tsx
git commit -m "feat: add CourseCheckpoint page wiring checkpoints to existing quiz/XP pipeline"
```

---

### Task 11: Final integration — seed data, full build, cross-unit walkthrough

**Files:** none (verification and, if needed, minimal fixes only)

- [ ] **Step 1: Confirm the checkpoint seed has been run**

Verify `gerda-english/course-quizzes-seed.sql` has been run against the live Supabase project (Task 10's manual verification already asked for this — confirm it actually happened, don't assume). Check via REST: `curl "$VITE_SUPABASE_URL/rest/v1/quizzes?created_by=eq.course&select=id,title" -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY"` should return exactly 28 rows. If it returns fewer (or zero), some or all of the seed SQL hasn't been run — run the full file now in the Supabase SQL Editor before continuing.

- [ ] **Step 2: Verify the TypeScript build is clean**

Run `npm run build` from `gerda-english/`. Expected: zero errors. By this point every task has already checked its own slice, but this is the first time all 11 tasks' code exists together — read the actual output, don't just trust the exit code.

- [ ] **Step 3: Full manual walkthrough across all 4 units**

Using a test account state (or accepting that this will genuinely progress Gerda's real account, since there's only one user), walk the full chain at least once:

1. `/course` — Unit 1 unlocked, Units 2-4 locked.
2. Unit 1 → complete all 7 lessons' checkpoints, scoring ≥60% each time (use the answer keys in `unit1.ts`/`course-quizzes-seed.sql` if speed-running the walkthrough rather than answering "for real").
3. After Unit 1 Lesson 7's checkpoint passes, confirm Unit 2 unlocks on `/course` without a manual refresh being required beyond navigating back to that page.
4. Spot-check one lesson from each remaining unit (not all 21 remaining lessons) for correct rendering: a `vocab` block, a `listening` block (confirm text-to-speech plays), a `writing` block (confirm the textarea works), and a `reading` block.
5. Confirm the sidebar XP/level (Layout, from the earlier backend-wiring plan) updates after a passing checkpoint, same as it does for the standalone Quiz page.
6. Deliberately fail one checkpoint (submit wrong answers) — confirm `completed_quizzes` does NOT gain that quiz's id and the next lesson stays locked, per Task 10's design.

- [ ] **Step 4: If Step 2 or Step 3 surfaced a real bug, fix it minimally and commit**

```bash
git add -A
git commit -m "fix: resolve issues found in final course integration pass"
```

If both steps passed clean, skip this commit — nothing to record.

- [ ] **Step 5: Note the known, accepted visual inconsistency**

No code change needed here — just confirming this is understood, not forgotten: the sidebar shell and every non-Course page still use the `cute-*` pink/purple theme, while Course pages now use the new `warm-*` cream/terracotta theme. This was the explicit, discussed tradeoff of building Course first (see the design spec's "Visual direction" section). The retrofit of the rest of the app to the warm theme is a separate, future pass — not part of this plan.

