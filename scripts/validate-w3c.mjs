#!/usr/bin/env node
/**
 * AutoElektronik W3C Nu HTML Checker Automated Validation (CSCB700 Requirement #2)
 *
 * Validates all compiled static HTML pages in dist/ against the official W3C Nu Validator.
 * Ensures 100% W3C HTML5 compliance with 0 errors and 0 warnings.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

function findHtmlFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

function runLocalVnu(htmlFiles) {
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const res = spawnSync(npxCmd, ['--yes', 'vnu-jar', '--format', 'json', ...htmlFiles], {
    encoding: 'utf8',
    shell: true,
  });

  if (res.error) {
    throw res.error;
  }

  const rawJson = res.stderr || res.stdout;
  if (!rawJson) {
    throw new Error('No output from vnu-jar');
  }

  return JSON.parse(rawJson);
}

async function run() {
  console.log('\x1b[36m============================================================\x1b[0m');
  console.log('\x1b[36m  Official W3C Nu HTML Validator (CSCB700 Requirement #2) \x1b[0m');
  console.log('\x1b[36m============================================================\x1b[0m\n');

  if (!fs.existsSync(DIST_DIR)) {
    console.error(`\x1b[31mError: ${DIST_DIR} not found. Run "npm run build" first.\x1b[0m`);
    process.exit(1);
  }

  const htmlFiles = findHtmlFiles(DIST_DIR).sort();
  console.log(`Validating ${htmlFiles.length} HTML pages with official W3C Nu HTML Checker...\n`);

  try {
    const result = runLocalVnu(htmlFiles);
    const messages = result.messages || [];

    // Group messages by relative file path
    const messagesByFile = new Map();
    for (const f of htmlFiles) {
      messagesByFile.set(f, []);
    }
    for (const msg of messages) {
      const fileUrl = msg.url || '';
      for (const f of htmlFiles) {
        if (fileUrl.includes(path.basename(f)) || fileUrl.endsWith(f.replace(/\\/g, '/'))) {
          messagesByFile.get(f)?.push(msg);
          break;
        }
      }
    }

    let grandTotalErrors = 0;
    let grandTotalWarnings = 0;

    for (const filePath of htmlFiles) {
      const relPath = path.relative(DIST_DIR, filePath).replace(/\\/g, '/');
      const fileMessages = messagesByFile.get(filePath) || [];
      const errors = fileMessages.filter((m) => m.type === 'error');
      const warnings = fileMessages.filter(
        (m) => (m.type === 'info' || m.type === 'warning') && m.subType === 'warning'
      );

      grandTotalErrors += errors.length;
      grandTotalWarnings += warnings.length;

      if (errors.length === 0 && warnings.length === 0) {
        console.log(`  \x1b[32m✓\x1b[0m [${relPath.padEnd(40)}] 0 Errors, 0 Warnings`);
      } else {
        console.log(`  \x1b[31m✗\x1b[0m [${relPath.padEnd(40)}] ${errors.length} Errors, ${warnings.length} Warnings`);
        for (const err of errors) {
          console.error(`      \x1b[31mError:\x1b[0m ${err.message} (line ${err.lastLine || '?'})`);
        }
        for (const warn of warnings) {
          console.warn(`      \x1b[33mWarning:\x1b[0m ${warn.message} (line ${warn.lastLine || '?'})`);
        }
      }
    }

    console.log('\n\x1b[36m============================================================\x1b[0m');
    if (grandTotalErrors === 0 && grandTotalWarnings === 0) {
      console.log(`\x1b[32m\x1b[1mW3C VALIDATION RESULT: 100% VALID (0 Errors, 0 Warnings across ${htmlFiles.length} pages)\x1b[0m`);
      console.log('\x1b[36m============================================================\x1b[0m\n');
      process.exit(0);
    } else {
      console.error(`\x1b[31m\x1b[1mW3C VALIDATION FAILED: ${grandTotalErrors} Errors, ${grandTotalWarnings} Warnings\x1b[0m`);
      console.log('\x1b[36m============================================================\x1b[0m\n');
      process.exit(1);
    }
  } catch (err) {
    console.error(`\x1b[31mValidator Execution Error: ${err.message}\x1b[0m`);
    process.exit(1);
  }
}

run();
