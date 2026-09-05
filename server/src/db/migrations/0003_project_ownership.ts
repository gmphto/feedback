import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`create table projects (
    id integer generated always as identity primary key,
    owner_id integer not null references users(id),
    name text not null check (char_length(name) <= 200 and name !~ '^[[:space:]]*$'),
    version integer not null default 1 check (version > 0)
  )`.execute(db);
  await sql`create index projects_owner_name_id on projects (owner_id, name, id)`.execute(db);
  await sql`create table feature_areas (
    id integer generated always as identity primary key,
    project_id integer not null references projects(id)
  )`.execute(db);
  await sql`create index feature_areas_project_id on feature_areas (project_id)`.execute(db);
  await sql`create table features (
    id integer generated always as identity primary key,
    feature_area_id integer not null references feature_areas(id)
  )`.execute(db);
  await sql`create index features_feature_area_id on features (feature_area_id)`.execute(db);
}
