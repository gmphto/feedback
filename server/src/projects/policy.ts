const MAX_INTEGER = 2_147_483_647;
export function pathIdentifier(value: unknown): number | undefined {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return undefined;
  const number = Number(value);
  return Number.isInteger(number) && number <= MAX_INTEGER ? number : undefined;
}
export function validateProjectName(value: unknown): { valid: true; name: string } | { valid: false; message: string } {
  if (typeof value !== 'string') return { valid: false, message: 'Enter plain text.' };
  const name = value.trim();
  if (!name) return { valid: false, message: 'Enter a project name.' };
  if (name.includes('\0')) return { valid: false, message: 'Remove the NUL character.' };
  if ([...name].length > 200) return { valid: false, message: 'Use 200 characters or fewer.' };
  return { valid: true, name };
}
export function expectedVersion(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= MAX_INTEGER ? value : undefined;
}
export type ProjectListOptions = { name: string; limit: number; offset: number };
export function projectListOptions(value: Record<string, unknown>): ProjectListOptions | undefined {
  if (Object.keys(value).some(key => !['name', 'limit', 'offset'].includes(key))) return undefined;
  const name = value.name ?? '';
  if (typeof name !== 'string' || [...name].length > 200) return undefined;
  const limit = value.limit === undefined ? 50 : pathIdentifier(value.limit);
  const offset = value.offset === undefined ? 0 : typeof value.offset === 'string' && /^(0|[1-9]\d*)$/.test(value.offset)
    && Number.isSafeInteger(Number(value.offset)) ? Number(value.offset) : undefined;
  if (limit === undefined || limit > 100 || offset === undefined) return undefined;
  return { name, limit, offset };
}
