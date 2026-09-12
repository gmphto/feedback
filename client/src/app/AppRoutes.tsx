import { Route, Routes } from 'react-router-dom';

import { ProjectIndex } from '../features/projects/ProjectIndex';
import { ProtectedRoute } from './ProtectedRoute';

/**
 * The signed-in route map. The URLs here mirror the rail destinations in
 * `shell/navigation.ts`; every feature entry point renders under the protected
 * layout route. Features keep ownership of their own views.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route index element={<ProjectIndex />} />
        <Route path="projects/new" element={<ProjectIndex />} />
        <Route path="projects/:projectId" element={<ProjectIndex />} />
      </Route>
    </Routes>
  );
}