export const ordered = projects => [...projects].sort((a, b) => a.id.toLowerCase() < b.id.toLowerCase() ? -1 : 1);
export function search(projects, query = '') {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return ordered(projects.filter(p => {
    const text = [p.id, p.summary, p.category, ...p.tasks].join(' ').toLowerCase();
    return words.every(word => text.includes(word));
  }));
}
export function summarize(projects) {
  return projects.length ? projects.map(p => `${p.id}${p.fork ? ' (fork)' : ''}\n  ${p.summary}\n  ${p.repository}`).join('\n\n') : 'No projects match.';
}
