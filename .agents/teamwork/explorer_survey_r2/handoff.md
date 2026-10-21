# Survey Report: Requirement R2 (Strict 30 Academic SEO Requirements Verification — CSCB700)

**Agent:** Academic SEO & CSCB700 Explorer (`explorer_survey_r2`)  
**Target:** University SEO Project AutoElektronik (CSCB700)  
**Date:** 2026-10-21  
**Scope:** Rigorous independent audit of all 30 academic SEO requirements from `Project Requirements - CSCB700.pdf` against the live website implementation, codebase, sitemaps, metadata, and documentation.

---

## 1. Observation

### 1.1 Primary Source Document Extraction
The primary requirement document `Project Requirements - CSCB700.pdf` was located on the system at:
`C:\Users\Asus\Desktop\gemini\SEO_University_Handover_Package\Project Requirements - CSCB700.pdf` (and `C:\Users\Asus\Desktop\uni\SEO\Project Requirements - CSCB700.pdf`).

Extracted verbatim using PyMuPDF (`fitz` / Unicode glyph decoding):
```text
Минимални изисквания към финален проект 
 
1. Да има поне една скриптова страница 
2. Валиден HTML код 
3. Да има домейн 
4. Да е на хостинг 
5. Сайтът да има: 
a. XML Sitemap 
b. XML Imagemap 
c. XML Videomap 
6. Да има поне 5 страници с авторски текст 
7. Да няма плагиатство 
8. Дължина на съдържанието 
9. Да има поне 8 изображения 
10. Всички изображения да имат височина и ширина 
11. Всички изображения да имат alt атрибут 
12. Всички линкове да имат title атрибут 
13. Да се използват където е удачно номерирани и неномерирани списъци (задължително при менютата) 
14. Дизайна да е responsive 
15. Поне една изходяща връзка 
16. Поне една входяща връзка 
17. Вътрешни връзки между страниците 
18. Четими URL адреси 
19. Ключови думи в URL 
20. Ключови думи в домейна 
21. Ключови думи в H1, .., H6 
22. Да има страница “Условия за ползване” и “Защита на данните” 
23. Google map + pin 
24. Facebook Open Graph tags в meta секцията 
25. Breadcrumbs 
26. Да има регистрация в Google Search Console и Google Analytics 
27. Всяка страница да е оптимизирана, като има списък от поне 5 ключови думи/фрази, и всички задължителни мета данни 
28. За всички страници да е попълнена примерната таблица за оптимизация 
29. Да е представена документация с измервания на сайта, бързина на зареждане и т.н. 
30. Презентация – PowerPoint 
```

### 1.2 Official W3C Nu Validator Audit (Requirement #2)
Each of the 11 compiled HTML pages in `dist/` was submitted to the official W3C Nu HTML Checker API (`https://validator.w3.org/nu/?out=json`).
Results:
- **`dist/index.html`**: 0 Errors, 0 Warnings (100% valid)
- **`dist/usloviya-za-polzvane/index.html`**: 0 Errors, 0 Warnings (100% valid)
- **`dist/za-nas/index.html`**: 0 Errors, 0 Warnings (100% valid)
- **`dist/zashtita-na-dannite/index.html`**: 0 Errors, 0 Warnings (100% valid)
- **`dist/kontakti/index.html`**: **4 Errors**, 0 Warnings
  - `Error: Bad value "100%" for attribute "width" on element "iframe": Expected a digit but saw "%" instead.`
  - `Error: Bad value "100%" for attribute "height" on element "iframe": Expected a digit but saw "%" instead.`
  - `Error: Stray start tag "script".` (Extract: `y></html> <script>`)
  - `Error: Cannot recover after last error. Any further errors will be ignored.`
- **`dist/otkrii-problema/index.html`**: **11 Errors**, 0 Warnings
  - `Error: The "aria-label" attribute must not be specified on any "div" element unless the element has a "role" value...` (Extract: `<div class="mb-8" aria-label="Прогрес на въпросника">`)
  - `Error (8 occurrences): Element "div" not allowed as child of element "button" in this context.`
  - `Error: Stray start tag "script".` (Extract: `y></html> <script>`)
  - `Error: Cannot recover after last error.`
- **`dist/uslugi/index.html`**: 0 Errors, **1 Warning**
  - `Warning: Section lacks heading. Consider using "h2"-"h6" elements to add identifying headings to all sections, or else use a "div" element instead...` (`<section class="py-16 bg-slate-50">`)
- **`dist/uslugi/avtodiagnostika/index.html`**: 0 Errors, **1 Warning**
  - `Warning: Section lacks heading...` (`<section class="py-16 bg-white">`)
- **`dist/uslugi/remont-na-abs-modul/index.html`**: 0 Errors, **1 Warning**
  - `Warning: Section lacks heading...` (`<section class="py-16 bg-white">`)
- **`dist/uslugi/remont-na-avtomobilno-tablo/index.html`**: 0 Errors, **1 Warning**
  - `Warning: Section lacks heading...` (`<section class="py-16 bg-white">`)
- **`dist/uslugi/remont-na-ecu-kompyutar/index.html`**: 0 Errors, **1 Warning**
  - `Warning: Section lacks heading...` (`<section class="py-16 bg-white">`)

**Summary of W3C Violations**:
- Total Errors: **15**
- Total Warnings: **5**
- Note: This contradicts the premature claim in `docs/04-Technical-Documentation-And-Measurements.md` of "0 errors and 0 warnings".

### 1.3 Links & Title Attributes Audit (Requirements #12, #15, #17)
- **Total links across 11 routes**: 331 `<a>` tags.
- **Missing title attributes**: **0** (100% compliance with title attributes).
- **Outgoing external links**: 11 occurrences (1 on each page in `Footer.astro`) to `https://www.bosch-mobility.com/en/solutions/diagnostics/` with `target="_blank"`, `rel="noopener noreferrer"`, and descriptive `title`.
- **Broken internal links**: **1 critical defect found**:
  - Location: `src/pages/uslugi/remont-na-abs-modul.astro`, line 202:
    `href="/otkrii-probleма/"`
  - Cause: Typo where the letters `м` (code 1084) and `а` (code 1072) are in Cyrillic instead of ASCII `m` and `a`.
  - Impact: Returns 404 in browser when clicked.

### 1.4 Images Audit (Requirements #9, #10, #11)
- **Total `<img>` tags across 11 HTML pages**: 16 tags.
- **Missing `alt` attributes**: **0** (100% keyword-rich Bulgarian descriptions).
- **Missing `width` attributes**: **0** (100% explicit dimensions).
- **Missing `height` attributes**: **0** (100% explicit dimensions).
- **Distinct SVG image files in `public/images/`**: 10 files:
  1. `author-certification.svg`
  2. `diagnostic-flow.svg`
  3. `hero-car-electronics.svg`
  4. `map-location.svg`
  5. `service-abs.svg`
  6. `service-diag.svg`
  7. `service-ecu.svg`
  8. `service-lab.svg`
  9. `service-tablo.svg`
  10. `video-repair-thumbnail.svg`
- **Distinct images rendered in HTML**: 8 files. (Images `diagnostic-flow.svg` and `map-location.svg` exist in `public/images/` and are listed in `image-sitemap.xml`, but are currently not rendered as `<img>` tags on `/otkrii-problema/` and `/kontakti/`).

### 1.5 XML Sitemaps & robots.txt Audit (Requirements #5a, #5b, #5c)
- **`public/robots.txt`**:
  Syntactically valid. Declares all 3 sitemaps:
  - `Sitemap: https://autoelektronik-service.bg/sitemap.xml`
  - `Sitemap: https://autoelektronik-service.bg/image-sitemap.xml`
  - `Sitemap: https://autoelektronik-service.bg/video-sitemap.xml`
- **`sitemap.xml`** (`src/pages/sitemap.xml.ts`):
  Valid XML. Lists all 11 routes with `lastmod`, `changefreq`, and `priority`.
- **`image-sitemap.xml`** (`src/pages/image-sitemap.xml.ts`):
  Valid XML with `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`. Lists 9 images with `loc`, `image:title`, `image:caption`.
- **`video-sitemap.xml`** (`src/pages/video-sitemap.xml.ts`):
  Valid XML with `xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"`.
  - Discrepancy 1: Points to `contentLoc: https://autoelektronik-service.bg/videos/abs-module-repair-lab.mp4`, but directory `public/videos/` does NOT exist in the repository (missing video file).
  - Discrepancy 2: Page `/uslugi/remont-na-abs-modul/` contains the thumbnail image but does not embed an actual HTML5 `<video>` element.

### 1.6 Metadata, Titles, Open Graph, and Schema.org
- **Title Duplication**:
  In `src/layouts/BaseLayout.astro`, lines 80-81:
  `<title>{title} | AutoElektronik</title>`
  `<meta name="title" content={`${title} | AutoElektronik`} />`
  `<meta property="og:title" content={`${title} | AutoElektronik`} />`
  All individual pages pass titles that already end with `| AutoElektronik` or `— AutoElektronik`.
  Result: Every page title renders with a double suffix (e.g. `... | AutoElektronik | AutoElektronik`), causing title lengths to reach 76–89 characters, exceeding the university guideline of "< 60 characters".
- **Missing OG and Schema image assets**:
  - In `BaseLayout.astro`: `ogImage = '/images/autoelektronik-social-share.jpg'` (file does NOT exist in `public/images/`).
  - In `localBusinessSchema`: `image: '${siteUrl}/images/service-lab.jpg'` (file does NOT exist; only `service-lab.svg` exists).
  - In `BaseLayout.astro`: `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />` (file does NOT exist in `public/`).
- **NAP Consistency (Name, Address, Phone)**:
  - Name: `AutoElektronik`
  - Address: `бул. „Цариградско шосе“ №115, 1784 София, BG`
  - Phone: `+359 88 812 3456` (`+359888123456` in schema)
  - Geo coordinates: `42.6617, 23.3853` (consistent across Schema.org `GeoCoordinates`, Google Maps embed, and contact page text).
- **Google Analytics 4**:
  `BaseLayout.astro` contains a partial stub defining `window.dataLayer` and `gtag('config', 'G-AELEKTRON700')`, but omits the async library loader `<script async src="https://www.googletagmanager.com/gtag/js?id=G-AELEKTRON700"></script>`.

### 1.7 Existing Audit and Validation Scripts
In `package.json`, only standard Astro scripts are defined (`dev`, `start`, `build`, `preview`, `astro`).
There is NO npm script for automated SEO auditing, link checking, attribute validation, or W3C testing.

---

## 2. Logic Chain

1. **Premise**: University project grading under CSCB700 requires 100% strict compliance with all 30 items in `Project Requirements - CSCB700.pdf`.
2. **Observation**: `docs/04-Technical-Documentation-And-Measurements.md` claims:
   - "W3C HTML Валидация: 11 от 11 страници, Грешки: 0, Предупреждения: 0".
3. **Factual Reality**: W3C Nu Validator proves there are **15 errors** and **5 warnings**:
   - `kontakti.astro` and `otkrii-problema.astro` append scripts outside `</BaseLayout>`, generating invalid HTML where `<script>` tags appear after `</html>`.
   - `<iframe>` in `kontakti.astro` uses percent signs (`width="100%"`), violating HTML5 element syntax.
   - `<button>` tags in `otkrii-problema.astro` enclose `<div>` elements, violating the HTML5 phrasing content model.
   - `<section>` tags in `uslugi/*.astro` lack heading elements.
4. **Impact**: An automated or manual academic check via `validator.w3.org` would immediately fail Requirement #2, invalidating the claim in `docs/04`.
5. **Observation**: On `/uslugi/remont-na-abs-modul/`, line 202 links to `/otkrii-probleма/` with Cyrillic characters.
6. **Impact**: Internal link checker and human evaluators clicking the link get a 404 error, hurting internal link integrity (Requirement #17).
7. **Observation**: In `src/layouts/BaseLayout.astro`, `| AutoElektronik` is appended unconditionally, resulting in duplicate branding and titles over 80 characters.
8. **Impact**: Violates snippet optimization guidelines and contradicts the "< 60 characters" target in `docs/03-University-SEO-Optimization-Table.md`.
9. **Observation**: Missing image assets (`autoelektronik-social-share.jpg`, `service-lab.jpg`, `abs-module-repair-lab.mp4`, `apple-touch-icon.png`) produce 404s in social debuggers (Facebook Sharing Debugger, Twitter Card Validator) and Google Video indexing bots.
10. **Conclusion**: Remediating these concrete code issues will elevate the project from "partially compliant with documentation discrepancies" to **100% verifiable academic excellence**.

---

## 3. Comprehensive Matrix: 30 Academic SEO Requirements (CSCB700)

| № | Изискване (Verbatim от PDF) | Текущ статус | Наличност в кода и доказателство | Какво трябва да се коригира / внедри |
|:---:|:---|:---:|:---|:---|
| **1** | **Да има поне една скриптова страница** | 🟢 **Satisfied** | `/otkrii-problema/` (`src/pages/otkrii-problema.astro`). 442 реда код, съдържащ стъпков съветник (избор на система, марка, симптоми), калкулация на вероятен дефект, ориентировъчна цена и контактна форма. | 1. Преместване на `<script is:inline>` вътре в `<BaseLayout>`.<br>2. Замяна на `<div>` вътре в `<button>` със `<span>`.<br>3. Обогатяване на анимациите и преходите (R1). |
| **2** | **Валиден HTML код** | 🟡 **Partial** | 4 от 11 страници са 100% чисти. Налични са **15 грешки** и **5 предупреждения** от официалния W3C Nu Checker (`w3c_results.json`). | 1. Премахване на stray script таговете след `</html>` в `kontakti` и `otkrii-problema`.<br>2. Премахване на `%` от `width`/`height` на `<iframe>` в `kontakti`.<br>3. Оправяне на `aria-label` върху `div` и `div` в `button` в `otkrii-problema`.<br>4. Замяна на `<section>` с `<div>` или добавяне на `<h2>` в `uslugi/*.astro`. |
| **3** | **Да има домейн** | 🟢 **Satisfied (Target)** | `https://autoelektronik-service.bg` е конфигуриран в `astro.config.mjs`, `BaseLayout.astro`, `sitemap.xml.ts`, `robots.txt` и каноничните адреси. | Академично документиран избор на TLD домейн с ключова дума. Готовност за регистрация/деплой при изискване за жива презентация. |
| **4** | **Да е на хостинг** | 🟢 **Satisfied (Static)** | Проектът компилира до чист статичен билд в `dist/` (`astro build` за 6.3 сек), готов за хостинг в Cloudflare Pages / Vercel / GitHub Pages. | Добавяне на скрипт за автоматичен билд и деплой към Cloudflare Pages. |
| **5a** | **XML Sitemap** | 🟢 **Satisfied** | `src/pages/sitemap.xml.ts` генерира валиден `sitemap.xml` с всички 11 публични URL адреса, `lastmod`, `changefreq` и `priority`. | Препоръчително генериране/копиране на статичен файл в `public/` като резервен вариант при чист файлов преглед. |
| **5b** | **XML Imagemap** | 🟢 **Satisfied** | `src/pages/image-sitemap.xml.ts` генерира валиден `image-sitemap.xml` с 9 снимки, `loc`, `image:title`, `image:caption`. | Включване на реални `<img>` елементи за `diagnostic-flow.svg` в `/otkrii-problema/` и `map-location.svg` в `/kontakti/`, за да съвпадат 100% с декларираното в sitemap-а. |
| **5c** | **XML Videomap** | 🟡 **Partial** | `src/pages/video-sitemap.xml.ts` генерира синтактично валиден XML с пълни Google тагове за видео за ремонт на ABS модул. | 1. Създаване на физически видео файл `public/videos/abs-module-repair-lab.mp4` (или реална връзка), за да няма 404.<br>2. Вграждане на `<video>` плейър в `remont-na-abs-modul.astro`. |
| **6** | **Да има поне 5 страници с авторски текст** | 🟢 **Satisfied** | 6 дълбочинни авторски страници: `/` (Начало), `/uslugi/remont-na-abs-modul/`, `/uslugi/remont-na-ecu-kompyutar/`, `/uslugi/remont-na-avtomobilno-tablo/`, `/uslugi/avtodiagnostika/`, `/za-nas/`. | Разширяване на обема на текста (виж №8). |
| **7** | **Да няма плагиатство** | 🟢 **Satisfied** | Текстовете са 100% уникални на български език, с високоспециализирана инженерна терминология (бондинг проводници, ATE MK60, Bosch EDC17, осцилоскопия, IPC-7711). | Запазване на авторската оригиналност при добавяне на нови текстови блокове. |
| **8** | **Дължина на съдържанието** | 🟡 **Partial** | Обемът на страниците е между 220 и 390 думи. В плана (`01-Project-Plan-And-Requirements.md`) е заложен целеви диапазон 450–800 думи за услугите. | Разширяване на текста в авторските страници с детайлни сервизни протоколи, симптоматика, етапи на рециклиране и гаранционни клаузи до 500+ думи. |
| **9** | **Да има поне 8 изображения** | 🟢 **Satisfied** | 10 авторски SVG графики в `public/images/`. 8 уникални изображения са вградени в `<img>` тагове през сайта (общо 16 екземпляра). | Добавяне на липсващите 2 изображения в съответните страници, за да се показват и десетте. |
| **10** | **Всички изображения да имат височина и ширина** | 🟢 **Satisfied** | 16 от 16 (100%) `<img>` тага имат изрични `width` и `height` в HTML кода. 0 пропуснати атрибута (проверено с Python скрипт). | Запазване на стриктната дисциплина при добавяне на нови изображения. |
| **11** | **Всички изображения да имат alt атрибут** | 🟢 **Satisfied** | 16 от 16 (100%) `<img>` тага имат подробни, наситени с ключови думи `alt` атрибути на български език. | Запазване на стриктната дисциплина. |
| **12** | **Всички линкове да имат title атрибут** | 🟢 **Satisfied** | Всички 331 `<a>` тага в сайта имат изричен и непразен `title` атрибут (проверено машинно). | Коригиране на сгрешения target URL адрес при 1 вътрешна връзка (виж №17). |
| **13** | **Да се използват където е удачно номерирани и неномерирани списъци (задължително при менютата)** | 🟢 **Satisfied** | Навигация десктоп: `<nav><ul><li>...`, мобилна навигация: `<nav><ul><li>...`, футър менюта: 3 отделни `<ul><li>...` списъка. Трохи: `<ol><li>...`. Списъци със симптоми и етапи във всички услуги. | Няма забележки. |
| **14** | **Дизайна да е responsive** | 🟢 **Satisfied** | Адаптивен дизайн с Tailwind CSS: флуидни брейкпойнти, мобилно хамбургер меню, touch таргети. | Допълнително полиране по Figma спецификациите в R1. |
| **15** | **Поне една изходяща връзка** | 🟢 **Satisfied** | Линк във футъра на всяка страница към официалния портал на *Bosch Mobility Diagnostics* (`https://www.bosch-mobility.com/en/solutions/diagnostics/`) с `rel="noopener noreferrer"`. | Няма забележки. |
| **16** | **Поне една входяща връзка** | 🟡 **Partial (Plan)** | Документирана стратегия в `docs/04-Technical-Documentation-And-Measurements.md` (външен беклинк от GitHub/Behance портфолио с точен анкър текст). | Създаване на реален жив линк след публично публикуване на сайта в интернет. |
| **17** | **Вътрешни връзки между страниците** | 🟡 **Partial** | Богата кръстосана мрежа от над 300 вътрешни връзки. Открита е обаче **1 счупена връзка** с кирилски букви в `remont-na-abs-modul.astro:202`: `href="/otkrii-probleма/"`. | Замяна на кирилските букви `м` и `а` с латински: `href="/otkrii-problema/"`. |
| **18** | **Четими URL адреси** | 🟢 **Satisfied** | Кратки, семантични slugs на латиница без излишни параметри (`/uslugi/remont-na-abs-modul/`, `/otkrii-problema/`). | Няма забележки. |
| **19** | **Ключови думи в URL** | 🟢 **Satisfied** | Всички адреси съдържат фокусни термини: `remont-na-abs-modul`, `remont-na-ecu-kompyutar`, `avtodiagnostika`, `otkrii-problema`. | Няма забележки. |
| **20** | **Ключови думи в домейна** | 🟢 **Satisfied** | Домейнът `autoelektronik-service.bg` съдържа две ключови думи: `autoelektronik` и `service`. | Описано и аргументирано в университетската документация. |
| **21** | **Ключови думи в H1, .., H6** | 🟢 **Satisfied** | Стриктна йерархия: точно един `<h1>` на страница с главната ключова фраза, тематични `<h2>` и `<h3>` за симптоми и процеси. | Коригиране на предупрежденията за `<section>` без заглавие. |
| **22** | **Да има страница “Условия за ползване” и “Защита на данните”** | 🟢 **Satisfied** | Две напълно функционални страници: `/usloviya-za-polzvane/` и `/zashtita-na-dannite/`, свързани във футъра. И двете имат 0 W3C грешки. | Няма забележки. |
| **23** | **Google map + pin** | 🟡 **Partial** | Вградена Google карта с точен маркер в `kontakti.astro` за бул. „Цариградско шосе“ №115. Атрибутите `width="100%"` и `height="100%"` обаче чупят W3C валидацията. | Коригиране на атрибутите на `<iframe>` към валидни числови стойности или CSS класове. |
| **24** | **Facebook Open Graph tags в meta секцията** | 🟡 **Partial** | Пълни OG тагове в `BaseLayout.astro`. Но `og:title` се дублира накрая (`| AutoElektronik | AutoElektronik`), а изображението `/images/autoelektronik-social-share.jpg` липсва физически (404). | 1. Премахване на двойния брандинг в заглавието.<br>2. Добавяне на физическо изображение за социално споделяне 1200x630px. |
| **25** | **Breadcrumbs** | 🟢 **Satisfied** | Компонентът `Breadcrumbs.astro` генерира семантична HTML навигация `<nav><ol><li>` и Schema.org `BreadcrumbList` JSON-LD на всички 10 вътрешни страници. | Няма забележки. |
| **26** | **Да има регистрация в Google Search Console и Google Analytics** | 🟢 **Satisfied (Stubs)** | Внедрени `google-site-verification` мета таг и GA4 конфигурационен код в `BaseLayout.astro`. | Добавяне на пълния асинхронен зареждащ скрипт за `googletagmanager.com/gtag/js`. |
| **27** | **Всяка страница да е оптимизирана, като има списък от поне 5 ключови думи/фрази, и всички задължителни мета данни** | 🟢 **Satisfied** | Всички 11 страници имат дефинирани точно по 5 таргетирани фрази в `<meta name="keywords">`, уникален `<meta name="description">`, каноничен адрес и Open Graph. | Оптимизиране на дължината на заглавията до 60 знака (в момента са 76–89 знака поради двойния суфикс). |
| **28** | **За всички страници да е попълнена примерната таблица за оптимизация** | 🟢 **Satisfied** | Налична в `docs/03-University-SEO-Optimization-Table.md` с всички 11 страници, URL, заглавия, описания, H1, 5 фрази, Alt и вътрешни линкове. | Синхронизиране на таблицата след коригиране на мета заглавията. |
| **29** | **Да е представена документация с измервания на сайта, бързина на зареждане и т.н.** | 🟡 **Partial** | `docs/04-Technical-Documentation-And-Measurements.md` описва детайлно PageSpeed, Core Web Vitals и W3C валидация, но съдържа неточно твърдение за "0 грешки и 0 предупреждения". | Актуализиране на документацията след реалното отстраняване на W3C грешките с точни команди за независима проверка. |
| **30** | **Презентация – PowerPoint** | 🟡 **Partial (Plan)** | План и структура от 12 слайда са описани в `docs/04` Раздел 5. Изискване R3 поставя задача за пълен слайд-по-слайд дек. | Изготвяне на детайлни слайдове за експорт и презентиране пред комисията. |

---

## 4. Deep-Dive Findings & Technical Discrepancies

### 4.1 Root Cause Analysis of W3C Validation Failures
1. **Astro Component Hoisting Error**:
   In both `src/pages/kontakti.astro` and `src/pages/otkrii-problema.astro`, script tags are placed after `</BaseLayout>`:
   ```astro
   <!-- Bottom of kontakti.astro -->
   </BaseLayout>

   <script is:inline>
     document.getElementById('contact-page-form')?.addEventListener(...)
   </script>
   ```
   Because `BaseLayout.astro` contains `</body></html>`, Astro renders the `<script>` after the closing `</html>` tag, causing a fatal W3C error:
   `Stray start tag "script"`.
   **Fix**: Move all scripts inside `<BaseLayout> ... </BaseLayout>` or place them in an Astro `<script>` tag.

2. **Button Flow Content Violation**:
   In `src/pages/otkrii-problema.astro`, lines 125–135:
   ```astro
   <button type="button" class="symptom-btn ...">
     <div class="w-10 h-10 ...">...</div>
     <div>
       <span class="block ...">Липса на комуникация (CAN-Bus)</span>
     </div>
   </button>
   ```
   HTML5 forbids `<div>` (flow content) inside `<button>` (phrasing content only).
   **Fix**: Replace `<div class="...">` inside `<button>` with `<span class="...">`.

3. **Iframe Attribute Syntax Violation**:
   In `src/pages/kontakti.astro`, lines 225–226:
   ```astro
   <iframe width="100%" height="100%" ...></iframe>
   ```
   The HTML5 specification requires `width` and `height` attributes on `<iframe>` to be non-negative integers (in CSS pixels).
   **Fix**: Use CSS classes `class="w-full h-full"` and omit `%` attributes or use numeric attributes `width="1200" height="500"`.

4. **Section Without Heading Warnings**:
   In `src/pages/uslugi/*.astro`, container sections lack headings:
   ```astro
   <section class="py-16 bg-slate-50">
   ```
   **Fix**: Use `<div class="py-16 bg-slate-50">` or add an accessible `<h2 class="sr-only">Специализирани сервизни услуги</h2>`.

### 4.2 Broken Link in ABS Module Service Page
- **File**: `src/pages/uslugi/remont-na-abs-modul.astro`, line 202:
  ```astro
  <a
    href="/otkrii-probleма/"
    title="Направи интерактивния диагностичен тест за спирачна система"
    class="text-xs font-bold text-brand-700 hover:text-brand-900 underline"
  >
  ```
  The letters `м` (U+043C) and `а` (U+0430) are Unicode Cyrillic. In web servers and static builds, this resolves to `%D0%BC%D0%B0`, causing an immediate 404 HTTP status.
  **Fix**: Change to `href="/otkrii-problema/"`.

### 4.3 Meta Title Length & Duplication
- **File**: `src/layouts/BaseLayout.astro`, line 80:
  ```astro
  <title>{title} | AutoElektronik</title>
  ```
  Individual pages pass:
  ```astro
  title="Ремонт на ABS модул и помпа — 12 Месеца Гаранция | AutoElektronik"
  ```
  Rendered output:
  ```html
  <title>Ремонт на ABS модул и помпа — 12 Месеца Гаранция | AutoElektronik | AutoElektronik</title>
  ```
  **Fix**: Clean the template logic in `BaseLayout.astro`:
  ```astro
  const fullTitle = title.includes('AutoElektronik') ? title : `${title} | AutoElektronik`;
  ```

### 4.4 Missing Assets in `public/`
1. **Video File**: `public/videos/abs-module-repair-lab.mp4` is referenced in `video-sitemap.xml.ts` but does not exist on disk.
2. **Social Share Graphic**: `public/images/autoelektronik-social-share.jpg` (1200x630px) is referenced in Open Graph tags and Twitter Cards but does not exist.
3. **Apple Touch Icon**: `public/apple-touch-icon.png` is referenced in `<link rel="apple-touch-icon">` but does not exist.
4. **Schema Image**: `service-lab.jpg` referenced in `localBusinessSchema` does not exist (`service-lab.svg` exists).

---

## 5. Audit Tools & Script Recommendations

Currently, `package.json` contains no linting or validation scripts. To ensure continuous compliance and fulfill Acceptance Criteria ("Automated audit confirms 0 missing title attributes on links and 0 missing alt/width/height on images"), the following scripts should be added:

### Recommended `package.json` Addition
```json
"scripts": {
  "dev": "astro dev",
  "start": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "audit": "node scripts/audit.mjs",
  "validate:w3c": "node scripts/validate-w3c.mjs"
}
```

A dedicated automated audit script (`scripts/audit.mjs`) should inspect `dist/` and enforce:
- 0 missing `title` on `<a>` tags.
- 0 missing `alt`, `width`, or `height` on `<img>` tags.
- 0 broken internal links (including Cyrillic character checks in URLs).
- Valid XML parsing of all 3 sitemaps.
- Verification that all declared sitemap images and videos physically exist.

---

## 6. Caveats

1. **Read-Only Explorer Mission**: As an explorer, no changes were directly applied to project code. All code observations and recommendations are documented for the implementing agents.
2. **Live Domain and Backlink**: Domain registration (`autoelektronik-service.bg`) and the external backlink (Requirement #16) represent operational milestones that depend on live DNS and external hosting environments. They are thoroughly specified and staged in code and academic documentation.
3. **Word Counts**: The CSCB700 PDF does not specify a minimum word count number for Requirement #8 ("Дължина на съдържанието"), but the project's own strategic plan specifies 450–800 words. Current service pages average ~300 words.

---

## 7. Conclusion

Requirement R2 has a solid, well-architected foundation in Astro 4 with strong semantic styling and impressive baseline SEO parameters (0 missing title attributes across 331 links, 0 missing image dimensions or alt tags across all 16 images, 3 valid XML sitemaps, and NAP consistency).

However, **there are critical technical violations that would prevent a perfect academic grade if left unaddressed**:
1. **15 W3C validation errors and 5 warnings** across `kontakti.astro`, `otkrii-problema.astro`, and the service routes (contradicting the documentation in `docs/04`).
2. **1 broken internal link** with Cyrillic characters in `remont-na-abs-modul.astro:202`.
3. **Title tag double branding** resulting in titles exceeding 60 characters.
4. **Missing media assets** (`abs-module-repair-lab.mp4`, `autoelektronik-social-share.jpg`, `apple-touch-icon.png`).
5. **Absence of an automated `npm run audit` script** in `package.json`.

Following the precise remediation steps detailed in this report will achieve **100% genuine W3C validity (0 errors, 0 warnings)** and complete verification across all 30 academic SEO requirements.

---

## 8. Verification Method

To independently verify all findings in this report, execute the following commands in the project root:

1. **Build Project**:
   ```powershell
   npm run build
   ```
   *Expected result*: Compiles 11 HTML pages and 3 XML sitemaps into `dist/` in under 10 seconds.

2. **Verify Links, Images, and Heading Compliance**:
   Run the Python audit script created during this survey:
   ```powershell
   python .agents/teamwork/explorer_survey_r2/audit_dist.py
   ```
   *Expected output*: 331 links (0 missing title), 16 images (0 missing alt/w/h).

3. **Verify W3C HTML Validation**:
   Run the live W3C Nu Validator script:
   ```powershell
   python .agents/teamwork/explorer_survey_r2/validate_w3c.py
   ```
   *Inspect*: `.agents/teamwork/explorer_survey_r2/w3c_results.json` showing 4 errors on `kontakti/index.html` and 11 errors on `otkrii-problema/index.html`.

4. **Verify Internal Links & Cyrillic Typo**:
   Run:
   ```powershell
   python -c "content = open('src/pages/uslugi/remont-na-abs-modul.astro', encoding='utf-8').read(); [print('Typo at line 202:', m) for m in __import__('re').findall(r'href=[\x22\x27][^\x22\x27]+[\x22\x27]', content) if any(ord(c) > 127 for c in m)]"
   ```
   *Expected output*: Displays `href="/otkrii-probleма/"`.

5. **Verify Sitemaps XML Syntax**:
   ```powershell
   python -c "import xml.etree.ElementTree as ET; [print(f, ET.parse(f).getroot().tag) for f in ['dist/sitemap.xml', 'dist/image-sitemap.xml', 'dist/video-sitemap.xml']]"
   ```
   *Expected output*: All 3 return `{http://www.sitemaps.org/schemas/sitemap/0.9}urlset`.
