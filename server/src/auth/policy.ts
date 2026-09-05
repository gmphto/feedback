export const SESSION_LIFETIME_MS = 8 * 60 * 60 * 1_000;
export const LOGIN_LIFETIME_MS = 10 * 60 * 1_000;

export function safeReturnPath(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')
    || /[\\\u0000-\u0020\u007f]/.test(value)) return '/';
  try {
    // Reject encoded redirect separators too; downstream paths must not reinterpret them.
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith('//') || /[\\\u0000-\u0020\u007f]/.test(decoded)) return '/';
    const base = 'https://application.invalid';
    const url = new URL(value, base);
    return url.origin === base ? `${url.pathname}${url.search}${url.hash}` : '/';
  } catch { return '/'; }
}

export function allowsBrowserMutation(origin: unknown, applicationOrigin: string): boolean {
  return typeof origin === 'string' && origin === applicationOrigin;
}
