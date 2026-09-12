import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const feedApi = createApi({
  reducerPath: 'feedApi',

  baseQuery: fetchBaseQuery({
    baseUrl: globalThis.location?.origin ?? 'http://localhost',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { accept: 'application/json' },
  }),

  endpoints: () => ({}),
});
