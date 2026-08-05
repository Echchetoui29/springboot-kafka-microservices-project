import { useEffect, useState } from 'react';
import { getCustomers, updateCustomer, deleteCustomer } from '../services/customersApi';
import { useToast } from './ToastProvider';

export default function CustomerList({ refreshKey }) {
  const showToast = useToast();
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: '', amountAvailable: '' });
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    getCustomers()
      .then(setCustomers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [refreshKey]);

  function startEdit(c) {
    setEditingId(c.id);
    setDraft({ name: c.name, amountAvailable: c.amountAvailable });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id) {
    setSaving(true);
    try {
      const updated = await updateCustomer(id, {
        name: draft.name,
        amountAvailable: Number(draft.amountAvailable),
      });
      setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
    } catch (e) {
      showToast(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      showToast(e.message);
    }
  }

  if (loading) return <p className="muted">Loading customers...</p>;
  if (error) return <p className="error">Error: {error}</p>;
  if (customers.length === 0) return <p className="muted">No customers yet.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Available</th>
            <th>Reserved</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) =>
            editingId === c.id ? (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={draft.amountAvailable}
                    onChange={(e) => setDraft((d) => ({ ...d, amountAvailable: e.target.value }))}
                  />
                </td>
                <td>{c.amountReserved}</td>
                <td>
                  <button onClick={() => saveEdit(c.id)} disabled={saving}>
                    Save
                  </button>
                  <button onClick={cancelEdit} disabled={saving}>
                    Cancel
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.amountAvailable}</td>
                <td>{c.amountReserved}</td>
                <td>
                  <button onClick={() => startEdit(c)}>Edit</button>
                  <button onClick={() => handleDelete(c.id)}>Delete</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
