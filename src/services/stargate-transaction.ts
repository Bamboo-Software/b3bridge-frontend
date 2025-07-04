import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_STARGATE_TRANSACTION_API_URL;

export const stargateTransactionApi = createApi({
  reducerPath: "stargateTransactionApi",
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getBusQueue: builder.query({
      query: (params) => ({
        url: `/v1/buses/bus-queue/${params.txHash}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useLazyGetBusQueueQuery } = stargateTransactionApi;
