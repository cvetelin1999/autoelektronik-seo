import fs from 'node:fs';
import path from 'node:path';

const projectRoot = 'c:\\Users\\Asus\\Documents\\antigravity\\hopeful-bardeen';
const distDir = path.join(projectRoot, 'dist');
const publicDir = path.join(projectRoot, 'public');

const routes = [
  'index.html',
  'kontakti/index.html',
  'otkrii-problema/index.html',
  'usloviya-za-polzvane/index.html',
  'uslugi/index.html',
  'uslugi/avtodiagnostika/index.html',
  'uslugi/remont-na-abs-modul/index.html',
  'uslugi/remont-na-avtomobilno-tablo/index.html',
  'uslugi/remont-na-ecu-kompyutar/index.html',
  'za-nas/index.html',
  'zashtita-na-dannite/index.html'
];

console.log('--- INDEPENDENT VICTORY AUDITOR FORENSIC HTML AUDIT ---');

let totalIssues = 0;
let totalLinks = 0;
let totalImages = 0;

for (const r of routes) {
  const p = path.join(distDir, r);
  if (!fs.existsSync(p)) {
    console.error(`[FAIL] MISSING: ${p}`);
    totalIssues++;
    continue;
  }
  const content = fs.readFileSync(p, 'utf8');

  // Title tag
  const titleM = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleM ? titleM[1].trim() : null;
  if (!title) {
    console.error(`[FAIL] [${r}] Missing <title>`);
    totalIssues++;
  } else if (title.length > 60) {
    console.error(`[FAIL] [${r}] Title too long (${title.length} chars): "${title}"`);
    totalIssues++;
  }

  // Meta description
  const descM = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  if (!descM || !descM[1].trim()) {
    console.error(`[FAIL] [${r}] Missing meta description`);
    totalIssues++;
  }

  // Canonical tag
  const canonM = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (!canonM || !canonM[1].trim()) {
    console.error(`[FAIL] [${r}] Missing canonical tag`);
    totalIssues++;
  }

  // OG Image
  const ogImgM = content.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (!ogImgM || !ogImgM[1].trim()) {
    console.error(`[FAIL] [${r}] Missing og:image`);
    totalIssues++;
  }

  // Schema.org JSON-LD
  const jsonLdM = content.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi);
  if (!jsonLdM || jsonLdM.length === 0) {
    console.error(`[FAIL] [${r}] Missing Schema.org JSON-LD`);
    totalIssues++;
  } else {
    for (const s of jsonLdM) {
      const jsonText = s.replace(/<script[^>]*>|<\/script>/gi, '');
      try {
        JSON.parse(jsonText);
      } catch (e) {
        console.error(`[FAIL] [${r}] Invalid JSON-LD: ${e.message}`);
        totalIssues++;
      }
    }
  }

  // Anchors: title attribute
  const aRegex = /<a\b([^>]*)>/gi;
  let aM;
  let pageLinks = 0;
  let missingLinkTitles = 0;
  while ((aM = aRegex.exec(content)) !== null) {
    pageLinks++;
    totalLinks++;
    const attrs = aM[1];
    const titleAttr = attrs.match(/\btitle=["']([^"']+)["']/i);
    if (!titleAttr || !titleAttr[1].trim()) {
      missingLinkTitles++;
      totalIssues++;
      console.error(`[FAIL] [${r}] Link missing title: <a ${attrs}>`);
    }
  }

  // Images: alt, width, height, file existence
  const imgRegex = /<img\b([^>]*)>/gi;
  let imgM;
  let pageImgs = 0;
  let imgAttrIssues = 0;
  while ((imgM = imgRegex.exec(content)) !== null) {
    pageImgs++;
    totalImages++;
    const attrs = imgM[1];
    const altM = attrs.match(/\balt=["']([^"']+)["']/i);
    const wM = attrs.match(/\bwidth=["'](\d+)["']/i);
    const hM = attrs.match(/\bheight=["'](\d+)["']/i);
    const srcM = attrs.match(/\bsrc=["']([^"']+)["']/i);

    if (!altM || !altM[1].trim()) {
      imgAttrIssues++;
      totalIssues++;
      console.error(`[FAIL] [${r}] Image missing alt: <img ${attrs}>`);
    }
    if (!wM) {
      imgAttrIssues++;
      totalIssues++;
      console.error(`[FAIL] [${r}] Image missing numeric width: <img ${attrs}>`);
    }
    if (!hM) {
      imgAttrIssues++;
      totalIssues++;
      console.error(`[FAIL] [${r}] Image missing numeric height: <img ${attrs}>`);
    }
    if (srcM) {
      const src = srcM[1].trim().split('?')[0].split('#')[0];
      const diskP = path.join(distDir, src);
      const pubP = path.join(publicDir, src);
      if (!fs.existsSync(diskP) && !fs.existsSync(pubP)) {
        totalIssues++;
        console.error(`[FAIL] [${r}] Image file not found on disk: ${src}`);
      }
    }
  }

  console.log(`✓ [${r}] title="${title.slice(0, 40)}..." (${title.length}c), links=${pageLinks}, imgs=${pageImgs}, ldJson=${jsonLdM ? jsonLdM.length : 0}`);
}

console.log(`\nAudited 11 HTML pages. Total links: ${totalLinks}, Total images: ${totalImages}. Total issues: ${totalIssues}`);
process.exit(totalIssues === 0 ? 0 : 1);
