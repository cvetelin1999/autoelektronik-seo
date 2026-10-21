import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, 'dist');

console.log('====================================================');
console.log('  CHALLENGER 1: EMPIRICAL ADVERSARIAL TEST HARNESS  ');
console.log('====================================================\n');

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const htmlFiles = getHtmlFiles(distDir);
console.log(`[INFO] Found ${htmlFiles.length} HTML files in dist/:\n` + htmlFiles.map(f => '  - ' + path.relative(distDir, f)).join('\n') + '\n');

let totalFailures = 0;
const results = {
  links: { total: 0, broken: [], cyrillic: [], empty: [], missingTitle: [] },
  images: { total: 0, missingAlt: [], missingDimensions: [], missingFiles: [] },
  header: { issues: [] },
  phrasing: { issues: [] },
  inputs: { issues: [] },
  build: {}
};

// ============================================================================
// TEST 1: ADVERSARIAL LINK & IMAGE CRAWLER
// ============================================================================
console.log('--- TEST 1: ADVERSARIAL LINK & IMAGE CRAWLER ---');

const pageDomMap = new Map();
for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(distDir, file).replace(/\\/g, '/');
  
  const ids = new Set();
  const idRegex = /\sid="([^"]+)"/gi;
  let idMatch;
  while ((idMatch = idRegex.exec(content)) !== null) {
    ids.add(idMatch[1]);
  }
  pageDomMap.set(relPath, { content, ids });
}

function resolveInternalRoute(targetRoute) {
  let clean = targetRoute.split('?')[0].split('#')[0];
  if (clean.startsWith('/')) clean = clean.slice(1);
  if (clean === '') return 'index.html';
  if (clean.endsWith('/')) return clean + 'index.html';
  if (path.extname(clean)) return clean;
  return clean + '/index.html';
}

for (const file of htmlFiles) {
  const relFile = path.relative(projectRoot, file).replace(/\\/g, '/');
  const relDist = path.relative(distDir, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf8');

  // 1. Crawl all <a> tags
  const aTagRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let aMatch;
  while ((aMatch = aTagRegex.exec(content)) !== null) {
    results.links.total++;
    const attrs = aMatch[1];
    const innerText = aMatch[2].replace(/<[^>]*>/g, '').trim();

    const hrefMatch = attrs.match(/\bhref=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const href = hrefMatch ? (hrefMatch[1] ?? hrefMatch[2] ?? hrefMatch[3] ?? '') : null;

    const titleMatch = attrs.match(/\btitle=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const title = titleMatch ? (titleMatch[1] ?? titleMatch[2] ?? titleMatch[3] ?? '') : null;

    // Check Cyrillic homoglyphs in href
    if (href && /[\u0400-\u04FF]/.test(href)) {
      results.links.cyrillic.push({ file: relFile, href, innerText });
      totalFailures++;
    }

    // Check empty or whitespace href
    if (href === null || href === '' || href === '#') {
      results.links.empty.push({ file: relFile, href, innerText, tag: aMatch[0].slice(0, 80) });
      totalFailures++;
    }

    // Check missing title
    if (!title || title.trim() === '') {
      results.links.missingTitle.push({ file: relFile, href, innerText, tag: aMatch[0].slice(0, 100) });
      totalFailures++;
    }

    // Check 404s
    if (href) {
      if (href.startsWith('#')) {
        const targetId = href.slice(1);
        const pageData = pageDomMap.get(relDist);
        if (targetId && pageData && !pageData.ids.has(targetId)) {
          results.links.broken.push({ file: relFile, href, reason: `Target anchor #${targetId} not found in ${relDist}` });
          totalFailures++;
        }
      } else if (href.startsWith('/') && !href.startsWith('//')) {
        const [routePath, anchor] = href.split('#');
        const expectedDistRel = resolveInternalRoute(routePath);
        const targetFullPath = path.join(distDir, expectedDistRel);
        
        if (!fs.existsSync(targetFullPath)) {
          results.links.broken.push({ file: relFile, href, expectedFile: expectedDistRel, reason: 'File does not exist in dist/' });
          totalFailures++;
        } else if (anchor) {
          const targetPageData = pageDomMap.get(expectedDistRel);
          if (targetPageData && !targetPageData.ids.has(anchor)) {
            results.links.broken.push({ file: relFile, href, reason: `Target anchor #${anchor} not found in ${expectedDistRel}` });
            totalFailures++;
          }
        }
      } else if (href.startsWith('http://') || href.startsWith('https://')) {
        try {
          new URL(href);
        } catch (e) {
          results.links.broken.push({ file: relFile, href, reason: `Invalid URL format: ${e.message}` });
          totalFailures++;
        }
      } else if (!href.startsWith('tel:') && !href.startsWith('mailto:') && !href.startsWith('javascript:')) {
        const currentDir = path.dirname(file);
        const resolved = path.resolve(currentDir, href);
        if (!fs.existsSync(resolved)) {
          results.links.broken.push({ file: relFile, href, resolved, reason: 'Relative link destination not found' });
          totalFailures++;
        }
      }
    }
  }

  // 2. Crawl all <img> tags
  const imgRegex = /<img\b([^>]*)\/?>/gi;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(content)) !== null) {
    results.images.total++;
    const attrs = imgMatch[1];

    const srcMatch = attrs.match(/\bsrc=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const altMatch = attrs.match(/\balt=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const widthMatch = attrs.match(/\bwidth=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const heightMatch = attrs.match(/\bheight=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);

    const src = srcMatch ? (srcMatch[1] ?? srcMatch[2] ?? srcMatch[3]) : null;
    const alt = altMatch ? (altMatch[1] ?? altMatch[2] ?? altMatch[3]) : null;
    const width = widthMatch ? (widthMatch[1] ?? widthMatch[2] ?? widthMatch[3]) : null;
    const height = heightMatch ? (heightMatch[1] ?? heightMatch[2] ?? heightMatch[3]) : null;

    if (alt === null || alt.trim() === '') {
      results.images.missingAlt.push({ file: relFile, src, tag: imgMatch[0].slice(0, 120) });
      totalFailures++;
    }

    if (!width || !height) {
      results.images.missingDimensions.push({ file: relFile, src, width, height, tag: imgMatch[0].slice(0, 120) });
      totalFailures++;
    }

    if (src) {
      let resolvedFilePath = null;
      if (src.startsWith('/')) {
        resolvedFilePath = path.join(distDir, src);
      } else if (!src.startsWith('http') && !src.startsWith('data:')) {
        resolvedFilePath = path.resolve(path.dirname(file), src);
      }

      if (resolvedFilePath) {
        if (!fs.existsSync(resolvedFilePath)) {
          results.images.missingFiles.push({ file: relFile, src, resolvedFilePath, reason: 'File does not exist' });
          totalFailures++;
        } else {
          const stats = fs.statSync(resolvedFilePath);
          if (stats.size === 0) {
            results.images.missingFiles.push({ file: relFile, src, resolvedFilePath, reason: 'File is 0 bytes empty' });
            totalFailures++;
          }
        }
      }
    } else {
      results.images.missingFiles.push({ file: relFile, tag: imgMatch[0], reason: 'Image tag has no src attribute' });
      totalFailures++;
    }
  }

  // 3. Check for HTML5 phrasing violations: <div> inside <button>
  const buttonRegex = /<button\b[^>]*>([\s\S]*?)<\/button>/gi;
  let btnMatch;
  while ((btnMatch = buttonRegex.exec(content)) !== null) {
    if (/<div\b/i.test(btnMatch[1])) {
      results.phrasing.issues.push({ file: relFile, snippet: btnMatch[0].slice(0, 100) });
      totalFailures++;
    }
  }

  // 4. Check for accessible inputs (excluding hidden, submit, button)
  const inputRegex = /<input\b([^>]*)\/?>/gi;
  let inMatch;
  while ((inMatch = inputRegex.exec(content)) !== null) {
    const inAttrs = inMatch[1];
    if (inAttrs.includes('type="hidden"') || inAttrs.includes('type="submit"') || inAttrs.includes('type="button"')) continue;
    const hasId = /\bid="([^"]+)"/i.test(inAttrs);
    const hasAriaLabel = /\baria-label="([^"]+)"/i.test(inAttrs);
    const hasAriaLabelledBy = /\baria-labelledby="([^"]+)"/i.test(inAttrs);

    if (!hasId && !hasAriaLabel && !hasAriaLabelledBy) {
      results.inputs.issues.push({ file: relFile, tag: inMatch[0] });
      totalFailures++;
    }
  }
}

console.log(`Total <a> tags crawled across 11 pages: ${results.links.total}`);
console.log(`  - 404 / broken links: ${results.links.broken.length}`);
console.log(`  - Cyrillic homoglyphs: ${results.links.cyrillic.length}`);
console.log(`  - Empty/hash hrefs: ${results.links.empty.length}`);
console.log(`  - Missing title attributes: ${results.links.missingTitle.length}`);
console.log(`Total <img> tags crawled across 11 pages: ${results.images.total}`);
console.log(`  - Missing alt attributes: ${results.images.missingAlt.length}`);
console.log(`  - Missing width/height: ${results.images.missingDimensions.length}`);
console.log(`  - Non-existent or empty files: ${results.images.missingFiles.length}`);
console.log(`HTML5 Phrasing violations (<div> in <button>): ${results.phrasing.issues.length}`);
console.log(`Input accessible name issues: ${results.inputs.issues.length}`);

// ============================================================================
// TEST 2: HEADER ENTITY ENCODING & MOBILE TOUCH TARGETS
// ============================================================================
console.log('\n--- TEST 2: HEADER ENTITY ENCODING & MOBILE TOUCH TARGETS ---');

const headerAstroPath = path.join(projectRoot, 'src', 'components', 'Header.astro');
const headerAstroContent = fs.readFileSync(headerAstroPath, 'utf8');

// Strip frontmatter, client script, and JSX expressions { ... } to inspect HTML template markup
const withoutFrontmatter = headerAstroContent.replace(/^---[\s\S]*?---/, '');
const withoutScript = withoutFrontmatter.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
const templateMarkupOnly = withoutScript.replace(/\{[\s\S]*?\}/g, '');
const unencodedAmpHeaderTemplate = templateMarkupOnly.match(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[a-f\d]+);)/gi);

if (unencodedAmpHeaderTemplate) {
  results.header.issues.push(`Header.astro template has ${unencodedAmpHeaderTemplate.length} unencoded ampersand(s) in markup`);
  totalFailures++;
} else {
  console.log('✓ Header.astro template markup: 0 unencoded ampersands found (all HTML text properly encoded).');
}

// Check Header.astro for mobile-menu-btn touch target
if (!headerAstroContent.includes('min-w-[44px]') || !headerAstroContent.includes('min-h-[44px]')) {
  results.header.issues.push('Header.astro: #mobile-menu-btn lacks 44x44px minimum touch target classes');
  totalFailures++;
} else {
  console.log('✓ Header.astro: #mobile-menu-btn contains explicit min-w-[44px] min-h-[44px] touch target.');
}

// Check rendered headers across all dist files
let headerRenderAmpIssues = 0;
for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relDist = path.relative(distDir, file).replace(/\\/g, '/');
  const hMatch = content.match(/<header\b[^>]*>([\s\S]*?)<\/header>/i);
  if (hMatch) {
    const hBody = hMatch[1];
    const unencoded = hBody.match(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[a-f\d]+);)/gi);
    if (unencoded) {
      headerRenderAmpIssues += unencoded.length;
      results.header.issues.push(`${relDist}: rendered header has ${unencoded.length} unencoded ampersands`);
      totalFailures++;
    }
  }
}
if (headerRenderAmpIssues === 0) {
  console.log(`✓ Rendered headers across all 11 dist pages: 0 unencoded ampersands.`);
}

// ============================================================================
// TEST 3: STRESS TEST `npm run build` & STYLES.CSS REGENERATION
// ============================================================================
console.log('\n--- TEST 3: STRESS TEST `npm run build` & STYLES.CSS REGENERATION ---');

const stylesCssPath = path.join(projectRoot, 'public', 'css', 'styles.css');
if (fs.existsSync(stylesCssPath)) {
  fs.unlinkSync(stylesCssPath);
  console.log('✓ Clean test: Deleted public/css/styles.css to test complete re-compilation.');
}

console.log('[INFO] Executing `npm run build` with timing measurement...');
const t0 = performance.now();
try {
  const buildOutput = execSync('npm run build', {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  const t1 = performance.now();
  const durationSec = ((t1 - t0) / 1000).toFixed(2);
  console.log(`✓ Build succeeded in ${durationSec}s (Target: < 15.00s).`);

  if (parseFloat(durationSec) >= 15.0) {
    results.build.issue = `Build exceeded 15 seconds threshold: ${durationSec}s`;
    totalFailures++;
  }

  if (!fs.existsSync(stylesCssPath)) {
    results.build.issue = 'public/css/styles.css was NOT generated by npm run build!';
    totalFailures++;
  } else {
    const stats = fs.statSync(stylesCssPath);
    console.log(`✓ public/css/styles.css regenerated cleanly! Size: ${(stats.size / 1024).toFixed(1)} KB.`);
    if (stats.size < 5000) {
      results.build.issue = `public/css/styles.css is suspiciously small (${stats.size} bytes)`;
      totalFailures++;
    }
  }

  results.build.durationSec = durationSec;
  results.build.success = true;
} catch (err) {
  const t1 = performance.now();
  results.build.durationSec = ((t1 - t0) / 1000).toFixed(2);
  results.build.success = false;
  results.build.error = err.stderr || err.message;
  console.error(`✗ Build failed after ${results.build.durationSec}s:`, results.build.error);
  totalFailures++;
}

// ============================================================================
// SUMMARY & VERDICT
// ============================================================================
console.log('\n====================================================');
console.log('                CHALLENGE TEST SUMMARY              ');
console.log('====================================================');
console.log(`Total empirical failures detected: ${totalFailures}`);

if (results.links.cyrillic.length > 0) {
  console.log('\n[FAIL] Cyrillic Homoglyphs in links:', JSON.stringify(results.links.cyrillic, null, 2));
}
if (results.links.broken.length > 0) {
  console.log('\n[FAIL] Broken / 404 links:', JSON.stringify(results.links.broken, null, 2));
}
if (results.links.empty.length > 0) {
  console.log('\n[FAIL] Empty hrefs:', JSON.stringify(results.links.empty, null, 2));
}
if (results.links.missingTitle.length > 0) {
  console.log('\n[FAIL] Missing title attributes on <a> tags:', JSON.stringify(results.links.missingTitle, null, 2));
}
if (results.images.missingAlt.length > 0) {
  console.log('\n[FAIL] Missing alt on <img> tags:', JSON.stringify(results.images.missingAlt, null, 2));
}
if (results.images.missingDimensions.length > 0) {
  console.log('\n[FAIL] Missing width/height on <img> tags:', JSON.stringify(results.images.missingDimensions, null, 2));
}
if (results.images.missingFiles.length > 0) {
  console.log('\n[FAIL] Non-existent image files:', JSON.stringify(results.images.missingFiles, null, 2));
}
if (results.header.issues.length > 0) {
  console.log('\n[FAIL] Header issues:', JSON.stringify(results.header.issues, null, 2));
}
if (results.phrasing.issues.length > 0) {
  console.log('\n[FAIL] Phrasing issues:', JSON.stringify(results.phrasing.issues, null, 2));
}
if (results.inputs.issues.length > 0) {
  console.log('\n[FAIL] Input accessible name issues:', JSON.stringify(results.inputs.issues, null, 2));
}

const verdict = totalFailures === 0 ? 'APPROVE' : 'REQUEST_CHANGES';
console.log(`\nFINAL VERDICT: [${verdict}]`);
process.exit(totalFailures === 0 ? 0 : 1);
