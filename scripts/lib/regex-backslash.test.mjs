// Safe to edit by hand
// Guards every script in the repo against regexes that lost their backslashes to a Git Bash
// heredoc (audit 2026-10-25, DEV-H2: flow.ts split headings on the letter "s"). The detector is
// scripts/lib/regex-backslash.mjs. A deliberate pattern that trips it (a regex that really means
// the letter s followed by +) can be written with a character class, `[s]+`, to pass.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { looksStripped, scanFile } from './regex-backslash.mjs';

test('the detector catches the shapes a heredoc leaves behind', () => {
  for (const body of ['(s+)', '^s+$', 'd+', '(d{1,2})', '[^s]', 'w+@', '^sunday-(d{1,2})$']) {
    assert.equal(looksStripped(body), true, body);
  }
});

test('the detector leaves real regexes alone', () => {
  for (const body of [
    '(\\s+)',
    '^\\s+$',
    '^sunday-(\\d{1,2})$',
    '.+@.+\\..+',
    'class+',
    'stones?',
    '[?&]still(=|&|$)',
    '^#[0-9a-f]{6}$',
    'is-(armed|laid)',
  ]) {
    assert.equal(looksStripped(body), false, body);
  }
});

test('no script in the repo holds a regex that lost its backslashes', () => {
  const files = execFileSync(
    'git',
    ['ls-files', '--', '*.ts', '*.tsx', '*.mjs', '*.js', '*.astro'],
    { encoding: 'utf8' },
  )
    .split('\n')
    .filter((f) => f && !f.includes('.generated.') && !f.startsWith('public/'));
  const hits = [];
  for (const f of files) {
    for (const h of scanFile(f)) hits.push(`${f}:${h.line} ${h.regex}`);
  }
  assert.deepEqual(
    hits,
    [],
    `Regexes that look like they lost their backslashes:\n${hits.join('\n')}`,
  );
});
