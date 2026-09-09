import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
import { loadCatalog } from '../lib/catalog.mjs';

const source = new URL('../catalog.json', import.meta.url);
const limit = 1024 * 1024;
const fixture = callback => {
  const dir = fs.mkdtempSync(join(tmpdir(), 'public-catalog-test-'));
  const file = join(dir, 'catalog.json');
  try { callback(file, dir); }
  finally { if (fs.existsSync(file)) fs.unlinkSync(file); fs.rmdirSync(dir); }
};

test('concurrent growth after descriptor stat cannot bypass consumed-byte limit', () => fixture(file => {
  fs.copyFileSync(source, file);
  const original = { fstat: fs.fstatSync, read: fs.readSync, close: fs.closeSync };
  let consumed = 0;
  let closed = 0;
  let descriptor;
  try {
    fs.fstatSync = (...args) => {
      descriptor = args[0];
      const observed = original.fstat(...args);
      fs.appendFileSync(file, ' '.repeat(limit));
      return observed;
    };
    fs.readSync = (...args) => { const count = original.read(...args); consumed += count; return count; };
    fs.closeSync = (...args) => { if (args[0] === descriptor) closed++; return original.close(...args); };
    syncBuiltinESMExports();
    assert.throws(() => loadCatalog(file), /exceeds 1 MiB/);
    assert.equal(consumed, limit + 1);
    assert.equal(closed, 1);
  } finally {
    fs.fstatSync = original.fstat; fs.readSync = original.read; fs.closeSync = original.close;
    syncBuiltinESMExports();
  }
}));

test('exact byte limit is accepted; extra byte, invalid UTF-8 and directories reject', () => fixture((file, dir) => {
  const bytes = fs.readFileSync(source);
  fs.writeFileSync(file, Buffer.concat([bytes, Buffer.alloc(limit - bytes.length, 0x20)]));
  assert.equal(loadCatalog(file).projects.length, 16);
  fs.appendFileSync(file, ' ');
  assert.throws(() => loadCatalog(file), /exceeds 1 MiB/);
  fs.writeFileSync(file, Buffer.from('{"bad":"\xff"}', 'latin1'));
  assert.throws(() => loadCatalog(file), /encoded data|encoding/i);
  assert.throws(() => loadCatalog(dir), /regular file|EISDIR|EPERM|EACCES/);
}));

test('descriptor rejected as nonregular is closed before reading', () => fixture(file => {
  fs.copyFileSync(source, file);
  const original = { fstat: fs.fstatSync, read: fs.readSync, close: fs.closeSync };
  let closed = 0;
  try {
    fs.fstatSync = () => ({ isFile: () => false });
    fs.readSync = () => assert.fail('Nonregular input must not be read');
    fs.closeSync = (...args) => { closed++; return original.close(...args); };
    syncBuiltinESMExports();
    assert.throws(() => loadCatalog(file), /regular file/);
    assert.equal(closed, 1);
  } finally {
    fs.fstatSync = original.fstat; fs.readSync = original.read; fs.closeSync = original.close;
    syncBuiltinESMExports();
  }
}));

test('POSIX FIFO fails promptly in real CLI without a writer', { skip: process.platform === 'win32' }, () => fixture(file => {
  const created = spawnSync('mkfifo', [file], { encoding: 'utf8', timeout: 2000 });
  assert.equal(created.status, 0, created.stderr);
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('../scripts/diff.mjs', import.meta.url)), file, fileURLToPath(source)], { encoding: 'utf8', timeout: 2000 });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /regular file/);
}));
