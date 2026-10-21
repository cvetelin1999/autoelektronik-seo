# Project: AutoElektronik (CSCB700) University SEO Optimization

## Architecture
- **Framework**: Astro 4 Static Site Generator (SSG) with zero runtime JS for content pages.
- **Styling**: Tailwind CSS compiling to standalone stylesheet `public/css/styles.css`, custom automotive design system.
- **Client Scripting**: Vanilla JavaScript for the interactive diagnostic wizard in `src/pages/otkrii-problema.astro`.
- **Metadata & SEO**: Centralized in `src/layouts/BaseLayout.astro` (Open Graph, Twitter Cards, Schema.org `AutoRepair` and `BreadcrumbList`, GeoCoordinates, NAP).
- **XML Sitemaps**: Dynamic TypeScript endpoints (`src/pages/*.xml.ts`) generating `sitemap.xml`, `image-sitemap.xml`, and `video-sitemap.xml`.
- **Academic Documentation**: Markdown reports in `docs/` (`02`, `03`, `04`) and slide-by-slide presentation decks (`05`, `06`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Fix Cyrillic URL Typo | Replace `href="/otkrii-probleма/"` with `/otkrii-problema/` in `remont-na-abs-modul.astro:202` (fixes 404) | M1 | Survey R1/R2 |
| 2 | Sitemap-to-DOM Parity for SVGs | Embed `diagnostic-flow.svg` in `otkrii-problema.astro` and `map-location.svg` in `kontakti.astro` with width/height/alt | M1 | Survey R1/R2 |
| 3 | Diagnostic Wizard Upgrade | Implement OBD code lookup (01276, 5DF0, P0606, etc.), timing radios, price brackets (180-320 лв.), turnaround (24-48h), animation loading step, form labels | M1 | Survey R1 |
| 4 | WCAG AA Color Contrast | Upgrade `text-slate-400` to `text-slate-500`/`600` on white backgrounds in legal pages and wizard | M1 | Survey R1 |
| 5 | Header & Navigation Polish | Encode `&amp;` at line 37, expand mobile menu button touch target to 44x44px min, harmonize active route check | M1 | Survey R1 |
| 6 | Automate Stylesheet Build | Chain `"build:css"` into `"build"` script in `package.json` for automated Tailwind compilation | M1 | Survey R1 |
| 7 | W3C HTML5 100% Validity | Fix stray script tags after `</html>` in `kontakti` and `otkrii-problema`, fix iframe dimensions, replace div in button with span, fix section headings | M2 | Survey R2 |
| 8 | Meta Title De-duplication | Eliminate double branding (`| AutoElektronik | AutoElektronik`) in `BaseLayout.astro`, keeping titles crisp and <= 60 chars | M2 | Survey R2 |
| 9 | Missing Media Assets | Create `abs-module-repair-lab.mp4`, `autoelektronik-social-share.jpg` (1200x630), `apple-touch-icon.png` (180x180), embed `<video>` player in ABS page | M2 | Survey R2 |
| 10 | GA4 & GSC Enhancements | Ensure complete async GA4 loader and Google verification tags in `BaseLayout.astro` | M2 | Survey R2 |
| 11 | Automated Audit Script | Add `scripts/audit.mjs` and npm scripts (`audit`, `validate:w3c`) to verify links, images, sitemaps, titles | M2 | Survey R2 |
| 12 | Deepen Competitor Report (`docs/02`) | Expand Competitors 2 & 3 across all 5 university perspectives, add quantitative benchmark matrix, add Bulgarian Google Ads intelligence | M3 | Survey R3 |
| 13 | Master SEO Table (`docs/03`) | Add mandatory `Meta Description` column (150-160 chars), keyword densities, search intent labels, exact anchor texts, Schema mapping | M3 | Survey R3 |
| 14 | 30/30 Requirements Audit (`docs/04`) | Expand table from 15 to all 30 requirements verbatim with code evidence and verified PASS; add CWV breakdown, sitemap validations, 3 Mermaid diagrams, backlink proof | M3 | Survey R3 |
| 15 | Mini-Project Deck (`docs/05`) | Standalone 12-slide presentation deck with layouts, bullet points, verbatim Bulgarian speaker notes, defense Q&A | M3 | Survey R3 |
| 16 | Final Project Deck (`docs/06`) | Standalone 16-slide presentation deck covering implementation, 30/30 requirements, measurements, Bulgarian speaker notes, defense Q&A | M3 | Survey R3 |
| 17 | E2E Audit & Forensic Verification | Run automated audits, verify build exit code 0 in <15s, 0 missing titles/alt/dimensions, 0 W3C errors/warnings, 3 valid sitemaps, forensic integrity audit | M4 | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Website Implementation & Modern UX/UI | Features #1, #2, #3, #4, #5, #6: 11 pages styling, wizard enhancement, broken link fix, SVG embedding, WCAG AA, package.json build script | none | DONE |
| M2 | Strict Academic SEO Engine & W3C Validity | Features #7, #8, #9, #10, #11: 100% W3C HTML validity (0 errors, 0 warnings), title de-duplication, media assets, GA4 loader, automated audit script, XML XSD schema sequence | M1 | DONE |
| M3 | Academic Deliverables & Presentation Decks | Features #12, #13, #14, #15, #16: Upgrades to `docs/02`, `docs/03`, `docs/04`, and authoring `docs/05-Mini-Project-Presentation-Deck.md` & `docs/06-Final-Project-Presentation-Deck.md` | M1, M2 | DONE |
| M4 | E2E Verification & Forensic Integrity Audit | Feature #17: Comprehensive build verification, automated link/image audit, W3C validation, review, challenge, and forensic integrity audit | M1, M2, M3 | DONE |

## Interface Contracts
### `src/layouts/BaseLayout.astro` ↔ All Pages
- Props:
  - `title`: string (page specific title; template checks if it already contains `AutoElektronik` before appending)
  - `description`: string (140-160 characters unique meta description)
  - `keywords`: string (exactly 5 comma-separated keywords per Req #27)
  - `ogImage`: string (defaults to `/images/autoelektronik-social-share.jpg`)
  - `canonicalUrl`: string (canonical URL matching siteUrl + route)
- Inline Scripts:
  - All page-specific scripts must be passed inside `<BaseLayout>` slot to avoid hoisting after `</html>`.

### Diagnostic Wizard (`src/pages/otkrii-problema.astro`)
- State machine:
  - Step 1: Category selection (`abs`, `ecu`, `tablo`, `can`)
  - Step 2: Brand selection (VAG, BMW, Mercedes, Opel, PSA, Renault, Toyota, Ford, Друга)
  - Step 3: Timing radio selection (`permanent`, `intermittent`, `rain`) + optional OBD code (`#error-code-input`)
  - Loading State: 600ms animated scanner transition
  - Step 4: Diagnosis summary, matched code, realistic price range (e.g. `180 – 320 лв.`), turnaround (`24 – 48 ч.`), warranty (`12 месеца`), lead capture form with accessible labels, and complete reset handler.

## Code Layout
- `src/layouts/BaseLayout.astro`: Master layout, meta tags, Schema.org, Open Graph
- `src/components/Header.astro`: Desktop & mobile navigation, logo, call CTA
- `src/components/Footer.astro`: Footer navigation, NAP, Bosch external link, copyright
- `src/components/Breadcrumbs.astro`: Schema.org BreadcrumbList navigation
- `src/pages/index.astro`: Homepage
- `src/pages/uslugi/index.astro`: Service category index
- `src/pages/uslugi/avtodiagnostika.astro`: Diagnostics service page
- `src/pages/uslugi/remont-na-abs-modul.astro`: ABS module repair service page & video player
- `src/pages/uslugi/remont-na-ecu-kompyutar.astro`: ECU repair service page
- `src/pages/uslugi/remont-na-avtomobilno-tablo.astro`: Instrument cluster repair service page
- `src/pages/otkrii-problema.astro`: Interactive diagnostic wizard & flow diagram
- `src/pages/za-nas.astro`: About lab & certifications
- `src/pages/kontakti.astro`: Contact details, Google Map embed & static location graphic
- `src/pages/usloviya-za-polzvane.astro`: Terms of service
- `src/pages/zashtita-na-dannite.astro`: Privacy & GDPR policy
- `src/pages/sitemap.xml.ts`, `image-sitemap.xml.ts`, `video-sitemap.xml.ts`: Sitemaps
- `public/css/styles.css`: Compiled standalone stylesheet
- `public/images/`: Optimized SVG and WebP graphics
- `public/videos/`: Service demonstration videos
- `scripts/audit.mjs`: Automated audit script for link titles, image dimensions/alt, sitemaps
- `docs/`: Academic documentation files (`01` through `06`)
