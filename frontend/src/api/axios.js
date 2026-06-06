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
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Flatten server error → Error.message
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      'Network error. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;
