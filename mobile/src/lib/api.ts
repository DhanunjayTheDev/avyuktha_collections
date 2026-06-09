import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { tokenStore } from './tokenStore';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra?.apiUrl as string) ||
  'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

// Attach access token to every request.
api.interceptors.request.use(async (config) => {
  const token = await tokenStore.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Called by the auth store on unrecoverable 401 (set during app init).
let onAuthFailure: (() => void) | null = null;
export const setAuthFailureHandler = (fn: () => void) => { onAuthFailure = fn; };

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (err.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const refresh = await tokenStore.getRefresh();
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken: refresh });
          await tokenStore.set(data.data.accessToken, data.data.refreshToken);
          original.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(original);
        } catch {
          await tokenStore.clear();
          onAuthFailure?.();
        }
      } else {
        await tokenStore.clear();
        onAuthFailure?.();
      }
    }
    return Promise.reject(err);
  }
);

export { API_URL };
