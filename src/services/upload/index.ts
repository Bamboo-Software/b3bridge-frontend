/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/uploadApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const baseUrl = import.meta.env.VITE_PRESALE_API_URL;
export const uploadApi = createApi({
  reducerPath: "uploadApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("auth-token");
      if (token) {
        headers.set("Authorization", `Bearer ${token.replace(/^"|"$/g, "")}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    uploadFile: builder.mutation<any, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: "/upload",
          method: "POST",
          body: formData,
        };
      },
    }),
  }),
});

export const { useUploadFileMutation } = uploadApi;
