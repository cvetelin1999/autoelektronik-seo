import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');

const filesToInspect = [
  { file: 'uslugi/index.html', title: 'CollectionPage on /uslugi/' },
  { file: 'uslugi/remont-na-abs-modul/index.html', title: 'ABS Repair (ItemPage, Service, VideoObject)' },
  { file: 'otkrii-problema/index.html', title: 'Wizard (WebApplication, DiagnosticProcedure)' },
  { file: 'za-nas/index.html', title: 'About Us (AboutPage)' },
  { file: 'kontakti/index.html', title: 'Contact (ContactPage)' }
];

for (const item of filesToInspect) {
  console.log(`\n======================================================`);
  console.log(`PAGE: ${item.title} (${item.file})`);
  console.log(`======================================================`);
  const html = fs.readFileSync(path.join(DIST_DIR, item.file), 'utf8');
  const regex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
  let match;
  let count = 0;
  while ((match = regex.exec(html)) !== null) {
    count++;
    console.log(`\n--- Block #${count} ---`);
    const parsed = JSON.parse(match[1]);
    console.log(JSON.stringify(parsed, null, 2));
  }
}
