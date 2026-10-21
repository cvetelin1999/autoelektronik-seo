import fs from 'node:fs';
import path from 'node:path';

const projectRoot = 'c:\\Users\\Asus\\Documents\\antigravity\\hopeful-bardeen';
const distDir = path.join(projectRoot, 'dist');
const publicDir = path.join(projectRoot, 'public');

console.log('--- INDEPENDENT VICTORY AUDITOR SITEMAP & ROBOTS AUDIT ---');

let totalIssues = 0;

// 1. robots.txt
const robotsPath = path.join(distDir, 'robots.txt');
if (!fs.existsSync(robotsPath)) {
  console.error('[FAIL] dist/robots.txt does not exist');
  totalIssues++;
} else {
  const robots = fs.readFileSync(robotsPath, 'utf8');
  const requiredLines = [
    'User-agent: *',
    'Allow: /',
    'Sitemap: https://autoelektronik-service.bg/sitemap.xml',
    'Sitemap: https://autoelektronik-service.bg/image-sitemap.xml',
    'Sitemap: https://autoelektronik-service.bg/video-sitemap.xml'
  ];
  for (const line of requiredLines) {
    if (!robots.includes(line)) {
      console.error(`[FAIL] robots.txt missing line: ${line}`);
      totalIssues++;
    }
  }
  console.log('✓ robots.txt contains all required directives and sitemaps');
}

// 2. sitemap.xml
const smPath = path.join(distDir, 'sitemap.xml');
if (!fs.existsSync(smPath)) {
  console.error('[FAIL] dist/sitemap.xml does not exist');
  totalIssues++;
} else {
  const sm = fs.readFileSync(smPath, 'utf8');
  if (!sm.startsWith('<?xml') || !sm.includes('<urlset') || !sm.includes('</urlset>')) {
    console.error('[FAIL] sitemap.xml invalid XML root structure');
    totalIssues++;
  }
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  console.log(`✓ sitemap.xml valid XML with ${locs.length} URLs (Expected 11)`);
  if (locs.length !== 11) {
    console.error(`[FAIL] Expected 11 URLs in sitemap.xml, found ${locs.length}`);
    totalIssues++;
  }
  for (const url of locs) {
    const urlObj = new URL(url);
    const rel = urlObj.pathname.replace(/^\/|\/$/g, '');
    const p = rel ? path.join(distDir, rel, 'index.html') : path.join(distDir, 'index.html');
    if (!fs.existsSync(p)) {
      console.error(`[FAIL] sitemap.xml URL points to missing file: ${url} -> ${p}`);
      totalIssues++;
    }
  }
}

// 3. image-sitemap.xml
const imgSmPath = path.join(distDir, 'image-sitemap.xml');
if (!fs.existsSync(imgSmPath)) {
  console.error('[FAIL] dist/image-sitemap.xml does not exist');
  totalIssues++;
} else {
  const imgSm = fs.readFileSync(imgSmPath, 'utf8');
  if (!imgSm.startsWith('<?xml') || !imgSm.includes('<urlset') || !imgSm.includes('</urlset>')) {
    console.error('[FAIL] image-sitemap.xml invalid XML root structure');
    totalIssues++;
  }
  const imgLocs = [...imgSm.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map(m => m[1]);
  console.log(`✓ image-sitemap.xml valid XML with ${imgLocs.length} image:loc entries`);
  if (imgLocs.length === 0) {
    console.error('[FAIL] image-sitemap.xml contains 0 image:loc entries');
    totalIssues++;
  }
  for (const imgUrl of imgLocs) {
    const u = new URL(imgUrl);
    const rel = u.pathname;
    const diskP = path.join(distDir, rel);
    const pubP = path.join(publicDir, rel);
    if (!fs.existsSync(diskP) && !fs.existsSync(pubP)) {
      console.error(`[FAIL] image-sitemap.xml image missing on disk: ${imgUrl}`);
      totalIssues++;
    }
  }
}

// 4. video-sitemap.xml
const vidSmPath = path.join(distDir, 'video-sitemap.xml');
if (!fs.existsSync(vidSmPath)) {
  console.error('[FAIL] dist/video-sitemap.xml does not exist');
  totalIssues++;
} else {
  const vidSm = fs.readFileSync(vidSmPath, 'utf8');
  if (!vidSm.startsWith('<?xml') || !vidSm.includes('<urlset') || !vidSm.includes('</urlset>')) {
    console.error('[FAIL] video-sitemap.xml invalid XML root structure');
    totalIssues++;
  }
  const vidContentLocs = [...vidSm.matchAll(/<video:content_loc>([^<]+)<\/video:content_loc>/g)].map(m => m[1]);
  const vidThumbLocs = [...vidSm.matchAll(/<video:thumbnail_loc>([^<]+)<\/video:thumbnail_loc>/g)].map(m => m[1]);
  console.log(`✓ video-sitemap.xml valid XML with ${vidContentLocs.length} video:content_loc entries`);
  if (vidContentLocs.length === 0) {
    console.error('[FAIL] video-sitemap.xml contains 0 video entries');
    totalIssues++;
  }
  for (const vUrl of vidContentLocs) {
    const u = new URL(vUrl);
    const rel = u.pathname;
    const diskP = path.join(distDir, rel);
    const pubP = path.join(publicDir, rel);
    if (!fs.existsSync(diskP) && !fs.existsSync(pubP)) {
      console.error(`[FAIL] video content missing on disk: ${vUrl}`);
      totalIssues++;
    }
  }
  for (const tUrl of vidThumbLocs) {
    const u = new URL(tUrl);
    const rel = u.pathname;
    const diskP = path.join(distDir, rel);
    const pubP = path.join(publicDir, rel);
    if (!fs.existsSync(diskP) && !fs.existsSync(pubP)) {
      console.error(`[FAIL] video thumbnail missing on disk: ${tUrl}`);
      totalIssues++;
    }
  }
}

console.log(`Total Sitemap & robots.txt issues: ${totalIssues}`);
process.exit(totalIssues === 0 ? 0 : 1);
