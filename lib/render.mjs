import { ordered, markdown, taskIndex } from './discover.mjs';

export function renderCatalog(catalog) {
  const date = catalog.assessedOn.split('-').reverse().join('-');
  const waves = Array.isArray(catalog.portfolioWavesCompleted) ? catalog.portfolioWavesCompleted.join(', ') : 'unset';
  const lines = [
    '<!--',
    '  Generated catalog guide. Edits here are overwritten by `node scripts/render.mjs --write`.',
    '  Encoding: UTF-8, LF, no BOM.',
    `  Catalog waves recorded: ${waves}.`,
    `-->`,
    '# Public project catalog', '',
    `Assessed ${date}. ${catalog.assessment}`, '',
    'Generated from [catalog.json](../catalog.json). For search, filters, comparison and task coverage, see the [discovery guide](DISCOVERY.md).', '',
    'Runtime labels list supported workflows or prerequisites, not interchangeable runtimes. Read each assessed README for versions and setup.', '',
    '## Data boundary labels', '',
    '- `local-after-setup`: documented core workflow runs locally; obtaining dependencies may need a network. Local files can still be sensitive.',
    '- `provider-dependent`: the selected assistant/model provider and enabled tools determine data handling.',
    '- `configuration-dependent`: different workflows or optional integrations have different boundaries.',
    '- `public-content`: the workflow reads or builds content intended for publication; publishing remains a separate action.', '',
    '## Browse projects', '', '| Project | Purpose | Runtime | Data boundary |', '| --- | --- | --- | --- |'];
  for (const p of ordered(catalog.projects)) lines.push(`| [${markdown(p.id)}](${p.repository})${p.fork ? ' (fork)' : ''} | ${markdown(p.summary)} | ${p.runtimes.join(', ')} | ${p.privacy} |`);
  lines.push('', '## Start with a task', '', '| Task | Projects |', '| --- | --- |');
  for (const item of taskIndex(catalog.projects)) lines.push(`| ${item.task} | ${item.projects.map(id => `[${markdown(id)}](https://github.com/EauDoon/${id})`).join(', ')} |`);
  lines.push('', '## Limits and assessed instructions', '');
  for (const p of ordered(catalog.projects)) lines.push(`### ${p.id}`, '', p.boundary, '', `Category: ${p.category}. [Assessed README](${p.source.url}) at ${p.source.revision}. [Current README](${p.repository}/blob/main/README.md).`, '');
  return lines.join('\n');
}
