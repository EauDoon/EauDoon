import { writeFileSync } from 'node:fs';
import { markdown } from './discover.mjs';
import { queryReport } from './query.mjs';
import { fingerprint } from './identity.mjs';

export function csvCell(value) {
  let text = String(value);
  if (/^[\s]*[=+@-]/u.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export function renderSelection(catalog, query, format) {
  const report = queryReport(catalog, query);
  if (format === 'json') return JSON.stringify(report, null, 2) + '\n';
  if (format === 'csv') {
    const rows = [['id','summary','category','runtimes','privacy','boundary','assessed_source','assessed_on','query_sha256'], ...report.projects.map(p => [p.id,p.summary,p.category,p.runtimes.join('; '),p.privacy,p.boundary,p.source.url,catalog.assessedOn,fingerprint(query)])];
    return rows.map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
  }
  if (format === 'markdown') {
    const row = values => '| ' + values.map(markdown).join(' | ') + ' |';
    return ['# Project selection', '', `Static assessment: ${catalog.assessedOn}. ${markdown(catalog.assessment)}`, '', `Query: ${markdown(JSON.stringify(query))}`, '', row(['Project','Purpose','Limit','Assessed source']), row(['---','---','---','---']), ...report.projects.map(p => row([p.id,p.summary,p.boundary,p.source.url])), '', `${report.total} catalog matches. No project was executed.`, ''].join('\n');
  }
  throw new Error('Export format must be json, csv or markdown');
}
export function writeNewOutput(path, content) {
  const bytes = Buffer.byteLength(content, 'utf8');
  if (bytes > 4 * 1024 * 1024) throw new Error('Output exceeds 4 MiB limit');
  writeFileSync(path, content, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
  return { bytes };
}
