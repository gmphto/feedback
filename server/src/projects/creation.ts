export const contextLimits = { roughIdea: 10000, primaryUser: 4000, coreJob: 4000, mainProblem: 4000, mvpOutcome: 4000, initialProductAreas: 4000, constraints: 10000 } as const;
export type ProjectInput = { name: string } & Record<keyof typeof contextLimits, string>;
type FieldErrors = Record<string, string>;
export const creationSchema = { type: 'object', additionalProperties: false, required: ['name'], properties: {
  name: { type: 'string' }, ...Object.fromEntries(Object.keys(contextLimits).map(key => [key, { type: 'string' }])),
} };

export function validateProjectInput(value: unknown): { valid: true; input: ProjectInput } | { valid: false; fields: FieldErrors } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { valid: false, fields: { _form: 'Submit an object with the project fields.' } };
  const source = value as Record<string, unknown>;
  const fields: FieldErrors = {};
  if (Object.keys(source).some(key => key !== 'name' && !Object.hasOwn(contextLimits, key))) fields._form = 'Remove fields that are not part of this form.';
  const input: ProjectInput = { name: '', roughIdea: '', primaryUser: '', coreJob: '', mainProblem: '', mvpOutcome: '', initialProductAreas: '', constraints: '' };
  const name = validateProjectName(source.name);
  if (name.valid) input.name = name.name;
  else fields.name = name.message;

  for (const [key, limit] of Object.entries(contextLimits)) {
    const raw = source[key];
    if (raw === undefined) continue;
    if (typeof raw !== 'string') {
      fields[key] = 'Enter plain text.';
      continue;
    }
    if (raw.includes('\0')) fields[key] = 'Remove the NUL character.';
    else if ([...raw].length > limit) fields[key] = `Use ${limit} characters or fewer.`;
    else input[key as keyof typeof contextLimits] = raw;
  }
  return Object.keys(fields).length ? { valid: false, fields } : { valid: true, input };
}
import { validateProjectName } from './policy.js';
