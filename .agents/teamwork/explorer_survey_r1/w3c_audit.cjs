const fs = require('fs');
const path = require('path');

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = getHtmlFiles('./dist');
const report = [];

files.forEach(f => {
  const rel = path.relative('.', f);
  const content = fs.readFileSync(f, 'utf8');
  const fileIssues = [];

  // Check duplicate IDs
  const idMatches = content.matchAll(/\sid="([^"]+)"/g);
  const ids = {};
  for (const m of idMatches) {
    const id = m[1];
    if (ids[id]) {
      fileIssues.push({ type: 'duplicate-id', id });
    }
    ids[id] = (ids[id] || 0) + 1;
  }

  // Check unencoded ampersands (e.g. & not followed by amp; or valid entity)
  // excluding script, style, json-ld
  const cleanBody = content.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  const unencodedAmp = cleanBody.match(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[a-f\d]+);)/gi);
  if (unencodedAmp) {
    fileIssues.push({ type: 'unencoded-ampersands', count: unencodedAmp.length });
  }

  // Check missing alt on img
  const imgWithoutAlt = (content.match(/<img\b(?![^>]*\balt=)[^>]*>/gi) || []).length;
  if (imgWithoutAlt > 0) fileIssues.push({ type: 'img-missing-alt', count: imgWithoutAlt });

  // Check missing title on a
  const aWithoutTitle = (content.match(/<a\b(?![^>]*\btitle=)[^>]*>/gi) || []).length;
  if (aWithoutTitle > 0) fileIssues.push({ type: 'a-missing-title', count: aWithoutTitle });

  // Check form inputs without id/label
  const inputs = content.match(/<input\b[^>]*>/gi) || [];
  inputs.forEach(inp => {
    if (inp.includes('type="hidden"') || inp.includes('type="submit"') || inp.includes('type="button"')) return;
    if (!inp.includes('id=') && !inp.includes('aria-label=') && !inp.includes('aria-labelledby=')) {
      fileIssues.push({ type: 'input-missing-accessible-name', input: inp });
    }
  });

  if (fileIssues.length > 0) {
    report.push({ file: rel, issues: fileIssues });
  }
});

console.log('Audit completed. Files with issues:', report.length);
console.log(JSON.stringify(report, null, 2));
