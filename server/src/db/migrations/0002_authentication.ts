import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`create table users (
    id integer generated always as identity primary key,
    issuer text not null,
    subject text not null,
    unique (issuer, subject)
  )`.execute(db);
  await sql`create table application_sessions (
    digest text primary key check (digest ~ '^[0-9a-f]{64}$'),
    user_id integer not null references users(id),
    expires_at timestamptz not null,
    revoked_at timestamptz
  )`.execute(db);
  await sql`create table login_transactions (
    state_digest text primary key check (state_digest ~ '^[0-9a-f]{64}$'),
    browser_digest text not null check (browser_digest ~ '^[0-9a-f]{64}$'),
    nonce text not null,
    verifier text not null,
    return_path text not null,
    expires_at timestamptz not null
  )`.execute(db);
}
