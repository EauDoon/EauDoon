import { existsSync, readdirSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

const notDocumented = new Set(['.git', 'node_modules']);
export function markdownFiles(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    if (entry.isDirectory()) return notDocumented.has(entry.name) ? [] : markdownFiles(join(root, entry.name));
    return entry.name.endsWith('.md') ? [join(root, entry.name)] : [];
  }).sort();
}

function inlineDestinations(text) {
  const destinations = [];
  for (const match of text.matchAll(/\]\(/g)) {
    let i = match.index + match[0].length;
    if (text[i] === ')') { destinations.push(''); continue; }
    if (text[i] === '<') {
      const end = text.indexOf('>', i + 1);
      destinations.push(end === -1 ? text.slice(i) : text.slice(i + 1, end));
      continue;
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
    destinations.push(text.slice(start, i));
  }
  return destinations;
}

export function checkLinks(text, file, root) {
  const errors = [];
  const autolinks = [...text.matchAll(/<([a-z][a-z0-9+.-]*:[^>\s]+)>/gi)].map(match => match[1]);
  const links = [...inlineDestinations(text), ...autolinks, ...[...text.matchAll(/(?:href|src|srcset)="([^"]+)"/g)].map(m => m[1])];
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
