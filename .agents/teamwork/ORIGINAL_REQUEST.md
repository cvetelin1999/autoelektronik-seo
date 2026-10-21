# Original User Request

## 2026-10-21T04:33:23Z

Review, polish, and enhance all deliverables for the university SEO project AutoElektronik (CSCB700), covering both the live website implementation and all academic documentation (Mini-Project and Final Project).

Working directory: c:\Users\Asus\Documents\antigravity\hopeful-bardeen
Integrity mode: development

## Requirements

### R1. Website Implementation & UX/UI Review and Enhancement
Perform a rigorous review of all 11 pages of the website (index.astro, uslugi/*, otkrii-problema.astro, za-nas.astro, kontakti.astro, usloviya-za-polzvane.astro, zashtita-na-dannite.astro):
- Elevate design aesthetics, typography, and spacing to match modern automotive tech standards, building upon the Figma project reference in figma_assets/.
- Ensure mobile responsiveness, touch targets, and accessibility (WCAG AA).
- Enhance the interactive diagnostic wizard on /otkrii-problema/ with richer feedback, step animations, and realistic repair estimates.
- Keep the standalone compiled stylesheet in public/css/styles.css updated and ensure fast, zero-CLS layout stability.

### R2. Strict 30 Academic SEO Requirements Verification (CSCB700)
Independently audit and enforce every single one of the 30 requirements from Project Requirements - CSCB700.pdf:
- 100% W3C HTML validity (0 errors, 0 warnings across all routes).
- Check every <a> tag for descriptive title attributes.
- Check every <img> tag for explicit width, height, and keyword-rich alt attributes.
- Ensure all 3 XML sitemaps (sitemap.xml, image-sitemap.xml, video-sitemap.xml) are syntactically valid and properly declared in robots.txt.
- Confirm Open Graph meta tags, Schema.org structured data (AutoRepair, BreadcrumbList), and local SEO geo coordinates.

### R3. Academic Deliverables & Presentation Upgrades
Review and upgrade all written reports in docs/:
- Mini-Project Report (docs/02-Mini-Project-Planning-And-Competitor-Analysis.md): Deepen competitor analysis of the 3 competitors across the 5 perspectives (UX, link building, social media, content strategy, technical SEO) and Google Ads intelligence.
- University SEO Table (docs/03-University-SEO-Optimization-Table.md): Verify semantic mapping, focus keywords, and internal link architecture.
- Technical Documentation & Measurements (docs/04-Technical-Documentation-And-Measurements.md): Document performance scores (PageSpeed, Core Web Vitals) and backlink verification.
- Provide detailed slide-by-slide decks for both PowerPoint presentations (Mini-Project and Final Project).

## Acceptance Criteria

### Technical & Code Quality
- [ ] npm run build exits with code 0 in under 15 seconds without build warnings.
- [ ] Automated audit confirms 0 missing title attributes on links and 0 missing alt/width/height on images.
- [ ] Interactive diagnostic wizard functions end-to-end without console errors.
- [ ] All 3 sitemaps (/sitemap.xml, /image-sitemap.xml, /video-sitemap.xml) are accessible and valid.

### Visual & UX Standards
- [ ] Design renders consistently with professional styling on desktop, tablet, and mobile viewport sizes.
- [ ] Color contrast meets WCAG AA standards across all text elements.

### Academic Completeness
- [ ] All 30 requirements from CSCB700 are explicitly addressed, audited, and documented.
- [ ] Complete slide decks for both presentations are ready for export.
