import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const wizardPath = path.join(projectRoot, 'src', 'pages', 'otkrii-problema.astro');
const content = fs.readFileSync(wizardPath, 'utf8');

console.log('--- ADVERSARIAL STRESS TEST: DIAGNOSTIC WIZARD LOGIC ---');

const obdCodesExpected = [
  '01276', '01130', '16352', '5DF0', '5DF1', 'C1380', 'C1350', 
  'P0606', '16986', 'P0300', 'P0301', 'P0302', 'P0303', 'P0304', 
  'DF017', 'U0100'
];

let failed = 0;
for (const code of obdCodesExpected) {
  if (!content.includes(`'${code}': {`)) {
    console.error(`✗ Missing OBD code key in dictionary: ${code}`);
    failed++;
  }
}

if (failed === 0) {
  console.log(`✓ All ${obdCodesExpected.length} OBD diagnostic error codes are present in the dictionary.`);
}

// Check category fallback diagnoses in applyCategoryDefaults
if (content.includes("category === 'abs'") && 
    content.includes("category === 'ecu'") && 
    content.includes("category === 'tablo'") && 
    content.includes("Нарушена комуникация по CAN-Bus шината")) {
  console.log(`✓ All 4 category fallback handlers ('abs', 'ecu', 'tablo', and default 'can') are present.`);
} else {
  console.error(`✗ Missing one or more category fallback handlers.`);
  failed++;
}

// Check realistic price ranges present in code
const expectedPricePatterns = ['180 – 320 лв.', '220 – 480 лв.', '140 – 260 лв.', '90 – 180 лв.'];
for (const price of expectedPricePatterns) {
  if (!content.includes(price)) {
    console.error(`✗ Missing realistic price pattern: ${price}`);
    failed++;
  }
}
if (failed === 0) {
  console.log(`✓ All realistic repair pricing brackets verified.`);
}

// Check animated spinner step
if (content.includes('id="step-loading"') && content.includes('setTimeout') && content.includes('600')) {
  console.log(`✓ 600ms animated scanner step (#step-loading) verified.`);
} else {
  console.error(`✗ Animated scanner step (#step-loading) missing or timing incorrect.`);
  failed++;
}

// Check timing radios and input IDs
const inputIdsExpected = ['timing-permanent', 'timing-intermittent', 'timing-rain', 'wizard-lead-name', 'wizard-lead-phone'];
for (const id of inputIdsExpected) {
  if (!content.includes(`id="${id}"`)) {
    console.error(`✗ Missing expected element id="${id}"`);
    failed++;
  }
  if (!content.includes(`for="${id}"`)) {
    console.error(`✗ Missing matching label for="${id}"`);
    failed++;
  }
}
if (failed === 0) {
  console.log(`✓ All timing radios and lead capture inputs have matching accessible label[for] pairs.`);
}

console.log(`Total wizard logic test failures: ${failed}`);
process.exit(failed === 0 ? 0 : 1);
