const fs = require('fs');

console.log('=== ADVERSARIAL STRESS TEST: DIAGNOSTIC WIZARD LOGIC ===\n');

const html = fs.readFileSync('dist/otkrii-problema/index.html', 'utf8');

// Extract wizard script (the one containing obdDatabase)
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
const scriptContent = scripts.find(s => s.includes('obdDatabase'));
if (!scriptContent) {
  console.error('FAIL: No script containing obdDatabase found in otkrii-problema');
  process.exit(1);
}

// Verify all expected handlers and elements are present in script
const requiredScriptKeywords = [
  'obdDatabase',
  'startDiagnosticScan',
  'showResult',
  'applyCategoryDefaults',
  'resetWizard',
  'selectedCategory',
  'selectedBrand',
  'error-code-input',
  'timing',
  'wizard-lead-form',
  'scanner-progress-bar'
];

requiredScriptKeywords.forEach(kw => {
  if (scriptContent.includes(kw)) {
    console.log(`PASS: Script contains "${kw}"`);
  } else {
    console.error(`FAIL: Script missing "${kw}"`);
  }
});

// Test OBD Code Coverage
const testCodes = [
  { input: '01276', expectedCategory: 'abs', expectedSubstr: 'V64' },
  { input: '01130', expectedCategory: 'abs', expectedSubstr: '01130' },
  { input: '16352', expectedCategory: 'abs', expectedSubstr: '16352' },
  { input: '5df0', expectedCategory: 'abs', expectedSubstr: '5DF0' }, // lowercase test
  { input: ' 5DF1 ', expectedCategory: 'abs', expectedSubstr: '5DF1' }, // whitespace test
  { input: 'c1380', expectedCategory: 'abs', expectedSubstr: 'C1380' },
  { input: 'C1350', expectedCategory: 'abs', expectedSubstr: 'C1350' },
  { input: 'p0606', expectedCategory: 'ecu', expectedSubstr: 'P0606' },
  { input: '16986', expectedCategory: 'ecu', expectedSubstr: '16986' },
  { input: 'p0300', expectedCategory: 'ecu', expectedSubstr: 'P0300' },
  { input: 'P0301', expectedCategory: 'ecu', expectedSubstr: 'P0301' },
  { input: 'P0302', expectedCategory: 'ecu', expectedSubstr: 'P0302' },
  { input: 'P0303', expectedCategory: 'ecu', expectedSubstr: 'P0303' },
  { input: 'P0304', expectedCategory: 'ecu', expectedSubstr: 'P0304' },
  { input: 'df017', expectedCategory: 'ecu', expectedSubstr: 'DF017' },
  { input: 'u0100', expectedCategory: 'can', expectedSubstr: 'U0100' },
  { input: 'XYZ999', expectedCategory: 'custom', expectedSubstr: 'XYZ999' } // Unknown code
];

// Evaluate the obdDatabase object from the script
const dbMatch = scriptContent.match(/const obdDatabase = (\{[\s\S]*?\n\s*\});/);
if (!dbMatch) {
  console.error('FAIL: obdDatabase definition could not be extracted');
  process.exit(1);
}

let obdDatabase;
try {
  eval(`obdDatabase = ${dbMatch[1]}`);
  console.log(`PASS: obdDatabase evaluated successfully with ${Object.keys(obdDatabase).length} entries.`);
} catch (e) {
  console.error('FAIL evaluating obdDatabase:', e);
  process.exit(1);
}

testCodes.forEach(({ input, expectedCategory, expectedSubstr }) => {
  const rawCode = input.trim().toUpperCase();
  let matched = null;
  for (const [key, data] of Object.entries(obdDatabase)) {
    if (rawCode.includes(key) || key.includes(rawCode)) {
      matched = { code: key, ...data };
      break;
    }
  }

  if (expectedCategory === 'custom') {
    if (matched === null) {
      console.log(`PASS: Unrecognized code "${input}" properly falls back to generic / category default.`);
    } else {
      console.error(`FAIL: Unrecognized code "${input}" matched unexpectedly to:`, matched);
    }
  } else {
    if (matched && matched.code === rawCode) {
      console.log(`PASS: Code "${input}" cleanly matched ${matched.code} (${matched.title})`);
    } else {
      console.error(`FAIL: Code "${input}" failed to match correctly. Result:`, matched);
    }
  }
});

// Test HTML5 phrasing inside buttons
const buttonMatches = [...html.matchAll(/<button[\s\S]*?<\/button>/gi)].map(m => m[0]);
let invalidButtonPhrasingCount = 0;
buttonMatches.forEach((btn, i) => {
  if (/<(div|p|h[1-6]|section|article|header|footer)\b/i.test(btn)) {
    console.error(`FAIL: Button ${i} contains non-phrasing content: ${btn.substring(0, 100)}`);
    invalidButtonPhrasingCount++;
  }
});
if (invalidButtonPhrasingCount === 0) {
  console.log(`PASS: All ${buttonMatches.length} <button> elements contain only valid HTML5 phrasing content.`);
}

console.log('\n=== WIZARD STRESS TEST COMPLETE ===');
