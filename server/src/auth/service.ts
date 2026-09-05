import type { AuthConfiguration } from './configuration.js';
import type { OidcProvider } from './oidc.js';
import { opaqueIdentifier, type createAuthRepository } from './repository.js';

export type AuthDependencies = {
  configuration: AuthConfiguration;
  repository: ReturnType<typeof createAuthRepository>;
  provider: OidcProvider;
};

export async function beginLogin(auth: AuthDependencies, returnPath: string) {
  const browser = opaqueIdentifier();
  const nonce = opaqueIdentifier();
  const verifier = opaqueIdentifier();
  const transaction = { nonce, verifier, returnPath };
  const { state, expiresAt } = await auth.repository.startLogin(browser, nonce, verifier, returnPath);
  const url = await auth.provider.authorizationUrl(state, transaction);
  return { browser, expiresAt, url };
}

export async function finishLogin(auth: AuthDependencies, url: URL, browser: unknown) {
  const state = url.searchParams.get('state');
  const transaction = await auth.repository.consumeLogin(state, browser);
  if (!transaction || !state) return undefined;
  // Consume before verification, including cancellation/failure: retries require
  // a new browser-bound transaction and concurrent replay cannot mint sessions.
  const identity = await auth.provider.verifyCallback(url, state, transaction);
  const session = await auth.repository.createSession(identity);
  return { ...session, returnPath: transaction.returnPath };
}
