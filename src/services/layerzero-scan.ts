import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const reducerPath = "layerZeroScanApi";
const baseUrl = import.meta.env.VITE_LAYER_ZERO_SCAN_API_URL;

export const layerZeroScanApi = createApi({
  reducerPath,
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getByTxHash: builder.query({
      query: (params) => ({
        url: `/v1/messages/tx/${params.txHash}`,
        method: "GET",
      }),
    }),
  }),
});


export const {
  useLazyGetByTxHashQuery
} = layerZeroScanApi