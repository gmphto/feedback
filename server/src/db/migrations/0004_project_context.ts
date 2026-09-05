import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`alter table projects
    add column rough_idea text not null default '' check (char_length(rough_idea) <= 10000),
    add column primary_user text not null default '' check (char_length(primary_user) <= 4000),
    add column core_job text not null default '' check (char_length(core_job) <= 4000),
    add column main_problem text not null default '' check (char_length(main_problem) <= 4000),
    add column mvp_outcome text not null default '' check (char_length(mvp_outcome) <= 4000),
    add column initial_product_areas text not null default '' check (char_length(initial_product_areas) <= 4000),
    add column constraints text not null default '' check (char_length(constraints) <= 10000)`.execute(db);
}
