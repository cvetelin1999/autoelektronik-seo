/**
 * EMPIRICAL ADVERSARIAL STRESS TEST SUITE
 * Milestone 1 - Interactive Diagnostic Wizard
 * Target: src/pages/otkrii-problema.astro & dist/otkrii-problema/index.html
 * 
 * Challenger 2 (Empirical Verification)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const parse5 = require('parse5');

// Color helpers for terminal output
const green = (t) => `\x1b[32m${t}\x1b[0m`;
const red = (t) => `\x1b[31m${t}\x1b[0m`;
const yellow = (t) => `\x1b[33m${t}\x1b[0m`;
const cyan = (t) => `\x1b[36m${t}\x1b[0m`;
const bold = (t) => `\x1b[1m${t}\x1b[0m`;

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    // console.log(`  ${green('✓')} ${message}`);
  } else {
    failedTests++;
    failures.push(message);
    console.error(`  ${red('✗ FAIL:')} ${message}`);
  }
}

console.log(bold('\n==============================================================='));
console.log(bold('  EMPIRICAL ADVERSARIAL STRESS TEST SUITE — MILESTONE 1'));
console.log(bold('  Interactive Diagnostic Wizard (/otkrii-problema/)'));
console.log(bold('===============================================================\n'));

// ---------------------------------------------------------------------------
// SUITE 1: HTML PHRASING VALIDITY (NO <div> INSIDE <button>)
// ---------------------------------------------------------------------------
console.log(cyan(bold('SUITE 1: HTML Phrasing Validity (<button> may only contain phrasing content)')));

function auditButtonDescendants(filePath, isAstro = false) {
  const content = fs.readFileSync(filePath, 'utf8');
  const htmlToParse = isAstro ? content.replace(/---[\s\S]*?---/, '') : content;
  const ast = isAstro ? parse5.parseFragment(htmlToParse) : parse5.parse(htmlToParse);

  let totalButtons = 0;
  const violations = [];

  function walk(node, insideButton) {
    const isButton = node.tagName === 'button';
    if (isButton) {
      totalButtons++;
      insideButton = true;
    } else if (insideButton && node.tagName === 'div') {
      violations.push({
        buttonAttrs: node.parentNode ? node.parentNode.attrs : null,
        divAttrs: node.attrs,
      });
    }

    if (node.childNodes) {
      for (const child of node.childNodes) {
        walk(child, insideButton);
      }
    }
  }

  walk(ast, false);
  return { totalButtons, violations };
}

const projectRoot = path.resolve(__dirname, '../../..');
const distFilePath = path.join(projectRoot, 'dist', 'otkrii-problema', 'index.html');
const srcFilePath = path.join(projectRoot, 'src', 'pages', 'otkrii-problema.astro');

const distButtonAudit = auditButtonDescendants(distFilePath, false);
assert(distButtonAudit.totalButtons >= 10, `dist index.html contains buttons (found: ${distButtonAudit.totalButtons})`);
assert(distButtonAudit.violations.length === 0, `dist index.html has 0 <div> tags inside <button> (found violations: ${distButtonAudit.violations.length})`);

const srcButtonAudit = auditButtonDescendants(srcFilePath, true);
assert(srcButtonAudit.totalButtons >= 10, `src otkrii-problema.astro contains buttons (found: ${srcButtonAudit.totalButtons})`);
assert(srcButtonAudit.violations.length === 0, `src otkrii-problema.astro has 0 <div> tags inside <button> (found violations: ${srcButtonAudit.violations.length})`);

console.log(`  ${green('✓')} Dist buttons inspected: ${distButtonAudit.totalButtons}, Violations: ${distButtonAudit.violations.length}`);
console.log(`  ${green('✓')} Src buttons inspected: ${srcButtonAudit.totalButtons}, Violations: ${srcButtonAudit.violations.length}`);


// ---------------------------------------------------------------------------
// SUITE 2: CLIENT SCRIPT SYNTAX & COMPILATION
// ---------------------------------------------------------------------------
console.log(cyan(bold('\nSUITE 2: Client Script Syntax & Compilation Check')));

const distHtml = fs.readFileSync(distFilePath, 'utf8');
const scriptMatches = distHtml.match(/<script[\s\S]*?<\/script>/gi);
let wizardScriptContent = '';

for (const s of scriptMatches) {
  if (s.includes('obdDatabase') && s.includes('startDiagnosticScan')) {
    wizardScriptContent = s.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
    break;
  }
}

assert(wizardScriptContent.length > 0, 'Diagnostic wizard script extracted from dist/otkrii-problema/index.html');

let scriptSyntaxValid = false;
try {
  new vm.Script(wizardScriptContent, { filename: 'wizard-inline.js' });
  scriptSyntaxValid = true;
} catch (err) {
  console.error('Syntax error in wizard script:', err);
}
assert(scriptSyntaxValid, 'Wizard client script compiles cleanly without JavaScript syntax errors');


// ---------------------------------------------------------------------------
// LIGHTWEIGHT DOM EMULATION ENGINE FOR HEADLESS BROWSER SIMULATION
// ---------------------------------------------------------------------------
class SimulatedClassList {
  constructor(element) {
    this.element = element;
    const initial = element.getAttribute('class') || '';
    this.classes = new Set(initial.split(/\s+/).filter(Boolean));
  }
  add(...names) {
    for (const name of names) this.classes.add(name);
    this.sync();
  }
  remove(...names) {
    for (const name of names) this.classes.delete(name);
    this.sync();
  }
  toggle(name) {
    if (this.classes.has(name)) this.classes.delete(name);
    else this.classes.add(name);
    this.sync();
  }
  contains(name) {
    return this.classes.has(name);
  }
  sync() {
    this.element.attributes['class'] = Array.from(this.classes).join(' ');
  }
}

class SimulatedElement {
  constructor(node) {
    this.tagName = node.tagName ? node.tagName.toLowerCase() : '';
    this.attributes = {};
    if (node.attrs) {
      for (const attr of node.attrs) {
        this.attributes[attr.name] = attr.value;
      }
    }
    this.classList = new SimulatedClassList(this);
    this.style = { width: '' };
    this.listeners = {};
    this.childNodes = [];
    this.parentNode = null;
    this._value = this.attributes['value'] || '';
    this._checked = this.attributes.hasOwnProperty('checked');
    this._href = this.attributes['href'] || '';
    this._text = '';

    // Collect initial text
    if (node.childNodes) {
      for (const c of node.childNodes) {
        if (c.nodeName === '#text') {
          this._text += c.value;
        }
      }
    }
  }

  getAttribute(name) {
    return this.attributes.hasOwnProperty(name) ? this.attributes[name] : null;
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
    if (name === 'class') {
      this.classList = new SimulatedClassList(this);
    }
    if (name === 'href') {
      this._href = String(val);
    }
  }

  get id() {
    return this.getAttribute('id') || '';
  }

  get value() {
    return this._value;
  }

  set value(v) {
    this._value = String(v);
  }

  get checked() {
    return this._checked;
  }

  set checked(v) {
    this._checked = Boolean(v);
    if (this._checked && this.tagName === 'input' && this.getAttribute('type') === 'radio') {
      const name = this.getAttribute('name');
      if (name && this.ownerDocument) {
        const others = this.ownerDocument.querySelectorAll(`input[name="${name}"]`);
        for (const o of others) {
          if (o !== this) o._checked = false;
        }
      }
    }
  }

  get href() {
    return this._href;
  }

  set href(v) {
    this._href = String(v);
    this.attributes['href'] = String(v);
  }

  get innerText() {
    return this._text;
  }

  set innerText(v) {
    this._text = String(v);
  }

  get textContent() {
    return this._text;
  }

  set textContent(v) {
    this._text = String(v);
  }

  addEventListener(type, cb) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(cb);
  }

  dispatchEvent(event) {
    const list = this.listeners[event.type] || [];
    for (const cb of list) {
      cb(event);
    }
  }

  click() {
    // If radio button, uncheck other radios with same name in document
    if (this.tagName === 'input' && this.getAttribute('type') === 'radio') {
      const name = this.getAttribute('name');
      if (name && this.ownerDocument) {
        const others = this.ownerDocument.querySelectorAll(`input[name="${name}"]`);
        for (const o of others) o.checked = false;
      }
      this.checked = true;
    }
    this.dispatchEvent({ type: 'click', target: this, preventDefault: () => {} });
  }

  submit() {
    let prevented = false;
    this.dispatchEvent({
      type: 'submit',
      target: this,
      preventDefault: () => { prevented = true; },
    });
    return prevented;
  }
}

class SimulatedDocument {
  constructor(ast) {
    this.elements = [];
    this.idMap = new Map();

    const buildTree = (node, parent) => {
      if (node.tagName) {
        const el = new SimulatedElement(node);
        el.parentNode = parent;
        el.ownerDocument = this;
        this.elements.push(el);
        if (el.id) {
          this.idMap.set(el.id, el);
        }
        if (node.childNodes) {
          for (const c of node.childNodes) {
            const childEl = buildTree(c, el);
            if (childEl) el.childNodes.push(childEl);
          }
        }
        return el;
      } else if (node.childNodes) {
        for (const c of node.childNodes) {
          buildTree(c, parent);
        }
      }
      return null;
    };

    buildTree(ast, null);
  }

  getElementById(id) {
    return this.idMap.get(id) || null;
  }

  querySelectorAll(selector) {
    const results = [];
    for (const el of this.elements) {
      if (this.matchesSelector(el, selector)) {
        results.push(el);
      }
    }
    return results;
  }

  querySelector(selector) {
    const all = this.querySelectorAll(selector);
    return all.length > 0 ? all[0] : null;
  }

  matchesSelector(el, selector) {
    selector = selector.trim();

    // Pseudo-class :checked
    let mustBeChecked = false;
    if (selector.endsWith(':checked')) {
      mustBeChecked = true;
      selector = selector.slice(0, -8);
    }
    if (mustBeChecked && !el.checked) return false;

    let remaining = selector;

    // Attributes [attr="val"] or [attr]
    const attrRegex = /\[([a-zA-Z0-9_-]+)(?:="([^"]*)")?\]/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(selector)) !== null) {
      const attrName = attrMatch[1];
      const attrVal = attrMatch[2];
      if (attrVal !== undefined) {
        if (el.getAttribute(attrName) !== attrVal) return false;
      } else {
        if (el.getAttribute(attrName) === null) return false;
      }
      remaining = remaining.replace(attrMatch[0], '');
    }

    // Classes .class
    const classMatches = remaining.match(/\.([a-zA-Z0-9_-]+)/g);
    if (classMatches) {
      for (const cm of classMatches) {
        const cls = cm.slice(1);
        if (!el.classList.contains(cls)) return false;
        remaining = remaining.replace(cm, '');
      }
    }

    // ID #id
    const idMatch = remaining.match(/#([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      if (el.id !== idMatch[1]) return false;
      remaining = remaining.replace(idMatch[0], '');
    }

    // Tag
    remaining = remaining.trim();
    if (remaining && remaining !== '*') {
      if (el.tagName !== remaining.toLowerCase()) return false;
    }

    return true;
  }
}

/**
 * Creates an isolated sandboxed sandbox and executes the client script.
 */
function createSandbox() {
  const ast = parse5.parse(distHtml);
  const doc = new SimulatedDocument(ast);

  const consoleLogs = [];
  const consoleErrors = [];
  const consoleWarns = [];

  const timers = [];

  const sandbox = {
    document: doc,
    window: {
      document: doc,
      requestAnimationFrame: (cb) => {
        cb();
        return 1;
      },
    },
    requestAnimationFrame: (cb) => {
      cb();
      return 1;
    },
    setTimeout: (cb, ms) => {
      const timer = { cb, ms, executed: false };
      timers.push(timer);
      return timer;
    },
    clearTimeout: (timer) => {
      if (timer) timer.executed = true;
    },
    console: {
      log: (...args) => consoleLogs.push(args.join(' ')),
      error: (...args) => {
        consoleErrors.push(args.join(' '));
        console.error('Captured console.error:', ...args);
      },
      warn: (...args) => consoleWarns.push(args.join(' ')),
    },
  };

  const context = vm.createContext(sandbox);

  // Run the wizard script in sandbox
  vm.runInContext(wizardScriptContent, context);

  function advanceTimers() {
    for (const t of timers) {
      if (!t.executed) {
        t.executed = true;
        t.cb();
      }
    }
  }

  return { doc, sandbox, advanceTimers, consoleErrors, consoleWarns };
}


// ---------------------------------------------------------------------------
// SUITE 3: DECISION TREE EXHAUSTIVE STATE SIMULATION (4 Categories × 9 Brands)
// ---------------------------------------------------------------------------
console.log(cyan(bold('\nSUITE 3: Exhaustive Decision Tree State Simulation (4 Categories × 9 Brands)')));

const categories = ['abs', 'ecu', 'tablo', 'can'];
const brands = [
  'VAG (VW / Audi / Seat / Skoda)',
  'BMW / Mini',
  'Mercedes-Benz',
  'Opel / Vauxhall',
  'Peugeot / Citroen',
  'Renault / Dacia',
  'Toyota / Lexus',
  'Ford',
  'Друга марка',
];

const categoryExpected = {
  abs: {
    title: 'Дефект в електронния блок на ABS/ESP помпата',
    price: '180 – 320 лв.',
    time: '24 – 48 часа',
    link: '/uslugi/remont-na-abs-modul/',
  },
  ecu: {
    title: 'Дефект в двигателния компютър (ECU)',
    price: '220 – 480 лв.',
    time: '24 – 48 часа',
    link: '/uslugi/remont-na-ecu-kompyutar/',
  },
  tablo: {
    title: 'Хардуерен дефект в таблото / контролния панел',
    price: '140 – 260 лв.',
    time: '24 – 48 часа',
    link: '/uslugi/remont-na-avtomobilno-tablo/',
  },
  can: {
    title: 'Нарушена комуникация по CAN-Bus шината',
    price: '90 – 180 лв.',
    time: 'В рамките на деня (24 ч.)',
    link: '/uslugi/avtodiagnostika/',
  },
};

let combinationCount = 0;

for (const cat of categories) {
  for (const brand of brands) {
    combinationCount++;
    const { doc, advanceTimers, consoleErrors } = createSandbox();

    // 1. Initial State assertions
    const step1 = doc.getElementById('step-1');
    const step2 = doc.getElementById('step-2');
    const step3 = doc.getElementById('step-3');
    const stepLoading = doc.getElementById('step-loading');
    const stepResult = doc.getElementById('step-result');
    const progressBar = doc.getElementById('progress-bar');
    const counter = doc.getElementById('step-counter');

    assert(!step1.classList.contains('hidden'), `Step 1 initially visible for [${cat} + ${brand}]`);
    assert(step2.classList.contains('hidden'), 'Step 2 initially hidden');
    assert(step3.classList.contains('hidden'), 'Step 3 initially hidden');
    assert(stepResult.classList.contains('hidden'), 'Step Result initially hidden');

    // 2. Select Symptom Category
    const catBtn = doc.querySelector(`.symptom-btn[data-category="${cat}"]`);
    assert(catBtn !== null, `Category button [${cat}] exists in DOM`);
    catBtn.click();

    // Verify Step 2 transition
    assert(step1.classList.contains('hidden'), `Step 1 hidden after selecting ${cat}`);
    assert(!step2.classList.contains('hidden'), `Step 2 visible after selecting ${cat}`);
    assert(counter.innerText === 'Стъпка 2 от 3', 'Counter shows Step 2 of 3');
    assert(progressBar.style.width === '66%', 'Progress bar at 66%');

    // 3. Select Brand
    const brandBtn = doc.querySelector(`.brand-btn[data-brand="${brand}"]`);
    assert(brandBtn !== null, `Brand button [${brand}] exists in DOM`);
    brandBtn.click();

    // Verify Step 3 transition
    assert(step2.classList.contains('hidden'), `Step 2 hidden after selecting ${brand}`);
    assert(!step3.classList.contains('hidden'), `Step 3 visible after selecting ${brand}`);
    assert(counter.innerText === 'Стъпка 3 от 3', 'Counter shows Step 3 of 3');
    assert(progressBar.style.width === '100%', 'Progress bar at 100%');

    // 4. Click Generate Diagnosis
    const generateBtn = doc.getElementById('generate-diagnosis-btn');
    assert(generateBtn !== null, 'Generate Diagnosis button exists');
    generateBtn.click();

    // Verify Loading Scanner Step
    assert(step3.classList.contains('hidden'), 'Step 3 hidden during scan');
    assert(!stepLoading.classList.contains('hidden'), 'Step Loading active during scan');
    assert(counter.innerText === 'Лабораторен анализ...', 'Counter shows scan in progress');

    // Advance 600ms timer
    advanceTimers();

    // Verify Result Step
    assert(stepLoading.classList.contains('hidden'), 'Step Loading hidden after 600ms');
    assert(!stepResult.classList.contains('hidden'), 'Step Result visible');
    assert(counter.innerText === 'Резултат от теста', 'Counter shows result status');

    // Verify Content
    const resBrand = doc.getElementById('result-brand');
    const resTitle = doc.getElementById('result-title');
    const resPrice = doc.getElementById('result-price');
    const resTime = doc.getElementById('result-time');
    const resLink = doc.getElementById('result-service-link');
    const resCodeRow = doc.getElementById('result-code-row');

    assert(resBrand.innerText === brand, `Result displays chosen brand "${brand}"`);
    assert(resTitle.innerText === categoryExpected[cat].title, `Result displays correct category title for "${cat}"`);
    assert(resPrice.innerText === categoryExpected[cat].price, `Result displays correct price bracket "${categoryExpected[cat].price}"`);
    assert(resTime.innerText === categoryExpected[cat].time, `Result displays correct turnaround time "${categoryExpected[cat].time}"`);
    assert(resLink.href === categoryExpected[cat].link, `Result link points to "${categoryExpected[cat].link}"`);
    assert(resCodeRow.classList.contains('hidden'), 'Result code row remains hidden when no code was entered');

    assert(consoleErrors.length === 0, `0 console errors during [${cat} + ${brand}] run`);
  }
}
console.log(`  ${green('✓')} All ${combinationCount} category × brand state branches passed with 100% fidelity.`);


// ---------------------------------------------------------------------------
// SUITE 4: TIMING SELECTION OPTIONS (permanent, intermittent, rain)
// ---------------------------------------------------------------------------
console.log(cyan(bold('\nSUITE 4: Timing Selection Options Evaluation')));

const timingScenarios = [
  { val: 'permanent', keyword: 'Постоянен отказ' },
  { val: 'intermittent', keyword: 'Прекъсващ термичен дефект' },
  { val: 'rain', keyword: 'Влажностен пробив' },
];

for (const sc of timingScenarios) {
  const { doc, advanceTimers } = createSandbox();

  doc.querySelector('.symptom-btn[data-category="abs"]').click();
  doc.querySelector('.brand-btn[data-brand="BMW / Mini"]').click();

  // Select timing radio
  const radio = doc.getElementById(`timing-${sc.val}`);
  assert(radio !== null, `Timing radio #timing-${sc.val} exists`);
  radio.click();
  assert(radio.checked === true, `Timing radio #timing-${sc.val} is checked`);

  doc.getElementById('generate-diagnosis-btn').click();
  advanceTimers();

  const resTiming = doc.getElementById('result-timing');
  assert(resTiming.innerText.includes(sc.keyword), `Timing "${sc.val}" outputs description with "${sc.keyword}" (output: ${resTiming.innerText})`);
}


// ---------------------------------------------------------------------------
// SUITE 5: ALL 16 OBD ERROR CODES + FUZZY & SUBSTRING MATCHING
// ---------------------------------------------------------------------------
console.log(cyan(bold('\nSUITE 5: Automotive OBD Error Code Lookup Dictionary (16 codes + fuzzy)')));

const obdCodes = [
  { code: '01276', expectedTitle: 'Дефект в хидравлична помпа ABS (V64)', expectedPrice: '180 – 320 лв.' },
  { code: '01130', expectedTitle: 'Недостоверна работа на ABS модула (01130)', expectedPrice: '180 – 320 лв.' },
  { code: '16352', expectedTitle: 'Вътрешен хардуерен дефект в контролния блок (16352)', expectedPrice: '200 – 320 лв.' },
  { code: '5DF0', expectedTitle: 'Дефект в ел. мотора на хидравличната помпа DSC (5DF0)', expectedPrice: '220 – 340 лв.' },
  { code: '5DF1', expectedTitle: 'Блокирал двигател на DSC помпата (5DF1)', expectedPrice: '220 – 340 лв.' },
  { code: 'C1380', expectedTitle: 'Дефект в рециркулационна помпа ESP (C1380)', expectedPrice: '180 – 300 лв.' },
  { code: 'C1350', expectedTitle: 'Неизправност в соленоидните клапани на ABS (C1350)', expectedPrice: '190 – 310 лв.' },
  { code: 'P0606', expectedTitle: 'Вътрешна процесорна грешка в ECU (P0606 / 16986)', expectedPrice: '220 – 480 лв.' },
  { code: '16986', expectedTitle: 'Грешка в контролната сума / ROM паметта (16986)', expectedPrice: '220 – 480 лв.' },
  { code: 'P0300', expectedTitle: 'Прекъсване на запалването в няколко цилиндъра (P0300)', expectedPrice: '220 – 420 лв.' },
  { code: 'P0301', expectedTitle: 'Прекъсване в 1-ви цилиндър от дефектен ECU драйвер (P0301)', expectedPrice: '200 – 380 лв.' },
  { code: 'P0302', expectedTitle: 'Прекъсване в 2-ри цилиндър от дефектен ECU драйвер (P0302)', expectedPrice: '200 – 380 лв.' },
  { code: 'P0303', expectedTitle: 'Прекъсване в 3-ти цилиндър от дефектен ECU драйвер (P0303)', expectedPrice: '200 – 380 лв.' },
  { code: 'P0304', expectedTitle: 'Прекъсване в 4-ти цилиндър от дефектен ECU драйвер (P0304)', expectedPrice: '200 – 380 лв.' },
  { code: 'DF017', expectedTitle: 'Верига за управление на главното реле (DF017)', expectedPrice: '220 – 400 лв.' },
  { code: 'U0100', expectedTitle: 'Липса на комуникация с двигателния ECU компютър (U0100)', expectedPrice: '90 – 180 лв.' },
];

for (const item of obdCodes) {
  const { doc, advanceTimers } = createSandbox();

  doc.querySelector('.symptom-btn[data-category="abs"]').click();
  doc.querySelector('.brand-btn[data-brand="VAG (VW / Audi / Seat / Skoda)"]').click();

  const codeInput = doc.getElementById('error-code-input');
  codeInput.value = item.code;

  doc.getElementById('generate-diagnosis-btn').click();
  advanceTimers();

  const resCodeRow = doc.getElementById('result-code-row');
  const resCode = doc.getElementById('result-code');
  const resTitle = doc.getElementById('result-title');
  const resPrice = doc.getElementById('result-price');

  assert(!resCodeRow.classList.contains('hidden'), `OBD code row visible for code ${item.code}`);
  assert(resCode.innerText.includes(item.code), `Result displays code badge with ${item.code}`);
  assert(resTitle.innerText === item.expectedTitle, `Result title matches OBD title for ${item.code}`);
  assert(resPrice.innerText === item.expectedPrice, `Result price matches OBD price for ${item.code}`);
}

// Test case insensitivity and whitespace tolerance
const fuzzyScenarios = [
  { input: 'p0606', expectedMatch: 'P0606' },
  { input: '  01276  ', expectedMatch: '01276' },
  { input: 'VAG fault 01276 pump', expectedMatch: '01276' },
  { input: 'df017', expectedMatch: 'DF017' },
  { input: 'u0100', expectedMatch: 'U0100' },
];

for (const fs of fuzzyScenarios) {
  const { doc, advanceTimers } = createSandbox();
  doc.querySelector('.symptom-btn[data-category="ecu"]').click();
  doc.querySelector('.brand-btn[data-brand="Renault / Dacia"]').click();

  const codeInput = doc.getElementById('error-code-input');
  codeInput.value = fs.input;

  doc.getElementById('generate-diagnosis-btn').click();
  advanceTimers();

  const resCode = doc.getElementById('result-code');
  assert(resCode.innerText.includes(fs.expectedMatch), `Fuzzy input "${fs.input}" resolves to recognized code "${fs.expectedMatch}"`);
}


// ---------------------------------------------------------------------------
// SUITE 6: UNKNOWN & EMPTY OBD CODES
// ---------------------------------------------------------------------------
console.log(cyan(bold('\nSUITE 6: Unknown and Empty OBD Code Handling')));

// 1. Unknown code
{
  const { doc, advanceTimers } = createSandbox();
  doc.querySelector('.symptom-btn[data-category="tablo"]').click();
  doc.querySelector('.brand-btn[data-brand="Mercedes-Benz"]').click();

  const codeInput = doc.getElementById('error-code-input');
  codeInput.value = 'P9999';

  doc.getElementById('generate-diagnosis-btn').click();
  advanceTimers();

  const resCodeRow = doc.getElementById('result-code-row');
  const resCode = doc.getElementById('result-code');
  const resTitle = doc.getElementById('result-title');

  assert(!resCodeRow.classList.contains('hidden'), 'Result code row visible for unknown code P9999');
  assert(resCode.innerText === 'P9999 (Записана специфична грешка)', `Result code formats unknown code gracefully: "${resCode.innerText}"`);
  assert(resTitle.innerText === categoryExpected.tablo.title, 'Falls back to tablo category default diagnosis for unknown code');
}

// 2. Empty code
{
  const { doc, advanceTimers } = createSandbox();
  doc.querySelector('.symptom-btn[data-category="can"]').click();
  doc.querySelector('.brand-btn[data-brand="Peugeot / Citroen"]').click();

  const codeInput = doc.getElementById('error-code-input');
  codeInput.value = '   ';

  doc.getElementById('generate-diagnosis-btn').click();
  advanceTimers();

  const resCodeRow = doc.getElementById('result-code-row');
  const resTitle = doc.getElementById('result-title');

  assert(resCodeRow.classList.contains('hidden'), 'Result code row hidden when input is whitespace-only');
  assert(resTitle.innerText === categoryExpected.can.title, 'Displays CAN category default diagnosis for empty code');
}


// ---------------------------------------------------------------------------
// SUITE 7: NAVIGATION, FAST STATE TRANSITIONS, & BACK BUTTONS
// ---------------------------------------------------------------------------
console.log(cyan(bold('\nSUITE 7: Navigation & Back Button Traversal')));

{
  const { doc } = createSandbox();

  const step1 = doc.getElementById('step-1');
  const step2 = doc.getElementById('step-2');
  const step3 = doc.getElementById('step-3');
  const backTo1 = doc.getElementById('back-to-step-1');
  const backTo2 = doc.getElementById('back-to-step-2');

  // Go to step 2
  doc.querySelector('.symptom-btn[data-category="ecu"]').click();
  assert(!step2.classList.contains('hidden'), 'Reached step 2');

  // Back to step 1
  backTo1.click();
  assert(!step1.classList.contains('hidden'), 'Returned to step 1 via back-to-step-1');
  assert(step2.classList.contains('hidden'), 'Step 2 hidden on back navigation');
  assert(doc.getElementById('step-counter').innerText === 'Стъпка 1 от 3', 'Counter reset to Step 1 of 3');
  assert(doc.getElementById('progress-bar').style.width === '33%', 'Progress bar back to 33%');

  // Re-select category
  doc.querySelector('.symptom-btn[data-category="tablo"]').click();
  assert(!step2.classList.contains('hidden'), 'Re-entered step 2');

  // Go to step 3
  doc.querySelector('.brand-btn[data-brand="Toyota / Lexus"]').click();
  assert(!step3.classList.contains('hidden'), 'Reached step 3');
  assert(doc.getElementById('step-counter').innerText === 'Стъпка 3 от 3', 'Counter is Step 3 of 3');
  assert(doc.getElementById('progress-bar').style.width === '100%', 'Progress bar at 100%');

  // Back to step 2
  backTo2.click();
  assert(!step2.classList.contains('hidden'), 'Returned to step 2 via back-to-step-2');
  assert(step3.classList.contains('hidden'), 'Step 3 hidden');
  assert(doc.getElementById('step-counter').innerText === 'Стъпка 2 от 3', 'Counter is Step 2 of 3');
  assert(doc.getElementById('progress-bar').style.width === '66%', 'Progress bar at 66%');

  // Re-advance to step 3
  doc.querySelector('.brand-btn[data-brand="Ford"]').click();
  assert(!step3.classList.contains('hidden'), 'Returned to step 3 with new brand Ford');
}


// ---------------------------------------------------------------------------
// SUITE 8: FULL RESET CYCLE & LEAD FORM SUBMISSION
// ---------------------------------------------------------------------------
console.log(cyan(bold('\nSUITE 8: Full Reset Cycle & Lead Form Interaction')));

{
  const { doc, advanceTimers } = createSandbox();

  // Complete wizard
  doc.querySelector('.symptom-btn[data-category="ecu"]').click();
  doc.querySelector('.brand-btn[data-brand="BMW / Mini"]').click();
  doc.getElementById('timing-rain').click();
  doc.getElementById('error-code-input').value = 'P0606';
  doc.getElementById('generate-diagnosis-btn').click();
  advanceTimers();

  assert(!doc.getElementById('step-result').classList.contains('hidden'), 'Result displayed');

  // Fill and submit lead form
  const nameInput = doc.getElementById('wizard-lead-name');
  const phoneInput = doc.getElementById('wizard-lead-phone');
  const form = doc.getElementById('wizard-lead-form');
  const successMsg = doc.getElementById('wizard-form-success');

  assert(nameInput !== null, 'Lead form name input exists');
  assert(phoneInput !== null, 'Lead form phone input exists');
  nameInput.value = 'Георги Димитров';
  phoneInput.value = '0888999888';

  assert(successMsg.classList.contains('hidden'), 'Form success message initially hidden');
  form.submit();
  assert(!successMsg.classList.contains('hidden'), 'Form success message shown after submit');

  // Click Restart Wizard
  const restartBtn = doc.getElementById('restart-wizard-btn');
  assert(restartBtn !== null, 'Restart button exists');
  restartBtn.click();

  // Verify all state reset
  const step1 = doc.getElementById('step-1');
  const stepResult = doc.getElementById('step-result');
  assert(!step1.classList.contains('hidden'), 'Step 1 visible after reset');
  assert(stepResult.classList.contains('hidden'), 'Step Result hidden after reset');

  assert(doc.getElementById('error-code-input').value === '', 'Error code input cleared to empty');
  assert(doc.getElementById('timing-permanent').checked === true, 'Timing radio reset to permanent (default)');
  assert(doc.getElementById('timing-rain').checked === false, 'Timing rain radio is unchecked');
  assert(nameInput.value === '', 'Lead form name input cleared to empty');
  assert(phoneInput.value === '', 'Lead form phone input cleared to empty');
  assert(successMsg.classList.contains('hidden'), 'Success message hidden after reset');
  assert(doc.getElementById('result-code-row').classList.contains('hidden'), 'Result code row hidden after reset');
  assert(doc.getElementById('progress-bar').style.width === '33%', 'Progress bar reset to 33%');
  assert(doc.getElementById('step-counter').innerText === 'Стъпка 1 от 3', 'Counter reset to Step 1 of 3');
}


// ---------------------------------------------------------------------------
// SUITE 9: ADVERSARIAL STRESS & EDGE CASES
// ---------------------------------------------------------------------------
console.log(cyan(bold('\nSUITE 9: Adversarial Stress & Substring Edge Cases')));

{
  const adversarialInputs = [
    { input: '<script>alert(1)</script>', desc: 'XSS script injection string' },
    { input: '   ', desc: 'Spaces only' },
    { input: '!@#$%^&*()_+', desc: 'Special characters' },
    { input: 'A'.repeat(500), desc: '500-character overflow string' },
    { input: 'P', desc: 'Single letter matching P-codes' },
    { input: '0', desc: 'Single digit matching 0-codes' },
  ];

  for (const adv of adversarialInputs) {
    const { doc, advanceTimers, consoleErrors } = createSandbox();

    doc.querySelector('.symptom-btn[data-category="abs"]').click();
    doc.querySelector('.brand-btn[data-brand="Друга марка"]').click();

    const codeInput = doc.getElementById('error-code-input');
    codeInput.value = adv.input;

    doc.getElementById('generate-diagnosis-btn').click();
    advanceTimers();

    const resResult = doc.getElementById('step-result');
    assert(!resResult.classList.contains('hidden'), `Wizard completes without crash for input: ${adv.desc}`);
    assert(consoleErrors.length === 0, `0 console errors for adversarial input: ${adv.desc}`);
  }
}


// ---------------------------------------------------------------------------
// TEST SUMMARY & FINAL VERDICT
// ---------------------------------------------------------------------------
console.log(bold('\n==============================================================='));
console.log(bold('  TEST RUNNER SUMMARY'));
console.log(bold('==============================================================='));
console.log(`Total assertions: ${bold(totalTests)}`);
console.log(`Passed:           ${green(bold(passedTests))}`);
console.log(`Failed:           ${failedTests > 0 ? red(bold(failedTests)) : green(bold('0'))}`);

if (failedTests > 0) {
  console.log(red('\nFailures recorded:'));
  failures.forEach((f, i) => console.log(red(`  ${i + 1}. ${f}`)));
  console.log(red(bold('\nCHALLENGE VERDICT: REQUEST_CHANGES')));
  process.exit(1);
} else {
  console.log(green(bold('\nCHALLENGE VERDICT: ALL TESTS PASSED EMPIRICALLY WITH 100% SUCCESS')));
  process.exit(0);
}
