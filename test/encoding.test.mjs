// encoding: utf-8, LF, no BOM
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const trackedNames = new Set(['LICENSE', '.gitattributes', '.gitignore']);
const trackedExtensions = new Set(['.json', '.md', '.mjs', '.svg', '.yml']);
const isTextFile = path => trackedNames.has(basename(path)) || trackedExtensions.has(extname(path));
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  if (entry.isDirectory()) return entry.name === '.git' || entry.name === 'node_modules' ? [] : walk(join(dir, entry.name));
  return isTextFile(entry.name) ? [join(dir, entry.name)] : [];
});
const name = file => relative(root, file).split(sep).join('/');

const git = args => spawnSync('git', args, { cwd: root, encoding: 'utf8' });
// root is a work tree of its own only when git runs and reports no prefix. An
// empty prefix rules out an export unpacked inside some other repository,
// where ls-files would list that repository's files instead of this one's.
const prefix = git(['rev-parse', '--show-prefix']);
const isWorkTree = !prefix.error && prefix.status === 0 && prefix.stdout.trim() === '';

// The guard checks what git tracks, so an untracked scratch file (a UTF-16
// drift-report.json from a PowerShell 5.1 redirect, say) cannot fail the suite.
// ls-files also lists paths deleted from disk but not yet staged; skip those.
// Outside a work tree (a git archive export or a packed install) there is no
// index to ask, so the guard falls back to every matching file on disk.
function textFiles() {
  if (!isWorkTree) return walk(root);
  const listed = git(['ls-files', '-z']);
  if (listed.error || listed.status !== 0) return walk(root);
  return listed.stdout.split('\0').filter(path => path && isTextFile(path))
    .map(path => join(root, path)).filter(file => existsSync(file));
}

// Parses `git ls-files --eol -z`: each record is "i/<index> w/<tree> attr/<attr>\t<path>".
// It reads the index column, so a Windows clone whose working copies are still
// CRLF (checked out before .gitattributes) passes, while the committed bytes
// stay enforced.
function eolFaults(output) {
  const faults = [];
  for (const record of output.split('\0')) {
    const tab = record.indexOf('\t');
    if (tab === -1) continue;
    const index = record.slice(0, tab).trim().split(/\s+/)[0];
    const path = record.slice(tab + 1);
    if (index === 'i/crlf') faults.push(`${path} is committed with CRLF line endings`);
    else if (index === 'i/mixed') faults.push(`${path} is committed with mixed CRLF and LF line endings`);
  }
  return faults;
}

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
  const files = textFiles();
  assert.ok(files.length >= 60, `expected the whole tree, found ${files.length} files`);
  assert.ok(files.map(name).includes('LICENSE'), 'LICENSE is not encoding-checked');
  for (const file of files) assert.equal(encodingFault(readFileSync(file)), null, `${name(file)} ${encodingFault(readFileSync(file))}`);
});

test('no tracked file is committed with CRLF line endings', { skip: !isWorkTree && 'not a git work tree' }, () => {
  const listed = git(['ls-files', '--eol', '-z']);
  assert.equal(listed.status, 0, listed.stderr);
  assert.ok(listed.stdout.includes('\tLICENSE\0'), 'git ls-files --eol did not list LICENSE');
  assert.deepEqual(eolFaults(listed.stdout), []);
});

test('the line-ending parser reports CRLF and mixed index entries only', () => {
  assert.deepEqual(eolFaults('i/crlf  w/crlf  attr/                 \tREADME.md\0'), ['README.md is committed with CRLF line endings']);
  assert.deepEqual(eolFaults('i/mixed w/mixed attr/                 \tdocs/a b.md\0'), ['docs/a b.md is committed with mixed CRLF and LF line endings']);
  // A CRLF working copy over an LF index is a local checkout, not a committed fault.
  assert.deepEqual(eolFaults('i/lf    w/crlf  attr/text eol=lf      \tcli.mjs\0i/-text w/-text attr/                 \tx.png\0'), []);
  assert.deepEqual(eolFaults(''), []);
});

test('the guard rejects each encoding this repository has already suffered', () => {
  assert.equal(encodingFault(Buffer.from('plain ascii', 'utf8')), null);
  assert.equal(encodingFault(Buffer.from('naïve — ünïcode', 'utf8')), null);
  assert.equal(encodingFault(Buffer.from('x', 'utf16le')), 'decodes as UTF-16');
  assert.equal(encodingFault(Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from('x', 'utf16le')])), 'is not valid UTF-8');
  assert.equal(encodingFault(Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from('x')])), 'contains a byte order mark');
  assert.equal(encodingFault(Buffer.from([0x7b, 0x22, 0x61, 0x22, 0x3a, 0x22, 0xff, 0x22, 0x7d])), 'is not valid UTF-8');
});
