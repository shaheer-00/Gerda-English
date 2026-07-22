# Full-App Warm Retrofit + Real PWA — Design

## Problem

Two things, decided together:

1. The app is visually split — Course pages use the new "Warm Cozy Notebook"
   theme, everything else (Dashboard, Notebook, Calendar, Mistakes, Quiz,
   Rewards, Admin, the sidebar itself) still uses the old pink/purple "cute"
   theme. User wants the whole app on one consistent look, and explicitly
   doesn't like the old one.
2. The PWA is broken: `vite.config.ts` and `index.html` reference icon files
   (`pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon.png`,
   `masked-icon.svg`) that don't exist in `public/` — only a leftover
   `heart.svg` is there. The manifest's colors are also the old pink theme.
   The app currently cannot properly install as a PWA. On top of the missing
   assets, the layout itself (fixed always-visible sidebar, built for
   tablet) doesn't suit a phone-width installed app.

## Visual direction (already chosen)

Warm Cozy Notebook everywhere — cream/tan background, terracotta as the
primary accent, sage as the secondary/success accent, warm-brown text,
Georgia serif headings. Reuses the `warm-*` Tailwind tokens and
`.card-warm`/`.btn-warm`/`.input-warm`/`.progress-warm`/`.badge-warm` CSS
classes already built for Course — nothing new to define, just applied more
broadly.

**Important calibration, not a literal find-and-replace:** the old "cute"
theme uses a different gradient combo (pink→purple, blue→mint, peach→pink,
etc.) on nearly every card for playful variety. A cozy-notebook aesthetic is
more restrained — mostly neutral cream/white/tan surfaces with terracotta as
the one primary accent and sage used sparingly for success/positive states.
Retrofitting each page means re-deciding which elements get color, not
swapping `cute-pink` for `warm-terracotta` one-for-one everywhere. Rule of
thumb applied consistently across every page:
- Primary actions / active states / highlights → `warm-terracotta`
- Success / completed / positive states → `warm-sage`
- Card surfaces → white or `warm-cream-50`, bordered `warm-tan-200`
- Body text → `warm-brown-700/800`, secondary text → `warm-brown-400/500`
- Headings → `font-warm` (the Georgia stack already defined)

## Navigation

Responsive, single `Layout.tsx`:
- **Desktop/tablet (≥768px, Tailwind `md:`):** existing sidebar pattern,
  restyled warm, all 7 items (Home, Course, Notebook, Calendar, Mistakes,
  Quiz, Rewards) plus the Admin link at the bottom — same structure as
  today, just recolored.
- **Mobile (<768px):** sidebar replaced by a fixed bottom tab bar with 4
  primary items (Home, Course, Quiz, Rewards) plus a 5th "More" tab that
  opens a bottom sheet listing Notebook, Calendar, Mistakes, and Admin.
  Content area gets bottom padding so the tab bar never covers content.

Since the whole app becomes warm-themed, the `-m-8 p-8 bg-warm-cream-50`
background-bleed hack added to the 4 Course pages (worked around
`Layout.tsx`'s `<main>` still being pink) is no longer needed once
`Layout.tsx`'s own background is warm — remove it as part of this pass, one
less thing for those 4 files to carry.

## PWA fix

- Generate a real icon set (192×192, 512×512, maskable 512×512, Apple
  touch icon, a small SVG favicon/mask icon) using the chosen graduation-cap
  motif on a terracotta→sage gradient background, replacing the unused
  `heart.svg`.
- Update `vite.config.ts`'s `VitePWA` manifest: `theme_color` and
  `background_color` to the warm palette (terracotta / cream) instead of
  the old pink hex values; `includeAssets` list matches the files that
  actually exist after this pass.
- Update `index.html`: favicon link, `theme-color` meta tag, and (since the
  app already frames itself as "Gerda English Learning" — no need to
  invent new branding) keep the title/description text, just fix the
  colors and icon reference.
- Confirm after the change that `public/` actually contains every file the
  manifest and `index.html` reference — this was the root cause of the
  original breakage and is the one thing worth double-checking explicitly.

## Cleanup

Once every page is confirmed to use only `warm-*`/`cute-*`-free classes
(verified by grep, not assumed), the now-fully-unused `cute-*` Tailwind
color tokens and `.card-cute`/`.btn-cute`/etc. CSS classes get removed from
`tailwind.config.js`/`index.css` — dead code, no reason to keep it once
nothing references it. This is the last step, done only after every other
page is verified clean, to avoid breaking a page that turns out to still
reference something `cute-*`.

## Out of scope

- No content/logic changes to any page — this is styling only, structure
  and behavior stay identical.
- No change to the Course pages' actual content or checkpoint logic, only
  removing their now-redundant background hack.
- Not redesigning the admin panel's functionality, just its look.

## Testing

Same as always for this project: no automated test framework. Verification
is `npm run build` staying clean, plus a full manual walkthrough (desktop
width and a narrow/mobile viewport) once all pages are restyled.
