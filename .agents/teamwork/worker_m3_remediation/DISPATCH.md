## 2026-10-21T06:05:35Z
You are the Remediation Worker for Milestone 3 (Academic Deliverables & Schema.org Parity).
Your Working Directory: c:\Users\Asus\Documents\antigravity\hopeful-bardeen\.agents\teamwork\worker_m3_remediation
Original Request Path: c:\Users\Asus\Documents\antigravity\hopeful-bardeen\.agents\teamwork\ORIGINAL_REQUEST.md
Challenger 1 Report Path: c:\Users\Asus\Documents\antigravity\hopeful-bardeen\.agents\teamwork\challenger_m3_1\handoff.md
Master SEO Table Path: c:\Users\Asus\Documents\antigravity\hopeful-bardeen\docs\03-University-SEO-Optimization-Table.md
Technical Docs Path: c:\Users\Asus\Documents\antigravity\hopeful-bardeen\docs\04-Technical-Documentation-And-Measurements.md

Read ORIGINAL_REQUEST.md and challenger_m3_1/handoff.md first.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Assigned Scope:
1. Schema.org JSON-LD Microdata Parity:
   Challenger 1 found that `docs/03` and `docs/04` declare specialized Schema.org types for each route, but `src/layouts/BaseLayout.astro` only rendered global `AutoRepair` and `Breadcrumbs.astro` rendered `BreadcrumbList`.
   Update `src/layouts/BaseLayout.astro` to generate authentic, rich, valid Schema.org JSON-LD structured data tailored to each page route (or accept custom schema objects):
   - For `/` (Homepage): keep `AutoRepair`, `PostalAddress`, `GeoCoordinates`, `OpeningHoursSpecification`.
   - For `/uslugi/`: Add `@type: 'CollectionPage'` with name "Сервизни Услуги по Автоелектроника", description, and `hasPart` listing the 4 service URLs.
   - For `/uslugi/remont-na-abs-modul/`: Add `@type: 'ItemPage'`, `@type: 'Service'` (name: "Ремонт на ABS Модул и Помпа", serviceType: "Ремонт на автоелектроника", provider: AutoElektronik reference, areaServed: "София, България"), and `@type: 'VideoObject'` (name: "Процес по рециклиране и диагностика на ABS модул", description: "Лабораторна диагностика и микроелектронно запояване на ABS модули", thumbnailUrl: "https://autoelektronik-service.bg/images/video-repair-thumbnail.svg", contentUrl: "https://autoelektronik-service.bg/videos/abs-module-repair-lab.mp4", uploadDate: "2026-03-15").
   - For `/uslugi/remont-na-ecu-kompyutar/`: Add `@type: 'ItemPage'` and `@type: 'Service'` (name: "Ремонт и Клониране на ECU Компютър").
   - For `/uslugi/remont-na-avtomobilno-tablo/`: Add `@type: 'ItemPage'` and `@type: 'Service'` (name: "Ремонт на Автомобилни Табла и Дисплеи").
   - For `/uslugi/avtodiagnostika/`: Add `@type: 'ItemPage'` and `@type: 'Service'` (name: "Компютърна Автодиагностика").
   - For `/otkrii-problema/`: Add `@type: 'WebApplication'` (name: "AutoElektronik Интерактивен Диагностичен Съветник", applicationCategory: "UtilityApplication", operatingSystem: "All") and `@type: 'DiagnosticProcedure'`.
   - For `/za-nas/`: Add `@type: 'AboutPage'`.
   - For `/kontakti/`: Add `@type: 'ContactPage'`.
   - For `/usloviya-za-polzvane/`: Add `@type: 'WebPage'`.
   - For `/zashtita-na-dannite/`: Add `@type: 'WebPage'`.
   Ensure that every single schema type declared in `docs/03` is rendered in `dist/` and valid JSON-LD syntax.

2. Line Number Synchronizations in `docs/04-Technical-Documentation-And-Measurements.md`:
   In § 3 table of `docs/04`:
   - Req #3: change citation to `src/layouts/BaseLayout.astro:32` (where `siteUrl = 'https://autoelektronik-service.bg'` is defined).
   - Req #13: change citation to `src/components/Header.astro:42-55` (where `<nav><ul><li>` navigation list is located).
   - Req #24: change citation to `src/layouts/BaseLayout.astro:93-103` (where `<meta property="og:...">` tags are rendered).
   - Req #26: change citation to `src/layouts/BaseLayout.astro:111-121` (where Google Search Console token and GA4 script are rendered).

3. Verification:
   - Run `npm run build` and ensure exit 0 in < 15s.
   - Run `npm run audit` and ensure 100% PASS with 0 violations.
   - Run `npm run validate:w3c` and ensure 0 errors, 0 warnings.
   - Verify that all 32 Schema.org assertions pass across all 11 compiled pages in `dist/`.

Write your full implementation and verification report to:
`c:\Users\Asus\Documents\antigravity\hopeful-bardeen\.agents\teamwork\worker_m3_remediation\handoff.md`
When finished, send a message to orchestrator parent (`b57832c4-ddf1-4844-9dbc-b736d5eb1551`).

## 2026-10-21T07:10:15Z
**Context**: Status check on Milestone 3 remediation
**Content**: task-172 (`npx vnu-jar --format json dist`) appears to be stalled parsing binary files in dist/. Please check task status, cancel if hung, validate only the 11 HTML files, and finish your handoff report.
**Action**: Report your current progress and deliver handoff.md.
