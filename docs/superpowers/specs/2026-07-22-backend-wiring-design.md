# Gerda English — Backend Wiring & Bug Fix Design

## Problem

The app has a complete Supabase data layer (`src/lib/db.ts`, `src/lib/supabase.ts`)
and schema (`supabase-schema.sql`), but no page actually uses it. Every page
(`Dashboard`, `Notebook`, `Calendar`, `Mistakes`, `Quiz`, `Rewards`,
`AdminDashboard`, `Layout`) holds its data in local `useState` initialized
with hardcoded mock values. Nothing persists across a page refresh, XP/level/
streak are fake, and several buttons (Save Quiz, Upload Reward, Watch/View
reward, Calendar `+`) have no handler at all.

Already fixed in a prior session, before this design:
- `.env` created locally with correct `VITE_`-prefixed Supabase URL/anon key
  (deployed host was using `NEXT_PUBLIC_` prefix, which Vite ignores —
  needs the same rename on the deploy host).
- `.gitignore` had literal markdown code-fence lines wrapping the file,
  breaking it as a gitignore. Removed.
- `supabase-schema.sql` RLS policies referenced
  `current_setting('app.current_user_id')`, a Postgres session variable
  never set by any client-side call — every query would always evaluate
  against `NULL` and match nothing. Replaced with open `USING (true)`
  policies, since this app has no server auth layer and is single-user
  (decision: no real auth needed, admin route protected separately by a
  password gate — see below).
- Schema has been run against the live Supabase project.

## Scope

Wire every page to the existing `db.ts` layer, fix the dead buttons, and
close two real gaps in the original build: no way to add a mistake, and no
way to actually attach reward media. Feature ideas beyond this (new pages,
extra gamification, etc.) are out of scope for this pass — this is the "make
what's already designed actually work" pass, not a feature-expansion pass.

Out of scope for this pass (explicitly deferred):
- Auto-logging mistakes from wrong quiz answers (only manual admin entry now).
- Real Supabase Auth (admin gets a simple shared-password gate instead).
- Any new pages or nav items.

## Architecture

No backend code changes beyond what's already written in `db.ts`. Per page:

1. `useEffect` on mount calls the relevant `db.ts` getter(s), stores result
   in state, shows a loading state until it resolves.
2. Write actions (save/delete/submit) call the matching `db.ts` mutator,
   then either refetch or optimistically update local state.
3. A single inline error banner pattern (no dedicated error page/toast
   library — keep it lightweight) shows `error.message` if a call throws.
4. A new `AdminGate` component wraps the `/admin` route: prompts for a
   password on first visit, compares against `import.meta.env.VITE_ADMIN_PASSWORD`,
   stores an "unlocked" flag in `localStorage` so it doesn't re-prompt every
   visit on the same device.

## Per-page changes

- **Layout**: replace hardcoded `xp`/`level`/`streak` state with
  `getUserProgress()` on mount.
- **Dashboard**: real note count (`getNotes().length`), real recent-activity
  feed built from the most recent notes/mistakes/quiz attempts merged and
  sorted by timestamp. Motivational quote and daily tips stay static content
  — they're not data, no need to wire them.
- **Notebook**: `getNotes`/`saveNote`/`deleteNote` wired in. Dictionary
  lookup switches from the 5-word hardcoded map to a call to
  `https://api.dictionaryapi.dev/api/v2/entries/en/<word>` on click, with a
  "no definition found" fallback state for words the API doesn't know.
- **Calendar**: fix hardcoded "January 2024" / `daysInMonth = 31` /
  `firstDayOfMonth = 1` to compute the real current month, real day count,
  and real weekday offset from `new Date()`. Wire `getCalendarEvents`,
  `createCalendarEvent`, `updateCalendarEvent`, `deleteCalendarEvent`; the
  `+` button opens a small inline form instead of doing nothing.
- **Mistakes**: `getMistakes` replaces the hardcoded array; stats/filter
  logic unchanged (already computed client-side from the list). New: a
  mistake-entry form lives in the Admin Panel (see below), calling
  `addMistake`.
- **Quiz**: `getQuizzes` replaces the hardcoded quiz; if the table is empty,
  show an empty state instead of a broken page. On submit, call
  `submitQuizAttempt` with the real score/answers so XP is actually awarded
  through `addXP`.
- **Rewards**: real XP/unlock state from `getUserProgress()` +
  `getRewards()`; `unlockReward` called when a reward's threshold is
  crossed. Watch/View button opens `media_url` (new tab for video/YouTube
  links, lightbox-style view for images). Upload flow (Admin Panel) uploads
  the chosen file to a public Supabase Storage bucket named `rewards`, then
  calls `createReward` with the resulting public URL.
- **AdminDashboard**: gated by `AdminGate`. Save Quiz button calls
  `createQuiz`. Upload Reward button uploads to Storage then calls
  `createReward`. New "Add Mistake" form (title/original/correction/type/
  explanation) calls `addMistake`.

## Data flow / error handling

Straightforward: browser → Supabase anon key → tables with open RLS. No
retries, no offline queue — matches the app's current scale (one user,
Wi-Fi-connected tablet/browser). Errors surface as an inline red banner with
the raw Supabase error message; good enough for a two-person app where the
"admin" is also the one who'll be told about breakage directly.

## Manual setup required (like the schema step)

Before the Rewards upload path can be tested end to end, a public Storage
bucket named `rewards` needs to exist in the Supabase project (Dashboard →
Storage → New Bucket → name `rewards` → Public: yes). This is a one-time
dashboard action, same category as running `supabase-schema.sql` — I'll flag
exactly when it's needed during implementation.

## Testing

No test framework is set up in this project (no Jest/Vitest, no test
script beyond `lint`). Verification for this pass is manual: run `npm run
dev`, exercise each page's read + write paths, and confirm data survives a
page refresh and shows up in Supabase's Table Editor. Not adding a test
framework as part of this pass — out of scope unless requested separately.
