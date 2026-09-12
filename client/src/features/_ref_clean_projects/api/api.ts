import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { Project } from '../types/project';
import type { ProjectDraft } from '../fields';
import { setupProject, setupProjects, convertProjectToApi } from './projects';

/**
 * The feature-owned API surface, registered in `app/store.ts` under
 * `projectApi.reducerPath`. RTK Query owns request data, loading and errors;
 * the slice must never copy these.
 *
 * Endpoints:
 * - GET  /api/projects                    -> list summaries
 * - GET  /api/projects/:id                -> one summary (the PATCH render target)
 * - GET  /api/projects/:id/definition     -> full editable context after create
 * - POST /api/projects                    -> create; 201 returns the definition
 * - PATCH /api/projects/:id               -> rename (optimistic single-project)
 * - DELETE /api/projects/:id              -> remove
 *
 * The server returns `{ project }` envelopes for single-resource endpoints and
 * `{ projects }` for the list; the response schema is declared in
 * `server/src/projects/routes.ts`.
 */
export const projectApi = createApi({
  reducerPath: 'projectApi',

  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),

  tagTypes: ['Project'],

  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => '/projects',

      transformResponse: (res: { projects: ApiProject[] }) =>
        setupProjects(res.projects),

      providesTags: (projects) => [
        { type: 'Project', id: 'LIST' },
        ...(projects ?? []).map(({ projectId }) => ({
          type: 'Project' as const,
          id: projectId!,
        })),
      ],
    }),

    getProject: builder.query<Project, number>({
      query: (projectId) => `/projects/${projectId}`,

      transformResponse: (res: { project: ApiProject }) =>
        setupProject(res.project),

      providesTags: (_project, _error, projectId) => [
        { type: 'Project', id: projectId },
      ],
    }),

    getProjectDefinition: builder.query<Project, number>({
      query: (projectId) => `/projects/${projectId}/definition`,

      transformResponse: (res: { project: ApiProject }) =>
        setupProject(res.project),

      providesTags: (_project, _error, projectId) => [
        { type: 'Project', id: projectId },
      ],
    }),

    createProject: builder.mutation<Project, ProjectDraft>({
      query: (draft) => ({
        url: '/projects',
        method: 'POST',
        body: convertProjectToApi(draft),
      }),

      transformResponse: (res: { project: ApiProject }) =>
        setupProject(res.project),

      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),

    updateProject: builder.mutation<
      Project,
      { projectId: number; name: string; expectedVersion: number }
    >({
      query: ({ projectId, name, expectedVersion }) => ({
        url: `/projects/${projectId}`,
        method: 'PATCH',
        body: { name, expectedVersion },
      }),

      transformResponse: (res: { project: ApiProject }) =>
        setupProject(res.project),

      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: projectId },
        { type: 'Project', id: 'LIST' },
      ],
    }),

    deleteProject: builder.mutation<void, number>({
      query: (projectId) => ({
        url: `/projects/${projectId}`,
        method: 'DELETE',
      }),

      invalidatesTags: (_result, _error, projectId) => [
        { type: 'Project', id: projectId },
        { type: 'Project', id: 'LIST' },
      ],
    }),
  }),
});

/** Untyped helper for transformResponse payloads. */
export type ApiProject = {
  id: number;
  name: string;
  version: number;
};

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useGetProjectDefinitionQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApi;