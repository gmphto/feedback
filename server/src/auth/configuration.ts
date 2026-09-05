export type AuthEnvironment = Partial<Record<
  'AUTH0_ISSUER_BASE_URL' | 'AUTH0_CLIENT_ID' | 'AUTH0_CLIENT_SECRET' |
  'APP_ORIGIN' | 'AUTH_ALLOW_LOCAL_HTTP' | 'NODE_ENV', string>>;

export type AuthConfiguration = {
  issuer: string;
  clientId: string;
  clientSecret: string;
  applicationOrigin: string;
  callbackUrl: string;
  secureCookies: boolean;
};

type ConfigurationResult = { available: true; configuration: AuthConfiguration }
  | { available: false; error: 'authentication_unavailable' };

function originUrl(value: string | undefined): URL {
  if (!value || !/^https?:\/\/(?:\[[\da-f:]+\]|[a-z\d.-]+)(?::\d+)?\/?$/i.test(value)) throw new Error();
  const url = new URL(value);
  if (!url.hostname || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error();
  return url;
}

export function readAuthConfiguration(environment: AuthEnvironment): ConfigurationResult {
  try {
    const flag = environment.AUTH_ALLOW_LOCAL_HTTP;
    if (flag !== undefined && flag !== 'false' && flag !== 'true') throw new Error();
    const allowHttp = flag === 'true';
    if (allowHttp && environment.NODE_ENV !== 'development' && environment.NODE_ENV !== 'test') throw new Error();
    const issuer = originUrl(environment.AUTH0_ISSUER_BASE_URL);
    if (issuer.protocol !== 'https:') throw new Error();
    const origin = originUrl(environment.APP_ORIGIN);
    const localHttp = allowHttp && origin.protocol === 'http:'
      && /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?\/?$/.test(environment.APP_ORIGIN!);
    if (origin.protocol !== 'https:' && !localHttp) throw new Error();
    const clientId = environment.AUTH0_CLIENT_ID;
    const clientSecret = environment.AUTH0_CLIENT_SECRET;
    if (!clientId?.trim() || !clientSecret?.trim()) throw new Error();
    return { available: true, configuration: {
      issuer: `${issuer.origin}/`, clientId, clientSecret,
      applicationOrigin: origin.origin, callbackUrl: `${origin.origin}/auth/callback`,
      secureCookies: origin.protocol === 'https:',
    } };
  } catch { return { available: false, error: 'authentication_unavailable' }; }
}
