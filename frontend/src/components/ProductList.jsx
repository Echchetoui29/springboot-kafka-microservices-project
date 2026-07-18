import { useEffect, useState } from 'react';
import { getProducts } from '../services/productsApi';

export default function ProductList({ refreshKey }) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <p className="muted">Loading products...</p>;
  if (error) return <p className="error">Error: {error}</p>;
  if (products.length === 0) return <p className="muted">No products yet.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Available</th>
            <th>Reserved</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.price}</td>
              <td>{p.availableItems}</td>
              <td>{p.reservedItems}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
