// encoding: utf-8, LF, no BOM
import { openSync, fstatSync, readSync, closeSync, constants } from 'node:fs';

export const vocab = Object.freeze({
  category: ['action-systems', 'agent-workflows', 'decision-methods', 'discovery', 'publishing'],
  runtimes: ['assistant', 'browser', 'markdown', 'node', 'python'],
  privacy: ['configuration-dependent', 'local-after-setup', 'provider-dependent', 'public-content'],
});
const plain = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const exact = (x, keys) => plain(x) && Object.keys(x).length === keys.length && keys.every(k => Object.hasOwn(x, k));
const exactWithOptional = (x, keys, optional) => {
  if (!plain(x)) return false;
  const allKeys = [...keys, ...optional];
  for (const k of Object.keys(x)) if (!allKeys.includes(k)) return false;
  for (const k of keys) if (!Object.hasOwn(x, k)) return false;
  return true;
};
const safeText = x => typeof x === 'string' && x.length > 0 && x.length <= 1000 && !/[\p{Cc}\p{Cf}<>|]/u.test(x);
const slug = x => typeof x === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9.-]{0,79}$/.test(x);
const list = (x, allowed) => Array.isArray(x) && x.length > 0 && x.length <= 20 && new Set(x).size === x.length && x.every(v => allowed ? allowed.includes(v) : slug(v));
const intList = x => Array.isArray(x) && x.length > 0 && x.length <= 20 && new Set(x).size === x.length && x.every(v => Number.isInteger(v) && v >= 1 && v <= 99);

export const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

export function validate(catalog) {
  const errors = [];
  if (!exactWithOptional(catalog, ['schemaVersion', 'assessedOn', 'assessment', 'projects'], ['portfolioWavesCompleted'])) return ['Invalid catalog fields'];
  if (catalog.schemaVersion !== 1) errors.push('Unsupported schemaVersion');
  if (!validDate(catalog.assessedOn)) errors.push('Invalid assessedOn date');
  if (!safeText(catalog.assessment)) errors.push('Invalid assessment');
  if (Object.hasOwn(catalog, 'portfolioWavesCompleted') && !intList(catalog.portfolioWavesCompleted)) errors.push('Invalid portfolioWavesCompleted');
  if (!Array.isArray(catalog.projects) || catalog.projects.length > 1000 || catalog.projects.length === 0) return [...errors, 'Invalid projects'];
  const seen = new Set();
  for (const [index, p] of catalog.projects.entries()) {
    const prefix = `projects[${index}]`;
    if (!exactWithOptional(p, ['id', 'repository', 'summary', 'category', 'runtimes', 'privacy', 'tasks', 'boundary', 'fork', 'source'], ['wavesTouched', 'lastAudited'])) { errors.push(`${prefix}: invalid fields`); continue; }
    if (!slug(p.id) || seen.has(String(p.id).toLowerCase())) errors.push(`${prefix}: invalid or duplicate id`);
    seen.add(String(p.id).toLowerCase());
    if (p.repository !== `https://github.com/EauDoon/${p.id}`) errors.push(`${prefix}: repository must be an explicit public owner URL`);
    if (!safeText(p.summary) || !safeText(p.boundary)) errors.push(`${prefix}: invalid descriptive text`);
    if (!vocab.category.includes(p.category) || !vocab.privacy.includes(p.privacy) || !list(p.runtimes, vocab.runtimes) || !list(p.tasks)) errors.push(`${prefix}: invalid classification`);
    if (typeof p.fork !== 'boolean') errors.push(`${prefix}: invalid fork flag`);
    if (Object.hasOwn(p, 'wavesTouched') && !intList(p.wavesTouched)) errors.push(`${prefix}: invalid wavesTouched`);
    if (Object.hasOwn(p, 'lastAudited') && !validDate(p.lastAudited)) errors.push(`${prefix}: invalid lastAudited`);
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
    if (stack.length > 64) throw new Error('JSON nesting exceeds 64 levels');
  }
  return data;
}

export function loadCatalog(path = new URL('../catalog.json', import.meta.url)) {
  const catalog = readJson(path);
  const errors = validate(catalog);
  if (errors.length) throw new Error(errors.join('\n'));
  return catalog;
}

export function errorMessage(error) {
  if (error?.code) return ({ ENOENT: 'Input or destination parent does not exist', EEXIST: 'Output already exists; choose a new destination', EACCES: 'File access denied', EPERM: 'File access denied', EISDIR: 'Expected a regular file', ERR_ENCODING_INVALID_ENCODED_DATA: 'Input must be valid UTF-8' })[error.code] ?? 'File operation failed';
  return error.message;
}
