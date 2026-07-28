# UI Upgrade: Nav + Dashboard "App Feel" — Design

## Goal

The app currently reads as a static, print-like document (Georgia serif body font, instant state changes, flat cards, text-only loading states). This pass makes the navigation shell and Dashboard feel like a modern, native-style app through motion, depth, and typography — without touching the existing warm terracotta/cream color palette or brand identity.

## Non-goals

- No color palette or branding changes. Warm terracotta/cream/sage/tan colors stay exactly as-is.
- No changes to Course, Quiz, Mock Exam, Notebook, Calendar, Rewards, or Admin pages in this pass. Only the navigation shell (`Layout.tsx`, `BottomNav.tsx`, `MoreSheet.tsx`) and `Dashboard.tsx` are touched. A follow-up pass applies the same patterns elsewhere once this one is validated.
- No drag-to-dismiss gesture on the "More" sheet — tap-backdrop-to-close only, for this pass.
- No route-change loading-state changes beyond Dashboard's skeleton — other pages keep their current "Loading X..." text for now.

## Approach

**Motion library:** Framer Motion (new dependency, ~50kb gzip). Chosen over hand-rolled CSS because React Router doesn't animate route unmounts natively — Framer Motion's `AnimatePresence` handles enter/exit transitions cleanly, and its `layoutId` shared-element animation is the simplest way to get a sliding active-tab indicator without manually tracking DOM positions.

**Typography:** Body font switches from Georgia serif to a system sans-serif stack (`-apple-system, "Segoe UI", Inter, sans-serif`). No web font download — renders with each OS's native UI font, which is itself part of what makes it read as "app-like" rather than "document-like." Colors and the existing `font-warm` Tailwind utility (used for one-off serif accents, e.g. quote text) are unaffected.

## Architecture

### New files

- `src/components/PageTransition.tsx` — wraps route content in `AnimatePresence` + `motion.div`, keyed on `location.pathname`. Fade + slight slide-up on enter, fade + slight slide-down on exit. Used once, inside `Layout.tsx`, around `<Outlet />` — benefits every route for free.
- `src/components/Skeleton.tsx` — a small shimmer placeholder block (`<Skeleton className="h-24 rounded-2xl" />`) built with a CSS keyframe animation (shimmer doesn't need Framer Motion — it's a continuous loop, not a state-driven transition). Reusable by any page; first consumer is Dashboard.

### Modified files

- `src/index.css` — font-family change on `body`; new `@keyframes shimmer` + `.skeleton-warm` utility class for `Skeleton.tsx`.
- `src/components/Layout.tsx` — wraps `<Outlet />` with `<PageTransition>`; sidebar nav items get a `layoutId="desktop-nav-indicator"` animated background behind the active item instead of a static class swap.
- `src/components/BottomNav.tsx` — active tab gets a `layoutId="mobile-nav-indicator"` animated pill behind the icon+label; icons get `whileTap={{ scale: 0.9 }}`.
- `src/components/MoreSheet.tsx` — backdrop and sheet become `motion.div`s with `AnimatePresence`: backdrop fades in/out, sheet springs up from `y: "100%"` to `y: 0` and back on close.
- `src/pages/Dashboard.tsx` — stat cards and activity/tip cards become `motion.div`s with a staggered fade-up entrance (`initial`, `animate`, `transition: { delay: index * 0.08 }`); cards get `whileHover`/`whileTap` lift/press; note/mistake counts animate via a small `useCountUp` hook; loading state renders `<Skeleton>` blocks matching the stat-card grid shape instead of the "Loading dashboard..." paragraph.
- `src/components/Layout.tsx` (level/XP card) — the existing `.progress-warm-fill` div gets an additional `motion.div` wrapper so its width animates with a spring instead of the current CSS `transition-all duration-500`.

### New hook

`src/hooks/useCountUp.ts` — `useCountUp(target: number, durationMs = 600): number`. Animates a number from its previous value to `target` using `requestAnimationFrame`, returns the current displayed value each render. Used for the Dashboard note/mistake counts. Kept as a plain hook (no Framer Motion dependency needed for a single number tween) since Framer Motion's `useSpring`/`animate` for numbers adds API surface for something `requestAnimationFrame` handles in ~15 lines.

## Motion details (kept subtle per "native app" direction, not "bold/playful")

- Page transitions: 150-200ms fade + 8px slide, no bounce/overshoot.
- Nav indicators: spring with high stiffness / low bounce (`type: "spring", stiffness: 500, damping: 35`) — snappy, not wobbly.
- Card hover lift: `translateY(-2px)` + shadow increase, 150ms ease.
- Card tap: `scale(0.98)`, no delay.
- "More" sheet: spring slide, `damping: 30` — no overshoot past final position.
- Count-up: linear-ish ease-out over 600ms, capped so large numbers don't feel sluggish (parked at a max visible duration regardless of magnitude).

## Testing

- No new unit tests planned — these are visual/motion components with no meaningful logic to assert against beyond "renders children" (Vitest + jsdom also doesn't run real paint/animation timing, so motion behavior can't be meaningfully asserted in this test setup). `useCountUp` is the one piece with real logic (progresses toward target over time) and gets a unit test using fake timers.
- Manual verification: dev server walkthrough (per this project's convention, no browser-automation tooling) — confirm page transitions fire on route change, nav indicators slide correctly on both mobile bottom-nav and desktop sidebar, More sheet animates open/close, Dashboard cards stagger in and counts animate up, skeleton shows briefly on load.

## Edge cases

- `prefers-reduced-motion`: Framer Motion respects this automatically for its animations when `MotionConfig reducedMotion="user"` is set at the app root (added in `App.tsx`) — page transitions and nav indicators become instant for users with the OS setting enabled. The CSS shimmer keyframe and `useCountUp` are manually gated behind the same media query since they're outside Framer Motion's control.
- Fast repeated navigation (user taps multiple nav items quickly): `AnimatePresence mode="wait"` is deliberately *not* used for page transitions (it would queue/delay), so a new navigation simply interrupts the previous exit animation — matches how native apps handle rapid navigation.
