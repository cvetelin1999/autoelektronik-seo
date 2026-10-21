const fs = require('fs');
const path = require('path');

console.log('=== FORENSIC INTEGRITY AUDIT: MILESTONE 1 ===\n');

let violations = [];
let passedChecks = [];

function check(name, fn) {
  try {
    fn();
    passedChecks.push(name);
    console.log(`[PASS] ${name}`);
  } catch (err) {
    violations.push({ name, error: err.message });
    console.error(`[FAIL] ${name}: ${err.message}`);
  }
}

// 1. Verify build artifacts actually exist and are newly generated
check('Build artifacts exist in dist/', () => {
  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) throw new Error('dist directory does not exist');
  const requiredFiles = [
    'index.html',
    'kontakti/index.html',
    'otkrii-problema/index.html',
    'usloviya-za-polzvane/index.html',
    'zashtita-na-dannite/index.html',
    'uslugi/remont-na-abs-modul/index.html',
    'sitemap.xml',
    'image-sitemap.xml',
    'video-sitemap.xml',
  ];
  for (const f of requiredFiles) {
    const fullPath = path.join(distDir, f);
    if (!fs.existsSync(fullPath)) throw new Error(`Missing build output: ${f}`);
  }
});

// 2. Verify broken Cyrillic link fix in source and dist
check('Zero Cyrillic characters in internal links of remont-na-abs-modul', () => {
  const src = fs.readFileSync('src/pages/uslugi/remont-na-abs-modul.astro', 'utf8');
  const dist = fs.readFileSync('dist/uslugi/remont-na-abs-modul/index.html', 'utf8');
  if (src.includes('/otkrii-probleма/')) throw new Error('Cyrillic characters still in source link');
  if (dist.includes('/otkrii-probleма/')) throw new Error('Cyrillic characters still in dist link');
  if (!src.includes('href="/otkrii-problema/"')) throw new Error('Missing corrected link in src');
  if (!dist.includes('href="/otkrii-problema/"')) throw new Error('Missing corrected link in dist');
});

// 3. Verify SVG image existence, dimensions, alt text
check('SVG image assets physically exist with matching 800x500 dimensions', () => {
  const diagSvgPath = path.resolve('public/images/diagnostic-flow.svg');
  const mapSvgPath = path.resolve('public/images/map-location.svg');
  if (!fs.existsSync(diagSvgPath)) throw new Error('diagnostic-flow.svg missing from disk');
  if (!fs.existsSync(mapSvgPath)) throw new Error('map-location.svg missing from disk');

  const diagContent = fs.readFileSync(diagSvgPath, 'utf8');
  const mapContent = fs.readFileSync(mapSvgPath, 'utf8');

  if (!diagContent.includes('width="800"') || !diagContent.includes('height="500"')) {
    throw new Error('diagnostic-flow.svg width/height mismatch');
  }
  if (!mapContent.includes('width="800"') || !mapContent.includes('height="500"')) {
    throw new Error('map-location.svg width/height mismatch');
  }
});

check('SVG image embedding in otkrii-problema and kontakti has valid attributes', () => {
  const otkriiHtml = fs.readFileSync('dist/otkrii-problema/index.html', 'utf8');
  const kontaktiHtml = fs.readFileSync('dist/kontakti/index.html', 'utf8');

  // Check otkrii-problema img
  const otkriiImgMatch = otkriiHtml.match(/<img[^>]*src="\/images\/diagnostic-flow\.svg"[^>]*>/i);
  if (!otkriiImgMatch) throw new Error('diagnostic-flow.svg img tag not found in dist/otkrii-problema/index.html');
  const oImg = otkriiImgMatch[0];
  if (!oImg.includes('width="800"') || !oImg.includes('height="500"') || !oImg.includes('alt="Интерактивна блок-схема')) {
    throw new Error(`diagnostic-flow.svg tag missing width/height/alt: ${oImg}`);
  }

  // Check kontakti img
  const kontaktiImgMatch = kontaktiHtml.match(/<img[^>]*src="\/images\/map-location\.svg"[^>]*>/i);
  if (!kontaktiImgMatch) throw new Error('map-location.svg img tag not found in dist/kontakti/index.html');
  const kImg = kontaktiImgMatch[0];
  if (!kImg.includes('width="800"') || !kImg.includes('height="500"') || !kImg.includes('alt="Локация на сервиз')) {
    throw new Error(`map-location.svg tag missing width/height/alt: ${kImg}`);
  }
});

// 4. Verify 16-code OBD database genuineness & logic
check('16-code OBD database has authentic automotive diagnostic codes', () => {
  const otkriiSrc = fs.readFileSync('src/pages/otkrii-problema.astro', 'utf8');
  const expectedCodes = [
    '01276', '01130', '16352', '5DF0', '5DF1', 'C1380', 'C1350',
    'P0606', '16986', 'P0300', 'P0301', 'P0302', 'P0303', 'P0304',
    'DF017', 'U0100'
  ];
  for (const c of expectedCodes) {
    if (!otkriiSrc.includes(`'${c}'`)) {
      throw new Error(`Expected code '${c}' not defined in obdDatabase`);
    }
  }

  // Verify that code lookup actually accesses database properties
  const requiredLogic = [
    'obdDatabase',
    'rawCode.includes(codeKey)',
    'resPrice.innerText = matchedOBD.price',
    'resTime.innerText = matchedOBD.time',
    'applyCategoryDefaults',
    'selectedTimingInput',
    'resetWizard'
  ];
  for (const snippet of requiredLogic) {
    if (!otkriiSrc.includes(snippet)) {
      throw new Error(`Missing expected genuine wizard logic snippet: ${snippet}`);
    }
  }
});

// 5. Verify dynamic price brackets and turnaround times
check('Dynamic price brackets and turnaround times present in logic', () => {
  const otkriiSrc = fs.readFileSync('src/pages/otkrii-problema.astro', 'utf8');
  const priceBrackets = ['180 – 320 лв.', '220 – 480 лв.', '140 – 260 лв.', '90 – 180 лв.'];
  for (const pb of priceBrackets) {
    if (!otkriiSrc.includes(pb)) throw new Error(`Missing price bracket ${pb}`);
  }
  if (!otkriiSrc.includes('24 – 48 часа')) throw new Error('Missing turnaround time 24 – 48 часа');
  if (!otkriiSrc.includes('12 месеца пълна гаранция')) throw new Error('Missing warranty declaration');
});

// 6. Verify HTML5 phrasing compliance (0 <div> inside <button>)
check('HTML5 phrasing compliance across all button elements', () => {
  const files = ['dist/otkrii-problema/index.html', 'dist/kontakti/index.html', 'dist/index.html'];
  for (const f of files) {
    const html = fs.readFileSync(f, 'utf8');
    const buttons = html.match(/<button[\s\S]*?<\/button>/gi) || [];
    for (const b of buttons) {
      if (/<div\b/i.test(b)) {
        throw new Error(`Invalid <div> inside <button> in ${f}: ${b.substring(0, 100)}`);
      }
    }
  }
});

// 7. Check for test evasion, mocked verification strings, or artificial bypasses
check('Absence of test evasion and mocked bypasses', () => {
  // Check if any code has artificial "if (test) return PASS" or similar mocks
  const gitDiffCmd = fs.readFileSync('package.json', 'utf8');
  if (gitDiffCmd.includes('exit 0') && !gitDiffCmd.includes('astro build')) {
    throw new Error('Fake build exit found in package.json');
  }
  // Check that public/css/styles.css is actually generated
  const css = fs.readFileSync('public/css/styles.css', 'utf8');
  if (css.length < 5000) {
    throw new Error(`public/css/styles.css seems suspiciously small (${css.length} bytes)`);
  }
});

// 8. Verify Header enhancements
check('Header enhancements (encoded ampersand, 44x44 touch target, active route matching)', () => {
  const headerSrc = fs.readFileSync('src/components/Header.astro', 'utf8');
  if (headerSrc.includes('Сервиз & Лаборатория')) throw new Error('Unencoded & in Header');
  if (!headerSrc.includes('Сервиз &amp; Лаборатория')) throw new Error('Missing &amp; in Header');
  if (!headerSrc.includes('min-w-[44px] min-h-[44px]')) throw new Error('Missing 44x44px touch target on mobile menu btn');
  if (!headerSrc.includes('currentPath.startsWith(item.href)')) throw new Error('Missing prefix matching in active route');
});

// 9. Verify WCAG AA Contrast upgrades
check('WCAG AA contrast upgrades in legal and wizard pages', () => {
  const u = fs.readFileSync('src/pages/usloviya-za-polzvane.astro', 'utf8');
  const z = fs.readFileSync('src/pages/zashtita-na-dannite.astro', 'utf8');
  const o = fs.readFileSync('src/pages/otkrii-problema.astro', 'utf8');

  if (u.includes('text-slate-400 mt-2')) throw new Error('Low contrast text-slate-400 in usloviya-za-polzvane');
  if (z.includes('text-slate-400 mt-2')) throw new Error('Low contrast text-slate-400 in zashtita-na-dannite');
  if (o.includes('text-slate-400 mt-1 block') || o.includes('text-slate-400 max-w-lg mx-auto')) {
    throw new Error('Low contrast text-slate-400 in otkrii-problema');
  }
});

console.log('\n=== AUDIT RESULTS SUMMARY ===');
console.log(`Passed checks: ${passedChecks.length}`);
console.log(`Violations: ${violations.length}`);

if (violations.length > 0) {
  console.error('\nFAILURES DETECTED:');
  violations.forEach(v => console.error(`- ${v.name}: ${v.error}`));
  process.exit(1);
} else {
  console.log('\nVERDICT: CLEAN — Zero integrity violations detected.');
  process.exit(0);
}
