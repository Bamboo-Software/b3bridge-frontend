/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/uploadApi.ts

import { baseQueryWithReauth } from "@/utils/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
const baseUrl = import.meta.env.VITE_PRESALE_API_URL;
export const uploadApi = createApi({
  reducerPath: "uploadApi",
  baseQuery: baseQueryWithReauth(baseUrl),
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
