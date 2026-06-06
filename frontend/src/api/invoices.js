import api from './axios';

export function fetchInvoices(params = {}) {
  return api.get('/invoices', { params }).then((r) => r.data);
}

export function fetchInvoice(id) {
  return api.get(`/invoices/${id}`).then((r) => r.data);
}

export function createInvoice(payload) {
  return api.post('/invoices', payload).then((r) => r.data);
}

export function updateInvoice(id, payload) {
  return api.put(`/invoices/${id}`, payload).then((r) => r.data);
}

export function deleteInvoice(id) {
  return api.delete(`/invoices/${id}`).then((r) => r.data);
}
