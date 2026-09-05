import { createHash, randomBytes } from 'node:crypto';
import { sql } from 'kysely';
import type { createDatabase } from '../db/database.js';
import { LOGIN_LIFETIME_MS, SESSION_LIFETIME_MS, safeReturnPath } from './policy.js';

type Database = ReturnType<typeof createDatabase>;
export type VerifiedIdentity = { issuer: string; subject: string };
export type LoginTransaction = { nonce: string; verifier: string; returnPath: string };

export function opaqueIdentifier(): string { return randomBytes(32).toString('base64url'); }
export function identifierDigest(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
export function validIdentifier(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value);
}

// This boundary accepts identities only after the OIDC adapter has verified tokens.
// Callers must wait for its committed result before issuing a browser cookie.
export function createAuthRepository(db: Database, clock: () => Date = () => new Date()) {
  return {
    async startLogin(browser: string, nonce: string, verifier: string, returnPath: string) {
      const state = opaqueIdentifier();
      const expiresAt = new Date(clock().getTime() + LOGIN_LIFETIME_MS);
      await sql`insert into login_transactions (state_digest, browser_digest, nonce, verifier, return_path, expires_at)
        values (${identifierDigest(state)}, ${identifierDigest(browser)}, ${nonce}, ${verifier}, ${safeReturnPath(returnPath)}, ${expiresAt})`.execute(db);
      return { state, expiresAt };
    },
    async consumeLogin(state: unknown, browser: unknown): Promise<LoginTransaction | undefined> {
      if (!validIdentifier(state) || !validIdentifier(browser)) return undefined;
      // DELETE RETURNING arbitrates simultaneous callbacks across processes.
      const result = await sql<LoginTransaction>`delete from login_transactions
        where state_digest = ${identifierDigest(state)} and browser_digest = ${identifierDigest(browser)}
          and expires_at > ${clock()}
        returning nonce, verifier, return_path as "returnPath"`.execute(db);
      return result.rows[0];
    },
    async createSession(identity: VerifiedIdentity) {
      const identifier = opaqueIdentifier();
      const expiresAt = new Date(clock().getTime() + SESSION_LIFETIME_MS);
      const user = await db.transaction().execute(async transaction => {
        const result = await sql<{ id: number }>`insert into users (issuer, subject)
          values (${identity.issuer}, ${identity.subject})
          on conflict (issuer, subject) do update set subject = excluded.subject returning id`.execute(transaction);
        const user = result.rows[0]!;
        await sql`insert into application_sessions (digest, user_id, expires_at)
          values (${identifierDigest(identifier)}, ${user.id}, ${expiresAt})`.execute(transaction);
        return user;
      });
      return { identifier, expiresAt, user };
    },
    async findSession(identifier: unknown): Promise<{ id: number } | undefined> {
      if (!validIdentifier(identifier)) return undefined;
      const result = await sql<{ id: number }>`select user_id as id from application_sessions
        where digest = ${identifierDigest(identifier)} and revoked_at is null and expires_at > ${clock()}`.execute(db);
      return result.rows[0];
    },
    async revokeSession(identifier: unknown): Promise<void> {
      if (!validIdentifier(identifier)) return;
      await sql`update application_sessions set revoked_at = ${clock()}
        where digest = ${identifierDigest(identifier)} and revoked_at is null`.execute(db);
    },
  };
}
