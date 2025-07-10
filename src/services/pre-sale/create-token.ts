/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseQueryWithReauth } from '@/utils/baseQuery';
import type { BaseApiResponse, CreateTokenPayload, ITokenOFT } from '@/utils/interfaces/token';
import { createApi } from "@reduxjs/toolkit/query/react";

const reducerPath = "preSaleCreateTokenApi";
const baseUrl = import.meta.env.VITE_PRESALE_API_URL;
export const preSaleCreateTokenApi = createApi({
  reducerPath,
  baseQuery: baseQueryWithReauth(baseUrl),
  endpoints: (builder) => ({
    getMyTokens: builder.query({
      query: (body) => ({
        url: `/tokens`,
        method: "POST",
        body,
      }),
    }),
    createToken: builder.mutation<BaseApiResponse<ITokenOFT[]>, CreateTokenPayload>({
      query: (body) => ({
        url: `/tokens`,
        method: "POST",
        body,
      }),
    }),
    verifyPayment: builder.mutation<BaseApiResponse<any>, string>({
      query: (tokenId) => ({
        url: `/tokens/${tokenId}/verify-payment`,
        method: "GET",
      }),
    }),
    deployToken: builder.mutation<BaseApiResponse<any>, string>({
      query: (tokenId) => ({
        url: `/tokens/${tokenId}/deploy`,
        method: "POST",
      }),
    }),
  }),
});

export const {useCreateTokenMutation,useVerifyPaymentMutation,useDeployTokenMutation}= preSaleCreateTokenApi