import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');

const restFiles = [
  'uslugi/remont-na-ecu-kompyutar/index.html',
  'uslugi/remont-na-avtomobilno-tablo/index.html',
  'uslugi/avtodiagnostika/index.html',
  'usloviya-za-polzvane/index.html',
  'zashtita-na-dannite/index.html'
];

for (const f of restFiles) {
  console.log(`\n=== dist/${f} ===`);
  const html = fs.readFileSync(path.join(DIST_DIR, f), 'utf8');
  const regex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
  let m;
  let i = 0;
  while ((m = regex.exec(html)) !== null) {
    i++;
    console.log(`\n--- Script #${i} ---`);
    const parsed = JSON.parse(m[1]);
    console.log(JSON.stringify(parsed, null, 2));
  }
}
