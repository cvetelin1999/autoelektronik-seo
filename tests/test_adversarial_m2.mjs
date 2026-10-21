import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, 'dist');
const publicDir = path.join(projectRoot, 'public');
const scriptsDir = path.join(projectRoot, 'scripts');

console.log('================================================================');
console.log('  CHALLENGER 1: EMPIRICAL ADVERSARIAL STRESS TEST (MILESTONE 2) ');
console.log('================================================================\n');

let totalFailures = 0;
const failureDetails = [];

function assert(condition, message, details = null) {
  if (!condition) {
    totalFailures++;
    console.error(`  \x1b[31m[FAIL]\x1b[0m ${message}`);
    if (details) {
      console.error(`         Details: ${JSON.stringify(details)}`);
      failureDetails.push({ message, details });
    } else {
      failureDetails.push({ message });
    }
  } else {
    console.log(`  \x1b[32m[PASS]\x1b[0m ${message}`);
  }
}

// -------------------------------------------------------------
// Helper: Collect HTML files
// -------------------------------------------------------------
function getFilesRecursively(dir, filterFn) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath, filterFn));
    } else if (filterFn(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

// =============================================================
// SUITE 1: Build Performance & Exit Code Verification
// =============================================================
console.log('\n--- SUITE 1: Build Performance & Exit Code Verification ---');
try {
  const t0 = performance.now();
  const buildOutput = execSync('npm run build', { cwd: projectRoot, encoding: 'utf8', stdio: 'pipe' });
  const t1 = performance.now();
  const buildDuration = (t1 - t0) / 1000;
  console.log(`  Build completed in ${buildDuration.toFixed(2)} seconds.`);
  assert(buildDuration < 15, `Build time must be under 15 seconds (Actual: ${buildDuration.toFixed(2)}s)`);
  assert(!buildOutput.includes('error'), 'Build output should not contain build errors');
} catch (err) {
  assert(false, `Build failed with error: ${err.message}`);
}

// =============================================================
// SUITE 2: Script Logic Inspection (scripts/audit.mjs)
// =============================================================
console.log('\n--- SUITE 2: Audit Script Logic & Authenticity Inspection ---');
const auditScriptPath = path.join(scriptsDir, 'audit.mjs');
assert(fs.existsSync(auditScriptPath), 'scripts/audit.mjs must exist');

if (fs.existsSync(auditScriptPath)) {
  const auditCode = fs.readFileSync(auditScriptPath, 'utf8');
  // Check for suspicious mock bypasses
  const hasHardcodedPass = /return\s+true/i.test(auditCode) && !/findHtmlFiles/.test(auditCode);
  assert(!hasHardcodedPass, 'Audit script does not contain unconditional early return passes');

  const parsesDistHtml = auditCode.includes('findHtmlFiles') && auditCode.includes('fs.readFileSync') && auditCode.includes('DIST_DIR');
  assert(parsesDistHtml, 'Audit script genuinely traverses and reads HTML files in dist/');

  const parsesSitemaps = auditCode.includes('sitemap.xml') && auditCode.includes('image-sitemap.xml') && auditCode.includes('video-sitemap.xml');
  assert(parsesSitemaps, 'Audit script audits all 3 XML sitemaps');

  const checksLinks = auditCode.includes('totalLinks') && auditCode.includes('missingLinkTitles') && auditCode.includes('title=');
  assert(checksLinks, 'Audit script rigorously parses <a> links and checks title attributes');

  const checksImages = auditCode.includes('totalImages') && auditCode.includes('missingAlt') && auditCode.includes('missingWidth') && auditCode.includes('missingHeight');
  assert(checksImages, 'Audit script rigorously parses <img> tags and checks alt, width, and height attributes');

  const checksExitCode = auditCode.includes('process.exit(0)') && auditCode.includes('process.exit(1)');
  assert(checksExitCode, 'Audit script exits with code 1 upon error and code 0 on success');
}

// =============================================================
// SUITE 3: Adversarial Crawl of all 11 Compiled HTML Pages
// =============================================================
console.log('\n--- SUITE 3: Adversarial Crawl of All 11 HTML Pages in dist/ ---');

const htmlFiles = getFilesRecursively(distDir, (name) => name.endsWith('.html'));
assert(htmlFiles.length === 11, `Exactly 11 compiled HTML pages must exist (Found: ${htmlFiles.length})`, {
  found: htmlFiles.map((f) => path.relative(distDir, f))
});

// Map of all page DOMs and anchor IDs for anchor resolution
const pageMap = new Map();
for (const file of htmlFiles) {
  const relPath = path.relative(distDir, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf8');
  
  // Extract all IDs
  const idSet = new Set();
  const idRegex = /\bid=["']([^"']+)["']/gi;
  let idMatch;
  while ((idMatch = idRegex.exec(content)) !== null) {
    idSet.add(idMatch[1]);
  }
  
  pageMap.set(relPath, { content, idSet, file });
}

let grandTotalLinks = 0;
let grandTotalImages = 0;
let grandTotalVideos = 0;

const linkDetails = [];
const imageDetails = [];
const titleDetails = [];

// Helper to resolve route to dist relative file
function resolveRouteToDistFile(route) {
  const cleanRoute = route.split('#')[0].split('?')[0];
  if (!cleanRoute || cleanRoute === '/') {
    return 'index.html';
  }
  const stripped = cleanRoute.replace(/^\/+|\/+$/g, '');
  if (stripped.endsWith('.html') || stripped.endsWith('.xml') || stripped.endsWith('.txt') || stripped.endsWith('.css') || stripped.endsWith('.js') || stripped.endsWith('.svg') || stripped.endsWith('.png') || stripped.endsWith('.jpg') || stripped.endsWith('.mp4')) {
    return stripped;
  }
  return `${stripped}/index.html`;
}

for (const [relPath, { content, idSet }] of pageMap.entries()) {
  console.log(`\n  Checking page: \x1b[34m${relPath}\x1b[0m`);

  // 1. Title Checks
  const titleRegex = /<title[^>]*>([^<]*)<\/title>/gi;
  const titleMatches = [...content.matchAll(titleRegex)];
  assert(titleMatches.length === 1, `[${relPath}] Must have exactly 1 <title> tag (Found: ${titleMatches.length})`);

  if (titleMatches.length > 0) {
    const rawTitle = titleMatches[0][1].trim();
    const titleLength = rawTitle.length;
    const brandOccurrences = (rawTitle.match(/AutoElektronik/g) || []).length;
    titleDetails.push({ page: relPath, title: rawTitle, length: titleLength, brandOccurrences });

    assert(titleLength <= 60, `[${relPath}] Title length must be <= 60 chars (Actual: ${titleLength} chars: "${rawTitle}")`);
    assert(brandOccurrences <= 1, `[${relPath}] Title must not have duplicate brand suffix (Found ${brandOccurrences} occurrences: "${rawTitle}")`);
    assert(!rawTitle.includes('AutoElektronik | AutoElektronik'), `[${relPath}] Title must not contain double brand string`);
  }

  // 2. Links Crawl
  const aTagRegex = /<a\b([^>]*)>/gi;
  let aMatch;
  let pageLinkCount = 0;
  while ((aMatch = aTagRegex.exec(content)) !== null) {
    grandTotalLinks++;
    pageLinkCount++;
    const attrs = aMatch[1];
    
    // Extract href
    const hrefMatch = attrs.match(/\bhref=["']([^"']*)["']/i);
    const titleMatch = attrs.match(/\btitle=["']([^"']*)["']/i);

    const href = hrefMatch ? hrefMatch[1].trim() : null;
    const title = titleMatch ? titleMatch[1].trim() : null;

    // Verify title attribute
    assert(title !== null && title.length > 0, `[${relPath}] <a> tag missing or empty title attribute: <a ${attrs.trim()}>`);

    // Verify href
    if (href) {
      // Check Cyrillic homoglyphs in href
      const hasCyrillic = /[\u0400-\u04FF]/.test(href);
      assert(!hasCyrillic, `[${relPath}] Link href contains Cyrillic homoglyph characters: href="${href}"`);

      // Verify internal links
      if (href.startsWith('/') && !href.startsWith('//')) {
        const parts = href.split('#');
        const pathPart = parts[0];
        const hashPart = parts[1];

        const targetDistRel = resolveRouteToDistFile(pathPart);
        const targetDistFull = path.join(distDir, targetDistRel);
        const targetPublicFull = path.join(publicDir, targetDistRel);

        const fileExists = fs.existsSync(targetDistFull) || fs.existsSync(targetPublicFull);
        assert(fileExists, `[${relPath}] Broken internal link: href="${href}" -> file not found at ${targetDistRel}`);

        // If link has anchor fragment, verify target ID in target page
        if (fileExists && hashPart) {
          const targetPageData = pageMap.get(targetDistRel);
          if (targetPageData) {
            const hasId = targetPageData.idSet.has(hashPart);
            assert(hasId, `[${relPath}] Anchor fragment #${hashPart} in href="${href}" not found on target page ${targetDistRel}`);
          }
        }
      } else if (href.startsWith('#')) {
        const hashId = href.slice(1);
        if (hashId) {
          const hasId = idSet.has(hashId);
          assert(hasId, `[${relPath}] In-page anchor #${hashId} does not exist on page`);
        }
      }
    } else {
      assert(false, `[${relPath}] <a> tag missing href attribute: <a ${attrs.trim()}>`);
    }
  }
  console.log(`    -> Analyzed ${pageLinkCount} links on ${relPath}`);

  // 3. Images Crawl
  const imgTagRegex = /<img\b([^>]*)>/gi;
  let imgMatch;
  let pageImgCount = 0;
  while ((imgMatch = imgTagRegex.exec(content)) !== null) {
    grandTotalImages++;
    pageImgCount++;
    const attrs = imgMatch[1];

    const altMatch = attrs.match(/\balt=["']([^"']*)["']/i);
    const widthMatch = attrs.match(/\bwidth=["']([^"']*)["']/i);
    const heightMatch = attrs.match(/\bheight=["']([^"']*)["']/i);
    const srcMatch = attrs.match(/\bsrc=["']([^"']*)["']/i);

    assert(altMatch !== null && altMatch[1].trim().length > 0, `[${relPath}] Image missing non-empty alt attribute: <img ${attrs.trim()}>`);
    assert(widthMatch !== null && /^\d+$/.test(widthMatch[1].trim()) && parseInt(widthMatch[1].trim(), 10) > 0, `[${relPath}] Image missing valid numeric width: <img ${attrs.trim()}>`);
    assert(heightMatch !== null && /^\d+$/.test(heightMatch[1].trim()) && parseInt(heightMatch[1].trim(), 10) > 0, `[${relPath}] Image missing valid numeric height: <img ${attrs.trim()}>`);
    assert(srcMatch !== null && srcMatch[1].trim().length > 0, `[${relPath}] Image missing src: <img ${attrs.trim()}>`);

    if (srcMatch) {
      const src = srcMatch[1].trim();
      if (src.startsWith('/') && !src.startsWith('//')) {
        const cleanSrc = src.split('?')[0].split('#')[0].replace(/^\//, '');
        const distFile = path.join(distDir, cleanSrc);
        const pubFile = path.join(publicDir, cleanSrc);
        const fileExists = fs.existsSync(distFile) || fs.existsSync(pubFile);
        assert(fileExists, `[${relPath}] Referenced image file does not exist: src="${src}" (looked in dist/${cleanSrc})`);
        if (fileExists) {
          const fileSize = fs.existsSync(distFile) ? fs.statSync(distFile).size : fs.statSync(pubFile).size;
          assert(fileSize > 0, `[${relPath}] Image file is 0 bytes: src="${src}"`);
        }
      }
    }
  }
  if (pageImgCount > 0) {
    console.log(`    -> Analyzed ${pageImgCount} images on ${relPath}`);
  }

  // 4. Video Elements Crawl
  const videoTagRegex = /<video\b([^>]*)>([\s\S]*?)<\/video>/gi;
  let vidMatch;
  while ((vidMatch = videoTagRegex.exec(content)) !== null) {
    grandTotalVideos++;
    const vAttrs = vidMatch[1];
    const vBody = vidMatch[2];

    const posterMatch = vAttrs.match(/\bposter=["']([^"']*)["']/i);
    assert(posterMatch !== null, `[${relPath}] <video> tag missing poster attribute`);
    if (posterMatch) {
      const posterSrc = posterMatch[1].replace(/^\//, '');
      const posterExists = fs.existsSync(path.join(distDir, posterSrc)) || fs.existsSync(path.join(publicDir, posterSrc));
      assert(posterExists, `[${relPath}] Video poster file does not exist on disk: ${posterSrc}`);
    }

    const sourceMatch = vBody.match(/<source\b[^>]*\bsrc=["']([^"']*)["']/i);
    assert(sourceMatch !== null, `[${relPath}] <video> tag missing valid <source> child`);
    if (sourceMatch) {
      const vidSrc = sourceMatch[1].replace(/^\//, '');
      const vidDist = path.join(distDir, vidSrc);
      const vidPub = path.join(publicDir, vidSrc);
      const vidExists = fs.existsSync(vidDist) || fs.existsSync(vidPub);
      assert(vidExists, `[${relPath}] Video file does not exist on disk: ${vidSrc}`);
      if (vidExists) {
        const vidSize = fs.existsSync(vidDist) ? fs.statSync(vidDist).size : fs.statSync(vidPubFile).size;
        assert(vidSize > 100000, `[${relPath}] Video file size unexpectedly small (${vidSize} bytes)`);
      }
    }
  }
}

console.log(`\n  Total <a> links verified across 11 pages: ${grandTotalLinks}`);
console.log(`  Total <img> tags verified across 11 pages: ${grandTotalImages}`);
console.log(`  Total <video> elements verified across 11 pages: ${grandTotalVideos}`);

assert(grandTotalLinks === 332, `Expected exactly 332 links across all 11 pages (Found: ${grandTotalLinks})`);
assert(grandTotalImages === 17, `Expected exactly 17 images across all 11 pages (Found: ${grandTotalImages})`);
assert(grandTotalVideos === 1, `Expected exactly 1 video across all 11 pages (Found: ${grandTotalVideos})`);

// Print Title table
console.log('\n--- Compiled Page Title Summary ---');
for (const t of titleDetails) {
  console.log(`  - [${t.length} chars] ${t.page}: "${t.title}"`);
}

// =============================================================
// SUITE 4: Sitemaps & robots.txt Syntax & Parity
// =============================================================
console.log('\n--- SUITE 4: Sitemaps & robots.txt Deep Verification ---');

const sitemaps = ['sitemap.xml', 'image-sitemap.xml', 'video-sitemap.xml'];
for (const smName of sitemaps) {
  const smPath = path.join(distDir, smName);
  assert(fs.existsSync(smPath), `Sitemap dist/${smName} must exist`);
  if (fs.existsSync(smPath)) {
    const xml = fs.readFileSync(smPath, 'utf8');
    assert(xml.startsWith('<?xml'), `[${smName}] Starts with XML declaration`);
    assert(xml.includes('<urlset'), `[${smName}] Contains <urlset> root`);
    assert(xml.includes('</urlset>'), `[${smName}] Contains closing </urlset>`);
    assert(!xml.includes('undefined') && !xml.includes('null'), `[${smName}] Contains no undefined/null tokens`);

    // In standard sitemap: check every <loc> corresponds to an existing HTML file
    if (smName === 'sitemap.xml') {
      const locMatches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];
      assert(locMatches.length === 11, `sitemap.xml should have 11 URLs (Found: ${locMatches.length})`);
      for (const m of locMatches) {
        const urlObj = new URL(m[1]);
        const expectedDistFile = resolveRouteToDistFile(urlObj.pathname);
        assert(fs.existsSync(path.join(distDir, expectedDistFile)), `sitemap.xml <loc> ${m[1]} points to non-existent HTML ${expectedDistFile}`);
      }
    }

    // In image sitemap: verify every <image:loc> exists on disk
    if (smName === 'image-sitemap.xml') {
      const imgLocMatches = [...xml.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)];
      assert(imgLocMatches.length === 9, `image-sitemap.xml should reference 9 images (Found: ${imgLocMatches.length})`);
      for (const m of imgLocMatches) {
        const imgUrl = new URL(m[1]);
        const relImg = imgUrl.pathname.replace(/^\//, '');
        const exists = fs.existsSync(path.join(distDir, relImg)) || fs.existsSync(path.join(publicDir, relImg));
        assert(exists, `image-sitemap.xml image file missing on disk: ${relImg}`);
      }
    }

    // In video sitemap: verify content_loc and thumbnail_loc
    if (smName === 'video-sitemap.xml') {
      const vidLoc = xml.match(/<video:content_loc>([^<]+)<\/video:content_loc>/);
      const thumbLoc = xml.match(/<video:thumbnail_loc>([^<]+)<\/video:thumbnail_loc>/);
      assert(vidLoc !== null, 'video-sitemap.xml must have <video:content_loc>');
      assert(thumbLoc !== null, 'video-sitemap.xml must have <video:thumbnail_loc>');

      if (vidLoc) {
        const relVid = new URL(vidLoc[1]).pathname.replace(/^\//, '');
        assert(fs.existsSync(path.join(distDir, relVid)) || fs.existsSync(path.join(publicDir, relVid)), `video-sitemap content_loc missing: ${relVid}`);
      }
      if (thumbLoc) {
        const relThumb = new URL(thumbLoc[1]).pathname.replace(/^\//, '');
        assert(fs.existsSync(path.join(distDir, relThumb)) || fs.existsSync(path.join(publicDir, relThumb)), `video-sitemap thumbnail_loc missing: ${relThumb}`);
      }
    }
  }
}

// robots.txt
const robotsPath = path.join(distDir, 'robots.txt');
assert(fs.existsSync(robotsPath), 'dist/robots.txt must exist');
if (fs.existsSync(robotsPath)) {
  const robotsTxt = fs.readFileSync(robotsPath, 'utf8');
  assert(robotsTxt.includes('User-agent: *'), 'robots.txt specifies User-agent: *');
  assert(robotsTxt.includes('Allow: /'), 'robots.txt specifies Allow: /');
  assert(robotsTxt.includes('Sitemap: https://autoelektronik-service.bg/sitemap.xml'), 'robots.txt includes sitemap.xml');
  assert(robotsTxt.includes('Sitemap: https://autoelektronik-service.bg/image-sitemap.xml'), 'robots.txt includes image-sitemap.xml');
  assert(robotsTxt.includes('Sitemap: https://autoelektronik-service.bg/video-sitemap.xml'), 'robots.txt includes video-sitemap.xml');
}

// =============================================================
// SUMMARY VERDICT
// =============================================================
console.log('\n================================================================');
if (totalFailures === 0) {
  console.log('  \x1b[32m\x1b[1mCHALLENGER 1 EMPIRICAL VERDICT: APPROVE (0 FAILURES)\x1b[0m');
  console.log('================================================================\n');
  process.exit(0);
} else {
  console.error(`  \x1b[31m\x1b[1mCHALLENGER 1 EMPIRICAL VERDICT: REQUEST_CHANGES (${totalFailures} FAILURES)\x1b[0m`);
  console.log('================================================================\n');
  process.exit(1);
}
