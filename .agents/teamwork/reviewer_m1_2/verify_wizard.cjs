const fs = require('fs');
const path = require('path');

const srcPath = path.resolve('src/pages/otkrii-problema.astro');
const distPath = path.resolve('dist/otkrii-problema/index.html');

console.log('=== REVIEWER 2 INDEPENDENT VERIFICATION & STRESS-TEST ===\n');

if (!fs.existsSync(srcPath)) {
  console.error('FAIL: Source file does not exist:', srcPath);
  process.exit(1);
}
if (!fs.existsSync(distPath)) {
  console.error('FAIL: Dist file does not exist:', distPath);
  process.exit(1);
}

const src = fs.readFileSync(srcPath, 'utf8');
const dist = fs.readFileSync(distPath, 'utf8');

let errors = [];
let warnings = [];

// 1. Check 16-code OBD lookup table and error code matching
console.log('[Check 1] 16-code OBD lookup table and error code matching:');
const expectedCodes = [
  '01276', '01130', '16352', '5DF0', '5DF1', 'C1380', 'C1350',
  'P0606', '16986', 'P0300', 'P0301', 'P0302', 'P0303', 'P0304',
  'DF017', 'U0100'
];

let foundCodes = [];
for (const code of expectedCodes) {
  if (src.includes(`'${code}':`) || src.includes(`"${code}":`)) {
    foundCodes.push(code);
  } else {
    errors.push(`Missing OBD code in database: ${code}`);
  }
}
console.log(`Found ${foundCodes.length} of ${expectedCodes.length} OBD codes in database.`);
if (foundCodes.length === 16) {
  console.log('✓ PASS: All 16 OBD codes present.');
} else {
  console.log('✗ FAIL: OBD codes mismatch.');
}

// 2. Check symptom timing radio evaluation and summary output
console.log('\n[Check 2] Symptom timing radio evaluation and summary output:');
const timingPermanent = src.includes('timing-permanent') && src.includes('value="permanent"');
const timingIntermittent = src.includes('timing-intermittent') && src.includes('value="intermittent"');
const timingRain = src.includes('timing-rain') && src.includes('value="rain"');
const timingEval = src.includes("const timingVal = selectedTimingInput ? selectedTimingInput.value : 'permanent'");
const timingDisplay = src.includes('resTiming.innerText = timingDescription');

if (timingPermanent && timingIntermittent && timingRain && timingEval && timingDisplay) {
  console.log('✓ PASS: Symptom timing radio options and dynamic summary evaluation verified.');
} else {
  errors.push('Symptom timing radios or evaluation logic incomplete.');
  console.log('✗ FAIL: Symptom timing check failed.');
}

// 3. Check realistic repair price brackets, turnaround times, and 12-month warranty
console.log('\n[Check 3] Repair price brackets, turnaround times, 12-month warranty:');
const absPrice = src.includes('180 – 320 лв.');
const ecuPrice = src.includes('220 – 480 лв.');
const tabloPrice = src.includes('140 – 260 лв.');
const canPrice = src.includes('90 – 180 лв.');
const turnaroundTime = src.includes('24 – 48 часа') || src.includes('24–48 ч.');
const warranty = src.includes('12 месеца пълна гаранция');

if (absPrice && ecuPrice && tabloPrice && canPrice && turnaroundTime && warranty) {
  console.log('✓ PASS: Price brackets (ABS, ECU, Dashboard, CAN), turnaround times, and 12-month warranty verified.');
} else {
  errors.push('Price brackets or warranty missing in source.');
  console.log('✗ FAIL: Realistic repair estimates incomplete.');
}

// 4. Check 600ms animated calculation step (#step-loading)
console.log('\n[Check 4] 600ms animated calculation step (#step-loading):');
const stepLoadingExists = src.includes('id="step-loading"') && dist.includes('id="step-loading"');
const timeout600 = src.includes('setTimeout(') && src.includes('600);');
const scannerProgress = src.includes('scanner-progress-bar');
const ariaLive = src.includes('role="status"') && src.includes('aria-live="polite"');

if (stepLoadingExists && timeout600 && scannerProgress && ariaLive) {
  console.log('✓ PASS: #step-loading has 600ms transition, animated scanner bar, and aria-live.');
} else {
  errors.push('Step loading animation or timing check failed.');
  console.log('✗ FAIL: #step-loading verification failed.');
}

// 5. Check HTML5 phrasing model: ensure no <div> inside <button>
console.log('\n[Check 5] HTML5 phrasing model: ensure no <div> inside <button>:');
// Parse buttons in dist
const buttonRegex = /<button\b[^>]*>([\s\S]*?)<\/button>/gi;
let match;
let buttonCount = 0;
let invalidButtons = 0;
while ((match = buttonRegex.exec(dist)) !== null) {
  buttonCount++;
  const buttonContent = match[1];
  if (/<div\b/i.test(buttonContent)) {
    invalidButtons++;
    errors.push(`Button ${buttonCount} contains invalid <div> child in dist.`);
  }
}
console.log(`Audited ${buttonCount} <button> tags in dist/otkrii-problema/index.html.`);
if (invalidButtons === 0 && buttonCount > 0) {
  console.log('✓ PASS: 0 <div> elements found inside <button> tags (100% HTML5 phrasing compliant).');
} else {
  console.log(`✗ FAIL: Found ${invalidButtons} invalid <button> tags containing <div>.`);
}

// 6. Check accessibility: verify <label for="..."> on lead form inputs
console.log('\n[Check 6] Accessibility: verify <label for="..."> on lead form inputs:');
const leadNameLabel = src.includes('<label for="wizard-lead-name"') && src.includes('id="wizard-lead-name"');
const leadPhoneLabel = src.includes('<label for="wizard-lead-phone"') && src.includes('id="wizard-lead-phone"');
const errorCodeLabel = src.includes('<label for="error-code-input"') && src.includes('id="error-code-input"');
const timingLabels = src.includes('<label for="timing-permanent"') &&
                     src.includes('<label for="timing-intermittent"') &&
                     src.includes('<label for="timing-rain"');

if (leadNameLabel && leadPhoneLabel && errorCodeLabel && timingLabels) {
  console.log('✓ PASS: All lead form and wizard input elements have explicit matching <label for="...">.');
} else {
  errors.push('Missing label for attribute or matching id.');
  console.log('✗ FAIL: Accessibility check failed.');
}

// 7. Check script placement inside <BaseLayout> preventing hoisting past </html>
console.log('\n[Check 7] Script placement inside <BaseLayout>:');
const lastScriptEnd = src.lastIndexOf('</script>');
const baseLayoutEnd = src.lastIndexOf('</BaseLayout>');
const htmlEndInDist = dist.lastIndexOf('</html>');
const scriptInDist = dist.lastIndexOf('</script>');

const isInsideBaseLayout = lastScriptEnd !== -1 && baseLayoutEnd !== -1 && lastScriptEnd < baseLayoutEnd;
const isBeforeHtmlInDist = scriptInDist !== -1 && htmlEndInDist !== -1 && scriptInDist < htmlEndInDist;

if (isInsideBaseLayout && isBeforeHtmlInDist) {
  console.log('✓ PASS: Script is inside <BaseLayout> before </BaseLayout>, and rendered before </html> in dist.');
} else {
  errors.push('Script is outside BaseLayout or hoisted after </html>.');
  console.log('✗ FAIL: Script placement check failed.');
}

// 8. Check wizard reset behavior
console.log('\n[Check 8] Wizard reset behavior:');
const hasResetBtn = src.includes('id="restart-wizard-btn"') && src.includes('resetWizard');
const resetsInputs = src.includes("errInput.value = ''") &&
                     src.includes('timingPermanent.checked = true') &&
                     src.includes("leadName.value = ''") &&
                     src.includes("leadPhone.value = ''");
const resetsFeedback = src.includes("successMsg.classList.add('hidden')") &&
                       src.includes("resCodeRow.classList.add('hidden')");
const resetsStep = src.includes('goToStep(1)');

if (hasResetBtn && resetsInputs && resetsFeedback && resetsStep) {
  console.log('✓ PASS: resetWizard clears inputs, resets radio, hides feedback/code row, and returns to step 1.');
} else {
  errors.push('Wizard reset function does not reset all state.');
  console.log('✗ FAIL: Wizard reset check failed.');
}

// 9. Adversarial stress-testing of OBD lookup and matching algorithm
console.log('\n[Check 9] Adversarial stress-testing:');
// Simulate the lookup logic from lines 681-689:
/*
  for (const [codeKey, data] of Object.entries(obdDatabase)) {
    if (rawCode.includes(codeKey) || codeKey.includes(rawCode)) {
      matchedOBD = { code: codeKey, ...data };
      break;
    }
  }
*/

// Extract obdDatabase from src
const dbMatch = src.match(/const obdDatabase = \{([\s\S]*?)\n\s*\};/);
let obdDb = {};
if (dbMatch) {
  eval('obdDb = {' + dbMatch[1] + '};');
}

function matchCode(input) {
  const rawCode = input.trim().toUpperCase();
  if (!rawCode) return null;
  for (const [codeKey, data] of Object.entries(obdDb)) {
    if (rawCode.includes(codeKey) || codeKey.includes(rawCode)) {
      return { code: codeKey, ...data };
    }
  }
  return null;
}

// Test scenarios:
const tests = [
  { input: '01276', expected: '01276', note: 'Exact ABS code' },
  { input: 'p0606', expected: 'P0606', note: 'Lowercase ECU code' },
  { input: '  DF017  ', expected: 'DF017', note: 'Whitespace padded' },
  { input: 'Грешка: 5DF0 помпа', expected: '5DF0', note: 'Substring in user phrase' },
  { input: 'P0303', expected: 'P0303', note: 'Cylinder 3 misfire' },
  { input: 'U0100', expected: 'U0100', note: 'CAN Bus loss' },
  { input: 'UNKNOWN_999', expected: null, note: 'Unknown error code fallback' },
  { input: '', expected: null, note: 'Empty string fallback' },
];

let simPassed = true;
for (const t of tests) {
  const res = matchCode(t.input);
  const matchedKey = res ? res.code : null;
  if (matchedKey === t.expected) {
    console.log(`  ✓ Case "${t.input}": matched -> ${matchedKey} (${t.note})`);
  } else {
    console.log(`  ✗ Case "${t.input}": expected ${t.expected}, got ${matchedKey}`);
    simPassed = false;
  }
}

// Adversarial edge cases:
console.log('\n  Adversarial Edge-Case Analysis:');
const edgeCase1 = matchCode('0');
console.log(`  - Single char '0' -> matched: ${edgeCase1 ? edgeCase1.code : 'null'}`);
const edgeCase2 = matchCode('P');
console.log(`  - Single char 'P' -> matched: ${edgeCase2 ? edgeCase2.code : 'null'}`);
if (edgeCase1 || edgeCase2) {
  warnings.push("Short inputs (e.g. single character '0' or 'P') trigger eager substring matching because of `codeKey.includes(rawCode)`. While not breaking functionality, an input length guard (e.g. rawCode.length >= 3) would prevent early false-positive matches for single keystrokes.");
}

// Check for integrity violations:
console.log('\n[Check 10] Integrity violation checks:');
// Check if result is hardcoded to bypass wizard
const isResultHardcoded = dist.includes('class="wizard-step"') && !dist.includes('hidden');
// Step-result must be hidden initially
const resultInitiallyHidden = dist.includes('id="step-result" class="wizard-step hidden"');
const loadingInitiallyHidden = dist.includes('id="step-loading" class="wizard-step hidden py-8 text-center"');
const step1InitiallyVisible = dist.includes('id="step-1" class="wizard-step"');

if (resultInitiallyHidden && loadingInitiallyHidden && step1InitiallyVisible) {
  console.log('✓ PASS: Wizard DOM steps correctly initialized (Step 1 visible, steps 2, 3, loading, result hidden). No facade/bypass.');
} else {
  errors.push('Initial visibility state of steps is incorrect (possible bypassed wizard).');
  console.log('✗ FAIL: Initial visibility state check failed.');
}

console.log('\n=== VERIFICATION SUMMARY ===');
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);
if (errors.length > 0) {
  console.log('Errors:', errors);
}
if (warnings.length > 0) {
  console.log('Warnings:', warnings);
}
