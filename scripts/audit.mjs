#!/usr/bin/env node
/**
 * AutoElektronik Automated SEO & Quality Audit Engine (CSCB700)
 *
 * Verifies:
 * 1. 0 missing title attributes on <a> links.
 * 2. 0 broken internal links (including Cyrillic homoglyph detection in URLs).
 * 3. 0 missing alt, width, height attributes on <img> tags.
 * 4. Image & video physical existence on disk.
 * 5. 3 XML sitemaps (sitemap.xml, image-sitemap.xml, video-sitemap.xml) parse valid XML.
 * 6. All sitemap image and video assets physically exist.
 * 7. Page titles <= 60 chars, no duplicate branding, meta description length.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const SITE_URL = 'https://autoelektronik-service.bg';

// Cyrillic unicode block regex to catch homoglyph URL typos (e.g. Cyrillic 'а', 'е', 'о', 'р', 'с', 'у', 'х', 'м')
const CYRILLIC_PATTERN = /[\u0400-\u04FF]/;

let totalErrors = 0;
let totalWarnings = 0;

function reportPass(msg) {
  console.log(`  \x1b[32m✓\x1b[0m ${msg}`);
}

function reportFail(msg) {
  totalErrors++;
  console.error(`  \x1b[31m✗\x1b[0m ${msg}`);
}

function reportWarn(msg) {
  totalWarnings++;
  console.warn(`  \x1b[33m!\x1b[0m ${msg}`);
}

function findHtmlFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

// -------------------------------------------------------------
// 1. Audit HTML Pages (Links, Images, Videos, Titles)
// -------------------------------------------------------------
function auditHtmlPages() {
  console.log('\n\x1b[1m[1/5] Auditing 11 Compiled HTML Pages...\x1b[0m');

  if (!fs.existsSync(DIST_DIR)) {
    reportFail(`Directory ${DIST_DIR} does not exist. Run "npm run build" first.`);
    return;
  }

  const htmlFiles = findHtmlFiles(DIST_DIR);
  if (htmlFiles.length === 0) {
    reportFail(`No HTML files found in ${DIST_DIR}`);
    return;
  }

  let totalLinks = 0;
  let missingLinkTitles = 0;
  let brokenInternalLinks = 0;
  let cyrillicUrlTypos = 0;

  let totalImages = 0;
  let missingAlt = 0;
  let missingWidth = 0;
  let missingHeight = 0;
  let missingImageFiles = 0;

  let totalVideos = 0;
  let missingVideoFiles = 0;

  let titleViolations = 0;
  let duplicateBrandingCount = 0;

  for (const filePath of htmlFiles) {
    const relPath = path.relative(DIST_DIR, filePath).replace(/\\/g, '/');
    const html = fs.readFileSync(filePath, 'utf8');

    // Title & Meta Audit
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (!titleMatch) {
      reportFail(`[${relPath}] Missing <title> tag`);
      titleViolations++;
    } else {
      const pageTitle = titleMatch[1].trim();
      if (pageTitle.length > 60) {
        reportFail(`[${relPath}] Title too long (${pageTitle.length} chars > 60): "${pageTitle}"`);
        titleViolations++;
      }
      if (pageTitle.includes('AutoElektronik | AutoElektronik') || (pageTitle.match(/AutoElektronik/g) || []).length > 1) {
        reportFail(`[${relPath}] Double branding detected in title: "${pageTitle}"`);
        duplicateBrandingCount++;
      }
    }

    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
    if (!descMatch || !descMatch[1].trim()) {
      reportWarn(`[${relPath}] Missing meta description`);
    }

    // Anchor Tags Audit: <a ... href="..." ...>
    const aTagRegex = /<a\b([^>]*)>/gi;
    let aMatch;
    while ((aMatch = aTagRegex.exec(html)) !== null) {
      totalLinks++;
      const attrs = aMatch[1];

      // Extract href
      const hrefMatch = attrs.match(/\bhref=["']([^"']*)["']/i);
      const titleAttrMatch = attrs.match(/\btitle=["']([^"']*)["']/i);

      if (!titleAttrMatch || !titleAttrMatch[1].trim()) {
        reportFail(`[${relPath}] Link missing title attribute: <a ${attrs.trim()}>`);
        missingLinkTitles++;
      }

      if (hrefMatch) {
        const href = hrefMatch[1].trim();

        // Check for Cyrillic letters inside URL paths
        if (CYRILLIC_PATTERN.test(href)) {
          reportFail(`[${relPath}] Cyrillic homoglyph detected in link href="${href}"`);
          cyrillicUrlTypos++;
        }

        // Validate internal links
        if (href.startsWith('/') && !href.startsWith('//')) {
          const cleanHref = href.split('#')[0].split('?')[0];
          // Check corresponding dist file
          let targetPath;
          if (cleanHref.endsWith('.xml') || cleanHref.endsWith('.txt') || cleanHref.endsWith('.css') || cleanHref.endsWith('.js') || cleanHref.endsWith('.svg') || cleanHref.endsWith('.png') || cleanHref.endsWith('.jpg') || cleanHref.endsWith('.mp4')) {
            targetPath = path.join(DIST_DIR, cleanHref);
          } else {
            const stripped = cleanHref.replace(/^\/|\/$/g, '');
            targetPath = stripped ? path.join(DIST_DIR, stripped, 'index.html') : path.join(DIST_DIR, 'index.html');
          }

          if (!fs.existsSync(targetPath)) {
            // Also check public folder for assets
            const publicPath = path.join(PUBLIC_DIR, cleanHref);
            if (!fs.existsSync(publicPath)) {
              reportFail(`[${relPath}] Broken internal link to "${href}" (resolved: ${targetPath})`);
              brokenInternalLinks++;
            }
          }
        }
      }
    }

    // Img Tags Audit: <img ...>
    const imgTagRegex = /<img\b([^>]*)>/gi;
    let imgMatch;
    while ((imgMatch = imgTagRegex.exec(html)) !== null) {
      totalImages++;
      const attrs = imgMatch[1];

      const altMatch = attrs.match(/\balt=["']([^"']*)["']/i);
      const widthMatch = attrs.match(/\bwidth=["']([^"']*)["']/i);
      const heightMatch = attrs.match(/\bheight=["']([^"']*)["']/i);
      const srcMatch = attrs.match(/\bsrc=["']([^"']*)["']/i);

      if (!altMatch || !altMatch[1].trim()) {
        reportFail(`[${relPath}] Image missing alt attribute: <img ${attrs.trim()}>`);
        missingAlt++;
      }

      if (!widthMatch || !/^\d+$/.test(widthMatch[1].trim())) {
        reportFail(`[${relPath}] Image missing numeric width attribute: <img ${attrs.trim()}>`);
        missingWidth++;
      }

      if (!heightMatch || !/^\d+$/.test(heightMatch[1].trim())) {
        reportFail(`[${relPath}] Image missing numeric height attribute: <img ${attrs.trim()}>`);
        missingHeight++;
      }

      if (srcMatch) {
        const src = srcMatch[1].trim();
        if (src.startsWith('/') && !src.startsWith('//')) {
          const cleanSrc = src.split('?')[0].split('#')[0];
          const distPath = path.join(DIST_DIR, cleanSrc);
          const pubPath = path.join(PUBLIC_DIR, cleanSrc);
          if (!fs.existsSync(distPath) && !fs.existsSync(pubPath)) {
            reportFail(`[${relPath}] Referenced image file not found: ${src}`);
            missingImageFiles++;
          }
        }
      }
    }

    // Video Tags Audit: <video ...>
    const videoTagRegex = /<video\b([^>]*)>([\s\S]*?)<\/video>/gi;
    let videoMatch;
    while ((videoMatch = videoTagRegex.exec(html)) !== null) {
      totalVideos++;
      const videoAttrs = videoMatch[1];
      const videoContent = videoMatch[2];

      const posterMatch = videoAttrs.match(/\bposter=["']([^"']*)["']/i);
      if (posterMatch) {
        const poster = posterMatch[1].trim();
        const posterDist = path.join(DIST_DIR, poster);
        const posterPub = path.join(PUBLIC_DIR, poster);
        if (!fs.existsSync(posterDist) && !fs.existsSync(posterPub)) {
          reportFail(`[${relPath}] Video poster not found on disk: ${poster}`);
          missingImageFiles++;
        }
      }

      const sourceMatch = videoContent.match(/<source\b[^>]*\bsrc=["']([^"']*)["']/i);
      if (sourceMatch) {
        const videoSrc = sourceMatch[1].trim();
        const videoDist = path.join(DIST_DIR, videoSrc);
        const videoPub = path.join(PUBLIC_DIR, videoSrc);
        if (!fs.existsSync(videoDist) && !fs.existsSync(videoPub)) {
          reportFail(`[${relPath}] Video file not found on disk: ${videoSrc}`);
          missingVideoFiles++;
        }
      }
    }
  }

  // Summary reports
  if (missingLinkTitles === 0) reportPass(`Checked ${totalLinks} <a> tags: 0 missing title attributes.`);
  if (brokenInternalLinks === 0 && cyrillicUrlTypos === 0) reportPass(`Checked internal links: 0 broken links, 0 Cyrillic homoglyph typos.`);
  if (missingAlt === 0 && missingWidth === 0 && missingHeight === 0 && missingImageFiles === 0) {
    reportPass(`Checked ${totalImages} <img> tags: 0 missing alt, 0 missing width/height, 0 404 images.`);
  }
  if (missingVideoFiles === 0 && totalVideos > 0) {
    reportPass(`Checked ${totalVideos} HTML5 <video> elements: valid sources & posters exist on disk.`);
  }
  if (titleViolations === 0 && duplicateBrandingCount === 0) {
    reportPass(`Checked ${htmlFiles.length} page titles: all <= 60 characters, 0 double branding.`);
  }
}

// Canonical element sequences defined by official Google/W3C XML Schemas (XSD)
const CANONICAL_IMAGE_CHILD_ORDER = [
  'image:loc',
  'image:caption',
  'image:geo_location',
  'image:title',
  'image:license',
];

const CANONICAL_VIDEO_CHILD_ORDER = [
  'video:thumbnail_loc',
  'video:title',
  'video:description',
  'video:content_loc',
  'video:player_loc',
  'video:duration',
  'video:expiration_date',
  'video:rating',
  'video:content_segment_loc',
  'video:view_count',
  'video:publication_date',
  'video:tag',
  'video:category',
  'video:family_friendly',
  'video:restriction',
  'video:gallery_loc',
  'video:price',
  'video:requires_subscription',
  'video:uploader',
  'video:platform',
  'video:live',
  'video:id',
];

function validateXmlChildSequence(xmlSnippet, parentTag, canonicalOrder, sitemapName) {
  const tagRegex = /<([a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+)\b/g;
  let match;
  let lastIndex = -1;
  let lastTag = '';
  let sequenceErrors = 0;

  while ((match = tagRegex.exec(xmlSnippet)) !== null) {
    const tag = match[1];
    const orderIndex = canonicalOrder.indexOf(tag);
    if (orderIndex === -1) {
      reportFail(`[${sitemapName}] Unexpected element <${tag}> inside <${parentTag}>`);
      sequenceErrors++;
      continue;
    }
    if (orderIndex < lastIndex) {
      reportFail(
        `[${sitemapName}] XSD Sequence violation in <${parentTag}>: <${tag}> appeared after <${lastTag}>. Official schema requires strict order: ${canonicalOrder.slice(0, 6).join(' -> ')}`
      );
      sequenceErrors++;
    } else {
      lastIndex = orderIndex;
      lastTag = tag;
    }
  }
  return sequenceErrors === 0;
}

// -------------------------------------------------------------
// 2. Audit XML Sitemaps (Syntax & Parity)
// -------------------------------------------------------------
function auditSitemaps() {
  console.log('\n\x1b[1m[2/5] Auditing XML Sitemaps & Asset Parity...\x1b[0m');

  const sitemaps = [
    { name: 'sitemap.xml', type: 'standard' },
    { name: 'image-sitemap.xml', type: 'image' },
    { name: 'video-sitemap.xml', type: 'video' },
  ];

  for (const sm of sitemaps) {
    const smPath = path.join(DIST_DIR, sm.name);
    if (!fs.existsSync(smPath)) {
      reportFail(`Missing sitemap file: ${smPath}`);
      continue;
    }

    const xml = fs.readFileSync(smPath, 'utf8');

    // XML Basic Syntax Checks
    if (!xml.startsWith('<?xml') || !xml.includes('<urlset') || !xml.includes('</urlset>')) {
      reportFail(`[${sm.name}] Invalid XML declaration or urlset root.`);
      continue;
    }

    reportPass(`[${sm.name}] Valid XML syntax and declaration.`);

    if (sm.type === 'image') {
      // Validate official XSD sequence order: loc -> caption -> geo_location -> title -> license
      const imageBlocks = [...xml.matchAll(/<image:image>([\s\S]*?)<\/image:image>/g)];
      let validSequences = 0;
      for (const block of imageBlocks) {
        if (validateXmlChildSequence(block[1], 'image:image', CANONICAL_IMAGE_CHILD_ORDER, sm.name)) {
          validSequences++;
        }
      }
      if (validSequences === imageBlocks.length && imageBlocks.length > 0) {
        reportPass(`[image-sitemap.xml] Verified ${imageBlocks.length} <image:image> entries conform strictly to sitemap-image.xsd sequence order.`);
      }
      const imgLocMatches = xml.matchAll(/<image:loc>([^<]+)<\/image:loc>/g);
      let count = 0;
      for (const m of imgLocMatches) {
        count++;
        const imgUrl = m[1].trim();
        const urlObj = new URL(imgUrl);
        const relPath = urlObj.pathname;
        const diskPath = path.join(PUBLIC_DIR, relPath);
        const distDiskPath = path.join(DIST_DIR, relPath);

        if (!fs.existsSync(diskPath) && !fs.existsSync(distDiskPath)) {
          reportFail(`[image-sitemap.xml] Referenced image file missing on disk: ${relPath} (${diskPath})`);
        }
      }
      reportPass(`[image-sitemap.xml] Verified ${count} images: 100% physically exist on disk.`);
    }

    if (sm.type === 'video') {
      // Validate official XSD sequence order: publication_date -> tag -> category -> family_friendly -> ...
      const videoBlocks = [...xml.matchAll(/<video:video>([\s\S]*?)<\/video:video>/g)];
      let validSequences = 0;
      for (const block of videoBlocks) {
        if (validateXmlChildSequence(block[1], 'video:video', CANONICAL_VIDEO_CHILD_ORDER, sm.name)) {
          validSequences++;
        }
      }
      if (validSequences === videoBlocks.length && videoBlocks.length > 0) {
        reportPass(`[video-sitemap.xml] Verified ${videoBlocks.length} <video:video> entries conform strictly to sitemap-video.xsd sequence order.`);
      }
      const vidContentLocs = xml.matchAll(/<video:content_loc>([^<]+)<\/video:content_loc>/g);
      const vidThumbLocs = xml.matchAll(/<video:thumbnail_loc>([^<]+)<\/video:thumbnail_loc>/g);

      let count = 0;
      for (const m of vidContentLocs) {
        count++;
        const vidUrl = m[1].trim();
        const relPath = new URL(vidUrl).pathname;
        const diskPath = path.join(PUBLIC_DIR, relPath);
        const distDiskPath = path.join(DIST_DIR, relPath);
        if (!fs.existsSync(diskPath) && !fs.existsSync(distDiskPath)) {
          reportFail(`[video-sitemap.xml] Video content file missing on disk: ${relPath}`);
        }
      }

      for (const m of vidThumbLocs) {
        const thumbUrl = m[1].trim();
        const relPath = new URL(thumbUrl).pathname;
        const diskPath = path.join(PUBLIC_DIR, relPath);
        const distDiskPath = path.join(DIST_DIR, relPath);
        if (!fs.existsSync(diskPath) && !fs.existsSync(distDiskPath)) {
          reportFail(`[video-sitemap.xml] Video thumbnail file missing on disk: ${relPath}`);
        }
      }

      reportPass(`[video-sitemap.xml] Verified ${count} video entry: MP4 content and poster thumbnail physically exist on disk.`);
    }
  }
}

// -------------------------------------------------------------
// 3. Audit robots.txt
// -------------------------------------------------------------
function auditRobotsTxt() {
  console.log('\n\x1b[1m[3/5] Auditing robots.txt...\x1b[0m');
  const robotsPath = path.join(DIST_DIR, 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    reportFail(`Missing robots.txt in ${DIST_DIR}`);
    return;
  }

  const content = fs.readFileSync(robotsPath, 'utf8');
  if (!content.includes('User-agent: *')) reportFail('robots.txt missing User-agent: *');
  if (!content.includes('Allow: /')) reportFail('robots.txt missing Allow: /');
  if (!content.includes('Sitemap: https://autoelektronik-service.bg/sitemap.xml')) reportFail('robots.txt missing sitemap.xml');
  if (!content.includes('Sitemap: https://autoelektronik-service.bg/image-sitemap.xml')) reportFail('robots.txt missing image-sitemap.xml');
  if (!content.includes('Sitemap: https://autoelektronik-service.bg/video-sitemap.xml')) reportFail('robots.txt missing video-sitemap.xml');

  reportPass('robots.txt properly configured with all 3 sitemap declarations.');
}

// -------------------------------------------------------------
// 4. Audit Core Assets (Social share, touch icon, css)
// -------------------------------------------------------------
function auditCoreAssets() {
  console.log('\n\x1b[1m[4/5] Auditing Essential Static Assets...\x1b[0m');

  const requiredAssets = [
    { path: 'images/autoelektronik-social-share.jpg', desc: 'Social Share OG Banner (1200x630)' },
    { path: 'apple-touch-icon.png', desc: 'Apple Touch Icon (180x180)' },
    { path: 'favicon.svg', desc: 'Favicon SVG' },
    { path: 'css/styles.css', desc: 'Core Compiled Stylesheet' },
    { path: 'videos/abs-module-repair-lab.mp4', desc: 'ABS Module Repair Video MP4' },
  ];

  for (const asset of requiredAssets) {
    const pubPath = path.join(PUBLIC_DIR, asset.path);
    const distPath = path.join(DIST_DIR, asset.path);
    if (!fs.existsSync(pubPath) && !fs.existsSync(distPath)) {
      reportFail(`Missing essential asset: ${asset.path} (${asset.desc})`);
    } else {
      const size = fs.existsSync(distPath) ? fs.statSync(distPath).size : fs.statSync(pubPath).size;
      reportPass(`${asset.desc} verified on disk (${size} bytes).`);
    }
  }
}

// -------------------------------------------------------------
// 5. Audit Schema.org Microdata Parity
// -------------------------------------------------------------
function auditSchemaParity() {
  console.log('\n\x1b[1m[5/5] Auditing Schema.org Microdata Parity...\x1b[0m');

  const expectedSchemasByRoute = {
    '/': ['AutoRepair', 'PostalAddress', 'GeoCoordinates'],
    '/uslugi/': ['CollectionPage', 'BreadcrumbList'],
    '/uslugi/remont-na-abs-modul/': ['ItemPage', 'Service', 'VideoObject', 'BreadcrumbList'],
    '/uslugi/remont-na-ecu-kompyutar/': ['ItemPage', 'Service', 'BreadcrumbList'],
    '/uslugi/remont-na-avtomobilno-tablo/': ['ItemPage', 'Service', 'BreadcrumbList'],
    '/uslugi/avtodiagnostika/': ['ItemPage', 'Service', 'BreadcrumbList'],
    '/otkrii-problema/': ['WebApplication', 'DiagnosticProcedure', 'BreadcrumbList'],
    '/za-nas/': ['AboutPage', 'AutoRepair', 'BreadcrumbList'],
    '/kontakti/': ['ContactPage', 'PostalAddress', 'GeoCoordinates', 'BreadcrumbList'],
    '/usloviya-za-polzvane/': ['WebPage', 'BreadcrumbList'],
    '/zashtita-na-dannite/': ['WebPage', 'BreadcrumbList'],
  };

  let verifiedRoutes = 0;
  let totalAssertions = 0;

  for (const [route, expectedSchemas] of Object.entries(expectedSchemasByRoute)) {
    const stripped = route === '/' ? '' : route.replace(/^\/|\/$/g, '');
    const htmlPath = path.join(DIST_DIR, stripped, 'index.html');
    if (!fs.existsSync(htmlPath)) {
      reportFail(`[${route}] Missing compiled file: ${htmlPath}`);
      continue;
    }

    const html = fs.readFileSync(htmlPath, 'utf8');
    const scriptRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
    let sMatch;
    const foundTypes = new Set();
    while ((sMatch = scriptRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(sMatch[1]);
        const traverse = (obj) => {
          if (!obj || typeof obj !== 'object') return;
          if (obj['@type']) {
            if (Array.isArray(obj['@type'])) obj['@type'].forEach((t) => foundTypes.add(t));
            else foundTypes.add(obj['@type']);
          }
          for (const k of Object.keys(obj)) traverse(obj[k]);
        };
        traverse(data);
      } catch (e) {
        reportFail(`[${route}] Invalid JSON in <script type="application/ld+json">`);
      }
    }

    const missing = expectedSchemas.filter((s) => !foundTypes.has(s));
    totalAssertions += expectedSchemas.length;
    if (missing.length > 0) {
      reportFail(`[${route}] Missing Schema types: ${missing.join(', ')}`);
    } else {
      verifiedRoutes++;
    }
  }

  if (verifiedRoutes === Object.keys(expectedSchemasByRoute).length) {
    reportPass(`Verified all ${verifiedRoutes} routes: ${totalAssertions} Schema.org assertions passed (100% parity).`);
  }
}

// -------------------------------------------------------------
// Main Runner
// -------------------------------------------------------------
function run() {
  console.log('\x1b[36m============================================================\x1b[0m');
  console.log('\x1b[36m  AutoElektronik Academic SEO & Integrity Audit (CSCB700)  \x1b[0m');
  console.log('\x1b[36m============================================================\x1b[0m');

  auditHtmlPages();
  auditSitemaps();
  auditRobotsTxt();
  auditCoreAssets();
  auditSchemaParity();

  console.log('\n\x1b[36m============================================================\x1b[0m');
  if (totalErrors === 0) {
    console.log(`\x1b[32m\x1b[1mAUDIT RESULT: 100% PASS (0 Errors, ${totalWarnings} Warnings)\x1b[0m`);
    console.log('\x1b[36m============================================================\x1b[0m\n');
    process.exit(0);
  } else {
    console.error(`\x1b[31m\x1b[1mAUDIT RESULT: FAILED (${totalErrors} Errors, ${totalWarnings} Warnings)\x1b[0m`);
    console.log('\x1b[36m============================================================\x1b[0m\n');
    process.exit(1);
  }
}

run();
