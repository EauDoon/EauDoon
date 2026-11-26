// Parse the installed CLI's ES modules without evaluating their code.
import { readFileSync, writeFileSync } from 'node:fs';
import { posix } from 'node:path';
import { SourceTextModule } from 'node:vm';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8').replaceAll('\r\n', '\n');
const entry = 'cli.mjs';

function architecture() {
  const modules = [];
  const paths = new Map([[entry, [entry]]]);
  // Map iteration visits appended entries breadth-first. First discovery is a shortest route.
  for (const [id, entryPath] of paths) {
    const source = new SourceTextModule(read(id), { identifier: id });
    const specs = source.moduleRequests?.map(request => request.specifier) ?? source.dependencySpecifiers;
    const imports = [...new Set(specs.filter(name => name.startsWith('.')).map(name => posix.join(posix.dirname(id), name)))].sort();
    const external = [...new Set(specs.filter(name => !name.startsWith('.')))].sort();
    for (const next of imports) {
      if (next.startsWith('../') || !next.endsWith('.mjs')) throw new Error('Unexpected local module: ' + next);
      if (!paths.has(next)) paths.set(next, [...entryPath, next]);
    }
    modules.push({ id, imports, external, entryPath });
  }
  for (const module of modules) {
    module.importedBy = modules.filter(other => other.imports.includes(module.id)).map(other => other.id).sort();
  }
  return { name: 'EauDoon/EauDoon', entry, modules };
}

// Follow one direction breadth-first so cycles terminate and paths contain the fewest edges.
function routes(repo, origin, direction) {
  const modules = new Map(repo.modules.map(m => [m.id, m]));
  const found = new Map([[origin, [origin]]]);
  for (const [id, route] of found) {
    for (const next of modules.get(id)[direction]) {
      if (!found.has(next)) found.set(next, [...route, next]);
    }
  }
  return found;
}

function query(repo, mode, args) {
  const module = id => {
    const found = repo.modules.find(row => row.id === id);
    if (!found) throw new Error('Unknown module. Run with --json to list the installed CLI modules.');
    return found;
  };
  const identity = { name: repo.name, entry: repo.entry };
  if (mode === '--json') return args.length ? { ...identity, module: module(args[0]) } : repo;
  if (mode === '--external') {
    const external = [...new Set(repo.modules.flatMap(m => m.external))].sort().map(specifier => ({
      specifier, importedBy: repo.modules.filter(m => m.external.includes(specifier)).map(m => m.id).sort(),
    }));
    return { ...identity, external };
  }
  const from = module(args[0]).id;
  if (mode === '--path') {
    const to = module(args[1]).id;
    return { ...identity, from, to, path: routes(repo, from, 'imports').get(to) ?? null };
  }
  const consumers = routes(repo, from, 'importedBy');
  consumers.delete(from);
  return { ...identity, changed: from, consumers: [...consumers].map(([id, route]) => ({
    id, distance: route.length - 1, importPath: [...route].reverse(),
  })) };
}

const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const sourceLink = path => 'https://github.com/EauDoon/EauDoon/blob/main/' + path.split('/').map(encodeURIComponent).join('/');
function render(repo) {
  const rows = repo.modules.map(({id, imports, importedBy, external}) =>
    '<tr><th scope="row"><a href="' + escape(sourceLink(id)) + '">' + escape(id) + '</a></th>' +
    [imports, importedBy, external].map(items => '<td>' + (items.map(escape).join('<br>') || '—') + '</td>').join('') + '</tr>'
  ).join('\n');
  const json = JSON.stringify({data: {repository: repo}}).replaceAll('<', '\\u003c');
  return read('scripts/source-map.template.html')
    .replace('<!-- TABLE -->', () => rows)
    .replace('<!-- DATA -->', () => json);
}
try {
  const [mode, ...args] = process.argv.slice(2);
  const arity = new Map([['--json', [0, 1]], ['--impact', [1]], ['--path', [2]], ['--external', [0]], ['--check', [0]], ['--write', [0]]]);
  if (!arity.get(mode)?.includes(args.length)) {
    throw new Error('Usage: npm run graph -- --check | --write | --json [MODULE] | --impact MODULE | --path FROM TO | --external');
  }
  const repo = architecture();
  if (mode !== '--write' && mode !== '--check') {
    const repository = query(repo, mode, args);
    console.log(JSON.stringify({data: {repository}}, null, 2));
  } else {
    const path = 'docs/source-map.html';
    const html = render(repo);
    if (mode === '--write') writeFileSync(new URL(path, root), html);
    else if (read(path) !== html) throw new Error('Source map is stale. Run npm run graph -- --write.');
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
