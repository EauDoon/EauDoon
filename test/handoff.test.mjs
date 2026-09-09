import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog } from '../lib/catalog.mjs';
import { normalizeQuery } from '../lib/query.mjs';
import { fingerprint } from '../lib/identity.mjs';
import { createHandoff, verifyHandoff } from '../lib/handoff.mjs';

test('handoff binds the complete selection and authority boundary', () => {
  const c = loadCatalog(); const q = normalizeQuery({ version: 1, text: 'evidence' }, c);
  const packet = createHandoff(c, q);
  assert.equal(verifyHandoff(c, packet, packet.digest).verified, true);
  assert.match(packet.payload.authority, /grants no authority/);
  const altered = structuredClone(packet); altered.payload.projects.pop(); altered.digest = fingerprint(altered.payload);
  assert.throws(() => verifyHandoff(c, altered, packet.digest), /integrity/);
  assert.throws(() => verifyHandoff(c, altered, altered.digest), /declared selection/);
  const changed = structuredClone(c); changed.assessment += ' Updated';
  assert.throws(() => verifyHandoff(changed, packet, packet.digest), /different catalog/);
  assert.throws(() => verifyHandoff(c, packet), /retained/);
});
