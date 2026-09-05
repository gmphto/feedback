import { sql } from 'kysely';
import type { createDatabase } from '../db/database.js';
import { projectName, type ProjectListOptions } from './policy.js';

export type ProjectActor = { id: number };
export type Project = { id: number; name: string; version: number };
export type RenameResult = { outcome: 'saved' | 'conflict'; project: Project } | { outcome: 'not_found' };

// This is the complete production project persistence surface. The database is
// closure-owned; no unscoped lookup/update or arbitrary SQL callback is exposed.
export function createProjectModule(db: ReturnType<typeof createDatabase>) {
  return {
    async createProject(actor: ProjectActor, inputName: string): Promise<Project> {
      const name = projectName(inputName);
      if (!name) throw new Error('Invalid project name');
      const result = await sql<Project>`insert into projects (owner_id, name)
        values (${actor.id}, ${name}) returning id, name, version`.execute(db);
      return result.rows[0]!;
    },
    async readProject(actor: ProjectActor, id: number): Promise<Project | undefined> {
      return (await sql<Project>`select id, name, version from projects where id = ${id} and owner_id = ${actor.id}`.execute(db)).rows[0];
    },
    async listProjects(actor: ProjectActor, options: ProjectListOptions): Promise<Project[]> {
      return (await sql<Project>`select id, name, version from projects
        where owner_id = ${actor.id} and position(lower(${options.name}) in lower(name)) > 0
        order by name asc, id asc limit ${options.limit} offset ${options.offset}`.execute(db)).rows;
    },
    async renameProject(actor: ProjectActor, id: number, inputName: string, expectedVersion: number): Promise<RenameResult> {
      const name = projectName(inputName);
      if (!name) throw new Error('Invalid project name');
      return db.transaction().execute(async transaction => {
        // Lock only an owner-scoped row. Authorization, conflict representation
        // and conditional mutation stay in the same serialized transaction.
        const current = (await sql<Project>`select id, name, version from projects
          where id = ${id} and owner_id = ${actor.id} for update`.execute(transaction)).rows[0];
        if (!current) return { outcome: 'not_found' };
        if (current.version !== expectedVersion) return { outcome: 'conflict', project: current };
        const saved = (await sql<Project>`update projects set name = ${name}, version = version + 1
          where id = ${id} and owner_id = ${actor.id} and version = ${expectedVersion}
          returning id, name, version`.execute(transaction)).rows[0]!;
        return { outcome: 'saved', project: saved };
      });
    },
    async readFeatureArea(actor: ProjectActor, projectId: number, featureAreaId: number) {
      return (await sql<{ id: number; projectId: number }>`select a.id, a.project_id as "projectId"
        from feature_areas a join projects p on p.id = a.project_id
        where a.id = ${featureAreaId} and p.id = ${projectId} and p.owner_id = ${actor.id}`.execute(db)).rows[0];
    },
    async readFeature(actor: ProjectActor, projectId: number, featureAreaId: number, featureId: number) {
      return (await sql<{ id: number; featureAreaId: number }>`select f.id, f.feature_area_id as "featureAreaId"
        from features f join feature_areas a on a.id = f.feature_area_id join projects p on p.id = a.project_id
        where f.id = ${featureId} and a.id = ${featureAreaId} and p.id = ${projectId}
          and p.owner_id = ${actor.id}`.execute(db)).rows[0];
    },
  };
}
export type ProjectModule = ReturnType<typeof createProjectModule>;
