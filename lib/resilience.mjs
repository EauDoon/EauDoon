import { coverageMatrix } from './review.mjs';

// A source-review aid, not a runtime failover or compatibility claim.
export function coverageResilience(catalog, query, request) {
  const matrix = coverageMatrix(catalog, query, request);
  const singleSourceTasks = matrix.rows.filter(row => row.coveredBy.length === 1);
  const removals = matrix.projects.map(project => {
    const newlyMissingTasks = singleSourceTasks
      .filter(row => row.coveredBy[0] === project.id).map(row => row.task);
    return {
      id: project.id,
      newlyMissingTasks,
      missingTasks: matrix.rows.filter(row => row.coveredBy.every(id => id === project.id)).map(row => row.task),
    };
  });
  return {
    ...matrix,
    singleSourceTasks,
    redundantTasks: matrix.rows.filter(row => row.coveredBy.length > 1),
    criticalProjects: removals.filter(row => row.newlyMissingTasks.length > 0).map(row => row.id),
    removals,
    note: 'Simulates removing one selected project at a time using declared task tags only. Existing gaps remain visible. Multiple tagged sources do not establish interchangeability, runtime failover, compatibility or execution authority.',
  };
}
