import { readFileSync, statSync } from 'node:fs';

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

export function loadCatalog(path = new URL('../catalog.json', import.meta.url)) {
  if (statSync(path).size > 1024 * 1024) throw new Error('Catalog exceeds 1 MiB limit');
  const catalog = JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
  const errors = validate(catalog);
  if (errors.length) throw new Error(errors.join('\n'));
  return catalog;
}
