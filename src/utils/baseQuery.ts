import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { disconnect } from '@wagmi/core';
import { wagmiConfig } from './constants/wallet/wagmi';

export const baseQueryWithReauth = (
  baseUrl: string
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
  const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      // const token = (getState() as RootState).auth.token;
      const token = localStorage.getItem('auth-token');
      if (token) {
        headers.set("Authorization", `Bearer ${JSON.parse(token).replace(/^"|"$/g, "")}`);
      }
      return headers;
    },
  });

  return async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
      try {
        await disconnect(wagmiConfig);
        
        localStorage.removeItem('auth-token');
        
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }

    return result;
  };
};