import { useParams, useNavigate } from 'react-router-dom';
import * as React from 'react';

import { useAuth } from '../features/auth/state/AuthProvider';
import { useAppSelector } from '../app/hooks';
import { selectView } from './state/selector';
import { ProjectDashboard } from './dashboard/Dashboard';
import { ProjectEditor } from './editor/Editor';

/**
 * The projects feature entry point. The router matches the signed-in routes
 * ('/', 'projects/new', 'projects/:projectId') to this component, which picks
 * the correct view from the slice and lets each view own its own rendering.
 *
 * This replaces the previous hand-rolled `ProjectView` that rendered directly
 * from an external `ProjectModel`; the slice + RTK Query cache are the single
 * source of truth now.
 */
export function ProjectView() {
  const view = useAppSelector(selectView);
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth('ProjectView', (state) => ({
    isAuthenticated: state.isAuthenticated,
  }), true);

  // The session owner is decided by AuthProvider; there is no "actor id" to
  // thread through the slice. If we are ever not authenticated, the protected
  // route has already bounced us; this is just a defensive guard.
  if (!isAuthenticated) {
    return null;
  }

  const numericProjectId = projectId ? Number(projectId) : undefined;

  return view === 'editor' ? (
    <ProjectEditor projectId={numericProjectId} />
  ) : (
    <ProjectDashboard
      onOpenProject={(id) => navigate(`/projects/${id}`)}
      onCreateProject={() => navigate('/projects/new')}
    />
  );
}