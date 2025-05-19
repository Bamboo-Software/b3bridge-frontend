import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";
import { ACCESS_TOKEN_KEY, AUTH_SERVICE_ENDPOINT, REFRESH_TOKEN_KEY } from ".";
// import useAddressStore from "@/store/address/useAddress";
import { toast } from "sonner";

export interface Response<T> {
  records: T;
  total_records: number;
}

export const getAccessToken = () => Cookies.get(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => Cookies.get(REFRESH_TOKEN_KEY);

class AxiosClient {
  private readonly axiosInstance: AxiosInstance;
  static instance: AxiosClient;
  private retryCount = 0;
  private isRefreshing = false;

  private failedQueue: any[] = [];

  static getInstance() {
    if (!AxiosClient.instance) {
      AxiosClient.instance = new AxiosClient();
    }
    return AxiosClient.instance;
  }

  setAccessToken = (accessToken: string) => {
    Cookies.set(ACCESS_TOKEN_KEY, accessToken);
  };

  processQueue = (error: AxiosError | null, token: string | null = null) => {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  };

  public constructor() {
    this.axiosInstance = axios.create({
      headers: {
        "content-type": "application/json",
      },
      timeout: 60000,
    });

    this._initializeInterceptor();
  }

  private _initializeInterceptor = () => {
    this.axiosInstance.interceptors.request.use(this._handleRequest);
    this.axiosInstance.interceptors.response.use(
      this._handleResponse,
      this._handleError
    );
  };

  post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.axiosInstance.post(url, data, config);
  }

  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.get(url, config);
  }

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.put(url, data, config);
  }

  patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.axiosInstance.patch(url, data, config);
  }

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.delete(url, config);
  }

  private _handleRequest = (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();

    if (accessToken && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  };

  private _handleResponse = async (response: AxiosResponse) => {
    if (
      !["application/json"].includes(response.headers["content-type"] as string)
    )
      return response;
    if (response.data) return response.data;
    return response;
  };

  clearToken = () => {
    Cookies.remove(ACCESS_TOKEN_KEY);
  };

  private _handleError = async (error: any) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {

      console.log("this.isRefreshing :>> ", this.isRefreshing);
      if (this.isRefreshing) {
        return new Promise((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            // console.log("token :>> ", token);
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return this.axiosInstance(originalRequest);
          })
          .catch((err) => {
            console.log("error :>> ", error);
            return Promise.reject(err);
          });
      }

      if (!this.isRefreshing) {
        originalRequest._retry = true;
        // this.retryCount += 1;
        this.isRefreshing = true;

        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          Cookies.remove(ACCESS_TOKEN_KEY);
          Cookies.remove(REFRESH_TOKEN_KEY);
        //   useAddressStore.getState().actions.resetAccount();
          window.location.href = "/";
          return Promise.reject(error);
        }

        try {
          const response: AxiosResponse = await axios.post(
            `${AUTH_SERVICE_ENDPOINT}/refresh`,
            {
              refreshToken: getRefreshToken(),
            }
          );
          Cookies.set(ACCESS_TOKEN_KEY, response?.data?.data?.accessToken);
          Cookies.set(REFRESH_TOKEN_KEY, response?.data?.data?.refreshToken);

          originalRequest.headers["Authorization"] =
            "Bearer " + response?.data?.data?.accessToken;
          this.processQueue(null, response?.data?.data?.accessToken);
          return this.axiosInstance(originalRequest);
        } catch (error) {
          console.log("error :>> ", error);
          Cookies.remove(ACCESS_TOKEN_KEY);
          Cookies.remove(REFRESH_TOKEN_KEY);
        //   useAddressStore.getState().actions.resetAccount();
          this.processQueue(error as AxiosError, null);
          window.location.href = "/";
          toast.error("Session expired, please login again");
          return Promise.reject(error);
        } finally {
          this.isRefreshing = false;
        }
      }
    }

    if (error.response && error.response.status === 403) {
      Cookies.remove(ACCESS_TOKEN_KEY);
      Cookies.remove(REFRESH_TOKEN_KEY);
    //   useAddressStore.getState().actions.resetAccount();
      // window.alert("You are not allowed to access this resource!");
    }

    return Promise.reject(error);
  };
}

export default AxiosClient.getInstance();
