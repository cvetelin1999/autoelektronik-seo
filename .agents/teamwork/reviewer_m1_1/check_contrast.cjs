const fs = require('fs');

const files = [
  'src/pages/usloviya-za-polzvane.astro',
  'src/pages/zashtita-na-dannite.astro',
  'src/pages/otkrii-problema.astro'
];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('text-slate-400')) {
      console.log(`Found text-slate-400 in ${f}:${idx + 1}: ${line.trim()}`);
    }
  });
});
