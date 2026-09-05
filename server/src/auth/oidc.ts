import * as oidc from 'openid-client';
import type { AuthConfiguration } from './configuration.js';
import type { LoginTransaction, VerifiedIdentity } from './repository.js';

export type OidcProvider = {
  authorizationUrl(state: string, transaction: LoginTransaction): Promise<string>;
  verifyCallback(url: URL, state: string, transaction: LoginTransaction): Promise<VerifiedIdentity>;
};

// Tests inject discovery transport, while exercising this same exchange and
// signature/claims validation. Production never enables insecure requests.
export function createOidcProvider(config: AuthConfiguration, discover = () => oidc.discovery(
  new URL(config.issuer), config.clientId, { client_secret: config.clientSecret, id_token_signed_response_alg: 'RS256' },
  oidc.ClientSecretPost(config.clientSecret), { execute: [oidc.enableNonRepudiationChecks], timeout: 5 },
)): OidcProvider {
  let pending: Promise<oidc.Configuration> | undefined;
  function configuration() {
    pending ??= discover().catch(error => { pending = undefined; throw error; });
    return pending;
  }
  return {
    async authorizationUrl(state, transaction) {
      return oidc.buildAuthorizationUrl(await configuration(), {
        redirect_uri: config.callbackUrl, scope: 'openid', response_type: 'code',
        code_challenge: await oidc.calculatePKCECodeChallenge(transaction.verifier),
        code_challenge_method: 'S256', state, nonce: transaction.nonce,
      }).href;
    },
    async verifyCallback(url, state, transaction) {
      const tokens = await oidc.authorizationCodeGrant(await configuration(), url, {
        pkceCodeVerifier: transaction.verifier, expectedState: state,
        expectedNonce: transaction.nonce, idTokenExpected: true,
      });
      const claims = tokens.claims();
      if (!claims || claims.iss !== config.issuer || !claims.sub) throw new Error('Invalid identity');
      return { issuer: claims.iss, subject: claims.sub };
    },
  };
}
