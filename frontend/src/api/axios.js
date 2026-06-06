import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

if (import.meta.env.PROD && (!import.meta.env.VITE_API_BASE_URL || !baseURL.endsWith('/api'))) {
  throw new Error(
    'VITE_API_BASE_URL must be set and end with /api in production (e.g. https://api.example.com/api). ' +
      `Current value: ${JSON.stringify(baseURL)}`
  );
}

const api = axios.create({
  baseURL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Retry once on timeout / network error (Render free tier cold starts take 30-60s).
// Non-retryable: 4xx/5xx with a server body.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const cfg = error.config || {};
    const isNetworkOrTimeout = !error.response && (error.code === 'ECONNABORTED' || error.message === 'Network Error');
    if (isNetworkOrTimeout && !cfg.__retried) {
      cfg.__retried = true;
      await new Promise((r) => setTimeout(r, 2000));
      return api(cfg);
    }
    const message =
      error.response?.data?.error ||
      error.message ||
      'Network error. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;
