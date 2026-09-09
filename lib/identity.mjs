import { createHash } from 'node:crypto';

export function fingerprint(value) {
  const stable = JSON.stringify(value, (_, v) => v !== null && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) : v);
  return createHash('sha256').update(stable).digest('hex');
}
