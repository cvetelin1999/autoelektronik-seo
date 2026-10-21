import fs from 'fs';

const files = [
  'dist/index.html',
  'dist/uslugi/index.html',
  'dist/uslugi/remont-na-abs-modul/index.html',
  'dist/uslugi/remont-na-ecu-kompyutar/index.html',
  'dist/uslugi/remont-na-avtomobilno-tablo/index.html',
  'dist/uslugi/avtodiagnostika/index.html',
  'dist/otkrii-problema/index.html',
  'dist/za-nas/index.html',
  'dist/kontakti/index.html',
  'dist/usloviya-za-polzvane/index.html',
  'dist/zashtita-na-dannite/index.html'
];

for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const types = [];
  schemas.forEach(s => {
    try {
      const parsed = JSON.parse(s[1]);
      if (Array.isArray(parsed)) {
        parsed.forEach(p => types.push(p['@type']));
      } else {
        types.push(parsed['@type']);
      }
    } catch(e) {
      types.push('INVALID JSON: ' + e.message);
    }
  });
  console.log(`${f}: ${types.join(', ')}`);
}
