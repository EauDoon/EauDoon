import { existsSync, readdirSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

const notDocumented = new Set(['.git', 'node_modules']);
export function markdownFiles(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    if (entry.isDirectory()) return notDocumented.has(entry.name) ? [] : markdownFiles(join(root, entry.name));
    return entry.name.endsWith('.md') ? [join(root, entry.name)] : [];
  }).sort();
}

function readDestination(text, i) {
  if (text[i] === '<') {
    const end = text.indexOf('>', i + 1);
    return end === -1 ? text.slice(i) : text.slice(i + 1, end);
  }
  const start = i;
  let depth = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '\\') { i += 2; continue; }
    if (ch === '(') { depth += 1; i += 1; continue; }
    if (ch === ')' && depth === 0) break;
    if (ch === ')') { depth -= 1; i += 1; continue; }
    if (/\s/u.test(ch) && depth === 0) break;
    i += 1;
  }
  return text.slice(start, i);
}

// CommonMark allows spaces, tabs, and one line ending between "(" and the destination.
function skipOpeningSpace(text, i) {
  const start = i;
  while (text[i] === ' ' || text[i] === '\t') i += 1;
  if (text[i] === '\r') i += 1;
  if (text[i] === '\n') {
    i += 1;
    while (text[i] === ' ' || text[i] === '\t') i += 1;
  }
  if (text[i] === '\n' || text[i] === '\r') return start;
  return i;
}

function inlineDestinations(text) {
  const destinations = [];
  for (const match of text.matchAll(/\]\(/g)) {
    let i = skipOpeningSpace(text, match.index + match[0].length);
    if (text[i] === ')' || i >= text.length) { destinations.push(''); continue; }
    destinations.push(readDestination(text, i));
  }
  return destinations;
}

function referenceDestinations(text) {
  const destinations = [];
  const lines = text.split('\n');
  for (let n = 0; n < lines.length; n++) {
    const line = lines[n].replace(/\r$/, '');
    const match = /^ {0,3}\[[^\]\n]+\]:[ \t]*(.*)$/.exec(line);
    if (!match) continue;
    let rest = match[1];
    if (/^[ \t]*$/.test(rest) && n + 1 < lines.length) {
      const next = lines[n + 1].replace(/\r$/, '');
      if (!/^[ \t]*$/.test(next)) { rest = next; n += 1; }
    }
    let i = 0;
    while (rest[i] === ' ' || rest[i] === '\t') i += 1;
    if (i >= rest.length) { destinations.push(''); continue; }
    destinations.push(readDestination(rest, i));
  }
  return destinations;
}

export function checkLinks(text, file, root) {
  const errors = [];
  const defined = [...inlineDestinations(text), ...referenceDestinations(text)];
  const autolinks = [...text.matchAll(/<([a-z][a-z0-9+.-]*:[^>\s]+)>/gi)].map(match => match[1]).filter(url => !defined.includes(url));
  const links = [...defined, ...autolinks, ...[...text.matchAll(/(?:href|src|srcset)="([^"]+)"/g)].map(m => m[1])];
  for (const link of links) {
    if (link === '') { errors.push('Empty link destination'); continue; }
    if (link.startsWith('#')) continue;
    if (/^https:\/\//.test(link)) {
      try { const url = new URL(link); if (url.username || url.password || url.port) throw new Error(); } catch { errors.push(`Invalid HTTPS link: ${link}`); }
      continue;
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(link) || link.startsWith('//') || link.includes('\\')) { errors.push(`Unsupported link: ${link}`); continue; }
    let decoded;
    try { decoded = decodeURIComponent(link.split('#')[0]); } catch { errors.push(`Malformed local link: ${link}`); continue; }
    const target = resolve(dirname(file), decoded);
    const within = p => { const rel = relative(root, p); return !isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${sep}`); };
    if (!within(target) || !existsSync(target) || !within(realpathSync(target))) errors.push(`Missing or out-of-scope local target: ${link}`);
  }
  return errors;
}
