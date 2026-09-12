import { useEffect, useRef, useSyncExternalStore } from 'react';
import { fieldKeys, projectFields } from './fields';
import type { ProjectModel } from './model';

export function ProjectView({ model }: { model: ProjectModel }) {
  const state = useSyncExternalStore(
    model.store.subscribe,
    model.store.getState,
    model.store.getState,
  );
  const saved = useSyncExternalStore(
    model.saved.subscribe,
    model.saved.getState,
    model.saved.getState,
  );
  const hasErrors = Object.keys(state.fields).length > 0;
  const heading = useRef<HTMLHeadingElement>(null);
  const errors = useRef<HTMLDivElement>(null);

  useEffect(() => {
    heading.current?.focus();
  }, [state.route, state.status === 'saved']);

  useEffect(() => {
    if (hasErrors) errors.current?.focus();
  }, [hasErrors]);

  // DASHBOARD
  if (state.status === 'home') {
    return (
      <section className="mt-8">
        <h2
          id="page-heading"
          ref={heading}
          tabIndex={-1}
          className="mb-4 text-lg font-semibold"
        >
          Start a project
        </h2>
        <button onClick={() => model.open('/projects/new')}>Create project</button>
      </section>
    );
  }

  if (state.status === 'editing' || state.status === 'submitting') {
    return (
      <section className="mt-10">
        <h2
          id="page-heading"
          ref={heading}
          tabIndex={-1}
          className="text-lg font-semibold"
        >
          Create project
        </h2>
        <p className="mt-2 text-slate-600">
          Capture your starting context. This text will not create requirements or approved scope.
        </p>

{/* EDITOR */}
        <form
          noValidate
          onSubmit={event => {
            event.preventDefault();
            model.submit();
          }}
          className="mt-6 space-y-6"
        >
          {hasErrors && (
            <div
              ref={errors}
              tabIndex={-1}
              role="alert"
              className="rounded-lg border border-red-300 bg-red-50 p-4"
            >
              <p>{state.fields._form ?? 'Please correct the fields below.'}</p>
              <ul>
                {fieldKeys.filter(key => state.fields[key]).map(key => (
                  <li key={key}>
                    <a className="underline" href={`#field-${key}`}>
                      {projectFields[key].label}: {state.fields[key]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {fieldKeys.map(key => (
            <div key={key}>
              <label htmlFor={`field-${key}`} className="block font-medium">
                {projectFields[key].label}{' '}
                <span className="font-normal text-slate-600">
                  ({projectFields[key].required ? 'required' : 'optional'})
                </span>
              </label>
              <p id={`hint-${key}`} className="my-1 text-sm text-slate-600">
                {projectFields[key].limit.toLocaleString()} characters maximum ·{' '}
                {[...state.draft[key]].length.toLocaleString()} entered
              </p>

              {key === 'name' ? (
                <input
                  id={`field-${key}`}
                  value={state.draft[key]}
                  onChange={event => model.edit(key, event.target.value)}
                  disabled={state.status === 'submitting'}
                  required
                  aria-invalid={!!state.fields[key]}
                  aria-describedby={`hint-${key}${state.fields[key] ? ` error-${key}` : ''}`}
                />
              ) : (
                <textarea
                  id={`field-${key}`}
                  rows={key === 'roughIdea' || key === 'constraints' ? 5 : 3}
                  value={state.draft[key]}
                  onChange={event => model.edit(key, event.target.value)}
                  disabled={state.status === 'submitting'}
                  aria-invalid={!!state.fields[key]}
                  aria-describedby={`hint-${key}${state.fields[key] ? ` error-${key}` : ''}`}
                />
              )}

              {state.fields[key] && (
                <p id={`error-${key}`} className="mt-1 text-sm text-red-800">
                  {state.fields[key]}
                </p>
              )}
            </div>
          ))}

          <p aria-live="polite">
            {state.status === 'submitting'
              ? 'Creating project… Cancelling stops waiting; a dispatched request may still save.'
              : 'Only the project name is required.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={state.status === 'submitting'}>
              Create project
            </button>
            <button type="button" className="secondary" onClick={model.cancel}>
              Cancel
            </button>
          </div>
        </form>



      </section>
    );
  }

  return (
    <section className="mt-10">
      <h2
        id="page-heading"
        ref={heading}
        tabIndex={-1}
        className="break-words text-lg font-semibold"
      >
        {state.status === 'saved' && saved.project
          ? saved.project.name
          : state.status === 'loading'
            ? 'Loading project…'
            : state.status === 'missing'
              ? 'Project not found'
              : 'Project unavailable'}
      </h2>

      {state.status === 'saved' && saved.project ? (
        <dl className="mt-6 space-y-6">
          {fieldKeys.filter(key => key !== 'name').map(key => (
            <div key={key}>
              <dt className="font-medium">{projectFields[key].label}</dt>
              <dd className="mt-2 whitespace-pre-wrap break-words text-slate-700">
                {saved.project![key] || 'Not supplied'}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="my-4" aria-live="polite">
          {state.status === 'loading'
            ? 'Reading your saved starting context.'
            : state.status === 'missing'
              ? 'This project does not exist or is not available to this account.'
              : 'We could not load the project. Please try again.'}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {state.status === 'failure' && (
          <button onClick={model.retryRead}>Retry loading</button>
        )}
        <button className="secondary" onClick={() => model.open('/projects/new')}>
          Create another project
        </button>
        <button className="secondary" onClick={model.cancel}>
          Back
        </button>
      </div>
    </section>
  );
}
