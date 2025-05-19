import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { type AxiosRequestConfig } from "axios";
import httpClient from "./httpClient";

export const ACCESS_TOKEN_KEY = "access-token";
export const REFRESH_TOKEN_KEY = "refresh-token";

export type ApiParamsProps = Record<
  string,
  string | number | string[] | number[] | undefined | boolean
>;

export type ApiMutationOptionsOf<T> = Omit<
  UseMutationOptions<T, unknown, { data: Record<string, unknown> }, unknown>,
  "mutationFn"
>;

export enum API_SERVICES {
  AUTH_SERVICE = "auth",
}

export const getApiEndpoint = (service?: API_SERVICES): string => {
  if (service) return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${service}`;
  return `${process.env.NEXT_PUBLIC_API_ENDPOINT}`;
};

interface ApiServiceProps {
  url: string;
  params?: ApiParamsProps;
  data?: unknown;
  config?: AxiosRequestConfig;
  id?: number | string;
  endpoint?: string;
}

interface ApiQueryServiceProps<TOptions> extends ApiServiceProps {
  key?: string;
  options?: TOptions;
}

interface ApiMethodProps {
  get: <T>(props: ApiServiceProps) => Promise<T>;
  post: <T>(props: ApiServiceProps) => Promise<T>;
  put: <T>(props: ApiServiceProps) => Promise<T>;
  patch: <T>(props: ApiServiceProps) => Promise<T>;
  delete: <T>(props: ApiServiceProps) => Promise<T>;
}

export const GetApiMethodInstance = (apiService: string): ApiMethodProps => {
  return {
    get: async <T>({ url, params, config }: ApiServiceProps) => {
      return httpClient.get<T>(`${apiService}${url}`, {
        ...config,
        params: params,
      });
    },
    post: async <T = unknown>({
      url,
      data,
      params,
      config,
    }: ApiServiceProps) => {
      return httpClient.post<T>(`${apiService}${url}`, data, {
        ...config,
        params: params,
      });
    },
    put: async ({ url, data, params, config }: ApiServiceProps) => {
      return httpClient.put(`${apiService}${url}`, data, {
        ...config,
        params: params,
      });
    },
    patch: async ({ url, data, params }: ApiServiceProps) => {
      return httpClient.patch(`${apiService}${url}`, data, {
        params: params,
      });
    },
    delete: async ({ url, id, params }: ApiServiceProps) => {
      return httpClient.delete(
        id ? `${apiService}${url}/${id}` : `${apiService}${url}`,
        {
          params: params,
        }
      );
    },
  };
};

export class ApiService {
  constructor(service: string) {
    this.apiMethod = GetApiMethodInstance(service);
  }

  apiMethod: ApiMethodProps;

  useGet = <T>({
    url,
    params,
    options,
    config,
  }: ApiQueryServiceProps<
    Omit<UseQueryOptions<T>, "queryKey" | "queryFn">
  >) => {
    return useQuery({
      queryKey: [url, params],
      queryFn: () => this.apiMethod.get<T>({ url, params, config }),
      ...options,
    });
  };

  usePostQuery = <T>({
    url,
    data,
    options,
    config,
    endpoint,
  }: ApiQueryServiceProps<
    Omit<UseQueryOptions<T>, "queryKey" | "queryFn">
  >) => {
    return useQuery({
      queryKey: [url, data],
      queryFn: () => this.apiMethod.post<T>({ url, data, config, endpoint }),
      ...options,
    });
  };

  usePost = <T = unknown>(
    props: ApiServiceProps,
    options?: ApiMutationOptionsOf<T>
  ) => {
    const { url, data: _data, endpoint, ...otherProps } = props;

    return useMutation({
      mutationFn: ({ data }: { data: Record<string, unknown> }) =>
        this.apiMethod.post<T>({ url, data, endpoint, ...otherProps }),
      ...options,
    });
  };

  usePut = <T = unknown>(
    props: ApiServiceProps,
    options?: ApiMutationOptionsOf<T>
  ) => {
    const { url, data: _data, ...otherProps } = props;

    return useMutation({
      mutationFn: ({ data }: { data: Record<string, unknown> }) =>
        this.apiMethod.put<T>({ url, data, ...otherProps }),
      ...options,
    });
  };

  usePatch = <T = unknown>(
    { url, params }: ApiServiceProps,
    options?: ApiMutationOptionsOf<T>
  ) => {
    return useMutation({
      mutationFn: ({ data }: { data: Record<string, unknown> }) =>
        this.apiMethod.patch<T>({ url, data, params }),
      ...options,
    });
  };

  useDelete = <T = unknown>({ url, params }: ApiServiceProps) => {
    return useMutation({
      mutationFn: (
        data?:
          | string
          | number
          | Record<
              string,
              string | number | boolean | string[] | number[] | undefined
            >
      ) => {
        if (typeof data === "number" || typeof data === "string") {
          return this.apiMethod.delete<T>({
            url,
            id: data,
            params,
          });
        }

        return this.apiMethod.delete<T>({
          url,
          params: { ...params, ...data },
        });
      },
    });
  };
}

// Export API endpoints
export const AUTH_SERVICE_ENDPOINT = getApiEndpoint(API_SERVICES.AUTH_SERVICE);



export const DEFAULT_ENDPOINT = getApiEndpoint();

// Export API client methods
export const AuthService = new ApiService(AUTH_SERVICE_ENDPOINT);
