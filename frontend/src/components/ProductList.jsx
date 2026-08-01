import { useEffect, useState } from 'react';
import { getProducts, updateProduct, deleteProduct } from '../services/productsApi';
import { useToast } from './ToastProvider';

export default function ProductList({ refreshKey }) {
  const showToast = useToast();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: '', price: '', availableItems: '' });
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    getProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [refreshKey]);

  function startEdit(p) {
    setEditingId(p.id);
    setDraft({ name: p.name, price: p.price, availableItems: p.availableItems });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id) {
    setSaving(true);
    try {
      const updated = await updateProduct(id, {
        name: draft.name,
        price: Number(draft.price),
        availableItems: Number(draft.availableItems),
      });
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setEditingId(null);
    } catch (e) {
      showToast(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      showToast(e.message);
    }
  }

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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) =>
            editingId === p.id ? (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={draft.price}
                    onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={draft.availableItems}
                    onChange={(e) => setDraft((d) => ({ ...d, availableItems: e.target.value }))}
                  />
                </td>
                <td>{p.reservedItems}</td>
                <td>
                  <button onClick={() => saveEdit(p.id)} disabled={saving}>
                    Save
                  </button>
                  <button onClick={cancelEdit} disabled={saving}>
                    Cancel
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td>{p.availableItems}</td>
                <td>{p.reservedItems}</td>
                <td>
                  <button onClick={() => startEdit(p)}>Edit</button>
                  <button onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
