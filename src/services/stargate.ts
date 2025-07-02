import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const reducerPath = "stargateApi";
const baseUrl = import.meta.env.VITE_STARGATE_API_URL;

export const stargateApi = createApi({
  reducerPath,
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getChainList: builder.query({
      query: (params) => ({
        url: `/v1/chains`,
        method: "GET",
        params,
      }),
    }),
    getTokenList: builder.query({
      query: (params) => ({
        url: `/v1/tokens`,
        method: "GET",
        params,
      }),
    }),
    getQuotes: builder.query({
      query: (params) => ({
        url: `/v1/quotes`,
        method: "GET",
        params,
      }),
    }),
  }),
});
