"use client";

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

export const ReactQueryClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const queryCache = new QueryCache({
    onError: (error, query) => {
      // console.error(`Query failed: ${query.queryKey}`, error);
    },
    onSuccess: (data, query) => {
      // console.log(`Query succeeded: ${query.queryKey}`, data);
    },
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
    queryCache,
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
