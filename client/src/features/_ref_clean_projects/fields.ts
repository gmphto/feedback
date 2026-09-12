/**
 * The reference contract for the create-project form.
 *
 * These eight fields are the client mirror of `server/src/projects/creation.ts`
 * (`contextLimits` plus the trimmed `name`). Keep the keys, labels, limits and
 * requiredness in sync with the server, because the server is the authority for
 * what is accepted. Field metadata lives here so editors, validators and
 * API converters all read from one place.
 */

export const projectFields = {
  name: { label: 'Project name', limit: 200, required: true },
  roughIdea: { label: 'Rough idea / notes', limit: 10000, required: false },
  primaryUser: { label: 'Primary user', limit: 4000, required: false },
  coreJob: { label: 'Core job', limit: 4000, required: false },
  mainProblem: { label: 'Main user problem', limit: 4000, required: false },
  mvpOutcome: { label: 'Desired MVP outcome', limit: 4000, required: false },
  initialProductAreas: { label: 'Initial product areas', limit: 4000, required: false },
  constraints: { label: 'Known constraints', limit: 10000, required: false },
} as const;

export type ProjectField = keyof typeof projectFields;

/** The values a user can enter for a project. Never includes id/version. */
export type ProjectDraft = Record<ProjectField, string>;

/** Field-level errors keyed by field name, plus one optional form-level error. */
export type FieldErrors = Partial<Record<ProjectField | '_form', string>>;

export const fieldKeys = Object.keys(projectFields) as ProjectField[];

export function emptyDraft(): ProjectDraft {
  return {
    name: '',
    roughIdea: '',
    primaryUser: '',
    coreJob: '',
    mainProblem: '',
    mvpOutcome: '',
    initialProductAreas: '',
    constraints: '',
  };
}

/**
 * Client-side validation. Mirrors `validateProjectInput` on the server so the
 * user gets the same messages without a round-trip; the server re-validates and
 * its `fields` payload still wins on 400.
 *
 * Lengths are counted by Unicode code points (like the server), so astral
 * characters such as emoji count as one.
 *
 * @returns a field error for every violation; a valid draft returns {}.
 */
export function validateDraft(draft: ProjectDraft): FieldErrors {
  const errors: FieldErrors = {};

  for (const key of fieldKeys) {
    const value = key === 'name' ? draft[key].trim() : draft[key];

    if (key === 'name' && !value) {
      errors[key] = 'Enter a project name.';
    } else if (value.includes('\0')) {
      errors[key] = 'Remove the NUL character.';
    } else if ([...value].length > projectFields[key].limit) {
      errors[key] = `Use ${projectFields[key].limit} characters or fewer.`;
    }
  }

  return errors;
}