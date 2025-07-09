import { baseQueryWithReauth } from '@/utils/baseQuery';
import { createApi } from "@reduxjs/toolkit/query/react";

const reducerPath = "preSaleTokenManagementApi";
const baseUrl = import.meta.env.VITE_PRESALE_API_URL;

export const preSaleTokenManagementApi = createApi({
  reducerPath,
  baseQuery: baseQueryWithReauth(baseUrl),
  endpoints: (builder) => ({
    getMyTokens: builder.query({
      query: (params) => ({
        url: `/tokens/my-tokens`,
        method: "GET",
        params,
      }),
    }),
  }),
});