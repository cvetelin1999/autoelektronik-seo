## 2026-10-21T04:49:09Z

You are the Worker for Milestone 1 (Website Implementation & Modern UX/UI).
Your Working Directory: c:\Users\Asus\Documents\antigravity\hopeful-bardeen\.agents\teamwork\worker_m1
Original Request Path: c:\Users\Asus\Documents\antigravity\hopeful-bardeen\.agents\teamwork\ORIGINAL_REQUEST.md
Scope Document Path: c:\Users\Asus\Documents\antigravity\hopeful-bardeen\.agents\teamwork\orchestrator_1\PROJECT.md
Explorer Survey Handoff: c:\Users\Asus\Documents\antigravity\hopeful-bardeen\.agents\teamwork\explorer_survey_r1\handoff.md

Read ORIGINAL_REQUEST.md, PROJECT.md, and explorer_survey_r1/handoff.md before starting work.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Assigned Scope (Milestone 1):
1. Fix Broken Internal Link (Cyrillic Typo):
   In `src/pages/uslugi/remont-na-abs-modul.astro`, line 202: replace `href="/otkrii-probleма/"` with `href="/otkrii-problema/"`.
2. Image Sitemap Parity:
   - Embed `public/images/diagnostic-flow.svg` in `src/pages/otkrii-problema.astro` with explicit `width="800"`, `height="500"`, and keyword-rich Bulgarian `alt`.
   - Embed `public/images/map-location.svg` in `src/pages/kontakti.astro` with explicit `width="800"`, `height="500"`, and keyword-rich Bulgarian `alt`.
3. Diagnostic Wizard Upgrade (`src/pages/otkrii-problema.astro`):
   - Add dynamic OBD error code matching in the client script (e.g. 01276, 01130, 16352, 5DF0, 5DF1, C1380, C1350, P0606, 16986, P0300-P0304).
   - Evaluate symptom timing radios (permanent, intermittent, rain) in the diagnostic logic.
   - Display realistic price brackets (ABS: 180–320 лв., ECU: 220–480 лв., Dashboard: 140–260 лв., CAN-bus: 90–180 лв.), turnaround times (24–48 ч.), and 12 months warranty.
   - Add a 600ms animated scanner/calculation transition step with progress bar between Step 3 and Step 4.
   - Replace any `<div>` inside `<button>` with `<span>` to ensure HTML5 phrasing validation.
   - Remove `aria-label` from `div` without role (or set `role="region"`).
   - Add accessible `<label for="...">` and explicit `id` attributes to lead form inputs (`#wizard-lead-name`, `#wizard-lead-phone`).
   - Move inline `<script>` inside `<BaseLayout>` so it doesn't get hoisted after `</html>`.
   - Ensure `#restart-wizard-btn` resets all inputs, results, forms, and timing selections cleanly.
4. WCAG AA Color Contrast Remediations:
   - `src/pages/usloviya-za-polzvane.astro:34`: change `text-slate-400` to `text-slate-500`.
   - `src/pages/zashtita-na-dannite.astro:34`: change `text-slate-400` to `text-slate-500`.
   - `src/pages/otkrii-problema.astro:201`: change `text-slate-400` to `text-slate-500`.
   - `src/pages/otkrii-problema.astro:322`: change `text-slate-400` to `text-slate-600`.
5. Header & Navigation Polish (`src/components/Header.astro`):
   - Line 37: replace `&` with `&amp;`.
   - Line 87: ensure `#mobile-menu-btn` touch target has `min-w-[44px] min-h-[44px] flex items-center justify-center`.
   - Line 108: adjust mobile active route check to match desktop logic.
6. Standalone Stylesheet Build Automation:
   - In `package.json`, add `"build:css": "tailwindcss -i ./src/styles/global.css -o ./public/css/styles.css --minify"`.
   - Chain `"build": "npm run build:css && astro build"`.
7. Build & Test Verification:
   - Run `npm run build` and verify exit code 0 in under 15 seconds.
   - Verify zero console errors or broken links.
