
import { selectView } from './state/selector';
import { ProjectDashboard } from './dashboard/Dashboard';
import { ProjectEditor } from './editor/Editor';
import { useAppSelector } from '../../app/hooks';
import { useAuth } from '../auth/state/AuthProvider';

export function ProjectIndex() {
  const view = useAppSelector(selectView);

  const { isAuthenticated } = useAuth('ProjectIndex', (state) => ({
    isAuthenticated: state.isAuthenticated,
  }), true);

  // The session owner is decided by AuthProvider; there is no "actor id" to
  // thread through the slice. If we are ever not authenticated, the protected
  // route has already bounced us; this is just a defensive guard.
  if (!isAuthenticated) {
    return null;
  }

  return view === 'editor' ? (
    <ProjectEditor />
  ) : (
    <ProjectDashboard />
  );
}