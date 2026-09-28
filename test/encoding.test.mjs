// encoding: utf-8, LF, no BOM
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const trackedNames = new Set(['LICENSE']);
const trackedExtensions = new Set(['.json', '.md', '.mjs', '.svg', '.yml']);
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  if (entry.isDirectory()) return entry.name === '.git' || entry.name === 'node_modules' ? [] : walk(join(dir, entry.name));
  return trackedNames.has(entry.name) || trackedExtensions.has(extname(entry.name)) ? [join(dir, entry.name)] : [];
});
const name = file => relative(root, file).split(sep).join('/');

// audits/2026-09-23-utf16-fix.md records catalog.json, lib/catalog.mjs,
// docs/CATALOG.md and cli.mjs reaching main as UTF-16 LE. readJson now
// reports that encoding fault for a catalog, but nothing checked the other 58
// files: a UTF-16 lib/render.mjs would render a blank catalog guide instead of
// failing, and a UTF-16 banner SVG would render as an empty image.
function encodingFault(bytes) {
  let text;
  // ignoreBOM keeps the mark in the string; the default strips it, which would
  // hide exactly the fault this test exists to catch.
  try { text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes); }
  catch { return 'is not valid UTF-8'; }
  if (text.includes('\uFEFF')) return 'contains a byte order mark';
  // UTF-16LE without a BOM decodes as valid UTF-8 with a NUL after every byte.
  if (text.includes('\0')) return 'decodes as UTF-16';
  return null;
}

test('every tracked text file is valid UTF-8 without a byte order mark', () => {
  const files = walk(root);
  assert.ok(files.length >= 60, `expected the whole tree, found ${files.length} files`);
  assert.ok(files.map(name).includes('LICENSE'), 'LICENSE is not encoding-checked');
  for (const file of files) assert.equal(encodingFault(readFileSync(file)), null, `${name(file)} ${encodingFault(readFileSync(file))}`);
});

test('the guard rejects each encoding this repository has already suffered', () => {
  assert.equal(encodingFault(Buffer.from('plain ascii', 'utf8')), null);
  assert.equal(encodingFault(Buffer.from('naïve — ünïcode', 'utf8')), null);
  assert.equal(encodingFault(Buffer.from('x', 'utf16le')), 'decodes as UTF-16');
  assert.equal(encodingFault(Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from('x', 'utf16le')])), 'is not valid UTF-8');
  assert.equal(encodingFault(Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from('x')])), 'contains a byte order mark');
  assert.equal(encodingFault(Buffer.from([0x7b, 0x22, 0x61, 0x22, 0x3a, 0x22, 0xff, 0x22, 0x7d])), 'is not valid UTF-8');
});
