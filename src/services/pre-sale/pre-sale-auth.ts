import { baseQueryWithReauth } from '@/utils/baseQuery';
import { createApi } from "@reduxjs/toolkit/query/react";

const reducerPath = "preSaleAuthApi";
const baseUrl = import.meta.env.VITE_PRESALE_API_URL;

export const preSaleAuthApi = createApi({
  reducerPath,
  baseQuery: baseQueryWithReauth( baseUrl ),
  endpoints: (builder) => ({
    connectWallet: builder.mutation({
      query: (body) => ({
        url: `/auth/metamask/login`,
        method: "POST",
        body,
      }),
    }),
    loginMetamask: builder.mutation({
      query: (body) => ({
        url: `/auth/metamask/login`,
        method: "POST",
        body,
      }),
    }),
    getMetamaskNonce: builder.mutation({
      query: (body) => ({
        url: `/auth/metamask/nonce`,
        method: "POST",
        body,
      }),
    }),
    getMe: builder.query({
      query: () => ({
        url: `/auth/me`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetMetamaskNonceMutation
} = preSaleAuthApi