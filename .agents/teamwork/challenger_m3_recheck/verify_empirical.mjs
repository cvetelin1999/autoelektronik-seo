import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');
const DOCS_DIR = path.resolve('docs');
const SRC_DIR = path.resolve('src');

console.log('=== EMPIRICAL CHALLENGER INDEPENDENT VERIFICATION ===\n');

// 1. Verify 11 compiled pages exist
const expectedRoutes = [
  { route: '/', file: 'index.html', requiredTypes: ['AutoRepair', 'PostalAddress', 'GeoCoordinates'] },
  { route: '/uslugi/', file: 'uslugi/index.html', requiredTypes: ['CollectionPage', 'AutoRepair', 'BreadcrumbList'] },
  { route: '/uslugi/remont-na-abs-modul/', file: 'uslugi/remont-na-abs-modul/index.html', requiredTypes: ['ItemPage', 'Service', 'VideoObject', 'AutoRepair', 'BreadcrumbList'] },
  { route: '/uslugi/remont-na-ecu-kompyutar/', file: 'uslugi/remont-na-ecu-kompyutar/index.html', requiredTypes: ['ItemPage', 'Service', 'AutoRepair', 'BreadcrumbList'] },
  { route: '/uslugi/remont-na-avtomobilno-tablo/', file: 'uslugi/remont-na-avtomobilno-tablo/index.html', requiredTypes: ['ItemPage', 'Service', 'AutoRepair', 'BreadcrumbList'] },
  { route: '/uslugi/avtodiagnostika/', file: 'uslugi/avtodiagnostika/index.html', requiredTypes: ['ItemPage', 'Service', 'AutoRepair', 'BreadcrumbList'] },
  { route: '/otkrii-problema/', file: 'otkrii-problema/index.html', requiredTypes: ['WebApplication', 'DiagnosticProcedure', 'AutoRepair', 'BreadcrumbList'] },
  { route: '/za-nas/', file: 'za-nas/index.html', requiredTypes: ['AboutPage', 'AutoRepair', 'BreadcrumbList'] },
  { route: '/kontakti/', file: 'kontakti/index.html', requiredTypes: ['ContactPage', 'AutoRepair', 'PostalAddress', 'GeoCoordinates', 'BreadcrumbList'] },
  { route: '/usloviya-za-polzvane/', file: 'usloviya-za-polzvane/index.html', requiredTypes: ['WebPage', 'AutoRepair', 'BreadcrumbList'] },
  { route: '/zashtita-na-dannite/', file: 'zashtita-na-dannite/index.html', requiredTypes: ['WebPage', 'AutoRepair', 'BreadcrumbList'] }
];

let schemaFailures = 0;
let jsonErrors = 0;
let totalCheckedAssertions = 0;

console.log('--- 1. SCHEMA.ORG JSON-LD MICRODATA PARITY ---');
for (const item of expectedRoutes) {
  const filePath = path.join(DIST_DIR, item.file);
  if (!fs.existsSync(filePath)) {
    console.error(`[ERROR] File missing: ${filePath}`);
    schemaFailures++;
    continue;
  }

  const html = fs.readFileSync(filePath, 'utf8');
  const scriptRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
  let match;
  const foundTypes = new Set();
  const scriptBlocks = [];

  while ((match = scriptRegex.exec(html)) !== null) {
    const rawJson = match[1];
    scriptBlocks.push(rawJson);
    try {
      const parsed = JSON.parse(rawJson);
      const extractTypes = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        if (obj['@type']) {
          if (Array.isArray(obj['@type'])) {
            obj['@type'].forEach(t => foundTypes.add(t));
          } else {
            foundTypes.add(obj['@type']);
          }
        }
        for (const key of Object.keys(obj)) {
          extractTypes(obj[key]);
        }
      };
      extractTypes(parsed);
    } catch (e) {
      console.error(`[JSON ERROR] in ${item.route}: ${e.message}`);
      jsonErrors++;
    }
  }

  console.log(`Route: ${item.route.padEnd(38)} | Script tags: ${scriptBlocks.length} | Found types: [${Array.from(foundTypes).join(', ')}]`);

  for (const reqType of item.requiredTypes) {
    totalCheckedAssertions++;
    if (!foundTypes.has(reqType)) {
      console.error(`  [FAIL] Missing required type: ${reqType} on route ${item.route}`);
      schemaFailures++;
    }
  }
}

console.log(`\nSchema Assertion Summary: Checked ${totalCheckedAssertions} type requirements across 11 routes.`);
console.log(`JSON parsing errors: ${jsonErrors}`);
console.log(`Schema assertion failures: ${schemaFailures}`);

// 2. Line Number Sync in docs/04-Technical-Documentation-And-Measurements.md § 3
console.log('\n--- 2. LINE NUMBER CITATIONS SYNC IN docs/04 § 3 ---');

const baseLayoutContent = fs.readFileSync(path.join(SRC_DIR, 'layouts', 'BaseLayout.astro'), 'utf8').split('\n');
const headerContent = fs.readFileSync(path.join(SRC_DIR, 'components', 'Header.astro'), 'utf8').split('\n');
const docs04Content = fs.readFileSync(path.join(DOCS_DIR, '04-Technical-Documentation-And-Measurements.md'), 'utf8');

// Check Req #3: BaseLayout.astro:32
const req3Line = baseLayoutContent[31] || ''; // 0-indexed line 32
console.log(`Req #3 -> BaseLayout.astro line 32: "${req3Line.trim()}"`);
const req3Valid = req3Line.includes("siteUrl = 'https://autoelektronik-service.bg'");
console.log(`  Target siteUrl matches: ${req3Valid ? 'PASS' : 'FAIL'}`);

// Check Req #13: Header.astro:42-55
const req13Chunk = headerContent.slice(41, 55).join('\n'); // lines 42 to 55
console.log(`Req #13 -> Header.astro lines 42-55:\n${req13Chunk.trim()}`);
const req13Valid = req13Chunk.includes('<nav class="hidden md:block" aria-label="Основна навигация">') && req13Chunk.includes('<ul') && req13Chunk.includes('<li');
console.log(`  Strict nav list matches: ${req13Valid ? 'PASS' : 'FAIL'}`);

// Check Req #24: BaseLayout.astro:93-103
const req24Chunk = baseLayoutContent.slice(92, 103).join('\n'); // lines 93 to 103
console.log(`Req #24 -> BaseLayout.astro lines 93-103:\n${req24Chunk.trim()}`);
const req24Valid = req24Chunk.includes('og:title') && req24Chunk.includes('og:image') && req24Chunk.includes('og:description');
console.log(`  Open Graph tags match: ${req24Valid ? 'PASS' : 'FAIL'}`);

// Check Req #26: BaseLayout.astro:111-121
const req26Chunk = baseLayoutContent.slice(110, 121).join('\n'); // lines 111 to 121
console.log(`Req #26 -> BaseLayout.astro lines 111-121:\n${req26Chunk.trim()}`);
const req26Valid = req26Chunk.includes('google-site-verification') && req26Chunk.includes('gtag(');
console.log(`  GSC & GA4 tags match: ${req26Valid ? 'PASS' : 'FAIL'}`);

// Verify docs/04 table lines mention these exact locations
const docsHasReq3 = docs04Content.includes('src/layouts/BaseLayout.astro:32');
const docsHasReq13 = docs04Content.includes('src/components/Header.astro:42-55');
const docsHasReq24 = docs04Content.includes('src/layouts/BaseLayout.astro:93-103');
const docsHasReq26 = docs04Content.includes('src/layouts/BaseLayout.astro:111-121');

console.log(`Docs/04 citations check:
  - Req #3 cited BaseLayout.astro:32: ${docsHasReq3 ? 'PASS' : 'FAIL'}
  - Req #13 cited Header.astro:42-55: ${docsHasReq13 ? 'PASS' : 'FAIL'}
  - Req #24 cited BaseLayout.astro:93-103: ${docsHasReq24 ? 'PASS' : 'FAIL'}
  - Req #26 cited BaseLayout.astro:111-121: ${docsHasReq26 ? 'PASS' : 'FAIL'}
`);

const overallStatus = (schemaFailures === 0 && jsonErrors === 0 && req3Valid && req13Valid && req24Valid && req26Valid && docsHasReq3 && docsHasReq13 && docsHasReq24 && docsHasReq26);
console.log(`OVERALL INDEPENDENT VERIFICATION VERDICT: ${overallStatus ? 'APPROVE' : 'REQUEST_CHANGES'}`);
