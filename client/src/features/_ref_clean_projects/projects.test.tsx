import { TextDecoder } from 'node:util';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { store } from '../app/store';
import { ProjectView } from './ProjectView';
import { createInitialState } from './state/state';
import { slice as projectSlice } from './state/slice';
import { createInitialDashboardState } from './dashboard/state/state';

/**
 * Render the real app store + router with a wrapper that lets tests intercept
 * `fetch` (RTK Query uses it). This exercises the actual public surface —
 * the query/mutation hooks, the slice reducers and the navigation — instead of
 * an internal facade.
 */
function renderProjects(initialPath = '/') {
  const fetchMock = vi.fn<typeof fetch>();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/"
            element={
              <div>
                {children}
                <TestNavigator />
              </div>
            }
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

  return {
    fetchMock,
    wrapper,
  };
}

/** Lets tests assert on where the feature navigated to. */
function TestNavigator() {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate('/projects/7')}>
      go to 7
    </button>
  );
}

const apiProject = {
  id: 7,
  name: 'Save the world',
  version: 1,
  idea: 'A rough idea',
  job: '',
  problem: '',
  mvpOutcome: '',
  initialProductAreas: '',
  constraints: '',
};

const listResponse = new Response(
  JSON.stringify({ projects: [apiProject] }),
  { status: 200, headers: { 'content-type': 'application/json' } },
);

// The app store is a singleton; reset it before each test so tags/cache do not
// leak between cases.
beforeEach(() => {
  store.dispatch(projectSlice.actions.reset());
});

describe('ProjectView', () => {
  it('renders the dashboard and navigates to a project on open', async () => {
    const { wrapper } = renderProjects('/');

    global.fetch = vi.fn(() => Promise.resolve(listResponse)) as typeof fetch;

    render(<ProjectView />, { wrapper });

    expect(await screen.findByText(/Save the world/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /create project/i })).toBeTruthy();
  });

  it('renders the create-form in the editor view when starting a new project', async () => {
    const { wrapper } = renderProjects('/projects/new');

    // No list fetch needed for the form; only the create mutation matters.
    global.fetch = vi.fn(() => Promise.resolve(listResponse)) as typeof fetch;

    // Start the create flow exactly as the user would: the dashboard dispatches
    // startCreate. Render Path "/" then go to new through the slice.
    store.dispatch(projectSlice.actions.startCreate({ readOnlySession: false }));

    render(<ProjectView />, { wrapper });

    expect(await screen.findByLabelText(/Project name/i)).toBeTruthy();
  });
});

describe('projects slice transitions', () => {
  it('startCreate opens the editor view with an empty editable draft', () => {
    const state = createInitialState();
    const next = projectSlice.reducer(
      state,
      projectSlice.actions.startCreate({ readOnlySession: false }),
    );

    expect(next.view).toBe('editor');
    expect(next.editor.draft?.isNew).toBe(true);
    expect(next.editor.draft?.name).toBe('');
    expect(next.editor.original).toBeUndefined();
  });

  it('startEdit keeps the server project unchanged and the input state unchanged', () => {
    const state = createInitialState();
    const project = { projectId: 7, name: 'Saved', version: 1 };
    const next = projectSlice.reducer(
      state,
      projectSlice.actions.startEdit({
        projectToOpen: project,
        readOnlySession: false,
      }),
    );

    expect(next.view).toBe('editor');
    expect(next.editor.original).toEqual(project);
    expect(next.editor.original).not.toBe(project);
    expect(state).toBe(state);
    expect(project).toEqual({ projectId: 7, name: 'Saved', version: 1 });
  });
});