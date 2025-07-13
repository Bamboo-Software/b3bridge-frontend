import { baseQueryWithReauth } from '@/utils/baseQuery';
import { createApi } from "@reduxjs/toolkit/query/react";

const reducerPath = "preSaleApi";
const baseUrl = import.meta.env.VITE_PRESALE_API_URL;

export const preSaleApi = createApi({
  reducerPath,
  baseQuery: baseQueryWithReauth(baseUrl),
  tagTypes: ['Presale', 'PresaleDetail'],
  endpoints: (builder) => ({
    createPreSales: builder.mutation({
      query: (body) => ({
        url: `/presales`,
        method: "POST",
        body,
      }),
      invalidatesTags: ['Presale'],
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
      providesTags: (result, error, arg) => [
        { type: 'PresaleDetail', id: arg.presaleId }
      ],
    }),
    getPreSales: builder.query({
      query: (params) => ({
        url: `/presales`,
        method: "GET",
        params
      }),
      providesTags: ['Presale'],
    }),
    cancelPreSales: builder.mutation({
      query: (body) => ({
        url: `/presales/${body.presaleId}/cancel`,
        method: "POST",
        body
      }),
      invalidatesTags: (result, error, arg) => [
        'Presale',
        { type: 'PresaleDetail', id: arg.presaleId }
      ],
    }),
    finalizePreSales: builder.mutation({
      query: (params) => ({
        url: `/presales/${params.presaleId}/finalize`,
        method: "POST",
      }),
      invalidatesTags: (result, error, arg) => [
        'Presale',
        { type: 'PresaleDetail', id: arg.presaleId }
      ],
    }),
    getPreSalesExplore: builder.query({
      query: (params) => ({
        url: `/presales/explore`,
        method: "GET",
        params
      }),
    }),
  }),
});