import { expect, it } from 'vitest';
import { emptyDraft } from '../fields';
import { projectsReducer, startCreate, startEdit, stopEdit } from './reducer';

it('owns create, edit, and stop transitions without changing the input state or project', () => {
  const initial = projectsReducer(undefined, { type: 'init' });
  const project = { ...emptyDraft(), id: 7, version: 2, name: 'Saved project' };
  const editing = projectsReducer(initial, startEdit(project));
  expect(editing.view).toBe('editor');
  expect(editing.editor).toEqual({
    activeKey: 7, original: project, draft: { ...emptyDraft(), name: 'Saved project' },
  });
  expect(editing.editor.original).not.toBe(project);
  expect(editing.editor.draft).not.toBe(editing.editor.original);
  expect(initial.view).toBe('dashboard');
  expect(initial.editor.draft).toBeUndefined();
  expect(editing.dashboard).toBe(initial.dashboard);

  const creating = projectsReducer(editing, startCreate());
  expect(creating.view).toBe('editor');
  expect(creating.editor).toEqual({ activeKey: undefined, original: undefined, draft: emptyDraft() });
  expect(editing.editor.draft?.name).toBe('Saved project');
  expect(project.name).toBe('Saved project');
  expect(project.version).toBe(2);

  expect(projectsReducer(creating, stopEdit())).toEqual(initial);
  expect(projectsReducer(editing, stopEdit())).toEqual(initial);
  expect(projectsReducer(initial, stopEdit())).toEqual(initial);
});
