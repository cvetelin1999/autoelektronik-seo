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
const brokenLinks = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const regex = /href="([^"]+)"/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const href = match[1];
    if (
      href.startsWith('#') ||
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('tel:') ||
      href.startsWith('mailto:') ||
      href.endsWith('.css') ||
      href.endsWith('.svg') ||
      href.endsWith('.png') ||
      href.endsWith('.jpg') ||
      href.endsWith('.ico')
    ) {
      continue;
    }
    let target = href.split('?')[0].split('#')[0];
    if (target.startsWith('/')) target = target.slice(1);
    
    const directPath = path.join('dist', target);
    const indexPath = path.join('dist', target, 'index.html');
    const htmlPath = path.join('dist', target.endsWith('.html') ? target : target + '.html');
    
    if (!fs.existsSync(directPath) && !fs.existsSync(indexPath) && !fs.existsSync(htmlPath)) {
      brokenLinks.push({ sourceFile: path.relative('.', f), href, target });
    }
  }
});

console.log('Dist files checked:', files.length);
console.log('Broken internal links count:', brokenLinks.length);
console.log(JSON.stringify(brokenLinks, null, 2));
