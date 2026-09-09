import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog } from '../lib/catalog.mjs';
import { catalogFingerprint, catalogReceipt, verifyReceipt } from '../lib/identity.mjs';

test('receipts ignore object/project order and bind all assessed content', () => {
  const c = loadCatalog(); const receipt = catalogReceipt(c);
  const reordered = structuredClone(c); reordered.projects.reverse();
  reordered.projects[0] = Object.fromEntries(Object.entries(reordered.projects[0]).reverse());
  assert.equal(catalogFingerprint(reordered), receipt.digest);
  assert.equal(verifyReceipt(c, receipt, receipt.digest).independentlyPinned, true);
  assert.equal(verifyReceipt(c, receipt).independentlyPinned, false);
  assert.throws(() => verifyReceipt(c, receipt, '0'.repeat(64)), /retained/);
  assert.throws(() => verifyReceipt(c, { ...receipt, projectCount: 999 }), /current catalog/);
  reordered.projects[0].boundary += ' Changed';
  assert.notEqual(catalogFingerprint(reordered), receipt.digest);
});
