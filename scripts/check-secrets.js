#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();

function getTrackedFiles() {
  const output = execSync('git ls-files -z', { cwd: ROOT, encoding: 'utf8' });
  return output.split('\0').filter(Boolean);
}

function isProbablyBinary(buffer) {
  const sampleSize = Math.min(buffer.length, 4096);
  let suspicious = 0;
  for (let i = 0; i < sampleSize; i += 1) {
    if (buffer[i] === 0) return true;
    if (buffer[i] < 7 || (buffer[i] > 13 && buffer[i] < 32)) suspicious += 1;
  }
  return sampleSize > 0 && suspicious / sampleSize > 0.1;
}

const RULES = [
  { name: 'Stripe Secret Key', regex: /\bsk_(live|test)_[A-Za-z0-9]{20,}\b/g },
  { name: 'Stripe Webhook Secret', regex: /\bwhsec_[A-Za-z0-9]{20,}\b/g },
  { name: 'DigitalOcean Token', regex: /\bdop_v1_[A-Za-z0-9]{32,}\b/g },
  { name: 'AWS Access Key ID', regex: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: 'Generic Private Key Block', regex: /-----BEGIN (RSA |EC |OPENSSH |)?PRIVATE KEY-----/g },
  { name: 'Supabase Publishable Key', regex: /\bsb_publishable_[A-Za-z0-9_\-]{20,}\b/g },
];

function isIgnoredMatch(matchText) {
  const lower = matchText.toLowerCase();
  if (lower.includes('replace_me')) return true;
  if (lower.includes('example')) return true;
  if (lower.includes('demo')) return true;
  return false;
}

function findLineNumber(text, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (text.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

function run() {
  let files;
  try {
    files = getTrackedFiles();
  } catch (err) {
    console.error('[secrets] Failed to list tracked files. Is git available?');
    console.error('[secrets]', err.message);
    process.exit(2);
  }

  const findings = [];

  for (const relPath of files) {
    const absPath = path.join(ROOT, relPath);
    let buffer;

    try {
      buffer = fs.readFileSync(absPath);
    } catch {
      continue;
    }

    if (isProbablyBinary(buffer)) continue;

    const text = buffer.toString('utf8');

    for (const rule of RULES) {
      rule.regex.lastIndex = 0;
      let match;
      while ((match = rule.regex.exec(text)) !== null) {
        const secret = match[0];
        if (isIgnoredMatch(secret)) continue;

        findings.push({
          path: relPath,
          line: findLineNumber(text, match.index),
          rule: rule.name,
          valuePreview: `${secret.slice(0, 8)}...${secret.slice(-4)}`,
        });
      }
    }
  }

  if (findings.length === 0) {
    console.log('[secrets] OK: no hardcoded secrets detected in tracked files.');
    process.exit(0);
  }

  console.error('[secrets] FAILED: detected potential secrets in tracked files.');
  for (const finding of findings) {
    console.error(`- ${finding.path}:${finding.line} [${finding.rule}] ${finding.valuePreview}`);
  }
  console.error('[secrets] Rotate any exposed key immediately and remove it from tracked files.');
  process.exit(1);
}

run();
