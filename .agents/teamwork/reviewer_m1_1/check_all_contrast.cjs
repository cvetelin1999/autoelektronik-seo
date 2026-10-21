const fs = require('fs');
const path = require('path');

function getAstroFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAstroFiles(fullPath));
    } else if (file.endsWith('.astro')) {
      results.push(fullPath);
    }
  });
  return results;
}

const astroFiles = getAstroFiles('src');
console.log('--- Scanning all src/**/*.astro for text-slate-400 ---');
astroFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('text-slate-400')) {
      console.log(`${path.relative('.', f)}:${idx + 1}: ${line.trim()}`);
    }
  });
});
