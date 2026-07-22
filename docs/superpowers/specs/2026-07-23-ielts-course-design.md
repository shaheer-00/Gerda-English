# IELTS Course Feature — Design

## Problem

The app has notes, a mistake bank, standalone practice quizzes, a calendar, and
rewards — but no actual curriculum. There's no structured path teaching her
from where she is (IELTS Band 4) to where she needs to be (Band 6.5). This
adds one: a gamified course, in a new visual direction, that both of you
agreed the rest of the app will migrate to later.

## Curriculum

Four units, each spanning a band-score range and mixing all four IELTS
skills (Listening, Reading, Writing, Speaking) plus the Grammar/Vocabulary
foundation under them, ~7 lessons per unit (~28 lessons total):

1. **Foundations** (Band 4 → 4.5) — core grammar (present/past tense,
   articles, prepositions), everyday vocabulary, skimming/scanning basics,
   listening for numbers/dates/directions.
2. **Building Up** (Band 4.5 → 5.5) — conditionals, passive voice, topic
   vocabulary across the four IELTS test parts, True/False/Not-Given
   reading, listening for specific detail, intro to Writing Task 1
   (describing a chart) and Task 2 (opinion essay), Speaking Part 1.
3. **Exam Skills** (Band 5.5 → 6) — complex sentences, academic
   collocations, matching-headings and inference reading, listening for
   implied meaning, full Writing Task 1/2 structures, Speaking Part 2 (cue
   card) and Part 3 (discussion).
4. **Band 6.5 Push** (Band 6 → 6.5) — polish and timed practice: denser
   academic vocabulary, harder inference reading, multi-speaker listening,
   scored-criteria writing practice, extended speaking answers.

Each lesson ends in a checkpoint (4-6 questions). A lesson unlocks when the
previous lesson's checkpoint is passed; a unit unlocks when its first lesson
does. Lesson depth is a real teaching point + examples + a short practice
set — solid and accurate, not an exhaustive textbook chapter (28 lessons at
textbook depth isn't achievable in one pass; this scope is).

## Visual direction

**Warm Cozy Notebook** — cream/paper background, soft terracotta and sage
accents, serif headings (Georgia), gentle rounded cards. This is a
deliberately different direction from the existing pink/purple "cute" theme
used everywhere else in the app. Per your choice: only the Course pages
adopt it now (new Tailwind tokens alongside the existing `cute-*` ones); the
sidebar shell and all other pages (Dashboard, Notebook, Calendar, Mistakes,
Quiz, Rewards, Admin) stay in the current style until a later retrofit pass.
**This means the app will look visually inconsistent between Course and
everything else until that follow-up happens** — flagging this explicitly
since it's a real, visible tradeoff of doing Course first.

Layout: units shown as a "Bookshelf Grid" (2-column grid of unit cards with
an icon, title, and progress), lessons within a unit shown as a vertical
chapter list.

## Architecture

No new Supabase tables. Everything rides on what already exists:

- **Curriculum content lives in code**, not the database:
  `src/course/units/unit-1.ts` … `unit-4.ts`, each exporting a typed
  `CourseUnit` (id, title, band range, `CourseLesson[]`). A `CourseLesson`
  has an id, title, an ordered list of `LessonContentBlock`s (discriminated
  union: `explanation`, `example`, `vocab` list, `reading` passage,
  `listening` script, `writing` prompt, `speaking` prompt), and a
  `checkpointQuizId` (a fixed UUID, not DB-generated). Content-in-code means
  it's reviewable like any other code change and editable later without
  touching the database.
- **Checkpoints are real rows in the existing `quizzes` table**, seeded via
  a new SQL script (`course-quizzes-seed.sql`) that inserts each checkpoint
  with the *same fixed UUID* referenced in the matching lesson's
  `checkpointQuizId`, `created_by: 'course'`, and an XP reward scaled to the
  unit tier (30/40/50/60). This means checkpoints reuse the entire
  already-built, already-tested quiz-taking and XP-awarding pipeline
  (`getQuizzes`/`submitQuizAttempt`/`addXP`) with **one new backend
  function**: `getQuizById(id: string)` in `db.ts`, since checkpoints need
  to fetch one specific quiz rather than the default "most recent" the
  standalone Quiz page uses.
- **Completion/unlock tracking reuses `user_progress.completed_quizzes`**
  (already exists, already typed, currently unused by anything). A
  checkpoint's quiz_id lands in that array the same way any quiz attempt
  already does — no new field, no new table.

## New frontend pieces

- `src/pages/Course.tsx` — bookshelf grid of the 4 units, each showing
  lessons-complete count and a locked state for units not yet reached.
- `src/pages/CourseUnit.tsx` — vertical lesson list for one unit; locked,
  unlocked, and complete states per lesson.
- `src/pages/CourseLesson.tsx` — renders a lesson's content blocks in
  order. Listening blocks get a real "🔊 Play" button using the browser's
  built-in `window.speechSynthesis` (Web Speech API — free, no server cost,
  no new dependency) to read the script aloud, not just display it as text.
  Writing/speaking blocks are reflective prompts with a text area (practice
  space, not graded — grading free-text IELTS writing/speaking accurately
  is out of scope for this pass). Ends in a "Start Checkpoint" button.
- `src/pages/CourseCheckpoint.tsx` — the same logic as the existing
  `Quiz.tsx`, scoped to one fixed `quiz_id` via the new `getQuizById`. On
  submit, calls the existing `submitQuizAttempt` (which already awards XP
  and appends to `completed_quizzes`), then returns to `CourseUnit.tsx`
  with the next lesson unlocked.
- New "Course" nav item in `Layout.tsx` (sidebar itself stays in the
  current cute style for now, per the scope note above — only the Course
  page content area uses the new warm tokens).
- New Tailwind tokens in `tailwind.config.js` (`warm-cream`, `warm-tan`,
  `warm-brown`, `warm-sage`, `warm-terracotta` or similar), additive
  alongside the existing `cute-*` tokens — nothing existing is renamed or
  removed.

## Out of scope for this pass

- Retrofitting the rest of the app to the new visual direction (explicitly
  deferred, per your choice).
- Automated grading of Writing Task 1/2 or Speaking answers — these are
  practice prompts with a text area, not scored.
- Audio *recording* (e.g., practicing pronunciation aloud) — only
  text-to-speech playback for listening material.
- Any change to the existing standalone Quiz page, Mistakes bank, or
  Rewards system — course checkpoints are additive on top of them.

## Testing

No automated test framework in this project (unchanged from the earlier
backend-wiring pass). Verification is manual + direct Supabase REST checks
for the one new backend piece (`getQuizById` and the checkpoint seed rows),
same pattern used throughout the backend-wiring plan.
