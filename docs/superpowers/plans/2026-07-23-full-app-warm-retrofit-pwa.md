# Full-App Warm Retrofit + PWA Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retrofit every remaining page (Dashboard, Notebook, Calendar, Mistakes, Quiz, Rewards, AdminDashboard, AdminGate, Layout sidebar) from the old pink/purple "cute" theme to the "Warm Cozy Notebook" theme already used by Course; replace the fixed sidebar with a responsive pattern (sidebar on desktop, bottom tab bar + More sheet on mobile); fix the currently-broken PWA (missing icon files, wrong-colored manifest).

**Architecture:** No new data/logic — this is a styling and layout pass only. Reuses the `warm-*` Tailwind tokens and `.card-warm`/`.btn-warm`/`.input-warm`/`.progress-warm`/`.badge-warm` CSS classes already defined for Course. Two new small components (`BottomNav`, `MoreSheet`) handle the mobile nav pattern. PWA icons are new binary assets generated to match the new palette.

**Tech Stack:** Same as the rest of the app — React 18, TypeScript (strict, `noUnusedLocals`/`noUnusedParameters`), Vite, Tailwind, `lucide-react`, `vite-plugin-pwa` (already a dependency, just misconfigured).

## Global Constraints

- No test framework — verification is `npm run build` staying clean, plus manual checks described per task.
- `tsconfig.json` has `strict`, `noUnusedLocals`, `noUnusedParameters` on.
- **Color mapping is not a literal find-and-replace.** The old theme uses a different gradient pair on nearly every card. Apply consistently: primary/active/highlight → `warm-terracotta`, success/positive/complete → `warm-sage`, card surfaces → white or `warm-cream-50` bordered `warm-tan-200`, body text → `warm-brown-700/800`, secondary text → `warm-brown-400/500`, headings → inherit the `font-warm` (Georgia) stack.
- No logic/behavior changes to any file in this plan — every `useState`/`useEffect`/handler/data-fetch stays exactly as it is; only JSX class names (and in Layout's case, structure) change.
- Commit after every task. Do not push — push only on the user's explicit word.
- Working directory for all app file paths below: `F:\Claude\Projects\Gerda-English-main\Gerda-English-main\gerda-english`. Git repo root: `F:\Claude\Projects\Gerda-English-main\Gerda-English-main`.

---

### Task 1: Global warm background + responsive Layout (sidebar + mobile bottom nav)

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/Layout.tsx`
- Create: `src/components/BottomNav.tsx`
- Create: `src/components/MoreSheet.tsx`

**Interfaces:**
- Produces: `BottomNav` (default export, no props) — mobile-only (`md:hidden`) fixed bottom tab bar with Home/Course/Quiz/Rewards + a "More" button that calls an `onMore` callback passed in as a prop.
- Produces: `MoreSheet` (default export, props `{ items: { path: string; icon: LucideIcon; label: string }[]; onClose: () => void }`) — mobile-only bottom-sheet overlay listing secondary nav items.

- [ ] **Step 1: Update the base background and scrollbar colors in `src/index.css`**

Change the `body` rule's `background` line from:
```css
  background: linear-gradient(135deg, #fdf2f8 0%, #faf5ff 50%, #f0fdfa 100%);
```
to:
```css
  background: linear-gradient(135deg, #fefcf8 0%, #fdf8f0 50%, #f8ecd8 100%);
```
and the `color` line from:
```css
  color: #4a4a6a;
```
to:
```css
  color: #5c4426;
```

Change the scrollbar rules from:
```css
::-webkit-scrollbar-track {
  background: #fce7f3;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #f9a8d4, #d8b4fe);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #f472b6, #c084fc);
}
```
to:
```css
::-webkit-scrollbar-track {
  background: #f3e5c8;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #eaa876, #a8bf94);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #d98f5c, #8fac78);
}
```

Leave every other rule in this file (the `.card-cute`/`.btn-cute`/etc. definitions, the `.card-warm`/`.btn-warm`/etc. definitions, keyframes) untouched — cleanup of the now-unused `cute-*` rules happens in the final task, after every page is confirmed off them.

- [ ] **Step 2: Create `src/components/BottomNav.tsx`**

```tsx
import { Link, useLocation } from 'react-router-dom';
import { Home, GraduationCap, Book, Gift, MoreHorizontal } from 'lucide-react';

interface BottomNavProps {
  onMore: () => void;
}

const primaryItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/course', icon: GraduationCap, label: 'Course' },
  { path: '/quiz', icon: Book, label: 'Quiz' },
  { path: '/rewards', icon: Gift, label: 'Rewards' },
];

const BottomNav = ({ onMore }: BottomNavProps) => {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-warm-tan-200 flex items-stretch z-40">
      {primaryItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold ${
              isActive ? 'text-warm-terracotta-600' : 'text-warm-brown-400'
            }`}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        );
      })}
      <button
        onClick={onMore}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold text-warm-brown-400"
      >
        <MoreHorizontal className="w-5 h-5" />
        More
      </button>
    </nav>
  );
};

export default BottomNav;
```

- [ ] **Step 3: Create `src/components/MoreSheet.tsx`**

```tsx
import { Link } from 'react-router-dom';
import { X, LucideIcon } from 'lucide-react';

interface MoreSheetItem {
  path: string;
  icon: LucideIcon;
  label: string;
}

interface MoreSheetProps {
  items: MoreSheetItem[];
  onClose: () => void;
}

const MoreSheet = ({ items, onClose }: MoreSheetProps) => {
  return (
    <div className="md:hidden fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl p-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-warm-brown-800">More</h3>
          <button onClick={onClose} className="text-warm-brown-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-warm-brown-700 hover:bg-warm-cream-100 transition-colors"
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MoreSheet;
```

- [ ] **Step 4: Replace `src/components/Layout.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, Calendar, Trophy, Gift, Settings, Home, Book, XCircle, GraduationCap } from 'lucide-react';
import { getUserProgress } from '../lib/db';
import BottomNav from './BottomNav';
import MoreSheet from './MoreSheet';

const Layout = () => {
  const location = useLocation();
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [showMore, setShowMore] = useState(false);

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

  useEffect(() => {
    setShowMore(false);
  }, [location.pathname]);

  const menuItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/course', icon: GraduationCap, label: 'Course' },
    { path: '/notebook', icon: BookOpen, label: 'Notebook' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/mistakes', icon: XCircle, label: 'Mistakes' },
    { path: '/quiz', icon: Book, label: 'Quiz' },
    { path: '/rewards', icon: Gift, label: 'Rewards' },
  ];

  const moreItems = [
    { path: '/notebook', icon: BookOpen, label: 'Notebook' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/mistakes', icon: XCircle, label: 'Mistakes' },
    { path: '/admin', icon: Settings, label: 'Admin Panel' },
  ];

  return (
    <div className="min-h-screen flex font-warm">
      <aside className="hidden md:flex w-64 bg-white border-r border-warm-tan-200 p-6 flex-col">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-warm-terracotta-500 to-warm-sage-500 bg-clip-text text-transparent">
            🎓 Gerda English
          </h1>
          <p className="text-sm text-warm-brown-500 mt-1">Let's learn together!</p>
        </div>

        <div className="card-warm mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-warm-brown-800">Level {level}</span>
            <Trophy className="w-6 h-6 text-warm-terracotta-400" />
          </div>
          <div className="progress-warm mb-2">
            <div className="progress-warm-fill" style={{ width: `${xp % 100}%` }} />
          </div>
          <p className="text-xs text-warm-brown-500">{xp} XP total</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-warm-brown-600">🔥 Streak</span>
            <span className="badge-warm badge-warm-terracotta">{streak} days</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-warm-terracotta-500 text-white shadow-sm'
                    : 'text-warm-brown-600 hover:bg-warm-cream-100'
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
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-warm-brown-600 hover:bg-warm-cream-100 transition-all duration-200 mt-auto"
        >
          <Settings className="w-5 h-5" />
          <span className="font-semibold">Admin Panel</span>
        </Link>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 md:pb-8 bg-warm-cream-50">
        <Outlet />
      </main>

      <BottomNav onMore={() => setShowMore(true)} />
      {showMore && <MoreSheet items={moreItems} onClose={() => setShowMore(false)} />}
    </div>
  );
};

export default Layout;
```

- [ ] **Step 5: Manual verification**

Run `npm run build` — clean. `npm run dev`, check at desktop width (≥768px): sidebar visible, warm-colored, all 7 items plus Admin link, no bottom bar visible. Resize/use devtools responsive mode to <768px width: sidebar disappears, a bottom bar with Home/Course/Quiz/Rewards/More appears; tapping "More" opens a bottom sheet with Notebook/Calendar/Mistakes/Admin; tapping any item navigates and closes the sheet; tapping the dark overlay behind the sheet also closes it.

- [ ] **Step 6: Commit**

```bash
git add gerda-english/src/index.css gerda-english/src/components/Layout.tsx gerda-english/src/components/BottomNav.tsx gerda-english/src/components/MoreSheet.tsx
git commit -m "feat: warm-theme the global background and add responsive nav (sidebar + mobile bottom bar)"
```

---

### Task 2: Restyle Dashboard.tsx

**Files:**
- Modify: `src/pages/Dashboard.tsx`

No data/logic changes — only class names. Full replacement:

- [ ] **Step 1: Replace `src/pages/Dashboard.tsx`**

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
    return <p className="text-center text-warm-brown-600 py-12">Loading dashboard... 🌸</p>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h2 className="text-4xl font-bold text-warm-brown-800 mb-2">Welcome back, Gerda! 🌸</h2>
        <p className="text-xl text-warm-terracotta-600">{randomMessage}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card-warm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-terracotta-500 rounded-2xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-warm-brown-400">Notes Created</p>
              <p className="text-2xl font-bold text-warm-brown-800">{noteCount}</p>
            </div>
          </div>
        </div>

        <div className="card-warm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-sage-500 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-warm-brown-400">Mistakes Logged</p>
              <p className="text-2xl font-bold text-warm-brown-800">{mistakeCount}</p>
            </div>
          </div>
        </div>

        <div className="card-warm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-terracotta-500 rounded-2xl">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-warm-brown-400">Recent Activities</p>
              <p className="text-2xl font-bold text-warm-brown-800">{activities.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-warm">
          <h3 className="text-xl font-bold text-warm-brown-800 mb-4">Recent Activity 📝</h3>
          <div className="space-y-3">
            {activities.length === 0 && (
              <p className="text-sm text-warm-brown-400 text-center py-4">
                Nothing yet — go create a note or try a quiz! 🌸
              </p>
            )}
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-warm-cream-100 rounded-xl">
                <div>
                  <p className="font-semibold text-warm-brown-800">{activity.title}</p>
                  <p className="text-xs text-warm-brown-400">{activity.time}</p>
                </div>
                <span className="badge-warm badge-warm-terracotta">+{activity.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-warm bg-warm-tan-50">
          <h3 className="text-xl font-bold text-warm-brown-800 mb-4">💡 Daily Tip</h3>
          <div className="space-y-4">
            <p className="text-warm-brown-700 leading-relaxed">
              <strong>Listening Practice:</strong> Try watching your favorite English TV shows with subtitles.
              Start with English subtitles, then try without! 📺
            </p>
            <p className="text-warm-brown-700 leading-relaxed">
              <strong>Vocabulary:</strong> Learn 5 new words every day and use them in sentences. Write them
              in your notebook! 📖
            </p>
            <div className="pt-4">
              <p className="text-sm text-warm-terracotta-600 italic">
                Remember: Progress, not perfection! Every small step counts! 🌈
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-warm text-center py-8">
        <p className="text-2xl font-warm text-warm-brown-800 mb-2">
          "Believe in yourself and all that you are."
        </p>
        <p className="text-warm-terracotta-600">- Christian D. Larson</p>
        <p className="mt-4 text-lg text-warm-brown-700">💕 You've got this! 💕</p>
      </div>
    </div>
  );
};

export default Dashboard;
```

- [ ] **Step 2: Manual verification**

Run `npm run build` — clean. `npm run dev`, visit `/` — confirm no `cute-*` classes remain (`grep -c "cute-" src/pages/Dashboard.tsx` should return `0`), page renders with warm palette, no data/behavior change (numbers still come from real Supabase data as before).

- [ ] **Step 3: Commit**

```bash
git add gerda-english/src/pages/Dashboard.tsx
git commit -m "style: retrofit Dashboard to warm theme"
```

---

### Task 3: Restyle Notebook.tsx

**Files:**
- Modify: `src/pages/Notebook.tsx`

- [ ] **Step 1: Replace `src/pages/Notebook.tsx`**

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
          className={isClickable ? 'text-warm-terracotta-600 hover:text-warm-terracotta-700 cursor-pointer underline decoration-dotted' : ''}
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
    return <p className="text-center text-warm-brown-600 py-12">Loading notebook... 🌸</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-warm-brown-800 flex items-center gap-3">
          <BookOpen className="w-8 h-8" />
          My Notebook 📝
        </h2>
        <p className="text-warm-terracotta-600">Click highlighted words to see definitions! ✨</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card-warm">
            <h3 className="text-xl font-bold text-warm-brown-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Note
            </h3>
            <input
              type="text"
              placeholder="Note title..."
              className="input-warm mb-3 text-lg font-semibold"
              value={currentNote.title}
              onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
            />
            <textarea
              placeholder="Write your notes here... Click on common IELTS words (they'll be highlighted!) to see their meaning."
              className="input-warm min-h-[200px] resize-y leading-relaxed"
              value={currentNote.content}
              onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
            />
            <button
              onClick={handleSaveNote}
              disabled={saving}
              className="btn-warm btn-warm-primary mt-4 w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          </div>

          <div className="card-warm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-warm-brown-800">My Notes</h3>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-brown-400" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  className="input-warm pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredNotes.length === 0 && (
                <p className="text-sm text-warm-brown-400 text-center py-4">No notes yet — write your first one above!</p>
              )}
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 bg-warm-cream-100 rounded-2xl border border-warm-tan-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-bold text-warm-brown-800">{note.title}</h4>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-warm-brown-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-warm-brown-600 mb-2 leading-relaxed">
                    {renderContentWithClickableWords(note.content)}
                  </p>
                  <span className="text-xs text-warm-brown-400">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-warm sticky top-4">
            <h3 className="text-xl font-bold text-warm-brown-800 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Quick Dictionary
            </h3>

            {dictLoading && <p className="text-center text-warm-brown-400 py-8">Looking it up...</p>}

            {!dictLoading && selectedWord && (
              <div className="space-y-4">
                <div className="p-4 bg-warm-tan-50 rounded-2xl">
                  <h4 className="text-2xl font-bold text-warm-terracotta-600 mb-2">{selectedWord.word}</h4>
                  <p className="text-warm-brown-700 mb-3">{selectedWord.definition}</p>
                  {selectedWord.example && (
                    <div className="p-3 bg-white rounded-xl">
                      <p className="text-sm text-warm-brown-500 italic">"{selectedWord.example}"</p>
                    </div>
                  )}
                </div>
                <button onClick={() => setSelectedWord(null)} className="btn-warm btn-warm-secondary w-full">
                  Close
                </button>
              </div>
            )}

            {!dictLoading && !selectedWord && dictNotFound && (
              <div className="text-center py-8 text-warm-brown-400">
                <p>No definition found for that word. Try another!</p>
              </div>
            )}

            {!dictLoading && !selectedWord && !dictNotFound && (
              <div className="text-center py-8 text-warm-brown-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Click a highlighted word in your notes to see its definition here!</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-warm-tan-200">
              <h4 className="font-bold text-warm-brown-800 mb-3">📚 Common IELTS Words</h4>
              <div className="flex flex-wrap gap-2">
                {commonWords.map((word) => (
                  <button
                    key={word}
                    onClick={() => handleWordClick(word)}
                    className="px-3 py-1 bg-warm-tan-100 text-warm-terracotta-700 rounded-full text-sm hover:bg-warm-tan-200 transition-colors"
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

- [ ] **Step 2: Manual verification**

Run `npm run build` — clean. `grep -c "cute-" src/pages/Notebook.tsx` returns `0`. `npm run dev`, confirm notebook still creates/deletes real notes and dictionary lookups still work (unchanged logic, just new colors).

- [ ] **Step 3: Commit**

```bash
git add gerda-english/src/pages/Notebook.tsx
git commit -m "style: retrofit Notebook to warm theme"
```

---

### Task 4: Restyle Calendar.tsx

**Files:**
- Modify: `src/pages/Calendar.tsx`

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
    return <p className="text-center text-warm-brown-600 py-12">Loading calendar... 🌸</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-warm-brown-800 flex items-center gap-3">
          <CalendarIcon className="w-8 h-8" />
          Study Calendar 📅
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-warm">
          <h3 className="text-xl font-bold text-warm-brown-800 mb-6 text-center">{monthLabel}</h3>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center font-bold text-warm-terracotta-600 py-2">
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
                      ? 'bg-warm-terracotta-500 text-white shadow-lg scale-105'
                      : status === 'completed'
                      ? 'bg-warm-sage-200 text-warm-brown-800'
                      : status === 'planned'
                      ? 'bg-warm-cream-100 text-warm-brown-700 border border-warm-tan-200'
                      : 'bg-warm-cream-50 text-warm-brown-300 hover:bg-warm-cream-100'
                  }`}
                >
                  <span className="font-bold">{day}</span>
                  {status === 'completed' && <CheckCircle className="w-4 h-4 mt-1 text-warm-sage-700" />}
                  {status === 'planned' && !isToday && (
                    <div className="w-2 h-2 bg-warm-terracotta-400 rounded-full mt-1"></div>
                  )}
                  {isToday && <span className="absolute -top-2 -right-2 text-lg">🌟</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-warm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-warm-brown-800">Next 7 Days</h3>
            <button
              onClick={() => setShowForm(!showForm)}
              className="p-2 bg-warm-tan-100 rounded-xl hover:bg-warm-tan-200 transition-colors"
            >
              <Plus className="w-5 h-5 text-warm-terracotta-600" />
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddTask} className="space-y-2 mb-4 p-3 bg-warm-cream-100 rounded-xl">
              <input
                type="text"
                placeholder="Task title"
                className="input-warm"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <input
                type="date"
                className="input-warm"
                value={newTask.date}
                onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
              />
              <input
                type="number"
                className="input-warm"
                value={newTask.xp}
                onChange={(e) => setNewTask({ ...newTask, xp: parseInt(e.target.value) || 0 })}
              />
              <button type="submit" className="btn-warm btn-warm-primary w-full text-sm py-2">
                Add Task
              </button>
            </form>
          )}

          <div className="space-y-3">
            {upcoming.length === 0 && (
              <p className="text-sm text-warm-brown-400 text-center py-4">No tasks planned yet.</p>
            )}
            {upcoming.map((event) => (
              <div
                key={event.id}
                className={`p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
                  event.completed ? 'bg-warm-sage-100' : 'bg-warm-cream-100'
                }`}
                onClick={() => handleToggleComplete(event)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`font-semibold ${
                        event.completed ? 'text-warm-sage-700 line-through' : 'text-warm-brown-800'
                      }`}
                    >
                      {event.title}
                    </p>
                    <p className="text-xs text-warm-brown-400">
                      {event.date} · +{event.xp_reward} XP
                    </p>
                  </div>
                  {event.completed && <CheckCircle className="w-5 h-5 text-warm-sage-600" />}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-warm-tan-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-warm-brown-800">Progress</span>
              <span className="text-sm text-warm-terracotta-600">
                {completedCount}/{upcoming.length} tasks
              </span>
            </div>
            <div className="progress-warm">
              <div
                className="progress-warm-fill"
                style={{ width: `${upcoming.length ? (completedCount / upcoming.length) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-warm-terracotta-600 mt-2 text-center">Keep going! You're doing great! 💪</p>
          </div>
        </div>
      </div>

      <div className="card-warm text-center py-6">
        <p className="text-lg text-warm-brown-700">
          🎯 <strong>Remember:</strong> Consistency is key! Even 15 minutes a day makes a difference!
        </p>
      </div>
    </div>
  );
};

export default Calendar;
```

- [ ] **Step 2: Manual verification**

Run `npm run build` — clean. `grep -c "cute-" src/pages/Calendar.tsx` returns `0`. `npm run dev`, confirm date math/CRUD behavior unchanged (real month still shown, add/toggle task still works against Supabase).

- [ ] **Step 3: Commit**

```bash
git add gerda-english/src/pages/Calendar.tsx
git commit -m "style: retrofit Calendar to warm theme"
```

---

### Task 5: Restyle Mistakes.tsx

**Files:**
- Modify: `src/pages/Mistakes.tsx`

- [ ] **Step 1: Replace `src/pages/Mistakes.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { XCircle, BookOpen, Headphones, Eye, PenTool, SpellCheck } from 'lucide-react';
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
      case 'spelling':
        return <SpellCheck className="w-5 h-5" />;
      default:
        return <XCircle className="w-5 h-5" />;
    }
  };

  const filteredMistakes = filter === 'all' ? mistakes : mistakes.filter((m) => m.error_type === filter);

  const stats = {
    total: mistakes.length,
    reading: mistakes.filter((m) => m.error_type === 'reading').length,
    listening: mistakes.filter((m) => m.error_type === 'listening').length,
    vocabulary: mistakes.filter((m) => m.error_type === 'vocabulary').length,
    grammar: mistakes.filter((m) => m.error_type === 'grammar').length,
    spelling: mistakes.filter((m) => m.error_type === 'spelling').length,
  };

  if (loading) {
    return <p className="text-center text-warm-brown-600 py-12">Loading mistakes... 🌸</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-warm-brown-800 flex items-center gap-3">
          <XCircle className="w-8 h-8" />
          My Mistakes Bank 📚
        </h2>
        <p className="text-warm-terracotta-600">Learn from mistakes = Get better! 💪</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card-warm text-center">
          <p className="text-3xl font-bold text-warm-brown-800">{stats.total}</p>
          <p className="text-sm text-warm-brown-400">Total</p>
        </div>
        <div className="card-warm text-center">
          <p className="text-3xl font-bold text-warm-terracotta-600">{stats.reading}</p>
          <p className="text-sm text-warm-brown-400">Reading</p>
        </div>
        <div className="card-warm text-center">
          <p className="text-3xl font-bold text-warm-terracotta-600">{stats.listening}</p>
          <p className="text-sm text-warm-brown-400">Listening</p>
        </div>
        <div className="card-warm text-center">
          <p className="text-3xl font-bold text-warm-sage-600">{stats.vocabulary}</p>
          <p className="text-sm text-warm-brown-400">Vocabulary</p>
        </div>
        <div className="card-warm text-center">
          <p className="text-3xl font-bold text-warm-sage-600">{stats.grammar}</p>
          <p className="text-sm text-warm-brown-400">Grammar</p>
        </div>
        <div className="card-warm text-center">
          <p className="text-3xl font-bold text-warm-terracotta-600">{stats.spelling}</p>
          <p className="text-sm text-warm-brown-400">Spelling</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {['all', 'reading', 'listening', 'vocabulary', 'grammar', 'spelling'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
              filter === type
                ? 'bg-warm-terracotta-500 text-white shadow-sm'
                : 'bg-white text-warm-brown-600 hover:bg-warm-cream-100 border border-warm-tan-200'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredMistakes.length === 0 && (
          <p className="text-center text-warm-brown-400 py-8">No mistakes logged yet — nice! 🌟</p>
        )}
        {filteredMistakes.map((mistake) => (
          <div key={mistake.id} className="card-warm">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-warm-terracotta-500 text-white">
                {getTypeIcon(mistake.error_type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="badge-warm badge-warm-terracotta capitalize">{mistake.error_type}</span>
                  <span className="text-xs text-warm-brown-400">
                    {new Date(mistake.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-xs text-red-600 font-bold mb-1">❌ My Answer:</p>
                    <p className="text-warm-brown-700">{mistake.original_text}</p>
                  </div>
                  <div className="p-4 bg-warm-sage-50 rounded-xl border border-warm-sage-200">
                    <p className="text-xs text-warm-sage-700 font-bold mb-1">✅ Correct:</p>
                    <p className="text-warm-brown-700">{mistake.corrected_text}</p>
                  </div>
                </div>

                {mistake.explanation && (
                  <div className="p-4 bg-warm-cream-100 rounded-xl">
                    <p className="text-sm text-warm-brown-700">
                      <strong>💡 Explanation:</strong> {mistake.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-warm text-center py-6">
        <p className="text-lg text-warm-brown-700">
          🌟 <strong>Great job reviewing!</strong> Every mistake you learn from makes you stronger!
        </p>
        <p className="text-sm text-warm-terracotta-600 mt-2">
          Review your mistakes regularly to avoid repeating them in the exam!
        </p>
      </div>
    </div>
  );
};

export default Mistakes;
```

Note: `getTypeColor` (the old per-type gradient lookup) is removed entirely — every mistake card now uses one consistent `warm-terracotta-500` icon chip instead of five different color combos, matching the cozy-notebook "one accent color" rule. This is a deliberate simplification, not a missed rename.

- [ ] **Step 2: Manual verification**

Run `npm run build` — clean. `grep -c "cute-" src/pages/Mistakes.tsx` returns `0`. `npm run dev`, confirm filter buttons and real mistake data still work.

- [ ] **Step 3: Commit**

```bash
git add gerda-english/src/pages/Mistakes.tsx
git commit -m "style: retrofit Mistakes to warm theme"
```

---

### Task 6: Restyle Quiz.tsx

**Files:**
- Modify: `src/pages/Quiz.tsx`

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
    return <p className="text-center text-warm-brown-600 py-12">Loading quiz... 🌸</p>;
  }

  if (!currentQuiz) {
    return (
      <div className="card-warm text-center py-12">
        <Book className="w-12 h-12 mx-auto mb-3 text-warm-tan-400" />
        <h2 className="text-xl font-bold text-warm-brown-800 mb-2">No quizzes yet</h2>
        <p className="text-warm-brown-400">Ask your admin to create one in the Admin Panel! 🌸</p>
      </div>
    );
  }

  const score = calculateScore();
  const percentage = Math.round((score / currentQuiz.questions.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-warm-brown-800 flex items-center gap-3">
          <Book className="w-8 h-8" />
          Practice Quiz 📝
        </h2>
      </div>

      <div className="card-warm bg-warm-tan-50">
        <h3 className="text-2xl font-bold text-warm-brown-800 mb-2">{currentQuiz.title}</h3>
        <p className="text-warm-terracotta-600">{currentQuiz.description}</p>
        <div className="flex items-center gap-4 mt-4">
          <span className="badge-warm badge-warm-terracotta">{currentQuiz.questions.length} questions</span>
          <span className="badge-warm badge-warm-sage">+{currentQuiz.xp_reward} XP on completion</span>
        </div>
      </div>

      {showResults && (
        <div className="card-warm text-center py-8">
          <div className="text-6xl mb-4">{percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}</div>
          <h3 className="text-3xl font-bold text-warm-brown-800 mb-2">
            Your Score: {score}/{currentQuiz.questions.length}
          </h3>
          <p className="text-xl text-warm-terracotta-600 mb-4">{percentage}% Correct</p>
          <div className="progress-warm max-w-md mx-auto mb-4">
            <div className="progress-warm-fill" style={{ width: `${percentage}%` }} />
          </div>
          <p className="text-warm-brown-700 font-semibold">
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
            className="btn-warm btn-warm-primary mt-6"
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
            <div key={q.id} className="card-warm">
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 w-8 h-8 bg-warm-terracotta-500 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-warm-brown-800 mb-2">{q.question_text}</h4>
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
                      className={`w-full p-4 rounded-xl text-left transition-all duration-300 border ${
                        showResult
                          ? isThisCorrect
                            ? 'bg-warm-sage-100 border-warm-sage-400 text-warm-sage-800'
                            : isSelected
                            ? 'bg-red-100 border-red-400 text-red-700'
                            : 'bg-warm-cream-50 border-warm-tan-200 text-warm-brown-400'
                          : isSelected
                          ? 'bg-warm-tan-100 border-warm-terracotta-400 text-warm-brown-800'
                          : 'bg-white border-warm-tan-200 hover:border-warm-terracotta-300 hover:bg-warm-cream-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option}</span>
                        {showResult && isThisCorrect && <CheckCircle className="w-5 h-5 text-warm-sage-600" />}
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
                  className={`mt-4 ml-11 p-4 rounded-xl border ${
                    isCorrect ? 'bg-warm-sage-50 border-warm-sage-200' : 'bg-warm-cream-100 border-warm-tan-200'
                  }`}
                >
                  <p className="text-sm text-warm-brown-700">
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
            className="btn-warm btn-warm-primary text-lg px-12 py-4 disabled:opacity-50"
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

Run `npm run build` — clean. `grep -c "cute-" src/pages/Quiz.tsx` returns `0`. `npm run dev`, confirm the standalone quiz still fetches, grades, and submits exactly as before (this file's logic is untouched — same as the earlier backend-wiring plan's Task 7, only recolored).

- [ ] **Step 3: Commit**

```bash
git add gerda-english/src/pages/Quiz.tsx
git commit -m "style: retrofit standalone Quiz page to warm theme"
```

---

### Task 7: Restyle Rewards.tsx

**Files:**
- Modify: `src/pages/Rewards.tsx`

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
    return <p className="text-center text-warm-brown-600 py-12">Loading rewards... 🌸</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-warm-brown-800 flex items-center gap-3">
          <Gift className="w-8 h-8" />
          Your Rewards 🎁
        </h2>
      </div>

      <div className="card-warm bg-warm-tan-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-warm-terracotta-600 mb-1">Your Current XP</p>
            <p className="text-4xl font-bold text-warm-brown-800">{userXp} XP</p>
          </div>
          {nextReward && (
            <div className="text-right">
              <p className="text-sm text-warm-brown-400 mb-1">Next Reward At</p>
              <p className="text-2xl font-bold text-warm-terracotta-600">{nextReward.xp_required} XP</p>
            </div>
          )}
        </div>
        {maxXp > 0 && (
          <>
            <div className="progress-warm mt-4">
              <div className="progress-warm-fill" style={{ width: `${Math.min((userXp / maxXp) * 100, 100)}%` }} />
            </div>
            <p className="text-xs text-warm-terracotta-600 mt-2 text-center">
              {Math.max(maxXp - userXp, 0)} XP away from the ultimate surprise! 🌟
            </p>
          </>
        )}
      </div>

      {rewards.length === 0 ? (
        <div className="card-warm text-center py-12">
          <Gift className="w-12 h-12 mx-auto mb-3 text-warm-tan-400" />
          <p className="text-warm-brown-400">No rewards uploaded yet — check back soon! 💕</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => {
            const isUnlocked = userXp >= reward.xp_required;

            return (
              <div
                key={reward.id}
                className={`card-warm transition-all duration-300 ${
                  isUnlocked ? 'hover:shadow-lg cursor-pointer' : 'opacity-75'
                }`}
              >
                <div className="text-center mb-4">
                  <div
                    className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl ${
                      isUnlocked ? 'bg-warm-terracotta-500' : 'bg-warm-tan-200'
                    }`}
                  >
                    {isUnlocked ? (reward.media_type === 'video' ? '🎥' : '🖼️') : <Lock className="w-8 h-8 text-warm-brown-400" />}
                  </div>
                </div>

                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-warm-brown-800 mb-2">{reward.title}</h3>
                  <p className="text-sm text-warm-brown-500 mb-3">{reward.description}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="badge-warm badge-warm-terracotta">{reward.xp_required} XP</span>
                    <span className="badge-warm badge-warm-sage capitalize">{reward.media_type}</span>
                  </div>
                </div>

                {isUnlocked ? (
                  <a
                    href={reward.media_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-warm btn-warm-primary w-full flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {reward.media_type === 'video' ? 'Watch Now' : 'View Gallery'}
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-warm-tan-100 text-warm-brown-400 rounded-2xl font-bold cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Locked
                  </button>
                )}

                {!isUnlocked && (
                  <div className="mt-3">
                    <div className="progress-warm">
                      <div
                        className="h-full rounded-full bg-warm-tan-300"
                        style={{ width: `${Math.min((userXp / reward.xp_required) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-warm-brown-400 mt-1 text-center">
                      {reward.xp_required - userXp} XP more needed
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="card-warm text-center py-6">
        <p className="text-lg text-warm-brown-700">
          💝 <strong>Every XP brings you closer to special surprises!</strong>
        </p>
        <p className="text-sm text-warm-terracotta-600 mt-2">
          Keep studying and unlock all the rewards! I believe in you! 💕
        </p>
      </div>
    </div>
  );
};

export default Rewards;
```

- [ ] **Step 2: Manual verification**

Run `npm run build` — clean. `grep -c "cute-" src/pages/Rewards.tsx` returns `0`. `npm run dev`, confirm unlock logic/media links still work unchanged.

- [ ] **Step 3: Commit**

```bash
git add gerda-english/src/pages/Rewards.tsx
git commit -m "style: retrofit Rewards to warm theme"
```

---

### Task 8: Restyle AdminDashboard.tsx and AdminGate.tsx

**Files:**
- Modify: `src/pages/AdminDashboard.tsx`
- Modify: `src/components/AdminGate.tsx`

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

  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    xpReward: 50,
    questions: [] as BuilderQuestion[],
  });
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [quizMessage, setQuizMessage] = useState('');

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
        <h2 className="text-3xl font-bold text-warm-brown-800 flex items-center gap-3">
          <Settings className="w-8 h-8" />
          Admin Panel 🛠️
        </h2>
        <p className="text-warm-terracotta-600">Create quizzes and upload rewards!</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'quizzes'
              ? 'bg-warm-terracotta-500 text-white shadow-sm'
              : 'bg-white text-warm-brown-600 hover:bg-warm-cream-100 border border-warm-tan-200'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          Create Quiz
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'rewards'
              ? 'bg-warm-terracotta-500 text-white shadow-sm'
              : 'bg-white text-warm-brown-600 hover:bg-warm-cream-100 border border-warm-tan-200'
          }`}
        >
          <Upload className="w-5 h-5" />
          Upload Rewards
        </button>
        <button
          onClick={() => setActiveTab('mistakes')}
          className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'mistakes'
              ? 'bg-warm-terracotta-500 text-white shadow-sm'
              : 'bg-white text-warm-brown-600 hover:bg-warm-cream-100 border border-warm-tan-200'
          }`}
        >
          <XCircle className="w-5 h-5" />
          Add Mistake
        </button>
      </div>

      {activeTab === 'quizzes' && (
        <div className="card-warm">
          <h3 className="text-xl font-bold text-warm-brown-800 mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Quiz
          </h3>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Quiz Title (e.g., IELTS Listening Practice)"
              className="input-warm"
              value={quizForm.title}
              onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
            />
            <textarea
              placeholder="Description (e.g., Practice numbers and dates for IELTS)"
              className="input-warm"
              rows={2}
              value={quizForm.description}
              onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
            />
            <div>
              <label className="block text-sm font-semibold text-warm-brown-700 mb-2">XP Reward</label>
              <input
                type="number"
                className="input-warm"
                value={quizForm.xpReward}
                onChange={(e) => setQuizForm({ ...quizForm, xpReward: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-warm-brown-800">Questions</h4>
                <button onClick={handleAddQuestion} className="btn-warm btn-warm-secondary text-sm py-2">
                  + Add Question
                </button>
              </div>

              {quizForm.questions.length === 0 ? (
                <div className="text-center py-8 text-warm-brown-400 bg-warm-cream-100 rounded-2xl">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No questions yet. Click "Add Question" to start!</p>
                </div>
              ) : (
                quizForm.questions.map((q, index) => (
                  <div key={q.id} className="p-4 bg-warm-cream-100 rounded-2xl border border-warm-tan-200">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 h-8 bg-warm-terracotta-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="Question text..."
                        className="input-warm flex-1"
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
                            className="input-warm flex-1"
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

            {quizMessage && <p className="text-sm text-warm-terracotta-600">{quizMessage}</p>}
            <button
              onClick={handleSaveQuiz}
              disabled={savingQuiz}
              className="btn-warm btn-warm-primary w-full mt-6 disabled:opacity-50"
            >
              {savingQuiz ? 'Saving...' : 'Save Quiz ✨'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="card-warm">
          <h3 className="text-xl font-bold text-warm-brown-800 mb-6 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload New Reward
          </h3>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Reward Title (e.g., Special Message #1)"
              className="input-warm"
              value={rewardForm.title}
              onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
            />

            <textarea
              placeholder="Description (e.g., A sweet video message to motivate you!)"
              className="input-warm"
              rows={2}
              value={rewardForm.description}
              onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-warm-brown-700 mb-2">XP Required</label>
                <input
                  type="number"
                  className="input-warm"
                  value={rewardForm.xpRequired}
                  onChange={(e) => setRewardForm({ ...rewardForm, xpRequired: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-warm-brown-700 mb-2">Type</label>
                <select
                  className="input-warm"
                  value={rewardForm.type}
                  onChange={(e) => setRewardForm({ ...rewardForm, type: e.target.value as 'video' | 'image' })}
                >
                  <option value="video">🎥 Video</option>
                  <option value="image">🖼️ Image</option>
                </select>
              </div>
            </div>

            <div className="border-2 border-dashed border-warm-tan-300 rounded-2xl p-8 text-center">
              {rewardForm.file ? (
                <div className="text-warm-brown-700">
                  <p className="font-bold">{rewardForm.file.name}</p>
                  <p className="text-sm">{(rewardForm.file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <>
                  {rewardForm.type === 'video' ? (
                    <Video className="w-12 h-12 mx-auto mb-3 text-warm-terracotta-400" />
                  ) : (
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 text-warm-terracotta-400" />
                  )}
                  <p className="text-warm-brown-700 font-semibold mb-2">Click to upload {rewardForm.type}</p>
                  <p className="text-sm text-warm-brown-400">MP4, JPG, PNG supported</p>
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
              <label htmlFor="file-upload" className="btn-warm btn-warm-secondary mt-4 inline-block cursor-pointer">
                Choose File
              </label>
            </div>

            {rewardMessage && <p className="text-sm text-warm-terracotta-600">{rewardMessage}</p>}
            <button
              onClick={handleUploadReward}
              disabled={uploadingReward}
              className="btn-warm btn-warm-primary w-full disabled:opacity-50"
            >
              {uploadingReward ? 'Uploading...' : 'Upload Reward 🎁'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'mistakes' && (
        <div className="card-warm">
          <h3 className="text-xl font-bold text-warm-brown-800 mb-6 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Add a Mistake
          </h3>

          <div className="space-y-4">
            <textarea
              placeholder="What she wrote/said (original)"
              className="input-warm"
              rows={2}
              value={mistakeForm.original_text}
              onChange={(e) => setMistakeForm({ ...mistakeForm, original_text: e.target.value })}
            />
            <textarea
              placeholder="Correct version"
              className="input-warm"
              rows={2}
              value={mistakeForm.corrected_text}
              onChange={(e) => setMistakeForm({ ...mistakeForm, corrected_text: e.target.value })}
            />
            <div>
              <label className="block text-sm font-semibold text-warm-brown-700 mb-2">Type</label>
              <select
                className="input-warm"
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
              className="input-warm"
              rows={2}
              value={mistakeForm.explanation}
              onChange={(e) => setMistakeForm({ ...mistakeForm, explanation: e.target.value })}
            />

            {mistakeMessage && <p className="text-sm text-warm-terracotta-600">{mistakeMessage}</p>}
            <button
              onClick={handleAddMistake}
              disabled={savingMistake}
              className="btn-warm btn-warm-primary w-full disabled:opacity-50"
            >
              {savingMistake ? 'Saving...' : 'Add Mistake 📚'}
            </button>
          </div>
        </div>
      )}

      <div className="card-warm bg-warm-tan-50">
        <h4 className="font-bold text-warm-brown-800 mb-3">💡 Admin Tips</h4>
        <ul className="space-y-2 text-sm text-warm-brown-600">
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

- [ ] **Step 2: Replace `src/components/AdminGate.tsx`**

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
      <div className="card-warm text-center">
        <Lock className="w-10 h-10 mx-auto mb-4 text-warm-terracotta-400" />
        <h2 className="text-xl font-bold text-warm-brown-800 mb-4">Admin Access</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            placeholder="Password"
            className="input-warm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="btn-warm btn-warm-primary w-full">
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminGate;
```

- [ ] **Step 3: Manual verification**

Run `npm run build` — clean. `grep -c "cute-" src/pages/AdminDashboard.tsx src/components/AdminGate.tsx` returns `0` for both. `npm run dev`, confirm the password gate and all three admin tabs (quiz builder, reward upload, add mistake) still work unchanged.

- [ ] **Step 4: Commit**

```bash
git add gerda-english/src/pages/AdminDashboard.tsx gerda-english/src/components/AdminGate.tsx
git commit -m "style: retrofit Admin panel and password gate to warm theme"
```

---

### Task 9: Remove the now-redundant Course-page background hack; fix PWA icons and manifest

**Files:**
- Modify: `src/pages/Course.tsx`
- Modify: `src/pages/CourseUnit.tsx`
- Modify: `src/pages/CourseLesson.tsx`
- Modify: `src/pages/CourseCheckpoint.tsx`
- Modify: `vite.config.ts`
- Modify: `index.html`
- Create: `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/apple-touch-icon.png`, `public/masked-icon.svg`, `public/favicon.svg`
- Delete: `public/heart.svg` (no longer referenced anywhere after this task)

**Part A — remove the background-bleed hack (now redundant since `Layout.tsx`'s `<main>` is warm-cream globally from Task 1):**

- [ ] **Step 1: Simplify `src/pages/Course.tsx`**

Every return statement in this file currently wraps its content in:
```tsx
<div className="-m-8 p-8 min-h-[calc(100vh-2rem)] bg-warm-cream-50">
  {/* content */}
</div>
```
Remove that wrapper `<div>` in all places it appears (the loading state and the main return) — just return the inner content directly. The file's actual layout/logic is otherwise unchanged.

- [ ] **Step 2: Simplify `src/pages/CourseUnit.tsx`** the same way — remove the `-m-8 p-8 min-h-[calc(100vh-2rem)] bg-warm-cream-50` wrapper from all three return paths (loading, not-found, happy path), keeping each path's inner content as-is.

- [ ] **Step 3: Simplify `src/pages/CourseLesson.tsx`** the same way — remove the wrapper from both return paths (not-found, happy path).

- [ ] **Step 4: Simplify `src/pages/CourseCheckpoint.tsx`** the same way — remove the wrapper from all three return paths (loading, not-found, happy path).

**Part B — PWA icons and manifest:**

- [ ] **Step 5: Generate the icon assets**

Using the `compound-engineering:ce-gemini-imagegen` skill (or any available image-generation tool), generate a square icon: a graduation cap on a diagonal gradient background from `#c17a4a` (warm-terracotta-500) to `#7a9b6e` (warm-sage-500), white/cream cap glyph, generous padding so it isn't cropped when a device applies a circular/rounded mask. Export it at these exact files/sizes into `gerda-english/public/`:
- `pwa-192x192.png` — 192×192
- `pwa-512x512.png` — 512×512 (also reused as the `maskable` purpose entry in the manifest — the padding from the previous sentence is what makes this safe as a maskable icon)
- `apple-touch-icon.png` — 180×180 (Apple's expected size; no transparency, since iOS ignores alpha and shows it as black)
- `masked-icon.svg` — a simple single-color (use `#c17a4a`) SVG silhouette of the same cap glyph, for Safari's pinned-tab icon
- `favicon.svg` — a small SVG version of the same icon (full color, matches the others), replacing `heart.svg` as the browser tab icon

If no image-generation tool is available in your environment, escalate (NEEDS_CONTEXT) rather than guessing — do not hand-draw a low-effort placeholder and call it done, since this is the one part of the plan that's a real visual asset, not a code transform.

- [ ] **Step 6: Delete the now-unused `public/heart.svg`**

```bash
git rm gerda-english/public/heart.svg
```

- [ ] **Step 7: Update the manifest in `vite.config.ts`**

Change the `manifest` object's `theme_color` and `background_color`:
```ts
        theme_color: '#c17a4a',
        background_color: '#fdf8f0',
```
(replacing the old `'#f5d0fe'` / `'#fdf2f8'` values). Leave `name`, `short_name`, `description`, `display`, `orientation`, and the `icons` array's structure unchanged — the icon `src` filenames already match what Step 5 generates, so no path changes are needed there. Also update `includeAssets` to match what now actually exists in `public/`:
```ts
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg'],
```

- [ ] **Step 8: Update `index.html`**

Change the favicon link from:
```html
    <link rel="icon" type="image/svg+xml" href="/heart.svg" />
```
to:
```html
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```
Change the theme-color meta tag from:
```html
    <meta name="theme-color" content="#f5d0fe" />
```
to:
```html
    <meta name="theme-color" content="#c17a4a" />
```
Leave the title, description, and font-preconnect/font-link tags as they are — no branding text changes, just the color/icon fixes that were actually broken.

- [ ] **Step 9: Manual verification**

Run `npm run build` — clean, and confirm the build output's file list includes the new PWA assets (check `dist/` after build, or the build log's asset list). Confirm `ls gerda-english/public/` shows every file `vite.config.ts`'s `includeAssets` and `manifest.icons` now reference, and does NOT show `heart.svg`. `grep -rn "heart.svg" gerda-english/src gerda-english/index.html gerda-english/vite.config.ts` should return nothing. `npm run dev`, open devtools → Application → Manifest (Chrome) and confirm no "image download error" warnings — this is the direct fix for the original brokenness.

- [ ] **Step 10: Commit**

```bash
git add gerda-english/src/pages/Course.tsx gerda-english/src/pages/CourseUnit.tsx gerda-english/src/pages/CourseLesson.tsx gerda-english/src/pages/CourseCheckpoint.tsx gerda-english/vite.config.ts gerda-english/index.html gerda-english/public/pwa-192x192.png gerda-english/public/pwa-512x512.png gerda-english/public/apple-touch-icon.png gerda-english/public/masked-icon.svg gerda-english/public/favicon.svg
git commit -m "fix: real PWA icon set + warm manifest colors, drop redundant Course background hack"
```

---

### Task 10: Final cleanup — remove dead `cute-*` theme, full build, full walkthrough

**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/index.css`

- [ ] **Step 1: Confirm zero remaining `cute-` usage before deleting anything**

```bash
grep -rn "cute-" gerda-english/src
```
Expected: no output. If anything shows up, stop — fix that file first (it means an earlier task's page missed something), then re-run this grep before continuing. Do not delete the shared tokens/classes while any page still depends on them.

- [ ] **Step 2: Remove the `cute-*` color tokens from `tailwind.config.js`**

Delete the five `'cute-pink'`, `'cute-purple'`, `'cute-blue'`, `'cute-mint'`, `'cute-peach'` color-scale entries from `theme.extend.colors` (keep all five `warm-*` entries). Delete the `'cute': ['Quicksand', 'Nunito', 'sans-serif']` entry from `theme.extend.fontFamily` (keep `'rounded'` and `'warm'` — check first whether `'rounded'` is actually used anywhere via `grep -rn "font-rounded" gerda-english/src`; if it's also unused, remove it too, but don't remove it speculatively without checking).

- [ ] **Step 3: Remove the `cute-*` CSS classes from `src/index.css`**

Delete the `.btn-primary`, `.btn-secondary`, `.card-cute`, `.input-cute`, `.progress-cute`, `.progress-fill`, `.badge-cute`, `.badge-pink`, `.badge-purple`, `.badge-mint` rule blocks (everything under the "Cute button styles" / "Card styles" / etc. comments that references `cute-*` tokens). Keep the `.btn-warm`/`.card-warm`/`.input-warm`/`.progress-warm`/`.badge-warm` blocks, the `float`/`sparkle` keyframes and their classes (check `grep -rn "sparkle\|float-animation" gerda-english/src` first — if genuinely unused, they can go too, but verify before deleting), and everything else.

- [ ] **Step 4: Full build verification**

Run `npm run build` from `gerda-english/` — must be clean. This is the real test of Step 2/3: if any page secretly still referenced a deleted class, this fails loudly (missing Tailwind utility just gets silently dropped from CSS output, not a build error — so also re-run the Step 1 grep once more after the config changes, and visually spot-check a couple of pages in the browser, not just the exit code).

- [ ] **Step 5: Full manual walkthrough**

`npm run dev`. At desktop width: click through every nav item (Home, Course, Notebook, Calendar, Mistakes, Quiz, Rewards, Admin) — confirm consistent warm styling everywhere, sidebar highlights the active page correctly. Resize to mobile width: confirm the bottom bar + More sheet work, confirm page content isn't hidden behind the bottom bar (check the bottom of a long page like Rewards). Confirm the browser tab shows the new icon, and the manifest (devtools → Application) shows no broken image references.

- [ ] **Step 6: Commit**

```bash
git add gerda-english/tailwind.config.js gerda-english/src/index.css
git commit -m "chore: remove dead cute-* theme tokens and classes now that every page is warm-themed"
```
