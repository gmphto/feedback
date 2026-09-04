export const DATABASE_TIMEOUT_MS = 3_000;

export type DatabaseConfiguration =
  | { valid: true; connectionString: string }
  | { valid: false; message: string };

export function readDatabaseConfiguration(
  value: string | undefined,
  variable = 'DATABASE_URL',
): DatabaseConfiguration {
  if (!value?.trim()) {
    return { valid: false, message: `${variable} is required; supply a PostgreSQL connection URL.` };
  }
  try {
    const url = new URL(value);
    for (const component of [url.username, url.password, url.pathname]) decodeURIComponent(component);
    if (!['postgres:', 'postgresql:'].includes(url.protocol)
      || !url.hostname || url.pathname.length < 2
      || (url.port !== '' && (!/^\d+$/.test(url.port) || Number(url.port) < 1 || Number(url.port) > 65_535))) {
      throw new Error('invalid');
    }
    return { valid: true, connectionString: value };
  } catch {
    return { valid: false, message: `${variable} must be a valid PostgreSQL connection URL with a host and database name.` };
  }
}
