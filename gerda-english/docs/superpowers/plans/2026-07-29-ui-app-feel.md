# UI Upgrade: Nav + Dashboard App Feel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the navigation shell and Dashboard feel like a modern native app through motion, depth, and typography, without touching the existing warm color palette.

**Architecture:** Framer Motion drives all state-driven animation (page transitions, nav indicators, sheet open/close, card entrance). A plain `requestAnimationFrame` hook (`useCountUp`) handles the one continuous-value tween that doesn't need a full animation library. CSS keyframes handle the one continuous *loop* animation (skeleton shimmer) since it has no React state driving it.

**Tech Stack:** Adds `framer-motion` as a new dependency. No other new dependencies — reuses the existing Vitest + `@testing-library/react` setup from the mock exam work.

## Global Constraints

- No color palette or branding changes — warm terracotta/cream/sage/tan stay exactly as they are.
- Scope is limited to `Layout.tsx`, `BottomNav.tsx`, `MoreSheet.tsx`, `Dashboard.tsx`, `index.css`, `App.tsx`, plus new files. No other page gets touched in this pass.
- Motion stays subtle: page transitions 150-200ms, nav indicator springs use `stiffness: 500, damping: 35` (snappy, no overshoot), card hover/tap are small (2px lift, 0.98 scale). Nothing bouncy or flashy.
- `prefers-reduced-motion: reduce` must be respected — `MotionConfig reducedMotion="user"` covers all Framer Motion animations; `useCountUp` and the skeleton shimmer are gated manually since they sit outside Framer Motion's control.
- Every new/modified component must still typecheck (`npx tsc -b`) and the full test suite must still pass (`npm test`) after each task.

---

## Task 1: Foundation — Framer Motion, sans-serif font, reduced-motion root config

**Files:**
- Modify: `package.json` (via `npm install`)
- Modify: `src/index.css`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `framer-motion` available for import (`motion`, `AnimatePresence`, `MotionConfig`) in every later task.

- [ ] **Step 1: Install Framer Motion**

```bash
npm install framer-motion
```

- [ ] **Step 2: Swap the body font in `src/index.css`**

Change:

```css
body {
  font-family: Georgia, Cambria, 'Times New Roman', serif;
  background: linear-gradient(135deg, #fefcf8 0%, #fdf8f0 50%, #f8ecd8 100%);
  min-height: 100vh;
  color: #5c4426;
  overflow-x: hidden;
}
```

to:

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif;
  background: linear-gradient(135deg, #fefcf8 0%, #fdf8f0 50%, #f8ecd8 100%);
  min-height: 100vh;
  color: #5c4426;
  overflow-x: hidden;
}
```

(The existing `font-warm` Tailwind utility, used for one-off serif accents like quote text, is untouched — check `tailwind.config.js` if unsure, but this task does not modify it.)

- [ ] **Step 3: Wire `MotionConfig` at the app root**

In `src/App.tsx`, add the import:

```ts
import { MotionConfig } from 'framer-motion';
```

Wrap the existing return value's outermost element. Change:

```tsx
function App() {
  return (
    <UserProgressProvider>
      <Router>
```

to:

```tsx
function App() {
  return (
    <MotionConfig reducedMotion="user">
      <UserProgressProvider>
        <Router>
```

And correspondingly close it at the end — change:

```tsx
      </Router>
    </UserProgressProvider>
  );
}
```

to:

```tsx
      </Router>
      </UserProgressProvider>
    </MotionConfig>
  );
}
```

(Re-indent the JSX between these two edits by one level for consistency — content itself is unchanged.)

- [ ] **Step 4: Verify it builds and tests still pass**

Run: `npx tsc -b`
Expected: no errors.

Run: `npm test`
Expected: all existing tests still PASS (21 tests from the mock exam work).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/index.css src/App.tsx
git commit -m "feat: add Framer Motion, switch to sans-serif font, wire reduced-motion config"
```

---

## Task 2: PageTransition component

**Files:**
- Create: `src/components/PageTransition.tsx`
- Modify: `src/components/Layout.tsx`

**Interfaces:**
- Consumes: `framer-motion` (Task 1), `react-router-dom`'s `useLocation`.
- Produces: `<PageTransition>{children}</PageTransition>` wrapper — consumed by `Layout.tsx` around `<Outlet />`. No other task depends on this component directly.

- [ ] **Step 1: Write `PageTransition.tsx`**

```tsx
// src/components/PageTransition.tsx
import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
```

- [ ] **Step 2: Wire it into `Layout.tsx`**

Add the import:

```ts
import PageTransition from './PageTransition';
```

Change:

```tsx
      <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 md:pb-8 bg-warm-cream-50">
        <Outlet />
      </main>
```

to:

```tsx
      <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 md:pb-8 bg-warm-cream-50">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
```

- [ ] **Step 3: Verify it builds and tests still pass**

Run: `npx tsc -b`
Expected: no errors.

Run: `npm test`
Expected: all tests still PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/PageTransition.tsx src/components/Layout.tsx
git commit -m "feat: add fade/slide page transitions on route change"
```

---

## Task 3: Skeleton component

**Files:**
- Create: `src/components/Skeleton.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Produces: `<Skeleton className="h-24 rounded-2xl" />` — consumed by Task 9 (`Dashboard.tsx`).

- [ ] **Step 1: Add shimmer CSS to `src/index.css`**

Append to the end of the file:

```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-warm {
  background: linear-gradient(90deg, #f3e5c8 25%, #fdf8f0 50%, #f3e5c8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-warm {
    animation: none;
    background: #f3e5c8;
  }
}
```

- [ ] **Step 2: Write `Skeleton.tsx`**

```tsx
// src/components/Skeleton.tsx
interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className = '' }: SkeletonProps) => {
  return <div className={`skeleton-warm rounded-2xl ${className}`} />;
};

export default Skeleton;
```

- [ ] **Step 3: Verify it builds and tests still pass**

Run: `npx tsc -b`
Expected: no errors.

Run: `npm test`
Expected: all tests still PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/Skeleton.tsx src/index.css
git commit -m "feat: add shimmer skeleton loader component"
```

---

## Task 4: useCountUp hook

**Files:**
- Create: `src/hooks/useCountUp.ts`
- Test: `src/hooks/useCountUp.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `useCountUp(target: number, durationMs?: number): number` — consumed by Task 9 (`Dashboard.tsx`).

- [ ] **Step 1: Write the failing tests**

```ts
// src/hooks/useCountUp.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountUp } from './useCountUp';

describe('useCountUp', () => {
  let frameCallbacks: FrameRequestCallback[] = [];
  let now = 0;

  beforeEach(() => {
    frameCallbacks = [];
    now = 0;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      frameCallbacks.push(cb);
      return frameCallbacks.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const flushFrame = (elapsedMs: number) => {
    now += elapsedMs;
    const callbacks = frameCallbacks;
    frameCallbacks = [];
    act(() => {
      callbacks.forEach((cb) => cb(now));
    });
  };

  it('starts at the initial target with no animation', () => {
    const { result } = renderHook(() => useCountUp(5, 100));
    expect(result.current).toBe(5);
    expect(frameCallbacks.length).toBe(0);
  });

  it('animates toward a new target over time, landing exactly on it', () => {
    const { result, rerender } = renderHook(({ target }) => useCountUp(target, 100), {
      initialProps: { target: 0 },
    });

    rerender({ target: 10 });
    flushFrame(0); // first frame establishes the animation's start time
    flushFrame(50); // halfway through the 100ms duration
    expect(result.current).toBe(5);

    flushFrame(50); // elapsed now covers the full duration
    expect(result.current).toBe(10);
  });

  it('jumps directly to the target when prefers-reduced-motion is set', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));

    const { result, rerender } = renderHook(({ target }) => useCountUp(target, 100), {
      initialProps: { target: 0 },
    });
    rerender({ target: 10 });

    expect(result.current).toBe(10);
    expect(frameCallbacks.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL with "Cannot find module './useCountUp'"

- [ ] **Step 3: Write the implementation**

```ts
// src/hooks/useCountUp.ts
import { useEffect, useRef, useState } from 'react';

export function useCountUp(target: number, durationMs = 600): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const from = fromRef.current;
    if (from === target || prefersReducedMotion) {
      setValue(target);
      fromRef.current = target;
      return;
    }

    startRef.current = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / durationMs, 1);
      setValue(Math.round(from + (target - from) * progress));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, durationMs]);

  return value;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useCountUp.ts src/hooks/useCountUp.test.ts
git commit -m "feat: add useCountUp hook for animated number tweens"
```

---

## Task 5: BottomNav animated indicator + tap feedback

**Files:**
- Modify: `src/components/BottomNav.tsx`

**Interfaces:**
- Consumes: `motion` from `framer-motion` (Task 1).

- [ ] **Step 1: Rewrite `BottomNav.tsx`**

Replace the entire file:

```tsx
// src/components/BottomNav.tsx
import { Link, useLocation } from 'react-router-dom';
import { Home, GraduationCap, Book, Gift, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

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
            className="relative flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold"
          >
            {isActive && (
              <motion.div
                layoutId="mobile-nav-indicator"
                className="absolute inset-x-2 inset-y-1 bg-warm-terracotta-50 rounded-xl -z-10"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <motion.div whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1">
              <Icon className={`w-5 h-5 ${isActive ? 'text-warm-terracotta-600' : 'text-warm-brown-400'}`} />
              <span className={isActive ? 'text-warm-terracotta-600' : 'text-warm-brown-400'}>{item.label}</span>
            </motion.div>
          </Link>
        );
      })}
      <button
        onClick={onMore}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold text-warm-brown-400"
      >
        <motion.div whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1">
          <MoreHorizontal className="w-5 h-5" />
          More
        </motion.div>
      </button>
    </nav>
  );
};

export default BottomNav;
```

- [ ] **Step 2: Verify it builds and tests still pass**

Run: `npx tsc -b`
Expected: no errors.

Run: `npm test`
Expected: all tests still PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/BottomNav.tsx
git commit -m "feat: animate bottom nav active indicator and tap feedback"
```

---

## Task 6: Desktop sidebar animated indicator

**Files:**
- Modify: `src/components/Layout.tsx`

**Interfaces:**
- Consumes: `motion` from `framer-motion` (Task 1).

- [ ] **Step 1: Add the `motion` import**

In `src/components/Layout.tsx`, add alongside the existing imports:

```ts
import { motion } from 'framer-motion';
```

- [ ] **Step 2: Animate the active sidebar item**

Change:

```tsx
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
```

to:

```tsx
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-warm-brown-600 hover:bg-warm-cream-100'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktop-nav-indicator"
                    className="absolute inset-0 bg-warm-terracotta-500 rounded-xl shadow-sm -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
```

- [ ] **Step 3: Verify it builds and tests still pass**

Run: `npx tsc -b`
Expected: no errors.

Run: `npm test`
Expected: all tests still PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/Layout.tsx
git commit -m "feat: animate desktop sidebar active indicator"
```

---

## Task 7: MoreSheet animated open/close

**Files:**
- Modify: `src/components/MoreSheet.tsx`
- Modify: `src/components/Layout.tsx`

**Interfaces:**
- Consumes: `AnimatePresence`, `motion` from `framer-motion` (Task 1).

- [ ] **Step 1: Rewrite `MoreSheet.tsx`**

Replace the entire file:

```tsx
// src/components/MoreSheet.tsx
import { Link } from 'react-router-dom';
import { X, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative w-full bg-white rounded-t-3xl p-6 pb-8"
      >
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
      </motion.div>
    </div>
  );
};

export default MoreSheet;
```

- [ ] **Step 2: Wrap the conditional render in `AnimatePresence` in `Layout.tsx`**

`AnimatePresence` must wrap the *conditional itself* to delay unmounting for the exit animation — it cannot just wrap the always-present parent.

Add `AnimatePresence` to the existing `framer-motion` import (added in Task 6):

```ts
import { AnimatePresence, motion } from 'framer-motion';
```

Change:

```tsx
      <BottomNav onMore={() => setShowMore(true)} />
      {showMore && <MoreSheet items={moreItems} onClose={() => setShowMore(false)} />}
```

to:

```tsx
      <BottomNav onMore={() => setShowMore(true)} />
      <AnimatePresence>
        {showMore && <MoreSheet items={moreItems} onClose={() => setShowMore(false)} />}
      </AnimatePresence>
```

- [ ] **Step 3: Verify it builds and tests still pass**

Run: `npx tsc -b`
Expected: no errors.

Run: `npm test`
Expected: all tests still PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/MoreSheet.tsx src/components/Layout.tsx
git commit -m "feat: animate More sheet open and close"
```

---

## Task 8: XP progress bar spring fill

**Files:**
- Modify: `src/components/Layout.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `motion` from `framer-motion` (already imported in Task 6).

`.progress-warm-fill` is only ever used by this one XP bar in `Layout.tsx` (Quiz.tsx and CourseCheckpoint.tsx build their own inline classes for their progress bars, not this shared utility) — safe to change without affecting other pages.

- [ ] **Step 1: Remove the CSS transition from `.progress-warm-fill` in `src/index.css`**

Change:

```css
.progress-warm-fill {
  @apply h-full rounded-full transition-all duration-500 ease-out bg-warm-terracotta-500;
}
```

to:

```css
.progress-warm-fill {
  @apply h-full rounded-full bg-warm-terracotta-500;
}
```

(Framer Motion now owns the width animation for this element — leaving the CSS `transition-all` in place would fight with it.)

- [ ] **Step 2: Animate the fill in `Layout.tsx`**

Change:

```tsx
          <div className="progress-warm mb-2">
            <div className="progress-warm-fill" style={{ width: `${xp % 100}%` }} />
          </div>
```

to:

```tsx
          <div className="progress-warm mb-2">
            <motion.div
              className="progress-warm-fill"
              initial={false}
              animate={{ width: `${xp % 100}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>
```

- [ ] **Step 3: Verify it builds and tests still pass**

Run: `npx tsc -b`
Expected: no errors.

Run: `npm test`
Expected: all tests still PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/Layout.tsx src/index.css
git commit -m "feat: animate XP progress bar fill with spring physics"
```

---

## Task 9: Dashboard — stagger entrance, hover/tap, skeleton, count-up

**Files:**
- Modify: `src/pages/Dashboard.tsx`

**Interfaces:**
- Consumes: `motion` from `framer-motion` (Task 1), `Skeleton` (Task 3), `useCountUp` (Task 4).

- [ ] **Step 1: Rewrite `Dashboard.tsx`**

Replace the entire file:

```tsx
// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, Award } from 'lucide-react';
import { getNotes, getMistakes, getQuizAttempts } from '../lib/db';
import { useCountUp } from '../hooks/useCountUp';
import Skeleton from '../components/Skeleton';

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

const cardMotionProps = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  whileHover: { y: -2, boxShadow: '0 8px 20px -6px rgba(92, 68, 38, 0.18)' },
  whileTap: { scale: 0.98 },
};

const Dashboard = () => {
  const [noteCount, setNoteCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [randomMessage] = useState(
    () => encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]
  );

  const noteCountDisplay = useCountUp(noteCount);
  const mistakeCountDisplay = useCountUp(mistakeCount);

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
    return (
      <div className="space-y-8">
        <div className="text-center py-8 space-y-3">
          <Skeleton className="h-10 w-80 mx-auto" />
          <Skeleton className="h-6 w-56 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h2 className="text-4xl font-bold text-warm-brown-800 mb-2">Welcome back, Gerda! 🌸</h2>
        <p className="text-xl text-warm-terracotta-600">{randomMessage}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div className="card-warm" {...cardMotionProps} transition={{ delay: 0 * 0.08, duration: 0.3 }}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-terracotta-500 rounded-2xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-warm-brown-400">Notes Created</p>
              <p className="text-2xl font-bold text-warm-brown-800">{noteCountDisplay}</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="card-warm" {...cardMotionProps} transition={{ delay: 1 * 0.08, duration: 0.3 }}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-sage-500 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-warm-brown-400">Mistakes Logged</p>
              <p className="text-2xl font-bold text-warm-brown-800">{mistakeCountDisplay}</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="card-warm" {...cardMotionProps} transition={{ delay: 2 * 0.08, duration: 0.3 }}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-terracotta-500 rounded-2xl">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-warm-brown-400">Recent Activities</p>
              <p className="text-2xl font-bold text-warm-brown-800">{activities.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div className="card-warm" {...cardMotionProps} transition={{ delay: 3 * 0.08, duration: 0.3 }}>
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
        </motion.div>

        <motion.div
          className="card-warm bg-warm-tan-50"
          {...cardMotionProps}
          transition={{ delay: 4 * 0.08, duration: 0.3 }}
        >
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
        </motion.div>
      </div>

      <motion.div
        className="card-warm text-center py-8"
        {...cardMotionProps}
        transition={{ delay: 5 * 0.08, duration: 0.3 }}
      >
        <p className="text-2xl font-warm text-warm-brown-800 mb-2">
          "Believe in yourself and all that you are."
        </p>
        <p className="text-warm-terracotta-600">- Christian D. Larson</p>
        <p className="mt-4 text-lg text-warm-brown-700">💕 You've got this! 💕</p>
      </motion.div>
    </div>
  );
};

export default Dashboard;
```

- [ ] **Step 2: Verify it builds and tests still pass**

Run: `npx tsc -b`
Expected: no errors.

Run: `npm test`
Expected: all tests still PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat: add stagger entrance, hover/tap, skeleton, and count-up to Dashboard"
```

---

## Task 10: Manual end-to-end verification

**Files:** none (verification only)

This project's stored guidance is not to use browser-automation or screenshot tools, even to verify UI — verification here is a dev-server walkthrough by the user, not an automated browser check.

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Ask the user to walk through the app and confirm:**

- Navigating between pages shows a brief fade/slide transition instead of an instant swap.
- On mobile width, the bottom nav's active-tab pill slides smoothly between tabs when switching pages; tapping an icon gives a small press-down feel.
- On desktop width, the sidebar's active-item highlight slides smoothly between items.
- Tapping "More" on mobile springs the sheet up with a backdrop fade; tapping the backdrop or an item closes it with a matching close animation.
- On the Dashboard: cards fade/slide in one after another (not all at once) on load; hovering a card lifts it slightly; the Notes/Mistakes counts animate upward from 0 rather than appearing instantly.
- Loading the Dashboard briefly shows shimmering placeholder blocks instead of "Loading dashboard..." text.
- The sidebar's XP bar fills with a slight spring bounce rather than a linear slide.
- Body text throughout reads as a clean sans-serif, not the old serif font.

- [ ] **Step 3: Fix any issues found, then re-run `npm test` and `npx tsc -b`**

Expected: all tests PASS, no type errors.

- [ ] **Step 4: Final commit if any fixes were made**

```bash
git add -A
git commit -m "fix: address issues found in UI upgrade manual walkthrough"
```
