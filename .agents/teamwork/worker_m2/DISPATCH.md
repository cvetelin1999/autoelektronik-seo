## 2026-10-21T05:10:51Z
You are the Worker for Milestone 2 (Strict Academic SEO Engine & W3C Validity).
Your Working Directory: c:\Users\Asus\Documents\antigravity\hopeful-bardeen\.agents\teamwork\worker_m2
Original Request Path: c:\Users\Asus\Documents\antigravity\hopeful-bardeen\.agents\teamwork\ORIGINAL_REQUEST.md
Scope Document Path: c:\Users\Asus\Documents\antigravity\hopeful-bardeen\.agents\teamwork\orchestrator_1\PROJECT.md
Explorer Survey Handoff: c:\Users\Asus\Documents\antigravity\hopeful-bardeen\.agents\teamwork\explorer_survey_r2\handoff.md

Read ORIGINAL_REQUEST.md, PROJECT.md, and explorer_survey_r2/handoff.md before starting work.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Assigned Scope (Milestone 2):
1. 100% W3C HTML5 Validity (0 Errors, 0 Warnings across all 11 routes):
   - In `src/pages/kontakti.astro`:
     * Remove `%` from `<iframe>` `width="100%"` and `height="100%"`. Use CSS `class="w-full h-full border-0"` and valid integer attributes (e.g. `width="1200" height="500"`).
     * Ensure all `<script>` tags are strictly located inside `<BaseLayout>` before `</BaseLayout>` so no stray scripts appear after `</html>`.
   - In `src/pages/uslugi/index.astro` and all 4 service pages (`avtodiagnostika.astro`, `remont-na-abs-modul.astro`, `remont-na-ecu-kompyutar.astro`, `remont-na-avtomobilno-tablo.astro`):
     * Resolve the W3C warning "Section lacks heading" on `<section class="py-16 ...">` by either replacing non-heading wrapper `<section>` with `<div class="py-16 ...">` or adding an accessible heading (e.g. `<h2 class="sr-only">...</h2>`).
   - Across all pages and components (including `Footer.astro`):
     * Encode all raw ampersands `&` to `&amp;` where used in text.
2. Meta Title Optimization & De-duplication:
   - In `src/layouts/BaseLayout.astro`:
     * Prevent double branding:
       `const fullTitle = title.includes('AutoElektronik') ? title : `${title} | AutoElektronik`;`
     * Use `fullTitle` in `<title>`, `<meta name="title">`, and `<meta property="og:title">`.
     * Verify that all page titles remain crisp and <= 60 characters.
   - Point `localBusinessSchema.image` to an existing valid file (e.g. `${siteUrl}/images/service-lab.svg` or `/images/autoelektronik-social-share.jpg`) to avoid 404s.
3. Media Assets & Video Player Implementation:
   - Create valid media files in `public/`:
     * `public/videos/abs-module-repair-lab.mp4`: Create a valid, playable MP4 file (or use ffmpeg / node buffer generator) so that `video-sitemap.xml` URL does not 404.
     * `public/images/autoelektronik-social-share.jpg`: Create a high-quality 1200x630 JPG banner for Open Graph and Twitter Card sharing.
     * `public/apple-touch-icon.png`: Create a 180x180 PNG touch icon.
   - In `src/pages/uslugi/remont-na-abs-modul.astro`:
     * Embed a real HTML5 `<video controls preload="metadata" poster="/images/video-repair-thumbnail.svg" class="w-full rounded-2xl shadow-lg border border-slate-200">` with `<source src="/videos/abs-module-repair-lab.mp4" type="video/mp4" />` and informative fallback text, satisfying Requirement #5c.
4. GA4 Async Loader:
   - In `src/layouts/BaseLayout.astro`, ensure `<script async src="https://www.googletagmanager.com/gtag/js?id=G-AELEKTRON700"></script>` is present alongside the dataLayer configuration.
5. Automated SEO Audit & Validation Scripts:
   - Create `scripts/audit.mjs` verifying:
     * 0 missing `title` on `<a>` tags.
     * 0 missing `alt`, `width`, `height` on `<img>` tags.
     * 0 broken internal links (with Cyrillic homoglyph detection).
     * 3 XML sitemaps parse valid XML.
     * All sitemap images and videos physically exist on disk.
   - Create `scripts/validate-w3c.mjs` to test compiled HTML pages against the W3C Nu HTML Checker API.
   - In `package.json`, add:
     * `"audit": "node scripts/audit.mjs"`
     * `"validate:w3c": "node scripts/validate-w3c.mjs"`
6. Verification:
   - Run `npm run build` and verify code 0 in <15s.
   - Run `npm run audit` and verify 100% PASS with 0 violations.
   - Run `npm run validate:w3c` and confirm 0 errors and 0 warnings.
