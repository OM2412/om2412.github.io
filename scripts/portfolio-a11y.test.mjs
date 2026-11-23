import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../script.js', import.meta.url), 'utf8');

test('all static section headings referenced by aria-labelledby exist', () => {
  const refs = [...html.matchAll(/<section\b[^>]*aria-labelledby="([^"]+)"/g)].map(m => m[1]);
  assert.ok(refs.length >= 7);
  for (const id of refs) assert.ok(html.includes('id="' + id + '"'), 'Missing heading ID: ' + id);
});

test('modal heading is supplied dynamically by the project renderer', () => {
  assert.match(html, /<dialog\b[^>]*aria-labelledby="dialog-title"/);
  assert.match(js, /title\.id = 'dialog-title'/);
  assert.match(js, /dialog\.showModal\(\)/);
});

test('site offers skip navigation and motion preferences', () => {
  assert.match(html, /class="skip-link" href="#main"/);
  assert.match(html, /id="main"/);
  assert.match(js, /prefers-reduced-motion: reduce/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
});

test('new mobile layout and skill section are present', () => {
  assert.match(html, /id="skills"/);
  assert.match(html, /id="skills-grid"/);
  assert.match(css, /max-width:480px/);
  assert.match(css, /\.project-reel\{grid-template-columns:1fr/);
});

test('site script uses expected versioned asset references', () => {
  assert.match(html, /styles\.css\?v=9/);
  assert.match(html, /script\.js\?v=9/);
  assert.match(html, /<meta name="viewport"/);
});

test('external project links receive noreferrer and noopener protections', () => {
  assert.match(js, /a\.rel = 'noopener noreferrer'/);
  assert.match(js, /const href = safeHttps\(url\)/);
});
