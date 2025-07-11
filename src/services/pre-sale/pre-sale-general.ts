import { baseQueryWithReauth } from '@/utils/baseQuery';
import { createApi } from "@reduxjs/toolkit/query/react";

const reducerPath = "preSaleGeneralApi";
const baseUrl = import.meta.env.VITE_PRESALE_API_URL;

export const preSaleGeneralApi = createApi({
  reducerPath,
  baseQuery: baseQueryWithReauth(baseUrl),
  endpoints: (builder) => ({
    getSupportedChainPreSales: builder.query({
      query: () => ({
        url: `/general/supported-chains`,
        method: "GET",
      }),
    }),
  }),
});