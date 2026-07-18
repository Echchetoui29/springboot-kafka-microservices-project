import { request } from './api';

const BASE_URL = import.meta.env.VITE_ORDERS_API_URL;

export function getOrders() {
  return request(BASE_URL, '/orders');
}

export function getOrder(id) {
  return request(BASE_URL, `/orders/${id}`);
}

export function createOrder(order) {
  return request(BASE_URL, '/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  });
}
