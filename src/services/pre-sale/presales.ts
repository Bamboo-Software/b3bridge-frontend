import { baseQueryWithReauth } from '@/utils/baseQuery';
import { createApi } from "@reduxjs/toolkit/query/react";

const reducerPath = "preSaleApi";
const baseUrl = import.meta.env.VITE_PRESALE_API_URL;

export const preSaleApi = createApi({
  reducerPath,
  baseQuery: baseQueryWithReauth(baseUrl),
  endpoints: (builder) => ({
    createPreSales: builder.mutation({
      query: (body) => ({
        url: `/presales`,
        method: "POST",
        body,
      }),
    }),
    verifyPaymentPreSales: builder.query({
      query: (params) => ({
        url: `/presales/${params.presaleId}/verify-payment`,
        method: "GET",
      }),
    }),
    deployContractPreSales: builder.mutation({
      query: (params) => ({
        url: `/presales/${params.presaleId}/deploy`,
        method: "POST",
      }),
    }),
    getDetailPreSales: builder.query({
      query: (params) => ({
        url: `/presales/${params.presaleId}`,
        method: "GET",
      }),
    }),
    getPreSales: builder.query({
      query: (params) => ({
        url: `/presales`,
        method: "GET",
        params
      }),
    }),
  }),
});