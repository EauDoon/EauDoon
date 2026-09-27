import { existsSync, readdirSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

const notDocumented = new Set(['.git', 'node_modules']);
export function markdownFiles(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    if (entry.isDirectory()) return notDocumented.has(entry.name) ? [] : markdownFiles(join(root, entry.name));
    return entry.name.endsWith('.md') ? [join(root, entry.name)] : [];
  }).sort();
}

export function checkLinks(text, file, root) {
  const errors = [];
  const links = [...text.matchAll(/\]\(([^\s)]+)\)|(?:href|src|srcset)="([^"]+)"/g)].map(m => m[1] || m[2]);
  for (const link of links) {
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
