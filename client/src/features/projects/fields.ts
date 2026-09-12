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
export type ProjectDraft = Record<ProjectField, string>;
export type FieldErrors = Partial<Record<ProjectField | '_form', string>>;
export const fieldKeys = Object.keys(projectFields) as ProjectField[];
export function emptyDraft(): ProjectDraft {
  return { name: '', roughIdea: '', primaryUser: '', coreJob: '', mainProblem: '', mvpOutcome: '', initialProductAreas: '', constraints: '' };
}
export function validateDraft(draft: ProjectDraft): FieldErrors {
  const errors: FieldErrors = {};
  for (const key of fieldKeys) {
    const value = key === 'name' ? draft[key].trim() : draft[key];
    if (key === 'name' && !value) errors[key] = 'Enter a project name.';
    else if (value.includes('\0')) errors[key] = 'Remove the NUL character.';
    else if ([...value].length > projectFields[key].limit) errors[key] = `Use ${projectFields[key].limit} characters or fewer.`;
  }
  return errors;
}
