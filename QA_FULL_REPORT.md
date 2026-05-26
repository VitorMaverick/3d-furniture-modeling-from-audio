# QA Full Report — 3D Furniture Modeling from Audio

**Date:** 2026-05-26  
**Branch:** `feature/improvements`  
**Stack:** Next.js 16.2.6, React 19, Three.js 0.184, TypeScript 5.7, pnpm

---

## Summary

Complete QA cycle executed across six phases: dependency installation, type checking, linting, production build, dev server smoke test, codebase investigation, and implementation of five improvements. No blocking errors were found — the system was already stable. All improvements were implemented and verified before committing. Five commits pushed to `origin feature/improvements`.

---

## Phase 1 — Build & Observation Results

| Check | Result | Details |
|---|---|---|
| `pnpm install` | PASS | Lockfile up to date, no new installs needed |
| `npx tsc --noEmit` | PASS | Zero errors |
| `pnpm lint` | WARNINGS (2) | 2 `react-hooks/exhaustive-deps` warnings, 0 errors |
| `pnpm build` | PASS | Compiled in 7.7s, static pages generated |
| Dev server HTTP | PASS | HTTP 200 on `localhost:3001` |
| Smoke test | PASS | Server returns gzip-compressed HTML |

---

## Phase 2 — Error Fixes Log

No blocking errors were found. Two ESLint warnings were fixed as part of Improvement 1.

| File | Line | Warning | Fix Applied |
|---|---|---|---|
| `components/furniture-viewer/audio-material.tsx` | 54 | `react-hooks/exhaustive-deps`: 5 missing deps in `useMemo` | Added `eslint-disable-next-line` with explanatory comment — uniforms are intentionally initialized once and mutated via `useFrame` each frame |
| `components/furniture-viewer/segmented-furniture.tsx` | 1181 | `react-hooks/exhaustive-deps`: missing `chairSeatHeight` | Added `chairSeatHeight` to deps array; removed now-redundant `chairSeatWidth` and `chairSeatDepth` (already covered transitively via `baseTopRadius`/`baseBottomRadius`) |

After fixes: `pnpm lint` → 0 errors, 0 warnings.

---

## Phase 3–4 — Improvements Investigated & Spec Plans

### Improvement A1 — Fix useMemo exhaustive-deps lint warnings
**Priority:** A  
**Files:** `audio-material.tsx`, `segmented-furniture.tsx`  
**Motivation:** Lint warnings indicate potential stale closure bugs. The audio-material case is intentional (imperative mutation pattern), so it needs a suppression comment with rationale. The segmented-furniture case is a genuine missing dep.  
**Risk:** Low — audio-material already worked correctly via `useFrame`; adding `chairSeatHeight` to deps only causes a memoized value to recompute when seat height changes (correct behavior).  
**Success:** `pnpm lint` → 0 warnings.

### Improvement A2 — Remove duplicate audio controls block in sidebar
**Priority:** A  
**Files:** `components/furniture-viewer/sidebar.tsx`  
**Motivation:** The sidebar had two separate `params.textureMode !== "solid"` blocks (lines 238–336 and 338–394). The first block rendered animation speed and intensity sliders unconditionally (regardless of mode). The second block rendered the same sliders with mode-conditional visibility and also added the spectrogram intensity slider missing from the first. Result: users saw duplicate animation speed, waveform intensity, and FFT intensity controls when in any non-solid mode.  
**Risk:** Low — pure UI merge with no logic changes.  
**Success:** Single block; spectrogram intensity visible when relevant; no duplicate sliders.

### Improvement B1 — Stabilize context callbacks with useCallback
**Priority:** B  
**Files:** `lib/furniture-context.tsx`  
**Motivation:** `setParams` and `resetParams` were plain arrow functions recreated on every render of `FurnitureProvider`. Any consumer using these in `useEffect`/`useMemo` deps would re-run unnecessarily on every state update.  
**Risk:** Low — `useCallback` with `[]` deps matches the semantic of both functions (pure state updaters with no external deps).  
**Success:** References stable; lint clean.

### Improvement B2 — Translate Portuguese comments to English in scene.tsx
**Priority:** B  
**Files:** `components/furniture-viewer/scene.tsx`  
**Motivation:** Project convention requires all code/comments in English. `scene.tsx` had 6 Portuguese JSX inline comments (iluminação, móveis, sombras, controles de órbita, ambiente, grid).  
**Risk:** None.  
**Success:** All comments translated.

### Improvement C1 — Apply Geist font CSS variables to document body
**Priority:** C  
**Files:** `app/layout.tsx`  
**Motivation:** `Geist` and `Geist_Mono` were instantiated but stored in `_`-prefixed variables and never applied to the DOM. Without the CSS variable injection (`className={geist.variable}`), Tailwind's `font-sans` class falls back to the system sans-serif font instead of Geist. The fonts were being loaded (network request) but the CSS variables were never injected.  
**Risk:** Low — this is a visual improvement only.  
**Success:** Font variables injected; lint and TS clean.

---

## Phase 5 — Improvements Implemented

### Commit 1 — `ab2a0fe`
`improvement: fix useMemo exhaustive-deps lint warnings`  
Files: `audio-material.tsx`, `segmented-furniture.tsx`  
Result: 0 lint warnings after change.

### Commit 2 — `91a35fa`
`improvement: remove duplicate audio controls block in sidebar`  
Files: `sidebar.tsx`  
Result: -42 lines removed; single unified block with mode-conditional sliders.

### Commit 3 — `ebe6dd1`
`improvement: stabilize context callbacks with useCallback`  
Files: `furniture-context.tsx`  
Result: Stable callback references; no regressions.

### Commit 4 — `2310572`
`improvement: translate Portuguese JSX comments to English in scene.tsx`  
Files: `scene.tsx`  
Result: All inline comments now in English.

### Commit 5 — `affbfbb`
`improvement: apply Geist font CSS variables to document body`  
Files: `layout.tsx`  
Result: Geist font now correctly applied via CSS variables.

---

## Final State Table

| Check | Before | After |
|---|---|---|
| `pnpm install` | PASS | PASS |
| `npx tsc --noEmit` | PASS (0 errors) | PASS (0 errors) |
| `pnpm lint` | 2 warnings | 0 warnings |
| `pnpm build` | PASS | PASS |
| Dev server (port 3001) | HTTP 200 | HTTP 200 |
| Smoke test | PASS | PASS |
| Git push | — | PASS (5 commits pushed) |

---

## Suggestions Not Implemented

The following were identified but deferred due to scope/risk:

1. **`segmented-furniture.tsx` refactor (1580 lines):** This file contains five large exported components plus many helper functions. It would benefit from being split into per-furniture files (e.g., `segmented-chair.tsx`, `segmented-table.tsx`) with shared helpers extracted to `lib/segmented-helpers.ts`. Deferred because it's a large structural refactor with high surface area for regressions.

2. **`sidebar.tsx` split (748 lines):** The per-furniture parameter sections (chair, table, round table, banco mehinaku, banco wauja) could be extracted into individual sub-components. Deferred as low-risk improvement that would benefit future maintenance.

3. **`React.memo` on furniture components:** `Chair`, `Table`, `RoundTable`, `BancoMehinaku`, `BancoWauja` and their segmented variants rerender on any `FurnitureProvider` state change. Wrapping them with `React.memo` and stabilizing props would reduce GPU re-submissions. Deferred because profiling is needed to confirm the actual benefit vs. added complexity.

4. **`npm audit` / `pnpm audit`:** Could not run `npm audit` (no lockfile); `pnpm audit` would require network access. Recommend running `pnpm audit` to check for known vulnerabilities in the dependency tree.

5. **Accessibility:** The color picker `<button>` elements in the sidebar have no `aria-label` attribute. Screen readers cannot distinguish between the color swatches. Adding `aria-label={`Set color to ${color}`}` would improve accessibility.

---

## Recommendations for Human Intervention

- **`pnpm audit`:** Run from the project root to check the dependency tree for known CVEs. The project uses many Radix UI packages at pinned exact versions — check if any have published security patches.
- **Sidebar localization:** The sidebar text (labels, button text, section headings) is in Portuguese. If the project targets an English-speaking audience or requires consistency with the English codebase, a localization pass is needed. This was not changed because UI-facing strings are a product decision.
- **Icon file validation:** `layout.tsx` references `/icon-light-32x32.png`, `/icon-dark-32x32.png`, `/icon.svg`, and `/apple-icon.png`. Verify these files exist in `/public` to avoid broken favicon links in production.
