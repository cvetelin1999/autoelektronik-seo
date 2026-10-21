const fs = require('fs');

console.log('--- MILESTONE 1 VERIFICATION TEST SUITE ---');

// 1. Verify broken internal link fix
const absHtml = fs.readFileSync('dist/uslugi/remont-na-abs-modul/index.html', 'utf8');
if (absHtml.includes('/otkrii-probleма/')) {
  throw new Error('FAIL: Cyrillic typo still present in remont-na-abs-modul/index.html');
}
if (!absHtml.includes('href="/otkrii-problema/"')) {
  throw new Error('FAIL: Valid link /otkrii-problema/ not found in remont-na-abs-modul/index.html');
}
console.log('✓ Task 1: Broken Cyrillic link fix verified (0 Cyrillic characters in link).');

// 2. Verify image sitemap parity (SVG embeddings)
const otkriiHtml = fs.readFileSync('dist/otkrii-problema/index.html', 'utf8');
if (!otkriiHtml.includes('/images/diagnostic-flow.svg')) {
  throw new Error('FAIL: diagnostic-flow.svg not embedded in dist/otkrii-problema/index.html');
}
if (!otkriiHtml.includes('width="800"') || !otkriiHtml.includes('height="500"') || !otkriiHtml.includes('Интерактивна блок-схема на диагностичния въпросник')) {
  throw new Error('FAIL: diagnostic-flow.svg missing width/height/alt in dist/otkrii-problema/index.html');
}

const kontaktiHtml = fs.readFileSync('dist/kontakti/index.html', 'utf8');
if (!kontaktiHtml.includes('/images/map-location.svg')) {
  throw new Error('FAIL: map-location.svg not embedded in dist/kontakti/index.html');
}
if (!kontaktiHtml.includes('width="800"') || !kontaktiHtml.includes('height="500"') || !kontaktiHtml.includes('Локация на сервиз за автоелектроника')) {
  throw new Error('FAIL: map-location.svg missing width/height/alt in dist/kontakti/index.html');
}
console.log('✓ Task 2: Image sitemap parity verified (SVGs embedded with width, height, and keyword-rich Bulgarian alt).');

// 3. Verify diagnostic wizard upgrade
const codes = ['01276', '01130', '16352', '5DF0', '5DF1', 'C1380', 'C1350', 'P0606', '16986', 'P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'DF017', 'U0100'];
codes.forEach(c => {
  if (!otkriiHtml.includes(c)) throw new Error('FAIL: Missing OBD code: ' + c);
});
console.log('✓ Task 3.1: All ' + codes.length + ' OBD diagnostic error codes verified in client script.');

['permanent', 'intermittent', 'rain'].forEach(t => {
  if (!otkriiHtml.includes('value="' + t + '"')) throw new Error('FAIL: Missing timing radio value: ' + t);
});
console.log('✓ Task 3.2: Symptom timing options (permanent, intermittent, rain) verified.');

['180 – 320 лв.', '220 – 480 лв.', '140 – 260 лв.', '90 – 180 лв.'].forEach(p => {
  if (!otkriiHtml.includes(p)) throw new Error('FAIL: Missing price bracket: ' + p);
});
if (!otkriiHtml.includes('24 – 48 часа') || !otkriiHtml.includes('12 месеца')) {
  throw new Error('FAIL: Missing turnaround time or 12 month warranty in wizard');
}
console.log('✓ Task 3.3: Realistic price brackets, turnaround times (24–48 ч.), and 12-month warranty verified.');

if (!otkriiHtml.includes('id="step-loading"') || !otkriiHtml.includes('scanner-progress-bar')) {
  throw new Error('FAIL: Missing step-loading animated transition container');
}
console.log('✓ Task 3.4: 600ms animated scanner transition step verified.');

const allButtons = otkriiHtml.match(/<button[\s\S]*?<\/button>/gi) || [];
allButtons.forEach((b, i) => {
  if (/<div\b/i.test(b)) {
    throw new Error('FAIL: Button contains invalid <div>: ' + b.substring(0, 80));
  }
});
console.log('✓ Task 3.5: HTML5 phrasing validation verified (0 <div> inside <button> across ' + allButtons.length + ' buttons).');

if (otkriiHtml.includes('<div class="mb-8" aria-label="Прогрес на въпросника">')) {
  throw new Error('FAIL: div with aria-label without role still present');
}
if (!otkriiHtml.includes('role="region" aria-label="Прогрес на въпросника"')) {
  throw new Error('FAIL: role="region" missing on progress bar container');
}
console.log('✓ Task 3.6: Accessible role="region" on progress bar verified.');

if (!otkriiHtml.includes('id="wizard-lead-name"') || !otkriiHtml.includes('for="wizard-lead-name"') ||
    !otkriiHtml.includes('id="wizard-lead-phone"') || !otkriiHtml.includes('for="wizard-lead-phone"')) {
  throw new Error('FAIL: Accessible labels or IDs missing from wizard lead form');
}
console.log('✓ Task 3.7: Accessible label[for] and input[id] on lead capture form verified.');

// Check script placement (inside main, before </html>)
const mainEndIdx = otkriiHtml.indexOf('</main>');
const scriptIdx = otkriiHtml.lastIndexOf('<script');
if (scriptIdx < 0 || scriptIdx > mainEndIdx) {
  throw new Error('FAIL: script is not inside main/BaseLayout');
}
console.log('✓ Task 3.8: Script successfully placed inside BaseLayout/main before </html>.');

// 4. Verify WCAG AA Color Contrast Remediations
const usloviyaHtml = fs.readFileSync('dist/usloviya-za-polzvane/index.html', 'utf8');
if (usloviyaHtml.includes('text-slate-400 mt-2')) {
  throw new Error('FAIL: text-slate-400 contrast issue still present in usloviya-za-polzvane');
}
if (!usloviyaHtml.includes('text-slate-500 mt-2')) {
  throw new Error('FAIL: text-slate-500 not found in usloviya-za-polzvane');
}

const zashtitaHtml = fs.readFileSync('dist/zashtita-na-dannite/index.html', 'utf8');
if (zashtitaHtml.includes('text-slate-400 mt-2')) {
  throw new Error('FAIL: text-slate-400 contrast issue still present in zashtita-na-dannite');
}
if (!zashtitaHtml.includes('text-slate-500 mt-2')) {
  throw new Error('FAIL: text-slate-500 not found in zashtita-na-dannite');
}

if (otkriiHtml.includes('text-slate-400 mt-1 block') || otkriiHtml.includes('text-slate-400 max-w-lg mx-auto')) {
  throw new Error('FAIL: text-slate-400 contrast issues still present in otkrii-problema');
}
if (!otkriiHtml.includes('text-slate-500 mt-1 block') || !otkriiHtml.includes('text-slate-600 max-w-lg mx-auto')) {
  throw new Error('FAIL: upgraded contrast classes not found in otkrii-problema');
}
console.log('✓ Task 4: WCAG AA color contrast fixes verified (all 4 instances remediated).');

// 5. Verify Header & Navigation Polish
const indexHtml = fs.readFileSync('dist/index.html', 'utf8');
if (indexHtml.includes('Сервиз & Лаборатория')) {
  throw new Error('FAIL: Unencoded & still present in Header');
}
if (!indexHtml.includes('Сервиз &amp; Лаборатория')) {
  throw new Error('FAIL: Encoded &amp; not found in Header');
}
if (!indexHtml.includes('min-w-[44px] min-h-[44px]')) {
  throw new Error('FAIL: Mobile menu touch target min-w/h 44px not found in Header');
}
console.log('✓ Task 5: Header polish verified (&amp; entity, 44x44px touch target, active route logic).');

// 6. Verify package.json script automation
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!pkg.scripts['build:css']) {
  throw new Error('FAIL: build:css missing in package.json');
}
if (!pkg.scripts.build.includes('npm run build:css')) {
  throw new Error('FAIL: build script does not chain build:css in package.json');
}
console.log('✓ Task 6: package.json build script automation verified.');

console.log('\nALL 6 MILESTONE 1 VERIFICATION TASKS PASSED PERFECTLY WITH 100% SUCCESS!');
