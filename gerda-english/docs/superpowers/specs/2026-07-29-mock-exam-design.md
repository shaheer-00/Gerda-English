# IELTS Mock Exam — Design

## Goal

Give the learner a way to estimate her IELTS band before sitting the real test, using timed, full-length Listening (40 Q) and Reading (40 Q, Academic) sections modeled on the real exam. Writing and Speaking are out of scope for v1 (see Non-goals).

## Non-goals

- No Writing or Speaking sections. Result is labeled "Estimated Listening & Reading band," never presented as a full official band, since two of four skills are missing.
- No claim of exact IELTS-equated scoring. Band conversion tables here are commonly published approximations, not the official per-sitting equating IELTS itself uses — good enough for trend-tracking, not a guarantee.
- No admin UI for authoring mock exams in v1. First exam is seeded via SQL, same pattern as `course-quizzes-seed.sql`. Admin authoring can be added later if more mock exams are wanted.
- No pre-recorded audio. Listening scripts are read aloud via the browser's `speechSynthesis` API at runtime.

## Architecture

One page, `src/pages/MockExam.tsx`, drives the whole flow through an internal phase state machine:

```
intro -> listening -> reading -> results
```

No route changes between phases — this keeps timer state, answers, and exam data in one component tree instead of needing to persist state across page navigations.

### Data model (Supabase)

```sql
CREATE TABLE mock_exams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  module TEXT NOT NULL DEFAULT 'academic',
  sections JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE mock_exam_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  mock_exam_id UUID REFERENCES mock_exams(id) ON DELETE CASCADE,
  section_scores JSONB NOT NULL,     -- {"listening": {"raw": 32, "band": 7.5}, "reading": {"raw": 28, "band": 6.5}}
  estimated_band NUMERIC NOT NULL,   -- average of the two section bands, rounded to nearest 0.5
  answers JSONB NOT NULL,
  time_spent_seconds INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_progress ADD COLUMN completed_mock_exams UUID[] DEFAULT '{}';

ALTER TABLE mock_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_exam_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open access" ON mock_exams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Open access" ON mock_exam_attempts FOR ALL USING (true) WITH CHECK (true);
```

`sections` shape (JSONB, mirrors the existing `quizzes.questions` blob pattern):

```ts
type MockExamSection = {
  type: 'listening' | 'reading';
  section_number: number;       // 1-4 for listening, 1-3 for reading
  title: string;
  instructions: string;
  passage_text?: string;        // reading only
  listening_script?: string;    // listening only, fed to speechSynthesis
  questions: {
    id: string;
    question_text: string;
    type: 'multiple_choice' | 'fill_blank';
    options?: string[];
    correct_answer: string;
    explanation?: string;
  }[];
};
```

This reuses the existing `QuizQuestion`-style shape rather than inventing a new one, so the review UI (right/wrong, explanation) can share code with `Quiz.tsx`/`CourseCheckpoint.tsx`.

### Band conversion

New file `src/lib/ieltsBand.ts`. Raw score (0-40) → band, one table per section (Listening and Reading use different curves; Reading table below is Academic, not General Training):

| Raw (Listening) | Band | Raw (Academic Reading) | Band |
|---|---|---|---|
| 39-40 | 9 | 39-40 | 9 |
| 37-38 | 8.5 | 37-38 | 8.5 |
| 35-36 | 8 | 35-36 | 8 |
| 32-34 | 7.5 | 33-34 | 7.5 |
| 30-31 | 7 | 30-32 | 7 |
| 26-29 | 6.5 | 27-29 | 6.5 |
| 23-25 | 6 | 23-26 | 6 |
| 18-22 | 5.5 | 19-22 | 5.5 |
| 16-17 | 5 | 15-18 | 5 |
| 13-15 | 4.5 | 13-14 | 4.5 |
| 11-12 | 4 | 10-12 | 4 |
| 9-10 | 3.5 | 8-9 | 3.5 |
| 6-8 | 3 | 6-7 | 3 |
| 4-5 | 2.5 | 4-5 | 2.5 |

`estimated_band = round_to_nearest_half((listening_band + reading_band) / 2)`.

### Components

- `Timer.tsx` — countdown display, `onExpire` callback. No pause; matches real exam conditions.
- `ListeningSection.tsx` — 4 parts sequential, single 30-minute timer for the whole section, auto-advances to Reading when time expires regardless of what's answered.
- `AudioPlayer.tsx` — wraps `window.speechSynthesis.speak()`. Play button disables once playback finishes for that part — no rewind/replay, matching the real test's single playback.
- `ReadingSection.tsx` — 3 passages, single 60-minute timer, passage-left/questions-right split view on desktop, stacked (passage above questions) on mobile.
- Results phase (inline in `MockExam.tsx`, not a separate route) — score + band per section, combined estimated band with the "not an official score" disclaimer, then full review list (question, her answer, correct answer, explanation) reusing the result-row styling from `Quiz.tsx`.

### Data access (`src/lib/db.ts` additions)

- `getMockExams()` / `getMockExamById(id)`
- `submitMockExamAttempt(attempt)` — writes to `mock_exam_attempts`, and if `mock_exam_id` isn't already in `user_progress.completed_mock_exams`, appends it and awards a fixed XP bonus (mirrors how `CourseCheckpoint` awards XP once per lesson).

### Navigation

Added to the `items` array passed to `MoreSheet` in `Layout.tsx` — not one of the four primary bottom-tab slots.

## Content plan (first seeded exam)

Written as SQL, same pattern as `course-quizzes-seed.sql`:

- 3 Academic-style reading passages, ~700-800 words each, 13-14 questions each (40 total) — mix of multiple-choice and fill-in-the-blank (True/False/Not Given style questions modeled as multiple_choice with those three options).
- 4 listening parts, script text (for TTS) + 10 questions each (40 total) — Part 1 everyday conversation, Part 2 monologue, Part 3 academic discussion, Part 4 academic lecture, matching real IELTS part structure.

## Edge cases

- Timer expiry mid-question: answers given so far are kept, unanswered ones score as wrong, section auto-advances.
- Browser without `speechSynthesis` support (rare, but some embedded webviews lack it): show a text fallback — display the listening script as read-along text with a visible notice, so the section is still completable.
- Refresh/navigate-away mid-exam: no persistence across reloads in v1 — an in-progress attempt is lost, same as leaving the real exam room. A future version could persist phase+answers to `localStorage` if this proves annoying in practice.

## Testing

- Unit tests for `ieltsBand.ts` conversion (boundary values per band cutoff).
- Manual run-through of full flow (intro → listening → reading → results) in dev server, verifying timer auto-advance and TTS playback.
