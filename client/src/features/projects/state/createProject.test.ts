import { expect, it } from 'vitest';
import { validateProject } from '../editor/validation';
import projectReducer, { projectActions } from './slice';

it('opens an editable blank project with only the required name validation error', () => {
  const initial = projectReducer(undefined, { type: 'init' });
  const creating = projectReducer(initial, projectActions.startCreate({ readOnlySession: false }));

  expect(creating.view).toBe('editor');
  expect(creating.editor.showValidationErrors).toBe(false);
  expect(creating.editor.draft).toEqual({
    isNew: true,
    hasChanged: true,
    isReadOnly: false,
    name: '',
    roughIdea: '',
    primaryUser: '',
    coreJob: '',
    mainProblem: '',
    mvpOutcome: '',
    initialProductAreas: '',
    constraints: '',
    validation: {
      ok: false,
      canSaveDraft: false,
      name: 'Enter a project name.',
      roughIdea: undefined,
      primaryUser: undefined,
      coreJob: undefined,
      mainProblem: undefined,
      mvpOutcome: undefined,
      initialProductAreas: undefined,
      constraints: undefined,
    },
  });
  expect(initial.view).toBe('dashboard');
  expect(initial.editor.draft).toBeUndefined();
});

it('validates a new project with a name and blank descriptive fields', () => {
  const creating = projectReducer(undefined, projectActions.startCreate({ readOnlySession: false }));
  const draft = creating.editor.draft;
  expect(draft).toBeDefined();

  expect(validateProject({ ...draft!, name: 'New project' })).toMatchObject({
    ok: true,
    canSaveDraft: true,
    name: undefined,
  });
});

it('clears a cancelled new project and opens a fresh blank draft', () => {
  const creating = projectReducer(undefined, projectActions.startCreate({ readOnlySession: false }));
  const showingErrors = projectReducer(creating, projectActions.setShowValidationErrors(true));
  const cancelled = projectReducer(showingErrors, projectActions.cancelCurrentEdits({ readOnlySession: false }));
  const reopened = projectReducer(cancelled, projectActions.startCreate({ readOnlySession: false }));

  expect(cancelled.view).toBe('dashboard');
  expect(cancelled.editor.draft).toBeUndefined();
  expect(reopened.view).toBe('editor');
  expect(reopened.editor.showValidationErrors).toBe(false);
  expect(reopened.editor.draft).toEqual(creating.editor.draft);
  expect(reopened.editor.draft).not.toBe(creating.editor.draft);
  expect(reopened.editor.draft?.validation).not.toBe(creating.editor.draft?.validation);
  expect(showingErrors.editor.showValidationErrors).toBe(true);
});

it.each([
  { field: 'name', limit: 200 },
  { field: 'roughIdea', limit: 10000 },
  { field: 'primaryUser', limit: 4000 },
  { field: 'coreJob', limit: 4000 },
  { field: 'mainProblem', limit: 4000 },
  { field: 'mvpOutcome', limit: 4000 },
  { field: 'initialProductAreas', limit: 4000 },
  { field: 'constraints', limit: 10000 },
] as const)('retains NUL rejection and the $limit code point limit for $field', ({ field, limit }) => {
  const creating = projectReducer(undefined, projectActions.startCreate({ readOnlySession: false }));
  const draft = creating.editor.draft;
  expect(draft).toBeDefined();
  const namedDraft = { ...draft!, name: 'New project' };

  expect(validateProject({ ...namedDraft, [field]: '\0' })[field]).toBe('Remove the NUL character.');
  expect(validateProject({ ...namedDraft, [field]: '😀'.repeat(limit) }).ok).toBe(true);
  expect(validateProject({ ...namedDraft, [field]: '😀'.repeat(limit + 1) })[field]).toBe(
    `Use ${limit} characters or fewer.`,
  );
});
