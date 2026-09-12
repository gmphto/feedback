import type { ProjectDraft } from '../fields';
import type { Project } from '../types/project';
import type { ApiProject } from './types';

/**
 * Server <-> client converters. The server owns the wire shape; the client
 * view model lives in `types/project.ts` and `fields.ts`. Nothing else in the
 * client may build an `ApiProject` by hand.
 *
 * Wire shapes are deliberately NOT imported from the server: the client owns
 * its copy of the contract so it can evolve independently.
 */

/** server ---> client */
export function setupProject(project: ApiProject): Project {
  return {
    projectId: project.id,
    name: project.name,
    idea: project.idea,
    job: project.job,
    problem: project.problem,
    mvpOutcome: project.mvpOutcome,
    initialProductAreas: project.initialProductAreas,
    constraints: project.constraints,
    version: project.version,
  };
}

export function setupProjects(projects: ApiProject[]): Project[] {
  return (projects ?? []).map(setupProject);
}

/** client ---> server */
export function convertProjectToApi(draft: ProjectDraft): ApiProject {
  // The client draft already has defaults for every field, so it is safe to
  // send the whole draft; the server re-validates and strips nothing.
  return {
    id: 0,
    version: 1,
    name: draft.name,
    idea: draft.roughIdea,
    job: draft.coreJob,
    problem: draft.mainProblem,
    mvpOutcome: draft.mvpOutcome,
    initialProductAreas: draft.initialProductAreas,
    constraints: draft.constraints,
  };
}