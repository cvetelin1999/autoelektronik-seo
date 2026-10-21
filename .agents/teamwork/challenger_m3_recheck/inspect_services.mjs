import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');

for (const f of ['uslugi/index.html', 'uslugi/remont-na-abs-modul/index.html']) {
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
