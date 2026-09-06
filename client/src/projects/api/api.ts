// src/project/api/project-api.ts
import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

import type { Project } from "../types/project";

export interface CreateProjectRequest {
  name: string;
  description: string;
}

export interface UpdateProjectRequest {
  projectId: number;
  name: string;
  description: string;
}

export const projectApi = createApi({
  reducerPath: "projectApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
  }),

  tagTypes: ["Project"],

  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => "/projects",

      providesTags: (projects) => [
        { type: "Project", id: "LIST" },

        ...(projects ?? []).map(({ projectId }) => ({
          type: "Project" as const,
          projectId,
        })),
      ],
    }),

    getProject: builder.query<Project, number>({
      query: (projectId) => `/projects/${projectId}`,

      providesTags: (_project, _error, projectId) => [
        {
          type: "Project",
          id: projectId,
        },
      ],
    }),

    createProject: builder.mutation<
      Project,
      CreateProjectRequest
    >({
      query: (body) => ({
        url: "/projects",
        method: "POST",
        body,
      }),

      invalidatesTags: [
        {
          type: "Project",
          id: "LIST",
        },
      ],
    }),

    updateProject: builder.mutation<
      Project,
      UpdateProjectRequest
    >({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}`,
        method: "PUT",
        body,
      }),

      invalidatesTags: (
        _project,
        _error,
        { projectId },
      ) => [
        {
          type: "Project",
          id: projectId,
        },
        {
          type: "Project",
          id: "LIST",
        },
      ],
    }),

    deleteProject: builder.mutation<void, number>({
      query: (projectId) => ({
        url: `/projects/${projectId}`,
        method: "DELETE",
      }),

      invalidatesTags: (
        _result,
        _error,
        projectId,
      ) => [
        {
          type: "Project",
          id: projectId,
        },
        {
          type: "Project",
          id: "LIST",
        },
      ],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApi;