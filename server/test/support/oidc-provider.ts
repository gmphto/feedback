import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import { createServer } from 'node:http';
import { once } from 'node:events';
import * as oidc from 'openid-client';
import { createOidcProvider } from '../../src/auth/oidc.js';
import type { AuthConfiguration } from '../../src/auth/configuration.js';

export type ProviderMode = 'valid' | 'cancel' | 'failure' | 'signature' | 'issuer' | 'audience' | 'expiry' | 'nonce' | 'future' | 'missing-token';

export async function fakeProvider(t: { after(cleanup: () => void | Promise<void>): void }, secureCookies = false) {
  const keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const wrongKey = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey;
  const jwk = { ...keys.publicKey.export({ format: 'jwk' }), kid: 'fixture', use: 'sig', alg: 'RS256' };
  const codes = new Map<string, URLSearchParams>();
  const fixture = { mode: 'valid' as ProviderMode, exchanges: 0, verifiedPkce: 0, issuer: '' };
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url!, fixture.issuer);
      response.setHeader('content-type', 'application/json');
      if (url.pathname === '/.well-known/openid-configuration') {
        response.end(JSON.stringify({ issuer: fixture.issuer, authorization_endpoint: `${fixture.issuer}authorize`, token_endpoint: `${fixture.issuer}token`, jwks_uri: `${fixture.issuer}jwks`, response_types_supported: ['code'], subject_types_supported: ['public'], id_token_signing_alg_values_supported: ['RS256'], code_challenge_methods_supported: ['S256'], token_endpoint_auth_methods_supported: ['client_secret_post'] }));
      } else if (url.pathname === '/jwks') response.end(JSON.stringify({ keys: [jwk] }));
      else if (url.pathname === '/authorize') {
        const callback = new URL(url.searchParams.get('redirect_uri')!);
        callback.searchParams.set('state', url.searchParams.get('state')!);
        if (fixture.mode === 'cancel') {
          callback.searchParams.set('error', 'access_denied');
          callback.searchParams.set('error_description', 'private-provider-description');
        } else {
          const code = `code-${codes.size}-${fixture.exchanges}`;
          codes.set(code, url.searchParams);
          callback.searchParams.set('code', code);
        }
        response.writeHead(302, { location: callback.href }); response.end();
      } else if (url.pathname === '/token') {
        fixture.exchanges++;
        let body = '';
        for await (const chunk of request) body += chunk;
        const input = new URLSearchParams(body);
        const authorization = codes.get(input.get('code')!);
        codes.delete(input.get('code')!);
        const challenge = createHash('sha256').update(input.get('code_verifier') ?? '').digest('base64url');
        if (fixture.mode === 'failure' || !authorization || input.get('client_id') !== 'fixture-client'
          || input.get('client_secret') !== 'fixture-secret' || input.get('grant_type') !== 'authorization_code'
          || authorization.get('code_challenge_method') !== 'S256' || challenge !== authorization.get('code_challenge')
          || input.get('redirect_uri') !== authorization.get('redirect_uri')) {
          response.writeHead(400); response.end(JSON.stringify({ error: 'invalid_grant', error_description: 'private-provider-failure' })); return;
        }
        fixture.verifiedPkce++;
        const now = Math.floor(Date.now() / 1000);
        const claims = { iss: fixture.mode === 'issuer' ? 'https://wrong.example/' : fixture.issuer,
          sub: 'alice', aud: fixture.mode === 'audience' ? 'wrong-client' : 'fixture-client',
          iat: fixture.mode === 'future' ? now + 3600 : now,
          exp: fixture.mode === 'expiry' ? now - 3600 : now + 300,
          nbf: fixture.mode === 'future' ? now + 3600 : now - 1,
          nonce: fixture.mode === 'nonce' ? 'wrong-nonce' : authorization.get('nonce') };
        const signingInput = `${Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'fixture' })).toString('base64url')}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}`;
        const token = `${signingInput}.${sign('RSA-SHA256', Buffer.from(signingInput), fixture.mode === 'signature' ? wrongKey : keys.privateKey).toString('base64url')}`;
        response.end(JSON.stringify({ access_token: 'private-access-token', token_type: 'Bearer', expires_in: 300,
          ...(fixture.mode === 'missing-token' ? {} : { id_token: token }) }));
      } else { response.writeHead(404); response.end('{}'); }
    } catch { response.writeHead(500); response.end('{}'); }
  });
  t.after(async () => { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing fake provider port');
  fixture.issuer = `http://127.0.0.1:${address.port}/`;
  const config: AuthConfiguration = { issuer: fixture.issuer, clientId: 'fixture-client', clientSecret: 'fixture-secret',
    applicationOrigin: secureCookies ? 'https://app.example' : 'http://127.0.0.1:5173',
    callbackUrl: secureCookies ? 'https://app.example/auth/callback' : 'http://127.0.0.1:5173/auth/callback', secureCookies };
  const provider = createOidcProvider(config, () => oidc.discovery(new URL(config.issuer), config.clientId,
    { client_secret: config.clientSecret, id_token_signed_response_alg: 'RS256' }, oidc.ClientSecretPost(config.clientSecret),
    { execute: [oidc.allowInsecureRequests, oidc.enableNonRepudiationChecks], timeout: 2 }));
  return { fixture, config, provider };
}
