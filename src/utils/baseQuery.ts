import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { disconnect } from '@wagmi/core';
import { wagmiConfig } from './constants/wallet/wagmi';
import { useAuthToken } from '@/hooks/useAuthToken';

export const baseQueryWithReauth = (
  baseUrl: string
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
  const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token =  useAuthToken.getState().token
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  return async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
      try {
        await disconnect(wagmiConfig);
        useAuthToken.getState().removeToken();
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }

    return result;
  };
};