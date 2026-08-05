import { request } from './api';

const BASE_URL = import.meta.env.VITE_CUSTOMERS_API_URL;

export function getCustomers() {
  return request(BASE_URL, '/customers');
}

export function getCustomer(id) {
  return request(BASE_URL, `/customers/${id}`);
}

export function createCustomer(customer) {
  return request(BASE_URL, '/customers', {
    method: 'POST',
    body: JSON.stringify(customer),
  });
}

export function updateCustomer(id, customer) {
  return request(BASE_URL, `/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(customer),
  });
}

export function deleteCustomer(id) {
  return request(BASE_URL, `/customers/${id}`, {
    method: 'DELETE',
  });
}
