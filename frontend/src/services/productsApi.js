import { request } from './api';

const BASE_URL = import.meta.env.VITE_PRODUCTS_API_URL;

export function getProducts() {
  return request(BASE_URL, '/products');
}

export function getProduct(id) {
  return request(BASE_URL, `/products/${id}`);
}

export function createProduct(product) {
  return request(BASE_URL, '/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}
