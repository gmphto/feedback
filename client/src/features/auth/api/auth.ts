import { feedApi } from '../../../shared/api/api';
import {
  readLoginResponse,
  readLogoutResponse,
  readSessionResponse,
  type User,
} from '../authResponses';

export const {
  useGetSessionQuery,
  useLoginMutation,
  useLogoutMutation,
} = feedApi.injectEndpoints({
  endpoints: (builder) => ({
    getSession: builder.query<User | null, void>({
      query: () => ({
        url: '/api/session',
        responseHandler: readSessionResponse,
        validateStatus: ({ status }) => status === 200 || status === 401,
      }),
    }),

    login: builder.mutation<string, void>({
      query: () => ({
        url: '/auth/login?returnTo=%2F',
        responseHandler: readLoginResponse,
        validateStatus: ({ status }) => status === 200,
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
        responseHandler: readLogoutResponse,
        validateStatus: ({ status }) => status === 204 || status === 401,
      }),
    }),
  }),
});
