import axios from 'axios';
import { resolveApiUrl } from './api-resolver';

/**
 * Standard Axios Client for JAA Admin
 * Configured with withCredentials: true so that the browser automatically
 * sends HTTP-only auth cookies to the backend on all requests.
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ADMIN_BASE_URL || 'http://localhost:5000/api/admin',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically resolve network IP / localhost and ensure withCredentials
apiClient.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    if (config.url) {
      config.url = resolveApiUrl(config.url);
    }
    if (config.baseURL) {
      config.baseURL = resolveApiUrl(config.baseURL);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized cleanly
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      if (!window.location.pathname.includes('/admin/login')) {
        window.localStorage.removeItem('jaa_admin_user');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

