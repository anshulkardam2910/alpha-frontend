"use client";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '@/store/authStore';

export interface ApiErrorPayload {
  message: string;
  code?: string;
  status: number;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly errors?: Record<string, string[]>;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.status = payload.status;
    this.code = payload.code;
    this.errors = payload.errors;
  }

  isValidation() {
    return this.status === 400 || this.status === 422;
  }
  isUnauthorized() {
    return this.status === 401;
  }
  isForbidden() {
    return this.status === 403;
  }
  isNotFound() {
    return this.status === 404;
  }
}

// Extend InternalAxiosRequestConfig to carry our skip-refresh flag
interface CustomAxiosConfig extends InternalAxiosRequestConfig {
  _skipAuthRefresh?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

function handleSessionExpired() {
  useAuthStore.getState().logout();
  if (typeof window !== 'undefined') {
    window.location.href = '/login?reason=session_expired';
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: CustomAxiosConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalConfig = error.config as CustomAxiosConfig;

    // No response — network/timeout
    if (!error.response) {
      throw new ApiError({
        message:
          error.code === 'ECONNABORTED'
            ? 'Request timed out. Please try again.'
            : 'Network error. Check your connection.',
        status: 0,
      });
    }

    const { status, data } = error.response as AxiosResponse<any>;

    // 401 + refresh token exists + not already a refresh call
    if (status === 401 && !originalConfig._skipAuthRefresh) {
      // Another refresh is in flight — queue this request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalConfig.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalConfig);
        });
      }

      isRefreshing = true;

      try {
        const newToken = await useAuthStore.getState().refreshTokens();

        if (!newToken) {
          processQueue(new Error('Refresh failed'), null);
          handleSessionExpired();
          return Promise.reject(new ApiError({ status: 401, message: 'Session expired.' }));
        }

        processQueue(null, newToken);
        originalConfig.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalConfig);
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleSessionExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    throw normalizeError(status, data);
  },
);
// ---------------------------------------------------------------------------
// Error normalizer — handles standard NestJS error shapes
//
//  HttpException:    { statusCode, message: string, error }
//  ValidationPipe:   { statusCode, message: string[], error }
//  Custom:           { statusCode, code: "MY_CODE", message }
// ---------------------------------------------------------------------------

function normalizeError(status: number, data: any): ApiError {
  if (Array.isArray(data?.message)) {
    return new ApiError({
      status,
      message: 'Validation failed. Please check the form.',
      code: 'VALIDATION_ERROR',
      errors: parseValidationMessages(data.message),
    });
  }

  const fallback: Record<number, string> = {
    400: 'Bad request.',
    401: 'Your session has expired. Please log in again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'A conflict occurred.',
    422: 'Unprocessable request.',
    429: 'Too many requests. Please slow down.',
    500: 'Server error. Our team has been notified.',
    502: 'Service temporarily unavailable.',
    503: 'Service temporarily unavailable.',
  };

  return new ApiError({
    status,
    message: data?.message ?? fallback[status] ?? 'An unexpected error occurred.',
    code: data?.code,
  });
}

// Converts NestJS class-validator message array into field-keyed errors
// Input:  ["name must not be empty", "slug must be lowercase"]
// Output: { name: ["must not be empty"], slug: ["must be lowercase"] }
function parseValidationMessages(messages: string[]): Record<string, string[]> {
  return messages.reduce<Record<string, string[]>>((acc, msg) => {
    const i = msg.indexOf(' ');
    const field = i !== -1 ? msg.slice(0, i) : 'general';
    const text = i !== -1 ? msg.slice(i + 1) : msg;
    acc[field] = [...(acc[field] ?? []), text];
    return acc;
  }, {});
}

// ---------------------------------------------------------------------------
// Typed helpers — auto-unwrap .data, pass AbortSignal for React Query
//
// React Query usage:
//   queryFn: ({ signal }) => get<Workspace[]>('/workspaces', { signal })
//
// Manual cancel:
//   const controller = new AbortController();
//   get('/workspaces', { signal: controller.signal });
//   controller.abort();
//
// queryClient.cancelQueries() works automatically when signal is passed.
// ---------------------------------------------------------------------------

export const get = <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  apiClient.get<T>(url, config).then((r) => r.data);

export const post = <T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> =>
  apiClient.post<T>(url, body, config).then((r) => r.data);

export const patch = <T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> =>
  apiClient.patch<T>(url, body, config).then((r) => r.data);

export const put = <T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> =>
  apiClient.put<T>(url, body, config).then((r) => r.data);

export const del = <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  apiClient.delete<T>(url, config).then((r) => r.data);

export default apiClient;
