import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

import type { Project } from "../types/project";
import type { ProjectDraft } from "../editor/types/projectDraft";
import { convertProjectToApi, setupProjects } from "./projects";

// export interface CreateProjectRequest {
//   name: string;
//   description: string;
// }

// export interface UpdateProjectRequest {
//   projectId: number;
//   name: string;
//   description: string;
// }

// const listTags = 

type ApiProject = Project;

// type ApiData = {
//   projects: ApiProject
// }

// const baseUrl = "/api/projects/"

// const reducerPath = "projectApi"

// const tagTypes = ["Project"]

// const get = builder.query<Project, number>({} as const)

// const body = {
//       query: () => "/projects",

//       providesTags: (projects) => [
//         { type: "Project", id: "LIST" },

//         ...(projects ?? []).map(({ projectId }) => ({
//           type: "Project" as const,
//           projectId,
//         })),
//       ],
//     }

// const body = 

export const projectApi = createApi({
  reducerPath: "projectApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
  }),

  tagTypes: ["Project"],

  endpoints: (builder) => ({
    getProjects: builder.query<ApiProject[], void>({
      query: () => "/projects",

      transformResponse: (res) => setupProjects(res),

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
      ProjectDraft
    >({
      query: (draft) => ({
        url: "/projects",
        method: "POST",
        body: convertProjectToApi(draft),
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
      ProjectDraft
    >({
      query: ({ projectId, ...draft }) => ({
        url: `/projects/${projectId}`,
        method: "PUT",
        body: convertProjectToApi(draft),
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