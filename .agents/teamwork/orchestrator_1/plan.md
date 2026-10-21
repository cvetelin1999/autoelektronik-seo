# Orchestration Plan — AutoElektronik (CSCB700) SEO Project

## Objective
Review, polish, enhance, and rigorously verify all deliverables for the university SEO project AutoElektronik (CSCB700), ensuring production-grade code, 100% compliance with all 30 academic SEO requirements, and academic deliverables/presentations.

## Phases

### Phase 0: Survey & Scope Mapping
- Dispatch 3 Explorers in parallel:
  - `explorer_r1`: Audit website implementation, 11 Astro pages, components, CSS, Figma alignment, mobile UX, diagnostic wizard, build performance.
  - `explorer_r2`: Audit academic SEO requirements from CSCB700.pdf, XML sitemaps, robots.txt, Schema.org, Open Graph, W3C HTML validity, tags audit (a titles, img alt/dimensions).
  - `explorer_r3`: Audit academic documentation in `docs/` (02, 03, 04 reports) and presentation decks for Mini-Project and Final Project.
- Collect reports, deduplicate, synthesize into `PROJECT.md` with complete Feature Inventory.

### Phase 1: Decomposition & Interface Design
- Formulate milestone breakdown:
  - Milestone 1: Website Implementation, Modern Automotive Styling, Mobile UX, WCAG AA, Diagnostic Wizard Enhancement, Zero CLS.
  - Milestone 2: Technical SEO Engine & 30 CSCB700 Requirements (HTML validity, link titles, img attributes, 3 sitemaps, robots.txt, Open Graph, Schema.org, geo).
  - Milestone 3: Academic Deliverables & Presentation Decks (Docs 02, 03, 04 upgrades, slide decks for Mini-Project & Final Project).
  - Milestone 4: E2E Verification & Auditing (Automated audit scripts, build verification, W3C validation, Forensic Integrity Audit).

### Phase 2: Execution & Verification Loop
- For each milestone:
  - Dispatch Worker to implement targeted enhancements.
  - Dispatch Reviewers & Challengers to verify build, tests, visual/UX standards, and SEO compliance.
  - Dispatch Forensic Auditor for integrity verification.
  - Gate check and evaluate pass/fail criteria.

### Phase 3: Final Synthesis & Parent Reporting
- Verify all acceptance criteria are met:
  - `npm run build` exits 0 without warnings in < 15s.
  - 0 missing title attributes, 0 missing alt/width/height.
  - Interactive diagnostic wizard runs smoothly without errors.
  - 3 valid XML sitemaps.
  - Responsive design, WCAG AA color contrast.
  - All 30 CSCB700 requirements addressed and documented.
  - Slide decks ready for export.
- Send completion message to Sentinel.
