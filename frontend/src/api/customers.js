import api from './axios';

export function fetchCustomers() {
  return api.get('/customers').then((r) => r.data);
}

export function fetchTop5Customers() {
  return api.get('/customers/top5').then((r) => r.data);
}

export function fetchCustomer(id) {
  return api.get(`/customers/${id}`).then((r) => r.data);
}
