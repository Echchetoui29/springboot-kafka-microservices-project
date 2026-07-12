import { useEffect, useState } from "react";
import { getProducts } from "../services/productsApi";

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

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Available</th>
          <th>Reserved</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.id}>
            <td>{p.id}</td>
            <td>{p.name}</td>
            <td>{p.availableItems}</td>
            <td>{p.reservedItems}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
