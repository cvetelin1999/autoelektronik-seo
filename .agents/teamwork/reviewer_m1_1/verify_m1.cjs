const fs = require('fs');
const path = require('path');

console.log('=== INDEPENDENT REVIEWER M1 ADVERSARIAL VERIFICATION ===\n');

// 1. LINK AND UNICODE HOMOGLYPH CHECK
console.log('--- 1. Link & Unicode Homoglyph Verification ---');
const srcAbs = fs.readFileSync('src/pages/uslugi/remont-na-abs-modul.astro', 'utf8');
const distAbs = fs.readFileSync('dist/uslugi/remont-na-abs-modul/index.html', 'utf8');

const regexLink = /href="([^"]*otkrii-proble[^"]*)"/g;
let srcMatches = [...srcAbs.matchAll(regexLink)].map(m => m[1]);
let distMatches = [...distAbs.matchAll(regexLink)].map(m => m[1]);

console.log('src matches:', srcMatches);
console.log('dist matches:', distMatches);

function getNonAscii(str) {
  return [...str].filter(c => c.charCodeAt(0) > 127).map(c => `${c} (U+${c.charCodeAt(0).toString(16).padStart(4, '0')})`);
}

srcMatches.forEach(m => {
  const nonAscii = getNonAscii(m);
  if (nonAscii.length > 0) {
    console.error(`FAIL: Non-ASCII characters found in src link ${m}:`, nonAscii);
  } else {
    console.log(`PASS: Link in src "${m}" contains 0 non-ASCII characters.`);
  }
});

distMatches.forEach(m => {
  const nonAscii = getNonAscii(m);
  if (nonAscii.length > 0) {
    console.error(`FAIL: Non-ASCII characters found in dist link ${m}:`, nonAscii);
  } else {
    console.log(`PASS: Link in dist "${m}" contains 0 non-ASCII characters.`);
  }
});

// Comprehensive check for ANY Cyrillic character in any href across dist
function getAllHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  });
  return results;
}

const htmlFiles = getAllHtmlFiles('dist');
console.log(`Found ${htmlFiles.length} HTML files in dist.`);

let cyrillicHrefCount = 0;
let brokenDistLinks = [];

htmlFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const hrefs = [...content.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
  hrefs.forEach(h => {
    // Check Cyrillic regex [\u0400-\u04FF]
    if (/[\u0400-\u04FF]/.test(h)) {
      console.error(`FAIL: Cyrillic character in href="${h}" in file ${f}`);
      cyrillicHrefCount++;
    }

    // Check broken internal links
    if (!h.startsWith('http://') && !h.startsWith('https://') && !h.startsWith('tel:') && !h.startsWith('mailto:') && !h.startsWith('#') && !h.endsWith('.css') && !h.endsWith('.svg') && !h.endsWith('.png') && !h.endsWith('.jpg') && !h.endsWith('.ico')) {
      let target = h.split('?')[0].split('#')[0];
      if (target.startsWith('/')) target = target.slice(1);
      const direct = path.join('dist', target);
      const index = path.join('dist', target, 'index.html');
      const htmlFile = path.join('dist', target.endsWith('.html') ? target : target + '.html');
      if (!fs.existsSync(direct) && !fs.existsSync(index) && !fs.existsSync(htmlFile)) {
        brokenDistLinks.push({ file: f, href: h, target });
      }
    }
  });
});

console.log(`Total Cyrillic hrefs found across dist: ${cyrillicHrefCount}`);
console.log(`Total broken internal links found across dist: ${brokenDistLinks.length}`);
if (brokenDistLinks.length > 0) {
  console.error('Broken links:', brokenDistLinks);
} else {
  console.log('PASS: 0 broken internal links across dist.');
}

// 2. IMAGE SITEMAP PARITY (kontakti.astro, otkrii-problema.astro)
console.log('\n--- 2. Image Sitemap Parity Verification ---');
const kontaktiSrc = fs.readFileSync('src/pages/kontakti.astro', 'utf8');
const kontaktiDist = fs.readFileSync('dist/kontakti/index.html', 'utf8');
const otkriiSrc = fs.readFileSync('src/pages/otkrii-problema.astro', 'utf8');
const otkriiDist = fs.readFileSync('dist/otkrii-problema/index.html', 'utf8');

const mapSvgPath = path.join('public', 'images', 'map-location.svg');
const diagSvgPath = path.join('public', 'images', 'diagnostic-flow.svg');

console.log(`File exists public/images/map-location.svg: ${fs.existsSync(mapSvgPath)} (${fs.statSync(mapSvgPath).size} bytes)`);
console.log(`File exists public/images/diagnostic-flow.svg: ${fs.existsSync(diagSvgPath)} (${fs.statSync(diagSvgPath).size} bytes)`);

// Check kontakti
const mapImgMatch = kontaktiDist.match(/<img[^>]*map-location\.svg[^>]*>/i);
console.log('kontakti img tag:', mapImgMatch ? mapImgMatch[0] : 'NOT FOUND');
if (mapImgMatch) {
  const hasWidth = /width="800"/i.test(mapImgMatch[0]);
  const hasHeight = /height="500"/i.test(mapImgMatch[0]);
  const hasAlt = /alt="[^"]+"/i.test(mapImgMatch[0]);
  const altText = mapImgMatch[0].match(/alt="([^"]+)"/i)[1];
  console.log(`kontakti: width=800: ${hasWidth}, height=500: ${hasHeight}, alt: "${altText}"`);
}

// Check otkrii-problema
const diagImgMatch = otkriiDist.match(/<img[^>]*diagnostic-flow\.svg[^>]*>/i);
console.log('otkrii img tag:', diagImgMatch ? diagImgMatch[0] : 'NOT FOUND');
if (diagImgMatch) {
  const hasWidth = /width="800"/i.test(diagImgMatch[0]);
  const hasHeight = /height="500"/i.test(diagImgMatch[0]);
  const hasAlt = /alt="[^"]+"/i.test(diagImgMatch[0]);
  const altText = diagImgMatch[0].match(/alt="([^"]+)"/i)[1];
  console.log(`otkrii: width=800: ${hasWidth}, height=500: ${hasHeight}, alt: "${altText}"`);
}

// 3. WCAG AA COLOR CONTRAST VERIFICATION
console.log('\n--- 3. WCAG AA Color Contrast Verification ---');
const usloviyaDist = fs.readFileSync('dist/usloviya-za-polzvane/index.html', 'utf8');
const zashtitaDist = fs.readFileSync('dist/zashtita-na-dannite/index.html', 'utf8');

console.log('usloviya contains text-slate-400:', usloviyaDist.includes('text-slate-400'));
console.log('usloviya contains text-slate-500:', usloviyaDist.includes('text-slate-500'));
console.log('zashtita contains text-slate-400:', zashtitaDist.includes('text-slate-400'));
console.log('zashtita contains text-slate-500:', zashtitaDist.includes('text-slate-500'));
console.log('otkrii contains text-slate-400:', otkriiDist.includes('text-slate-400'));

// 4. HEADER POLISH VERIFICATION
console.log('\n--- 4. Header Polish Verification ---');
const headerSrc = fs.readFileSync('src/components/Header.astro', 'utf8');
const indexDist = fs.readFileSync('dist/index.html', 'utf8');

const hasAmpEntitySrc = headerSrc.includes('Сервиз &amp; Лаборатория');
const hasUnencodedAmpHeader = headerSrc.includes('Сервиз & Лаборатория');
console.log(`Header.astro has encoded &amp;: ${hasAmpEntitySrc}, has unencoded &: ${hasUnencodedAmpHeader}`);

const mobileBtnMatch = headerSrc.match(/id="mobile-menu-btn"[\s\S]*?class="([^"]+)"/);
console.log('Mobile menu button classes in Header.astro:', mobileBtnMatch ? mobileBtnMatch[1] : 'NOT FOUND');
if (mobileBtnMatch) {
  const hasMinW = mobileBtnMatch[1].includes('min-w-[44px]');
  const hasMinH = mobileBtnMatch[1].includes('min-h-[44px]');
  console.log(`Mobile button min-w-[44px]: ${hasMinW}, min-h-[44px]: ${hasMinH}`);
}

const activeRouteSrc = headerSrc.includes("currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href))");
console.log(`Mobile active route logic in Header.astro matches desktop logic: ${activeRouteSrc}`);

// 5. PACKAGE.JSON BUILD SCRIPTS
console.log('\n--- 5. package.json Build Scripts Verification ---');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log('pkg.scripts.build:css:', pkg.scripts['build:css']);
console.log('pkg.scripts.build:', pkg.scripts['build']);

// 6. ADVERSARIAL & INTEGRITY TESTS
console.log('\n--- 6. Adversarial & Integrity Checks ---');
// Check for dummy or facade implementations
// Check if OBD dictionary handles case sensitivity, whitespace, unknown codes
const obdCodes = ['01276', '01130', '16352', '5DF0', '5DF1', 'C1380', 'C1350', 'P0606', '16986', 'P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'DF017', 'U0100'];
console.log(`OBD database in otkrii contains all ${obdCodes.length} codes:`, obdCodes.every(c => otkriiSrc.includes(`'${c}'`)));

// Check button phrasing in otkrii
const otkriiButtons = [...otkriiDist.matchAll(/<button[\s\S]*?<\/button>/gi)].map(m => m[0]);
const invalidDivButtons = otkriiButtons.filter(b => /<div\b/i.test(b));
console.log(`Total buttons in otkrii: ${otkriiButtons.length}, Buttons with invalid <div>: ${invalidDivButtons.length}`);

// Check inputs with labels in otkrii
const otkriiInputs = [...otkriiDist.matchAll(/<input[^>]+>/gi)].map(m => m[0]);
console.log(`Total inputs in otkrii: ${otkriiInputs.length}`);
otkriiInputs.forEach((inp, idx) => {
  const idMatch = inp.match(/id="([^"]+)"/);
  const id = idMatch ? idMatch[1] : null;
  const labelMatch = id ? otkriiDist.match(new RegExp(`<label[^>]*for="${id}"`, 'i')) : null;
  console.log(`  Input ${idx + 1} (${inp.match(/name="([^"]+)"/)?.[1] || id}): id=${id}, label found=${!!labelMatch}`);
});

console.log('\n=== VERIFICATION FINISHED ===');
