import type { Project } from '../../types/project';

/**
 * The server's summary representation. The server contract always returns an
 * integer `id` and a `version`, while the client `Project` keeps `projectId`
 * optional so an unsaved draft can be represented the same way.
 */
export interface ApiProject extends Project {
  id: number;
  version: number;
}