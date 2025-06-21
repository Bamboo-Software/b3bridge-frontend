import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "@/lib/configs";


const reducerPath = "bridgeApi";
const endpoint = "bridge";

export const bridgeApi = createApi({
  reducerPath,
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    bridge: builder.mutation({
      query: (data) => ({
        url: `${endpoint}/bridge`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
    useBridgeMutation,
} = bridgeApi;
