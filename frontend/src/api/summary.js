import api from './axios';

export function fetchSummary() {
  return api.get('/summary').then((r) => r.data);
}
