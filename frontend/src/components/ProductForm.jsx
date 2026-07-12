import { useState } from "react";
import { createProduct } from "../services/productsApi";
import { useToast } from "./ToastProvider";

export default function ProductForm({ onProductCreated }) {
  const showToast = useToast();
  const [name, setName] = useState("");
  const [availableItems, setAvailableItems] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const product = await createProduct({
        name,
        availableItems: Number(availableItems),
      });
      onProductCreated?.(product);
      setName("");
      setAvailableItems("");
    } catch (e) {
      showToast(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>

      <label>
        Available items
        <input
          type="number"
          min="0"
          value={availableItems}
          onChange={(e) => setAvailableItems(e.target.value)}
          required
        />
      </label>

      <button type="submit" disabled={submitting}>
        {submitting ? "Adding..." : "Add product"}
      </button>
    </form>
  );
}
