import { createHash } from 'node:crypto';
import { ordered } from './discover.mjs';

export function fingerprint(value) {
  const stable = JSON.stringify(value, (_, v) => v !== null && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) : v);
  return createHash('sha256').update(stable).digest('hex');
}

export const catalogFingerprint = catalog => fingerprint({ ...catalog, projects: ordered(catalog.projects) });
export function catalogReceipt(catalog) {
  return { version: 1, kind: 'public-catalog-receipt', algorithm: 'sha256-key-sorted-json-v1', digest: catalogFingerprint(catalog), assessedOn: catalog.assessedOn, projectCount: catalog.projects.length, sources: ordered(catalog.projects).map(p => ({ id: p.id, revision: p.source.revision })) };
}
export function verifyReceipt(catalog, receipt, expected) {
  if (fingerprint(receipt) !== fingerprint(catalogReceipt(catalog))) throw new Error('Receipt does not match the current catalog');
  if (expected !== undefined && (typeof expected !== 'string' || !/^[a-f0-9]{64}$/.test(expected) || receipt.digest !== expected)) throw new Error('Independently retained catalog digest does not match');
  return { matches: true, digest: receipt.digest, independentlyPinned: expected !== undefined, note: 'Digest consistency only. No signature, source authentication, deployment or security certification.' };
}
