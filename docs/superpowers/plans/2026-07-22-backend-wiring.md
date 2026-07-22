# Gerda English Backend Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire every page in the Gerda English app to the already-built Supabase data layer (`src/lib/db.ts`), fixing the fake/hardcoded data, dead buttons, and a handful of concrete bugs (broken date math, dead imports that fail the strict TS build, a reward-type value the schema can never accept) uncovered while reading the code.

**Architecture:** No backend code changes beyond one small addition (`getQuizAttempts` in `db.ts` — needed by the Dashboard task, doesn't exist yet). Each page switches from mock `useState` to `useEffect` + `db.ts` calls, with a loading state and a console-logged error path (no toast library, no retry logic — matches the app's single-user scale). The `/admin` route gets a lightweight password gate (`localStorage` flag, no real auth).

**Tech Stack:** React 18, TypeScript (strict, `noUnusedLocals`/`noUnusedParameters` on), Vite, Tailwind, `@supabase/supabase-js`, `lucide-react` icons. No test framework — this repo has none, and adding one is out of scope for this plan (see spec's Testing section).

## Global Constraints

- No test framework exists in this project (only a `lint` script). Every task's verification step is manual: run `npm run dev`, exercise the page, confirm the row in Supabase Table Editor. Do not add Jest/Vitest as part of this plan.
- `tsconfig.json` has `strict`, `noUnusedLocals`, and `noUnusedParameters` on — dead imports are hard build errors, not lint warnings. Several pages currently have unused icon imports (`Star` in `Layout.tsx`, `HelpCircle` in `Quiz.tsx`, `Unlock`/`Image as ImageIcon` in other files) — `npm run build` is broken today because of this. Each task below removes the dead imports in the file it touches.
- `USER_ID = 'gerda'` is hardcoded in `db.ts` — do not change it or add multi-user logic.
- RLS policies are open (`USING (true)`) — no auth headers or session context needed for any Supabase call.
- Do not reintroduce the `'text'` reward media type. The schema's `media_type` CHECK constraint only allows `'video' | 'image'`, and the original mock data used `'text'` inconsistently with its own type — this plan removes it everywhere.
- Do not invent data for stats with no backing table (e.g. "Study Time", "Achievements" — the original Dashboard hardcoded these with zero underlying data model; this plan removes them rather than faking a new system).
- Keep the existing Tailwind design classes (`card-cute`, `btn-cute`, `btn-primary`, `btn-secondary`, `input-cute`, `badge-cute`, `badge-pink`, `badge-purple`, `badge-mint`, `progress-cute`, `progress-fill`) exactly as they are — this plan is about wiring, not restyling.
- Commit after every task. Do not push — push only happens on the user's explicit word, per this session's established workflow.
- Working directory for all file paths below: `F:\Claude\Projects\Gerda-English-main\Gerda-English-main\gerda-english`.

---

### Task 1: Admin password gate

**Files:**
- Create: `src/components/AdminGate.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `AdminGate` component, default export, props `{ children: React.ReactNode }`. Renders `children` only after the visitor enters the correct password once; remembers via `localStorage["gerda_admin_unlocked"]`.
- Consumes: `import.meta.env.VITE_ADMIN_PASSWORD` (falls back to `'gerda-admin'` if unset, same graceful-fallback pattern `src/lib/supabase.ts` already uses for missing env vars).

- [ ] **Step 1: Create `src/components/AdminGate.tsx`**

```tsx
import { useState, useEffect, FormEvent, ReactNode } from 'react';
import { Lock } from 'lucide-react';

const STORAGE_KEY = 'gerda_admin_unlocked';

const AdminGate = ({ children }: { children: ReactNode }) => {
  const configuredPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'gerda-admin';
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      setUnlocked(true);
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input === configuredPassword) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setUnlocked(true);
      setError('');
    } else {
      setError('Wrong password');
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="max-w-sm mx-auto mt-20">
      <div className="card-cute text-center">
        <Lock className="w-10 h-10 mx-auto mb-4 text-cute-pink-400" />
        <h2 className="text-xl font-bold text-cute-purple-700 mb-4">Admin Access</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            placeholder="Password"
            className="input-cute"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="btn-cute btn-primary w-full">
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminGate;
```

- [ ] **Step 2: Wire it into the admin route in `src/App.tsx`**

Replace the full file with:

```tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AdminGate from './components/AdminGate';
import Dashboard from './pages/Dashboard';
import Notebook from './pages/Notebook';
import Calendar from './pages/Calendar';
import Mistakes from './pages/Mistakes';
import Quiz from './pages/Quiz';
import Rewards from './pages/Rewards';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="notebook" element={<Notebook />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="mistakes" element={<Mistakes />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="rewards" element={<Rewards />} />
          <Route
            path="admin"
            element={
              <AdminGate>
                <AdminDashboard />
              </AdminGate>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
```

- [ ] **Step 3: Add the password to `.env` (local, not committed)**

Append this line to `gerda-english/.env`:

```
VITE_ADMIN_PASSWORD=choose-your-own-password-here
```

Tell the user to pick their own value here — don't leave the fallback (`gerda-admin`) as the real password.

- [ ] **Step 4: Manual verification**

Run `npm run dev`, open `http://localhost:5173/admin`. Expected: password prompt appears, wrong password shows "Wrong password", correct password (matching `.env`'s `VITE_ADMIN_PASSWORD`) reveals the admin panel and survives a page refresh (check `localStorage` in devtools for `gerda_admin_unlocked: "true"`).

- [ ] **Step 5: Commit**

```bash
git add src/components/AdminGate.tsx src/App.tsx
git commit -m "feat: gate admin route behind a shared password"
```

(`.env` stays uncommitted — it's gitignored.)

---

### Task 2: Layout — real XP/level/streak

**Files:**
- Modify: `src/components/Layout.tsx` (full rewrite)

**Interfaces:**
- Consumes: `getUserProgress(): Promise<UserProgress | null>` from `src/lib/db.ts`. `UserProgress` has `total_xp: number`, `level: number`, `streak: number` (from `src/lib/supabase.ts`).

- [ ] **Step 1: Replace `src/components/Layout.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, Calendar, Trophy, Gift, Settings, Home, Book, XCircle } from 'lucide-react';
import { getUserProgress } from '../lib/db';

const Layout = () => {
  const location = useLocation();
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    getUserProgress()
      .then((progress) => {
        if (progress) {
          setXp(progress.total_xp);
          setLevel(progress.level);
          setStreak(progress.streak);
        }
      })
      .catch((err) => console.error('Failed to load progress:', err));
  }, [location.pathname]);

  const menuItems = [
    { path: '/', icon: Home, label: 'Home', color: 'from-cute-pink-400 to-cute-purple-400' },
    { path: '/notebook', icon: BookOpen, label: 'Notebook', color: 'from-cute-blue-400 to-cute-mint-400' },
    { path: '/calendar', icon: Calendar, label: 'Calendar', color: 'from-cute-peach-400 to-cute-pink-400' },
    { path: '/mistakes', icon: XCircle, label: 'Mistakes', color: 'from-cute-purple-400 to-cute-pink-400' },
    { path: '/quiz', icon: Book, label: 'Quiz', color: 'from-cute-mint-400 to-cute-blue-400' },
    { path: '/rewards', icon: Gift, label: 'Rewards', color: 'from-cute-pink-400 to-cute-peach-400' },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white/90 backdrop-blur-sm border-r-2 border-cute-pink-100 p-6 flex flex-col">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-cute bg-gradient-to-r from-cute-pink-400 to-cute-purple-400 bg-clip-text text-transparent">
            🌸 Gerda English
          </h1>
          <p className="text-sm text-cute-pink-600 mt-1">Let's learn together! 💕</p>
        </div>

        <div className="card-cute mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold">Level {level}</span>
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="progress-cute mb-2">
            <div
              className="progress-fill bg-gradient-to-r from-cute-pink-400 to-cute-purple-400"
              style={{ width: `${(xp % 1000) / 10}%` }}
            />
          </div>
          <p className="text-xs text-cute-pink-600">{xp} XP total</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm">🔥 Streak</span>
            <span className="badge-cute badge-pink">{streak} days</span>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : 'text-gray-600 hover:bg-cute-pink-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          to="/admin"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-600 hover:bg-cute-purple-50 transition-all duration-300 mt-auto"
        >
          <Settings className="w-5 h-5" />
          <span className="font-semibold">Admin Panel</span>
        </Link>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
```

Note: `Star` import is dropped — it was imported in the original file but never used anywhere in the render, which is a hard build error under `noUnusedLocals`.

- [ ] **Step 2: Manual verification**

With an empty `user_progress` table, `npm run dev` should show "Level 1", "0 XP total", "0 days" streak in the sidebar (the component's initial state, since `getUserProgress` returns `null` for a user with no row yet). This will start reflecting real numbers once Task 7 (Quiz) awards XP — recheck then.

- [ ] **Step 3: Commit**

```bash
git add src/components/Layout.tsx
git commit -m "fix: wire sidebar XP/level/streak to real user progress"
```

---

### Task 3: Notebook — real notes + real dictionary lookups

**Files:**
- Modify: `src/pages/Notebook.tsx` (full rewrite)
- Modify: `src/lib/supabase.ts:23` (loosen `Note.mistakes` to optional — it's never actually populated by any query, since `mistakes` live in their own table joined by `note_id`, not embedded)

**Interfaces:**
- Consumes: `getNotes(): Promise<Note[]>`, `saveNote(note: Partial<Note>): Promise<Note>`, `deleteNote(id: string): Promise<void>` from `src/lib/db.ts`.
- Consumes (new, external): `https://api.dictionaryapi.dev/api/v2/entries/en/<word>` — free, no API key.

- [ ] **Step 1: Fix the `Note` type in `src/lib/supabase.ts`**

Change:
```ts
  mistakes: Mistake[];
```
to:
```ts
  mistakes?: Mistake[];
```
(around line 23 — it's the last field of the `Note` interface).

- [ ] **Step 2: Replace `src/pages/Notebook.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { Save, Search, BookOpen, Plus, Trash2 } from 'lucide-react';
import { getNotes, saveNote, deleteNote } from '../lib/db';
import { Note } from '../lib/supabase';

interface WordDefinition {
  word: string;
  definition: string;
  example?: string;
}

const commonWords = ['accommodation', 'environment', 'government', 'education', 'technology'];

async function fetchDefinition(word: string): Promise<WordDefinition | null> {
  const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
  if (!res.ok) return null;
  const data = await res.json();
  const entry = data[0];
  const definitionObj = entry?.meanings?.[0]?.definitions?.[0];
  if (!definitionObj) return null;
  return {
    word: entry.word,
    definition: definitionObj.definition,
    example: definitionObj.example,
  };
}

const Notebook = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentNote, setCurrentNote] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordDefinition | null>(null);
  const [dictLoading, setDictLoading] = useState(false);
  const [dictNotFound, setDictNotFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getNotes()
      .then(setNotes)
      .catch((err) => console.error('Failed to load notes:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleWordClick = async (word: string) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!cleanWord) return;
    setDictLoading(true);
    setDictNotFound(false);
    setSelectedWord(null);
    try {
      const def = await fetchDefinition(cleanWord);
      if (def) {
        setSelectedWord(def);
      } else {
        setDictNotFound(true);
      }
    } catch (err) {
      console.error('Dictionary lookup failed:', err);
      setDictNotFound(true);
    } finally {
      setDictLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!currentNote.title || !currentNote.content || saving) return;
    setSaving(true);
    try {
      const created = await saveNote(currentNote);
      setNotes([created, ...notes]);
      setCurrentNote({ title: '', content: '' });
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      setNotes(notes.filter((note) => note.id !== id));
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const renderContentWithClickableWords = (content: string) => {
    const words = content.split(' ');
    return words.map((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      const isClickable = commonWords.includes(cleanWord);
      return (
        <span
          key={index}
          className={isClickable ? 'text-cute-pink-500 hover:text-cute-pink-700 cursor-pointer underline decoration-dotted' : ''}
          onClick={() => isClickable && handleWordClick(word)}
        >
          {word}{' '}
        </span>
      );
    });
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <p className="text-center text-cute-pink-600 py-12">Loading notebook... 🌸</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold font-cute text-cute-purple-700 flex items-center gap-3">
          <BookOpen className="w-8 h-8" />
          My Notebook 📝
        </h2>
        <p className="text-cute-pink-600">Click pink words to see definitions! ✨</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card-cute">
            <h3 className="text-xl font-bold text-cute-purple-700 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Note
            </h3>
            <input
              type="text"
              placeholder="Note title..."
              className="input-cute mb-3 text-lg font-semibold"
              value={currentNote.title}
              onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
            />
            <textarea
              placeholder="Write your notes here... Click on common IELTS words (they'll turn pink!) to see their meaning."
              className="input-cute min-h-[200px] resize-y leading-relaxed"
              value={currentNote.content}
              onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
            />
            <button
              onClick={handleSaveNote}
              disabled={saving}
              className="btn-cute btn-primary mt-4 w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          </div>

          <div className="card-cute">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-cute-purple-700">My Notes</h3>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  className="input-cute pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredNotes.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No notes yet — write your first one above!</p>
              )}
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 bg-gradient-to-r from-cute-pink-50 to-cute-purple-50 rounded-2xl border-2 border-cute-pink-100"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-bold text-cute-purple-700">{note.title}</h4>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-600 mb-2 leading-relaxed">
                    {renderContentWithClickableWords(note.content)}
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-cute sticky top-4">
            <h3 className="text-xl font-bold text-cute-purple-700 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Quick Dictionary
            </h3>

            {dictLoading && <p className="text-center text-gray-500 py-8">Looking it up...</p>}

            {!dictLoading && selectedWord && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-cute-pink-100 to-cute-purple-100 rounded-2xl">
                  <h4 className="text-2xl font-bold text-cute-pink-600 mb-2">{selectedWord.word}</h4>
                  <p className="text-gray-700 mb-3">{selectedWord.definition}</p>
                  {selectedWord.example && (
                    <div className="p-3 bg-white/80 rounded-xl">
                      <p className="text-sm text-gray-600 italic">"{selectedWord.example}"</p>
                    </div>
                  )}
                </div>
                <button onClick={() => setSelectedWord(null)} className="btn-cute btn-secondary w-full">
                  Close
                </button>
              </div>
            )}

            {!dictLoading && !selectedWord && dictNotFound && (
              <div className="text-center py-8 text-gray-500">
                <p>No definition found for that word. Try another!</p>
              </div>
            )}

            {!dictLoading && !selectedWord && !dictNotFound && (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Click on a pink word in your notes to see its definition here!</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t-2 border-cute-pink-100">
              <h4 className="font-bold text-cute-purple-700 mb-3">📚 Common IELTS Words</h4>
              <div className="flex flex-wrap gap-2">
                {commonWords.map((word) => (
                  <button
                    key={word}
                    onClick={() => handleWordClick(word)}
                    className="px-3 py-1 bg-cute-pink-100 text-cute-pink-700 rounded-full text-sm hover:bg-cute-pink-200 transition-colors"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notebook;
```

- [ ] **Step 3: Manual verification**

`npm run dev` → Notebook page: create a note, confirm it appears in the list and shows up as a row in Supabase's `notes` table with `user_id = 'gerda'`. Refresh the page — note should still be there (this is the core bug fix, proving persistence). Click one of the "Common IELTS Words" buttons — should show a real definition fetched from the API (not the old 5-word hardcoded text). Delete a note — confirm it disappears from both the UI and the Supabase table.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Notebook.tsx src/lib/supabase.ts
git commit -m "feat: wire notebook to real notes + live dictionary API"
```

---

### Task 4: Calendar — fix date math, wire real events

**Files:**
- Modify: `src/pages/Calendar.tsx` (full rewrite)

**Interfaces:**
- Consumes: `getCalendarEvents(month?: number, year?: number): Promise<CalendarEvent[]>` (month is 1-indexed), `createCalendarEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent>`, `updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent>` from `src/lib/db.ts`. `CalendarEvent` fields: `id, user_id, date (string, 'YYYY-MM-DD'), title, description?, completed, xp_reward, created_at`.

- [ ] **Step 1: Replace `src/pages/Calendar.tsx`**

```tsx
import { useState, useEffect, FormEvent } from 'react';
import { Calendar as CalendarIcon, Plus, CheckCircle } from 'lucide-react';
import { getCalendarEvents, createCalendarEvent, updateCalendarEvent } from '../lib/db';
import { CalendarEvent } from '../lib/supabase';

const toDateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const Calendar = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    date: toDateKey(year, month, currentDate.getDate()),
    xp: 20,
  });

  useEffect(() => {
    getCalendarEvents(month + 1, year)
      .then(setEvents)
      .catch((err) => console.error('Failed to load calendar events:', err))
      .finally(() => setLoading(false));
  }, [month, year]);

  const getDayStatus = (day: number) => {
    const dateKey = toDateKey(year, month, day);
    const event = events.find((e) => e.date === dateKey);
    if (!event) return null;
    return event.completed ? 'completed' : 'planned';
  };

  const todayKey = toDateKey(year, month, currentDate.getDate());
  const upcoming = [...events]
    .filter((e) => e.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 7);
  const completedCount = upcoming.filter((e) => e.completed).length;

  const handleToggleComplete = async (event: CalendarEvent) => {
    try {
      const updated = await updateCalendarEvent(event.id, { completed: !event.completed });
      setEvents((prev) => prev.map((e) => (e.id === event.id ? updated : e)));
    } catch (err) {
      console.error('Failed to update event:', err);
    }
  };

  const handleAddTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      const created = await createCalendarEvent({
        title: newTask.title,
        date: newTask.date,
        xp_reward: newTask.xp,
        completed: false,
      });
      setEvents((prev) => [...prev, created]);
      setNewTask({ title: '', date: todayKey, xp: 20 });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const monthLabel = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  if (loading) {
    return <p className="text-center text-cute-pink-600 py-12">Loading calendar... 🌸</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold font-cute text-cute-purple-700 flex items-center gap-3">
          <CalendarIcon className="w-8 h-8" />
          Study Calendar 📅
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-cute">
          <h3 className="text-xl font-bold text-cute-purple-700 mb-6 text-center">{monthLabel}</h3>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center font-bold text-cute-pink-600 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const status = getDayStatus(day);
              const isToday = day === currentDate.getDate();

              return (
                <div
                  key={day}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300 ${
                    isToday
                      ? 'bg-gradient-to-br from-cute-pink-400 to-cute-purple-400 text-white shadow-lg scale-105'
                      : status === 'completed'
                      ? 'bg-gradient-to-br from-cute-mint-200 to-cute-blue-200 text-cute-purple-700'
                      : status === 'planned'
                      ? 'bg-cute-pink-50 text-cute-purple-700 border-2 border-cute-pink-200'
                      : 'bg-gray-50 text-gray-400 hover:bg-cute-pink-50'
                  }`}
                >
                  <span className="font-bold">{day}</span>
                  {status === 'completed' && <CheckCircle className="w-4 h-4 mt-1 text-cute-mint-600" />}
                  {status === 'planned' && !isToday && (
                    <div className="w-2 h-2 bg-cute-pink-300 rounded-full mt-1"></div>
                  )}
                  {isToday && <span className="absolute -top-2 -right-2 text-lg">🌟</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-cute">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-cute-purple-700">Next 7 Days</h3>
            <button
              onClick={() => setShowForm(!showForm)}
              className="p-2 bg-cute-pink-100 rounded-xl hover:bg-cute-pink-200 transition-colors"
            >
              <Plus className="w-5 h-5 text-cute-pink-600" />
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddTask} className="space-y-2 mb-4 p-3 bg-cute-pink-50 rounded-xl">
              <input
                type="text"
                placeholder="Task title"
                className="input-cute"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <input
                type="date"
                className="input-cute"
                value={newTask.date}
                onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
              />
              <input
                type="number"
                className="input-cute"
                value={newTask.xp}
                onChange={(e) => setNewTask({ ...newTask, xp: parseInt(e.target.value) || 0 })}
              />
              <button type="submit" className="btn-cute btn-primary w-full text-sm py-2">
                Add Task
              </button>
            </form>
          )}

          <div className="space-y-3">
            {upcoming.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No tasks planned yet.</p>
            )}
            {upcoming.map((event) => (
              <div
                key={event.id}
                className={`p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
                  event.completed ? 'bg-gradient-to-r from-cute-mint-100 to-cute-blue-100' : 'bg-cute-pink-50'
                }`}
                onClick={() => handleToggleComplete(event)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`font-semibold ${
                        event.completed ? 'text-cute-mint-700 line-through' : 'text-cute-purple-700'
                      }`}
                    >
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {event.date} · +{event.xp_reward} XP
                    </p>
                  </div>
                  {event.completed && <CheckCircle className="w-5 h-5 text-cute-mint-600" />}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t-2 border-cute-pink-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-cute-purple-700">Progress</span>
              <span className="text-sm text-cute-pink-600">
                {completedCount}/{upcoming.length} tasks
              </span>
            </div>
            <div className="progress-cute">
              <div
                className="progress-fill bg-gradient-to-r from-cute-mint-400 to-cute-blue-400"
                style={{ width: `${upcoming.length ? (completedCount / upcoming.length) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-cute-pink-600 mt-2 text-center">Keep going! You're doing great! 💪</p>
          </div>
        </div>
      </div>

      <div className="card-cute text-center py-6 bg-gradient-to-r from-cute-peach-50 via-cute-pink-50 to-cute-purple-50">
        <p className="text-lg text-cute-purple-700">
          🎯 <strong>Remember:</strong> Consistency is key! Even 15 minutes a day makes a difference!
        </p>
      </div>
    </div>
  );
};

export default Calendar;
```

- [ ] **Step 2: Manual verification**

`npm run dev` → Calendar page should show the *actual* current month/year (not "January 2024"), with the correct weekday grid alignment (check that today's date lands under the correct weekday column). Click the `+` button, add a task for today with some XP value, submit — it should appear both on the calendar grid (as a "planned" dot) and in the "Next 7 Days" list. Click the task to toggle it complete — checkmark appears, and the row shows in Supabase's `calendar_events` table with `completed: true`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Calendar.tsx
git commit -m "fix: calendar uses real current month/date math, wire events to db"
```

---

### Task 5: Mistakes — read real mistakes

**Files:**
- Modify: `src/pages/Mistakes.tsx` (full rewrite)

**Interfaces:**
- Consumes: `getMistakes(): Promise<Mistake[]>` from `src/lib/db.ts`. `Mistake` fields: `id, user_id, original_text, corrected_text, error_type ('grammar'|'vocabulary'|'spelling'|'listening'|'reading'), note_id?, quiz_id?, explanation?, created_at`.

- [ ] **Step 1: Replace `src/pages/Mistakes.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { XCircle, BookOpen, Headphones, Eye, PenTool } from 'lucide-react';
import { getMistakes } from '../lib/db';
import { Mistake } from '../lib/supabase';

const Mistakes = () => {
  const [filter, setFilter] = useState('all');
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMistakes()
      .then(setMistakes)
      .catch((err) => console.error('Failed to load mistakes:', err))
      .finally(() => setLoading(false));
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reading':
        return <Eye className="w-5 h-5" />;
      case 'listening':
        return <Headphones className="w-5 h-5" />;
      case 'vocabulary':
        return <BookOpen className="w-5 h-5" />;
      case 'grammar':
        return <PenTool className="w-5 h-5" />;
      default:
        return <XCircle className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reading':
        return 'from-cute-blue-400 to-cute-mint-400';
      case 'listening':
        return 'from-cute-purple-400 to-cute-pink-400';
      case 'vocabulary':
        return 'from-cute-peach-400 to-cute-pink-400';
      case 'grammar':
        return 'from-cute-mint-400 to-cute-blue-400';
      default:
        return 'from-cute-pink-400 to-cute-purple-400';
    }
  };

  const filteredMistakes = filter === 'all' ? mistakes : mistakes.filter((m) => m.error_type === filter);

  const stats = {
    total: mistakes.length,
    reading: mistakes.filter((m) => m.error_type === 'reading').length,
    listening: mistakes.filter((m) => m.error_type === 'listening').length,
    vocabulary: mistakes.filter((m) => m.error_type === 'vocabulary').length,
    grammar: mistakes.filter((m) => m.error_type === 'grammar').length,
  };

  if (loading) {
    return <p className="text-center text-cute-pink-600 py-12">Loading mistakes... 🌸</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold font-cute text-cute-purple-700 flex items-center gap-3">
          <XCircle className="w-8 h-8" />
          My Mistakes Bank 📚
        </h2>
        <p className="text-cute-pink-600">Learn from mistakes = Get better! 💪</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card-cute text-center">
          <p className="text-3xl font-bold text-cute-purple-700">{stats.total}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
        <div className="card-cute text-center bg-gradient-to-br from-cute-blue-50 to-cute-mint-50">
          <p className="text-3xl font-bold text-cute-blue-700">{stats.reading}</p>
          <p className="text-sm text-gray-500">Reading</p>
        </div>
        <div className="card-cute text-center bg-gradient-to-br from-cute-purple-50 to-cute-pink-50">
          <p className="text-3xl font-bold text-cute-purple-700">{stats.listening}</p>
          <p className="text-sm text-gray-500">Listening</p>
        </div>
        <div className="card-cute text-center bg-gradient-to-br from-cute-peach-50 to-cute-pink-50">
          <p className="text-3xl font-bold text-cute-peach-700">{stats.vocabulary}</p>
          <p className="text-sm text-gray-500">Vocabulary</p>
        </div>
        <div className="card-cute text-center bg-gradient-to-br from-cute-mint-50 to-cute-blue-50">
          <p className="text-3xl font-bold text-cute-mint-700">{stats.grammar}</p>
          <p className="text-sm text-gray-500">Grammar</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {['all', 'reading', 'listening', 'vocabulary', 'grammar'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
              filter === type
                ? 'bg-gradient-to-r from-cute-pink-400 to-cute-purple-400 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-cute-pink-50'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredMistakes.length === 0 && (
          <p className="text-center text-gray-500 py-8">No mistakes logged yet — nice! 🌟</p>
        )}
        {filteredMistakes.map((mistake) => (
          <div key={mistake.id} className="card-cute">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${getTypeColor(mistake.error_type)} text-white`}>
                {getTypeIcon(mistake.error_type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="badge-cute badge-pink capitalize">{mistake.error_type}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(mistake.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                    <p className="text-xs text-red-600 font-bold mb-1">❌ My Answer:</p>
                    <p className="text-gray-700">{mistake.original_text}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                    <p className="text-xs text-green-600 font-bold mb-1">✅ Correct:</p>
                    <p className="text-gray-700">{mistake.corrected_text}</p>
                  </div>
                </div>

                {mistake.explanation && (
                  <div className="p-4 bg-gradient-to-r from-cute-pink-50 to-cute-purple-50 rounded-xl">
                    <p className="text-sm text-cute-purple-700">
                      <strong>💡 Explanation:</strong> {mistake.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-cute text-center py-6 bg-gradient-to-r from-cute-mint-50 via-cute-blue-50 to-cute-purple-50">
        <p className="text-lg text-cute-purple-700">
          🌟 <strong>Great job reviewing!</strong> Every mistake you learn from makes you stronger!
        </p>
        <p className="text-sm text-cute-pink-600 mt-2">
          Review your mistakes regularly to avoid repeating them in the exam!
        </p>
      </div>
    </div>
  );
};

export default Mistakes;
```

Note: `Mic` import is dropped — unused in the original file, another `noUnusedLocals` build error.

- [ ] **Step 2: Manual verification**

With the `mistakes` table currently empty, the page should show "No mistakes logged yet — nice!" instead of crashing. In Supabase's Table Editor, manually insert one row into `mistakes` (`user_id: 'gerda'`, `original_text`, `corrected_text`, `error_type: 'grammar'`, `explanation`) — refresh the page, confirm it appears and the filter buttons correctly show/hide it.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Mistakes.tsx
git commit -m "fix: read real mistakes from db instead of hardcoded list"
```

---

### Task 6: Admin Dashboard — wire quiz builder, reward uploader, add mistakes form

**Files:**
- Modify: `src/pages/AdminDashboard.tsx` (full rewrite)

**Interfaces:**
- Consumes: `createQuiz(quiz: Partial<Quiz>): Promise<Quiz>`, `createReward(reward: Partial<Reward>): Promise<Reward>`, `addMistake(mistake: Partial<Mistake>): Promise<Mistake>` from `src/lib/db.ts`. `supabase` client from `src/lib/supabase.ts` (for Storage upload). `QuizQuestion` type fields: `id, quiz_id, type, question_text, options?, correct_answer, explanation?`.
- Produces: nothing new consumed by other tasks — this is a leaf page.

**Manual setup required before this task's reward-upload path can be tested:** create a public Storage bucket named `rewards` in the Supabase dashboard (Storage → New Bucket → name `rewards` → Public: yes). Do this before Step 3's manual verification.

- [ ] **Step 1: Replace `src/pages/AdminDashboard.tsx`**

```tsx
import { useState } from 'react';
import { Settings, Plus, Upload, BookOpen, Video, Image as ImageIcon, XCircle } from 'lucide-react';
import { createQuiz, createReward, addMistake } from '../lib/db';
import { supabase } from '../lib/supabase';
import { QuizQuestion, Mistake } from '../lib/supabase';

interface BuilderQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'quizzes' | 'rewards' | 'mistakes'>('quizzes');

  // Quiz Builder State
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    xpReward: 50,
    questions: [] as BuilderQuestion[],
  });
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [quizMessage, setQuizMessage] = useState('');

  // Reward Uploader State
  const [rewardForm, setRewardForm] = useState<{
    title: string;
    description: string;
    xpRequired: number;
    type: 'video' | 'image';
    file: File | null;
  }>({
    title: '',
    description: '',
    xpRequired: 500,
    type: 'video',
    file: null,
  });
  const [uploadingReward, setUploadingReward] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('');

  // Mistake Form State
  const [mistakeForm, setMistakeForm] = useState({
    original_text: '',
    corrected_text: '',
    error_type: 'grammar' as Mistake['error_type'],
    explanation: '',
  });
  const [savingMistake, setSavingMistake] = useState(false);
  const [mistakeMessage, setMistakeMessage] = useState('');

  const handleAddQuestion = () => {
    setQuizForm({
      ...quizForm,
      questions: [
        ...quizForm.questions,
        { id: Date.now(), question: '', options: ['', '', '', ''], correct: 0 },
      ],
    });
  };

  const handleSaveQuiz = async () => {
    if (!quizForm.title || quizForm.questions.length === 0 || savingQuiz) return;
    setSavingQuiz(true);
    setQuizMessage('');
    try {
      const questions: QuizQuestion[] = quizForm.questions.map((q) => ({
        id: String(q.id),
        quiz_id: '',
        type: 'multiple_choice',
        question_text: q.question,
        options: q.options,
        correct_answer: q.options[q.correct],
      }));
      await createQuiz({
        title: quizForm.title,
        description: quizForm.description,
        questions,
        xp_reward: quizForm.xpReward,
      });
      setQuizForm({ title: '', description: '', xpReward: 50, questions: [] });
      setQuizMessage('Quiz saved! ✨');
    } catch (err) {
      console.error('Failed to save quiz:', err);
      setQuizMessage('Failed to save quiz — check the console.');
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleUploadReward = async () => {
    if (!rewardForm.title || !rewardForm.file || uploadingReward) return;
    setUploadingReward(true);
    setRewardMessage('');
    try {
      const fileExt = rewardForm.file.name.split('.').pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('rewards')
        .upload(filePath, rewardForm.file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('rewards').getPublicUrl(filePath);

      await createReward({
        title: rewardForm.title,
        description: rewardForm.description,
        media_url: urlData.publicUrl,
        media_type: rewardForm.type,
        xp_required: rewardForm.xpRequired,
      });

      setRewardForm({ title: '', description: '', xpRequired: 500, type: 'video', file: null });
      setRewardMessage('Reward uploaded! 🎁');
    } catch (err) {
      console.error('Failed to upload reward:', err);
      setRewardMessage('Upload failed — check the console.');
    } finally {
      setUploadingReward(false);
    }
  };

  const handleAddMistake = async () => {
    if (!mistakeForm.original_text || !mistakeForm.corrected_text || savingMistake) return;
    setSavingMistake(true);
    setMistakeMessage('');
    try {
      await addMistake(mistakeForm);
      setMistakeForm({ original_text: '', corrected_text: '', error_type: 'grammar', explanation: '' });
      setMistakeMessage('Mistake added! 📚');
    } catch (err) {
      console.error('Failed to add mistake:', err);
      setMistakeMessage('Failed to add mistake — check the console.');
    } finally {
      setSavingMistake(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold font-cute text-cute-purple-700 flex items-center gap-3">
          <Settings className="w-8 h-8" />
          Admin Panel 🛠️
        </h2>
        <p className="text-cute-pink-600">Create quizzes and upload rewards!</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'quizzes'
              ? 'bg-gradient-to-r from-cute-pink-400 to-cute-purple-400 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-cute-pink-50'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          Create Quiz
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'rewards'
              ? 'bg-gradient-to-r from-cute-pink-400 to-cute-purple-400 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-cute-pink-50'
          }`}
        >
          <Upload className="w-5 h-5" />
          Upload Rewards
        </button>
        <button
          onClick={() => setActiveTab('mistakes')}
          className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'mistakes'
              ? 'bg-gradient-to-r from-cute-pink-400 to-cute-purple-400 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-cute-pink-50'
          }`}
        >
          <XCircle className="w-5 h-5" />
          Add Mistake
        </button>
      </div>

      {activeTab === 'quizzes' && (
        <div className="card-cute">
          <h3 className="text-xl font-bold text-cute-purple-700 mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Quiz
          </h3>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Quiz Title (e.g., IELTS Listening Practice)"
              className="input-cute"
              value={quizForm.title}
              onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
            />
            <textarea
              placeholder="Description (e.g., Practice numbers and dates for IELTS)"
              className="input-cute"
              rows={2}
              value={quizForm.description}
              onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
            />
            <div>
              <label className="block text-sm font-semibold text-cute-purple-700 mb-2">XP Reward</label>
              <input
                type="number"
                className="input-cute"
                value={quizForm.xpReward}
                onChange={(e) => setQuizForm({ ...quizForm, xpReward: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-cute-purple-700">Questions</h4>
                <button onClick={handleAddQuestion} className="btn-cute btn-secondary text-sm py-2">
                  + Add Question
                </button>
              </div>

              {quizForm.questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-cute-pink-50 rounded-2xl">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No questions yet. Click "Add Question" to start!</p>
                </div>
              ) : (
                quizForm.questions.map((q, index) => (
                  <div key={q.id} className="p-4 bg-cute-pink-50 rounded-2xl border-2 border-cute-pink-100">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 h-8 bg-cute-pink-400 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="Question text..."
                        className="input-cute flex-1"
                        value={q.question}
                        onChange={(e) => {
                          const newQuestions = [...quizForm.questions];
                          newQuestions[index] = { ...newQuestions[index], question: e.target.value };
                          setQuizForm({ ...quizForm, questions: newQuestions });
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 ml-11">
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correct === optIndex}
                            onChange={() => {
                              const newQuestions = [...quizForm.questions];
                              newQuestions[index] = { ...newQuestions[index], correct: optIndex };
                              setQuizForm({ ...quizForm, questions: newQuestions });
                            }}
                            className="w-4 h-4"
                          />
                          <input
                            type="text"
                            placeholder={`Option ${optIndex + 1}`}
                            className="input-cute flex-1"
                            value={opt}
                            onChange={(e) => {
                              const newQuestions = [...quizForm.questions];
                              const newOptions = [...newQuestions[index].options];
                              newOptions[optIndex] = e.target.value;
                              newQuestions[index] = { ...newQuestions[index], options: newOptions };
                              setQuizForm({ ...quizForm, questions: newQuestions });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {quizMessage && <p className="text-sm text-cute-purple-700">{quizMessage}</p>}
            <button
              onClick={handleSaveQuiz}
              disabled={savingQuiz}
              className="btn-cute btn-primary w-full mt-6 disabled:opacity-50"
            >
              {savingQuiz ? 'Saving...' : 'Save Quiz ✨'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="card-cute">
          <h3 className="text-xl font-bold text-cute-purple-700 mb-6 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload New Reward
          </h3>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Reward Title (e.g., Special Message #1)"
              className="input-cute"
              value={rewardForm.title}
              onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
            />

            <textarea
              placeholder="Description (e.g., A sweet video message to motivate you!)"
              className="input-cute"
              rows={2}
              value={rewardForm.description}
              onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-cute-purple-700 mb-2">XP Required</label>
                <input
                  type="number"
                  className="input-cute"
                  value={rewardForm.xpRequired}
                  onChange={(e) => setRewardForm({ ...rewardForm, xpRequired: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cute-purple-700 mb-2">Type</label>
                <select
                  className="input-cute"
                  value={rewardForm.type}
                  onChange={(e) => setRewardForm({ ...rewardForm, type: e.target.value as 'video' | 'image' })}
                >
                  <option value="video">🎥 Video</option>
                  <option value="image">🖼️ Image</option>
                </select>
              </div>
            </div>

            <div className="border-2 border-dashed border-cute-pink-300 rounded-2xl p-8 text-center">
              {rewardForm.file ? (
                <div className="text-cute-purple-700">
                  <p className="font-bold">{rewardForm.file.name}</p>
                  <p className="text-sm">{(rewardForm.file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <>
                  {rewardForm.type === 'video' ? (
                    <Video className="w-12 h-12 mx-auto mb-3 text-cute-pink-400" />
                  ) : (
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 text-cute-pink-400" />
                  )}
                  <p className="text-cute-purple-700 font-semibold mb-2">Click to upload {rewardForm.type}</p>
                  <p className="text-sm text-gray-500">MP4, JPG, PNG supported</p>
                </>
              )}
              <input
                type="file"
                accept={rewardForm.type === 'video' ? 'video/*' : 'image/*'}
                className="hidden"
                id="file-upload"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setRewardForm({ ...rewardForm, file: e.target.files[0] });
                  }
                }}
              />
              <label htmlFor="file-upload" className="btn-cute btn-secondary mt-4 inline-block cursor-pointer">
                Choose File
              </label>
            </div>

            {rewardMessage && <p className="text-sm text-cute-purple-700">{rewardMessage}</p>}
            <button
              onClick={handleUploadReward}
              disabled={uploadingReward}
              className="btn-cute btn-primary w-full disabled:opacity-50"
            >
              {uploadingReward ? 'Uploading...' : 'Upload Reward 🎁'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'mistakes' && (
        <div className="card-cute">
          <h3 className="text-xl font-bold text-cute-purple-700 mb-6 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Add a Mistake
          </h3>

          <div className="space-y-4">
            <textarea
              placeholder="What she wrote/said (original)"
              className="input-cute"
              rows={2}
              value={mistakeForm.original_text}
              onChange={(e) => setMistakeForm({ ...mistakeForm, original_text: e.target.value })}
            />
            <textarea
              placeholder="Correct version"
              className="input-cute"
              rows={2}
              value={mistakeForm.corrected_text}
              onChange={(e) => setMistakeForm({ ...mistakeForm, corrected_text: e.target.value })}
            />
            <div>
              <label className="block text-sm font-semibold text-cute-purple-700 mb-2">Type</label>
              <select
                className="input-cute"
                value={mistakeForm.error_type}
                onChange={(e) =>
                  setMistakeForm({ ...mistakeForm, error_type: e.target.value as Mistake['error_type'] })
                }
              >
                <option value="grammar">Grammar</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="spelling">Spelling</option>
                <option value="listening">Listening</option>
                <option value="reading">Reading</option>
              </select>
            </div>
            <textarea
              placeholder="Explanation (optional)"
              className="input-cute"
              rows={2}
              value={mistakeForm.explanation}
              onChange={(e) => setMistakeForm({ ...mistakeForm, explanation: e.target.value })}
            />

            {mistakeMessage && <p className="text-sm text-cute-purple-700">{mistakeMessage}</p>}
            <button
              onClick={handleAddMistake}
              disabled={savingMistake}
              className="btn-cute btn-primary w-full disabled:opacity-50"
            >
              {savingMistake ? 'Saving...' : 'Add Mistake 📚'}
            </button>
          </div>
        </div>
      )}

      <div className="card-cute bg-gradient-to-r from-cute-mint-50 to-cute-blue-50">
        <h4 className="font-bold text-cute-purple-700 mb-3">💡 Admin Tips</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Create short quizzes (3-5 questions) for daily practice</li>
          <li>• Upload personal videos/messages as rewards to keep her motivated</li>
          <li>• Set reasonable XP requirements based on her progress</li>
          <li>• Update mistakes bank regularly from her quiz results</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
```

- [ ] **Step 2: Create the Storage bucket (manual, one-time)**

In Supabase dashboard: Storage → New Bucket → name `rewards` → toggle Public: Yes → Create.

- [ ] **Step 3: Manual verification**

`npm run dev` → `/admin` (enter your password). **Quizzes tab**: add a title, one question with 4 options, mark one correct, hit Save — check the `quizzes` table gets a new row with a `questions` JSONB array matching what you typed. **Rewards tab**: pick a small image or video file, fill title/XP, upload — check the file lands in the `rewards` Storage bucket and a new row appears in the `rewards` table with a working public `media_url` (paste it into a new browser tab, confirm it loads). **Mistakes tab**: fill the form, submit — confirm a new row appears in `mistakes`, and (if Task 5 is done) that it now shows up on the Mistakes page.

- [ ] **Step 4: Commit**

```bash
git add src/pages/AdminDashboard.tsx
git commit -m "feat: wire admin quiz builder, reward uploader, and add-mistake form to db"
```

---

### Task 7: Quiz — real quizzes, real XP awarding

**Files:**
- Modify: `src/pages/Quiz.tsx` (full rewrite)

**Interfaces:**
- Consumes: `getQuizzes(): Promise<Quiz[]>`, `submitQuizAttempt(attempt: Partial<QuizAttempt>): Promise<QuizAttempt>` from `src/lib/db.ts` (the latter already calls `addXP` internally when `xp_earned` is set — no extra XP-awarding code needed here). `Quiz` fields: `id, title, description, questions: QuizQuestion[], xp_reward, created_by, created_at`. `QuizQuestion` fields used here: `id, question_text, options?, correct_answer`.

- [ ] **Step 1: Replace `src/pages/Quiz.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { Book, CheckCircle, XCircle } from 'lucide-react';
import { getQuizzes, submitQuizAttempt } from '../lib/db';
import { Quiz as QuizType } from '../lib/supabase';

const Quiz = () => {
  const [currentQuiz, setCurrentQuiz] = useState<QuizType | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getQuizzes()
      .then((data) => setCurrentQuiz(data[0] ?? null))
      .catch((err) => console.error('Failed to load quizzes:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleAnswer = (questionId: string, answer: string) => {
    if (!showResults) {
      setAnswers({ ...answers, [questionId]: answer });
    }
  };

  const calculateScore = () => {
    if (!currentQuiz) return 0;
    let correct = 0;
    currentQuiz.questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) correct++;
    });
    return correct;
  };

  const handleSubmit = async () => {
    if (!currentQuiz || submitting) return;
    setSubmitting(true);
    const score = calculateScore();
    try {
      await submitQuizAttempt({
        quiz_id: currentQuiz.id,
        score,
        total_questions: currentQuiz.questions.length,
        answers,
        xp_earned: currentQuiz.xp_reward,
      });
      setShowResults(true);
    } catch (err) {
      console.error('Failed to submit quiz attempt:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-center text-cute-pink-600 py-12">Loading quiz... 🌸</p>;
  }

  if (!currentQuiz) {
    return (
      <div className="card-cute text-center py-12">
        <Book className="w-12 h-12 mx-auto mb-3 text-cute-pink-300" />
        <h2 className="text-xl font-bold text-cute-purple-700 mb-2">No quizzes yet</h2>
        <p className="text-gray-500">Ask your admin to create one in the Admin Panel! 🌸</p>
      </div>
    );
  }

  const score = calculateScore();
  const percentage = Math.round((score / currentQuiz.questions.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold font-cute text-cute-purple-700 flex items-center gap-3">
          <Book className="w-8 h-8" />
          Practice Quiz 📝
        </h2>
      </div>

      <div className="card-cute bg-gradient-to-r from-cute-pink-50 to-cute-purple-50">
        <h3 className="text-2xl font-bold text-cute-purple-700 mb-2">{currentQuiz.title}</h3>
        <p className="text-cute-pink-600">{currentQuiz.description}</p>
        <div className="flex items-center gap-4 mt-4">
          <span className="badge-cute badge-pink">{currentQuiz.questions.length} questions</span>
          <span className="badge-cute badge-mint">+{currentQuiz.xp_reward} XP on completion</span>
        </div>
      </div>

      {showResults && (
        <div className="card-cute text-center py-8 bg-gradient-to-r from-cute-mint-50 to-cute-blue-50">
          <div className="text-6xl mb-4">{percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}</div>
          <h3 className="text-3xl font-bold text-cute-purple-700 mb-2">
            Your Score: {score}/{currentQuiz.questions.length}
          </h3>
          <p className="text-xl text-cute-pink-600 mb-4">{percentage}% Correct</p>
          <div className="progress-cute max-w-md mx-auto mb-4">
            <div
              className={`progress-fill ${
                percentage >= 80
                  ? 'bg-gradient-to-r from-cute-mint-400 to-cute-blue-400'
                  : percentage >= 60
                  ? 'bg-gradient-to-r from-cute-peach-400 to-cute-pink-400'
                  : 'bg-gradient-to-r from-cute-pink-400 to-cute-purple-400'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-cute-purple-700 font-semibold">
            {percentage >= 80
              ? "Amazing job! You're ready for IELTS! 🌟"
              : percentage >= 60
              ? 'Good work! Keep practicing! 💪'
              : "Don't give up! Practice makes perfect! 💕"}
          </p>
          <button
            onClick={() => {
              setAnswers({});
              setShowResults(false);
            }}
            className="btn-cute btn-primary mt-6"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="space-y-6">
        {currentQuiz.questions.map((q, index) => {
          const isCorrect = answers[q.id] === q.correct_answer;
          const hasAnswered = answers[q.id] !== undefined;
          const showResult = showResults && hasAnswered;

          return (
            <div key={q.id} className="card-cute">
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-cute-pink-400 to-cute-purple-400 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-cute-purple-700 mb-2">{q.question_text}</h4>
                </div>
              </div>

              <div className="space-y-2 ml-11">
                {(q.options ?? []).map((option, optionIndex) => {
                  const isSelected = answers[q.id] === option;
                  const isThisCorrect = option === q.correct_answer;

                  return (
                    <button
                      key={optionIndex}
                      onClick={() => handleAnswer(q.id, option)}
                      disabled={showResults}
                      className={`w-full p-4 rounded-xl text-left transition-all duration-300 border-2 ${
                        showResult
                          ? isThisCorrect
                            ? 'bg-green-100 border-green-400 text-green-700'
                            : isSelected
                            ? 'bg-red-100 border-red-400 text-red-700'
                            : 'bg-gray-50 border-gray-200 text-gray-400'
                          : isSelected
                          ? 'bg-gradient-to-r from-cute-pink-100 to-cute-purple-100 border-cute-pink-400 text-cute-purple-700'
                          : 'bg-white border-cute-pink-200 hover:border-cute-pink-400 hover:bg-cute-pink-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option}</span>
                        {showResult && isThisCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {showResult && isSelected && !isThisCorrect && (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <div
                  className={`mt-4 ml-11 p-4 rounded-xl ${
                    isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-cute-pink-50 border-2 border-cute-pink-200'
                  }`}
                >
                  <p className="text-sm">
                    <strong>{isCorrect ? '✅ Correct!' : '💡 Tip:'}</strong>{' '}
                    {isCorrect ? 'Well done!' : `The correct answer is "${q.correct_answer}".`}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!showResults && Object.keys(answers).length === currentQuiz.questions.length && (
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-cute btn-primary text-lg px-12 py-4 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Answers ✨'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
```

- [ ] **Step 2: Manual verification**

Requires a quiz to exist (create one via Task 6's Admin Panel first if you haven't). `npm run dev` → Quiz page shows the real quiz, answer every question, submit — score should match what you expect, and a new row should appear in `quiz_attempts` with the right `score`/`xp_earned`. Then check the `user_progress` table: `total_xp` should have increased by the quiz's XP reward. Go back to any page and confirm the sidebar (Layout, Task 2) now shows the updated XP/level.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Quiz.tsx
git commit -m "feat: wire quiz page to real quizzes and award real XP on submit"
```

---

### Task 8: Rewards — real XP/unlock state, working media links

**Files:**
- Modify: `src/pages/Rewards.tsx` (full rewrite)

**Interfaces:**
- Consumes: `getRewards(): Promise<Reward[]>`, `getUserProgress(): Promise<UserProgress | null>`, `unlockReward(rewardId: string): Promise<void>` from `src/lib/db.ts`. `Reward` fields: `id, title, description, media_url, media_type ('video'|'image'), xp_required, thumbnail_url?, created_by, created_at`.

- [ ] **Step 1: Replace `src/pages/Rewards.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { Gift, Play, Lock } from 'lucide-react';
import { getRewards, getUserProgress, unlockReward } from '../lib/db';
import { Reward, UserProgress } from '../lib/supabase';

const Rewards = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRewards(), getUserProgress()])
      .then(([rewardsData, progressData]) => {
        setRewards(rewardsData);
        setProgress(progressData);
      })
      .catch((err) => console.error('Failed to load rewards:', err))
      .finally(() => setLoading(false));
  }, []);

  const userXp = progress?.total_xp ?? 0;
  const unlockedRewards = progress?.unlocked_rewards ?? [];

  useEffect(() => {
    if (!progress) return;
    rewards.forEach((reward) => {
      if (userXp >= reward.xp_required && !unlockedRewards.includes(reward.id)) {
        unlockReward(reward.id).catch((err) => console.error('Failed to unlock reward:', err));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewards, progress]);

  const nextReward = [...rewards]
    .filter((r) => r.xp_required > userXp)
    .sort((a, b) => a.xp_required - b.xp_required)[0];
  const maxXp = rewards.length ? Math.max(...rewards.map((r) => r.xp_required)) : 0;

  if (loading) {
    return <p className="text-center text-cute-pink-600 py-12">Loading rewards... 🌸</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold font-cute text-cute-purple-700 flex items-center gap-3">
          <Gift className="w-8 h-8" />
          Your Rewards 🎁
        </h2>
      </div>

      <div className="card-cute bg-gradient-to-r from-cute-pink-50 to-cute-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-cute-pink-600 mb-1">Your Current XP</p>
            <p className="text-4xl font-bold text-cute-purple-700">{userXp} XP</p>
          </div>
          {nextReward && (
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Next Reward At</p>
              <p className="text-2xl font-bold text-cute-pink-600">{nextReward.xp_required} XP</p>
            </div>
          )}
        </div>
        {maxXp > 0 && (
          <>
            <div className="progress-cute mt-4">
              <div
                className="progress-fill bg-gradient-to-r from-cute-pink-400 to-cute-purple-400"
                style={{ width: `${Math.min((userXp / maxXp) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-cute-pink-600 mt-2 text-center">
              {Math.max(maxXp - userXp, 0)} XP away from the ultimate surprise! 🌟
            </p>
          </>
        )}
      </div>

      {rewards.length === 0 ? (
        <div className="card-cute text-center py-12">
          <Gift className="w-12 h-12 mx-auto mb-3 text-cute-pink-300" />
          <p className="text-gray-500">No rewards uploaded yet — check back soon! 💕</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => {
            const isUnlocked = userXp >= reward.xp_required;

            return (
              <div
                key={reward.id}
                className={`card-cute transition-all duration-300 ${
                  isUnlocked ? 'hover:scale-105 cursor-pointer' : 'opacity-75'
                }`}
              >
                <div className="text-center mb-4">
                  <div
                    className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl ${
                      isUnlocked ? 'bg-gradient-to-br from-cute-pink-400 to-cute-purple-400' : 'bg-gray-300'
                    }`}
                  >
                    {isUnlocked ? (reward.media_type === 'video' ? '🎥' : '🖼️') : <Lock className="w-8 h-8 text-gray-500" />}
                  </div>
                </div>

                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-cute-purple-700 mb-2">{reward.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="badge-cute badge-pink">{reward.xp_required} XP</span>
                    <span className="badge-cute badge-purple capitalize">{reward.media_type}</span>
                  </div>
                </div>

                {isUnlocked ? (
                  <a
                    href={reward.media_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-cute btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {reward.media_type === 'video' ? 'Watch Now' : 'View Gallery'}
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-gray-200 text-gray-500 rounded-2xl font-bold cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Locked
                  </button>
                )}

                {!isUnlocked && (
                  <div className="mt-3">
                    <div className="progress-cute">
                      <div
                        className="progress-fill bg-gray-300"
                        style={{ width: `${Math.min((userXp / reward.xp_required) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {reward.xp_required - userXp} XP more needed
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="card-cute text-center py-6 bg-gradient-to-r from-cute-peach-50 via-cute-pink-50 to-cute-purple-50">
        <p className="text-lg text-cute-purple-700">
          💝 <strong>Every XP brings you closer to special surprises!</strong>
        </p>
        <p className="text-sm text-cute-pink-600 mt-2">
          Keep studying and unlock all the rewards! I believe in you! 💕
        </p>
      </div>
    </div>
  );
};

export default Rewards;
```

Note: unlock status is computed directly from `userXp >= reward.xp_required` rather than trusting the persisted `unlocked_rewards` array — that array is written asynchronously by the background `unlockReward` effect, so deriving it live avoids a stale-flag bug where a reward could show locked for one render after crossing the XP threshold.

- [ ] **Step 2: Manual verification**

Requires at least one reward to exist (create one via Task 6's Admin Panel first if you haven't). `npm run dev` → Rewards page: reward should show unlocked/locked correctly based on current XP (compare against the `total_xp` value in the `user_progress` table). Click "Watch Now"/"View Gallery" on an unlocked reward — should open the real `media_url` in a new tab. Complete a quiz (Task 7) that pushes XP over a reward's threshold, revisit Rewards — it should flip to unlocked without a manual refresh needed beyond navigating back to the page.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Rewards.tsx
git commit -m "fix: rewards page uses real xp/unlock state, working media links, drops invalid text type"
```

---

### Task 9: Dashboard — real stats and recent activity

**Files:**
- Modify: `src/lib/db.ts` (add one new function, `getQuizAttempts`)
- Modify: `src/pages/Dashboard.tsx` (full rewrite)

**Interfaces:**
- Produces (new): `getQuizAttempts(): Promise<QuizAttempt[]>` in `src/lib/db.ts` — returns the current user's 10 most recent attempts, newest first.
- Consumes: `getNotes(): Promise<Note[]>`, `getMistakes(): Promise<Mistake[]>` (already exist), plus the new `getQuizAttempts()`.

- [ ] **Step 1: Add `getQuizAttempts` to `src/lib/db.ts`**

Insert this function directly after `submitQuizAttempt` (which ends around line 134, right before the `// User Progress Functions` comment):

```ts
export async function getQuizAttempts(): Promise<QuizAttempt[]> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', USER_ID)
    .order('completed_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data || [];
}
```

- [ ] **Step 2: Replace `src/pages/Dashboard.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { TrendingUp, BookOpen, Award } from 'lucide-react';
import { getNotes, getMistakes, getQuizAttempts } from '../lib/db';

interface ActivityItem {
  id: string;
  title: string;
  xp: number;
  time: string;
}

const encouragementMessages = [
  "You're doing amazing! 🌟",
  "Every day you're getting better! 💪",
  "I'm so proud of you! 💕",
  "Keep going, superstar! ✨",
  "Your hard work is paying off! 🎉",
];

const Dashboard = () => {
  const [noteCount, setNoteCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [randomMessage] = useState(
    () => encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]
  );

  useEffect(() => {
    Promise.all([getNotes(), getMistakes(), getQuizAttempts()])
      .then(([notes, mistakes, attempts]) => {
        setNoteCount(notes.length);
        setMistakeCount(mistakes.length);

        const noteActivities: ActivityItem[] = notes.slice(0, 5).map((n) => ({
          id: `note-${n.id}`,
          title: `New note: ${n.title}`,
          xp: 20,
          time: n.created_at,
        }));
        const mistakeActivities: ActivityItem[] = mistakes.slice(0, 5).map((m) => ({
          id: `mistake-${m.id}`,
          title: `Logged a ${m.error_type} mistake`,
          xp: 5,
          time: m.created_at,
        }));
        const quizActivities: ActivityItem[] = attempts.slice(0, 5).map((a) => ({
          id: `quiz-${a.id}`,
          title: `Completed a quiz — ${a.score}/${a.total_questions}`,
          xp: a.xp_earned,
          time: a.completed_at,
        }));

        const merged = [...noteActivities, ...mistakeActivities, ...quizActivities]
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          .slice(0, 5)
          .map((item) => ({ ...item, time: new Date(item.time).toLocaleDateString() }));

        setActivities(merged);
      })
      .catch((err) => console.error('Failed to load dashboard data:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center text-cute-pink-600 py-12">Loading dashboard... 🌸</p>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h2 className="text-4xl font-bold font-cute text-cute-purple-700 mb-2">Welcome back, Gerda! 🌸</h2>
        <p className="text-xl text-cute-pink-600">{randomMessage}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card-cute">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-cute-blue-400 to-cute-mint-400 rounded-2xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Notes Created</p>
              <p className="text-2xl font-bold text-cute-purple-700">{noteCount}</p>
            </div>
          </div>
        </div>

        <div className="card-cute">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-cute-peach-400 to-cute-pink-400 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Mistakes Logged</p>
              <p className="text-2xl font-bold text-cute-purple-700">{mistakeCount}</p>
            </div>
          </div>
        </div>

        <div className="card-cute">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-cute-purple-400 to-cute-pink-400 rounded-2xl">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Recent Activities</p>
              <p className="text-2xl font-bold text-cute-purple-700">{activities.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-cute">
          <h3 className="text-xl font-bold text-cute-purple-700 mb-4">Recent Activity 📝</h3>
          <div className="space-y-3">
            {activities.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Nothing yet — go create a note or try a quiz! 🌸
              </p>
            )}
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-cute-pink-50 rounded-xl">
                <div>
                  <p className="font-semibold text-cute-purple-700">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <span className="badge-cute badge-pink">+{activity.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-cute bg-gradient-to-br from-cute-pink-100 to-cute-purple-100">
          <h3 className="text-xl font-bold text-cute-purple-700 mb-4">💡 Daily Tip</h3>
          <div className="space-y-4">
            <p className="text-cute-purple-800 leading-relaxed">
              <strong>Listening Practice:</strong> Try watching your favorite English TV shows with subtitles.
              Start with English subtitles, then try without! 📺
            </p>
            <p className="text-cute-purple-800 leading-relaxed">
              <strong>Vocabulary:</strong> Learn 5 new words every day and use them in sentences. Write them
              in your notebook! 📖
            </p>
            <div className="pt-4">
              <p className="text-sm text-cute-pink-600 italic">
                Remember: Progress, not perfection! Every small step counts! 🌈
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-cute text-center py-8 bg-gradient-to-r from-cute-pink-50 via-cute-purple-50 to-cute-mint-50">
        <p className="text-2xl font-cute text-cute-purple-700 mb-2">
          "Believe in yourself and all that you are."
        </p>
        <p className="text-cute-pink-600">- Christian D. Larson</p>
        <p className="mt-4 text-lg">💕 You've got this! 💕</p>
      </div>
    </div>
  );
};

export default Dashboard;
```

Note: this drops the original "Today's Goal", "Study Time", and "Achievements" stat cards — none of them had any backing data (hardcoded `50`, `35`, `12.5h`, `8/20` with no table/field behind any of them). Rather than inventing a fake achievements or time-tracking system to justify keeping them, this plan removes them and replaces the 4-card grid with 3 real, data-backed stats. Flag this to the user as a visible content change when this task lands — it's a "remove the junk" call, not a silent side effect.

- [ ] **Step 3: Manual verification**

By this point Notebook (Task 3), Mistakes (Task 6), and Quiz (Task 7) should all have at least one real row each. `npm run dev` → Dashboard should show real note/mistake counts matching the Supabase tables, and a "Recent Activity" feed listing your actual notes/mistakes/quiz attempts sorted newest-first — not the three fake hardcoded entries from before.

- [ ] **Step 4: Commit**

```bash
git add src/lib/db.ts src/pages/Dashboard.tsx
git commit -m "feat: wire dashboard to real note/mistake/quiz-attempt data, drop fake stat cards"
```

---

### Task 10: Full build + smoke-test pass

**Files:** none (verification only)

- [ ] **Step 1: Verify the TypeScript build is clean**

Run: `npm run build`
Expected: completes with no TypeScript errors (this also confirms every dead-import bug found across Layout/Quiz/Mistakes/Rewards is actually gone — the original codebase failed this command).

- [ ] **Step 2: Full manual walkthrough**

Run `npm run dev` and click through every nav item (Home, Notebook, Calendar, Mistakes, Quiz, Rewards, Admin) once more in a single session, confirming: no console errors, every page's data matches what's in Supabase's Table Editor, and the sidebar XP updates after completing a quiz.

- [ ] **Step 3: Commit (only if Step 1 required fixes)**

```bash
git add -A
git commit -m "fix: resolve remaining build errors found during full verification pass"
```

If Step 1 passed clean on the first try, skip this commit — nothing to record.
