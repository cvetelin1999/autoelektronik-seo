import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const DIST_HTML_PATH = path.resolve('dist/otkrii-problema/index.html');

console.log('Testing Diagnostic Wizard Decision Tree from compiled HTML...');

if (!fs.existsSync(DIST_HTML_PATH)) {
  console.error(`ERROR: ${DIST_HTML_PATH} does not exist!`);
  process.exit(1);
}

const htmlContent = fs.readFileSync(DIST_HTML_PATH, 'utf8');

// Extract inline script containing the wizard logic
const scriptMatches = [...htmlContent.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
const wizardScriptMatch = scriptMatches.find((m) => m[1].includes('obdDatabase') && m[1].includes('selectedCategory'));

if (!wizardScriptMatch) {
  console.error('ERROR: Could not find wizard inline script in otkrii-problema/index.html!');
  process.exit(1);
}

const rawScript = wizardScriptMatch[1];

// Create Mock DOM environment for VM execution
class MockClassList {
  constructor() {
    this.classes = new Set();
  }
  add(c) { this.classes.add(c); }
  remove(c) { this.classes.delete(c); }
  toggle(c) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); }
  contains(c) { return this.classes.has(c); }
}

class MockElement {
  constructor(id, tag = 'div') {
    this.id = id;
    this.tagName = tag.toUpperCase();
    this.innerText = '';
    this.value = '';
    this.href = '';
    this.checked = false;
    this.classList = new MockClassList();
    this.style = {};
    this.listeners = {};
    this.attributes = {};
  }
  addEventListener(event, handler) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }
  trigger(event, evtObj = {}) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((h) => h(evtObj));
    }
  }
  getAttribute(attr) { return this.attributes[attr]; }
  setAttribute(attr, val) { this.attributes[attr] = val; }
}

function createMockContext() {
  const elements = {};
  const queryMap = {};

  const getOrCreate = (id, tag = 'div') => {
    if (!elements[id]) elements[id] = new MockElement(id, tag);
    return elements[id];
  };

  // Pre-populate known wizard IDs
  const knownIds = [
    'step-1', 'step-2', 'step-3', 'step-loading', 'step-result',
    'step-counter', 'step-title', 'progress-bar', 'scanner-progress-bar',
    'back-to-step-1', 'back-to-step-2', 'restart-wizard-btn',
    'generate-diagnosis-btn', 'wizard-lead-form', 'wizard-form-success',
    'result-title', 'result-brand', 'result-cause', 'result-timing',
    'result-price', 'result-time', 'result-service-link', 'result-link-text',
    'result-code-row', 'result-code', 'error-code-input',
    'wizard-lead-name', 'wizard-lead-phone'
  ];

  knownIds.forEach((id) => getOrCreate(id));

  // Radios for timing
  const timingRadios = [
    new MockElement('timing-permanent', 'input'),
    new MockElement('timing-intermittent', 'input'),
    new MockElement('timing-rain', 'input')
  ];
  timingRadios[0].value = 'permanent';
  timingRadios[0].checked = true;
  timingRadios[1].value = 'intermittent';
  timingRadios[2].value = 'rain';

  // Cached button lists
  const symptomButtons = ['abs', 'ecu', 'tablo', 'can'].map((cat) => {
    const btn = new MockElement(`symptom-${cat}`, 'button');
    btn.setAttribute('data-category', cat);
    return btn;
  });

  const brandButtons = ['VAG (VW / Audi / Seat / Skoda)', 'BMW / Mini', 'Mercedes-Benz', 'Opel / Vauxhall', 'Peugeot / Citroen', 'Renault / Dacia', 'Toyota / Lexus', 'Ford', 'Друга марка'].map((b) => {
    const btn = new MockElement(`brand-${b}`, 'button');
    btn.setAttribute('data-brand', b);
    return btn;
  });

  const mockDocument = {
    getElementById: (id) => getOrCreate(id),
    querySelectorAll: (selector) => {
      if (selector === '.symptom-btn') return symptomButtons;
      if (selector === '.brand-btn') return brandButtons;
      return [];
    },
    querySelector: (selector) => {
      if (selector === 'input[name="timing"]:checked') {
        return timingRadios.find((r) => r.checked) || timingRadios[0];
      }
      if (selector.includes('value="permanent"')) return timingRadios[0];
      if (selector.includes('value="intermittent"')) return timingRadios[1];
      if (selector.includes('value="rain"')) return timingRadios[2];
      return null;
    }
  };

  const context = {
    document: mockDocument,
    requestAnimationFrame: (cb) => cb(),
    setTimeout: (cb) => cb(), // Execute immediately for tests
    console: console,
  };

  vm.createContext(context);
  return { context, elements, timingRadios };
}

// ---------------------------------------------------------------------
// TEST SUITE: Decision Tree Stress Testing
// ---------------------------------------------------------------------

let passedTests = 0;
let totalTests = 0;
const errors = [];

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
  } else {
    errors.push(message);
    console.error(`  ❌ FAIL: ${message}`);
  }
}

console.log('\n--- 1. Testing All 16 Known OBD Codes in Database ---');
const knownOBDCodes = [
  '01276', '01130', '16352', '5DF0', '5DF1', 'C1380', 'C1350',
  'P0606', '16986', 'P0300', 'P0301', 'P0302', 'P0303', 'P0304',
  'DF017', 'U0100'
];

for (const code of knownOBDCodes) {
  const { context, elements } = createMockContext();
  vm.runInContext(rawScript, context);

  // Set input
  elements['error-code-input'].value = code;
  // Trigger scan
  elements['generate-diagnosis-btn'].trigger('click');

  assert(!elements['result-code-row'].classList.contains('hidden'), `[Code ${code}] result-code-row should be visible`);
  assert(elements['result-code'].innerText.includes(code), `[Code ${code}] result-code should mention '${code}'`);
  assert(elements['result-title'].innerText.length > 5, `[Code ${code}] result-title should be populated`);
  assert(elements['result-cause'].innerText.length > 10, `[Code ${code}] result-cause should be populated`);
  assert(elements['result-price'].innerText.includes('лв.'), `[Code ${code}] result-price should include price range`);
  assert(elements['result-time'].innerText.length > 0, `[Code ${code}] result-time should include turnaround`);
  assert(elements['result-service-link'].href.startsWith('/uslugi/'), `[Code ${code}] result-service-link should lead to /uslugi/`);
}
console.log(`  ✓ All ${knownOBDCodes.length} known OBD codes verified.`);

console.log('\n--- 2. Testing Case-Insensitive OBD Codes (lowercase) ---');
const lowercaseCodes = ['01276', '5df0', 'c1380', 'p0606', 'df017', 'u0100'];
for (const code of lowercaseCodes) {
  const { context, elements } = createMockContext();
  vm.runInContext(rawScript, context);

  elements['error-code-input'].value = code.toLowerCase();
  elements['generate-diagnosis-btn'].trigger('click');

  assert(elements['result-code'].innerText.includes(code.toUpperCase()), `[Code ${code}] should match case-insensitively for '${code.toUpperCase()}'`);
}
console.log(`  ✓ Case insensitivity verified.`);

console.log('\n--- 3. Testing Unknown OBD Codes ---');
const unknownCodes = ['UNKNOWN_CODE_9999', 'P9999', 'XYZ123', 'ERR-99'];
for (const code of unknownCodes) {
  const { context, elements } = createMockContext();
  vm.runInContext(rawScript, context);

  elements['error-code-input'].value = code;
  elements['generate-diagnosis-btn'].trigger('click');

  assert(!elements['result-code-row'].classList.contains('hidden'), `[Unknown ${code}] result-code-row should be visible`);
  assert(elements['result-code'].innerText.includes(code), `[Unknown ${code}] result-code should display user input code`);
  assert(elements['result-code'].innerText.includes('Записана специфична грешка'), `[Unknown ${code}] should label code as specific error`);
  assert(elements['result-price'].innerText.includes('лв.'), `[Unknown ${code}] should fall back to category price range`);
}
console.log(`  ✓ Unknown OBD codes properly handled.`);

console.log('\n--- 4. Testing Empty / Whitespace OBD Codes ---');
const emptyCodes = ['', '   ', '\t\n'];
for (const code of emptyCodes) {
  const { context, elements } = createMockContext();
  vm.runInContext(rawScript, context);

  elements['error-code-input'].value = code;
  elements['generate-diagnosis-btn'].trigger('click');

  assert(elements['result-code-row'].classList.contains('hidden'), `[Empty code '${code}'] result-code-row should remain HIDDEN`);
  assert(elements['result-price'].innerText.includes('лв.'), `[Empty code] should use default category price`);
}
console.log(`  ✓ Empty and whitespace codes handled correctly.`);

console.log('\n--- 5. Testing Adversarial Injection Inputs in Error Code Input ---');
const injectionCodes = [
  '<script>alert(1)</script>',
  '"><img src=x onerror=alert(1)>',
  "'; DROP TABLE codes; --",
  '${7*7}',
  '{{7*7}}',
  '../../../etc/passwd'
];
for (const inj of injectionCodes) {
  const { context, elements } = createMockContext();
  vm.runInContext(rawScript, context);

  elements['error-code-input'].value = inj;
  elements['generate-diagnosis-btn'].trigger('click');

  // Should treat as unknown code without crashing
  assert(!elements['result-code-row'].classList.contains('hidden'), `[Injection '${inj}'] handled safely`);
  assert(elements['result-code'].innerText.includes('Записана специфична грешка'), `[Injection] safely labeled as specific error`);
}
console.log(`  ✓ Adversarial injection inputs handled safely without crashes.`);

console.log('\n--- 6. Testing All 4 Category Branches and Fallbacks ---');
const categories = [
  { cat: 'abs', link: '/uslugi/remont-na-abs-modul/', minPrice: 180 },
  { cat: 'ecu', link: '/uslugi/remont-na-ecu-kompyutar/', minPrice: 220 },
  { cat: 'tablo', link: '/uslugi/remont-na-avtomobilno-tablo/', minPrice: 140 },
  { cat: 'can', link: '/uslugi/avtodiagnostika/', minPrice: 90 },
];

for (const c of categories) {
  const { context, elements } = createMockContext();
  vm.runInContext(rawScript, context);

  // Trigger symptom button
  const symptomBtns = context.document.querySelectorAll('.symptom-btn');
  const btn = symptomBtns.find((b) => b.getAttribute('data-category') === c.cat);
  btn.trigger('click');

  elements['generate-diagnosis-btn'].trigger('click');

  assert(elements['result-service-link'].href === c.link, `[Category ${c.cat}] link should be ${c.link}, got ${elements['result-service-link'].href}`);
  assert(elements['result-price'].innerText.includes('лв.'), `[Category ${c.cat}] price should be defined`);
  assert(elements['result-time'].innerText.length > 0, `[Category ${c.cat}] time should be defined`);
}
console.log(`  ✓ All 4 category branches verified.`);

console.log('\n--- 7. Testing All Timing Radios ---');
const timingScenarios = [
  { val: 'permanent', textSnippet: 'Постоянен отказ' },
  { val: 'intermittent', textSnippet: 'Прекъсващ термичен дефект' },
  { val: 'rain', textSnippet: 'Влажностен пробив' }
];

for (const ts of timingScenarios) {
  const { context, elements, timingRadios } = createMockContext();
  vm.runInContext(rawScript, context);

  timingRadios.forEach((r) => { r.checked = (r.value === ts.val); });
  elements['generate-diagnosis-btn'].trigger('click');

  assert(elements['result-timing'].innerText.includes(ts.textSnippet), `[Timing ${ts.val}] should include '${ts.textSnippet}'`);
}
console.log(`  ✓ Timing radio branches verified.`);

console.log('\n--- 8. Testing Wizard Reset Handler ---');
{
  const { context, elements } = createMockContext();
  vm.runInContext(rawScript, context);

  // Manipulate state
  elements['error-code-input'].value = '01276';
  elements['wizard-lead-name'].value = 'Test User';
  elements['wizard-lead-phone'].value = '0888123456';
  elements['wizard-form-success'].classList.remove('hidden');
  elements['generate-diagnosis-btn'].trigger('click');

  assert(!elements['result-code-row'].classList.contains('hidden'), 'Result code row was shown');

  // Trigger reset
  elements['restart-wizard-btn'].trigger('click');

  assert(elements['error-code-input'].value === '', 'Error code input cleared on reset');
  assert(elements['wizard-lead-name'].value === '', 'Lead name cleared on reset');
  assert(elements['wizard-lead-phone'].value === '', 'Lead phone cleared on reset');
  assert(elements['wizard-form-success'].classList.contains('hidden'), 'Success message hidden on reset');
  assert(elements['result-code-row'].classList.contains('hidden'), 'Result code row hidden on reset');
  assert(!elements['step-1'].classList.contains('hidden'), 'Step 1 is visible on reset');
  assert(elements['step-result'].classList.contains('hidden'), 'Step result is hidden on reset');
  assert(elements['step-counter'].innerText === 'Стъпка 1 от 3', 'Step counter reset to Step 1');
}
console.log(`  ✓ Reset handler completely restores initial clean state.`);

console.log('\n============================================================');
console.log(`WIZARD STRESS TEST SUMMARY: ${passedTests}/${totalTests} assertions passed (${errors.length} errors)`);
console.log('============================================================');

if (errors.length > 0) {
  process.exit(1);
} else {
  console.log('✅ ALL WIZARD DECISION TREE AND OBD TEST CASES PASSED 100%!');
}
