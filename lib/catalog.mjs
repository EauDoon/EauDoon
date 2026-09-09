import { openSync, fstatSync, readSync, closeSync, constants } from 'node:fs';

export const vocab = Object.freeze({
  category: ['action-systems', 'agent-workflows', 'decision-methods', 'discovery', 'publishing'],
  runtimes: ['assistant', 'browser', 'markdown', 'node', 'python'],
  privacy: ['configuration-dependent', 'local-after-setup', 'provider-dependent', 'public-content'],
});
const plain = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const exact = (x, keys) => plain(x) && Object.keys(x).length === keys.length && keys.every(k => Object.hasOwn(x, k));
const safeText = x => typeof x === 'string' && x.length > 0 && x.length <= 1000 && !/[\p{Cc}\p{Cf}<>|]/u.test(x);
const slug = x => typeof x === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9.-]{0,79}$/.test(x);
const list = (x, allowed) => Array.isArray(x) && x.length > 0 && x.length <= 20 && new Set(x).size === x.length && x.every(v => allowed ? allowed.includes(v) : slug(v));

export function validate(catalog) {
  const errors = [];
  if (!exact(catalog, ['schemaVersion', 'assessedOn', 'assessment', 'projects'])) return ['Invalid catalog fields'];
  if (catalog.schemaVersion !== 1) errors.push('Unsupported schemaVersion');
  if (typeof catalog.assessedOn !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(catalog.assessedOn) || !Number.isFinite(Date.parse(catalog.assessedOn)) || new Date(catalog.assessedOn).toISOString().slice(0, 10) !== catalog.assessedOn) errors.push('Invalid assessedOn date');
  if (!safeText(catalog.assessment)) errors.push('Invalid assessment');
  if (!Array.isArray(catalog.projects) || catalog.projects.length > 1000 || catalog.projects.length === 0) return [...errors, 'Invalid projects'];
  const seen = new Set();
  for (const [index, p] of catalog.projects.entries()) {
    const prefix = `projects[${index}]`;
    if (!exact(p, ['id', 'repository', 'summary', 'category', 'runtimes', 'privacy', 'tasks', 'boundary', 'fork', 'source'])) { errors.push(`${prefix}: invalid fields`); continue; }
    if (!slug(p.id) || seen.has(String(p.id).toLowerCase())) errors.push(`${prefix}: invalid or duplicate id`);
    seen.add(String(p.id).toLowerCase());
    if (p.repository !== `https://github.com/EauDoon/${p.id}`) errors.push(`${prefix}: repository must be an explicit public owner URL`);
    if (!safeText(p.summary) || !safeText(p.boundary)) errors.push(`${prefix}: invalid descriptive text`);
    if (!vocab.category.includes(p.category) || !vocab.privacy.includes(p.privacy) || !list(p.runtimes, vocab.runtimes) || !list(p.tasks)) errors.push(`${prefix}: invalid classification`);
    if (typeof p.fork !== 'boolean') errors.push(`${prefix}: invalid fork flag`);
    if (!exact(p.source, ['revision', 'url']) || typeof p.source.revision !== 'string' || !/^[a-f0-9]{40}$/.test(p.source.revision) || p.source.url !== `${p.repository}/blob/${p.source.revision}/README.md`) errors.push(`${prefix}: source must pin a README revision`);
  }
  return errors;
}

export function readJson(path) {
  const limit = 1024 * 1024;
  // Nonblocking open prevents a POSIX FIFO from waiting for a writer before
  // fstat can reject it. All inspection and reads use this one descriptor.
  const fd = openSync(path, constants.O_RDONLY | (constants.O_NONBLOCK ?? 0));
  let text;
  try {
    const info = fstatSync(fd);
    if (!info.isFile()) throw new Error('Catalog must be a regular file');
    if (info.size > limit) throw new Error('Catalog exceeds 1 MiB limit');
    const bytes = Buffer.allocUnsafe(limit + 1);
    let length = 0;
    while (length < bytes.length) {
      const count = readSync(fd, bytes, length, bytes.length - length, null);
      if (count === 0) break;
      length += count;
    }
    if (length > limit) throw new Error('Catalog exceeds 1 MiB limit');
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(0, length));
  } finally {
    closeSync(fd);
  }
  const source = text.replace(/^\uFEFF/, '');
  let data;
  try { data = JSON.parse(source); }
  catch { throw new Error('Invalid JSON input'); }
  // JSON.parse validates grammar; this iterative pass rejects ambiguous members.
  const stack = [];
  for (const match of source.matchAll(/"(?:[^"\\]|\\.)*"|[{}\[\],]/g)) {
    const token = match[0];
    if (token === '{') stack.push({ object: true, key: true, names: new Set() });
    else if (token === '[') stack.push({ object: false });
    else if (token === '}' || token === ']') stack.pop();
    else if (token === ',') { if (stack.at(-1)?.object) stack.at(-1).key = true; }
    else if (stack.at(-1)?.object && stack.at(-1).key) {
      const name = JSON.parse(token);
      if (stack.at(-1).names.has(name)) throw new Error('Duplicate JSON object member');
      stack.at(-1).names.add(name); stack.at(-1).key = false;
    }
  }
  return data;
}

export function loadCatalog(path = new URL('../catalog.json', import.meta.url)) {
  const catalog = readJson(path);
  const errors = validate(catalog);
  if (errors.length) throw new Error(errors.join('\n'));
  return catalog;
}
