import { useState } from "react";
import { createCustomer } from "../services/customersApi";
import { useToast } from "./ToastProvider";

export default function CustomerForm({ onCustomerCreated }) {
  const showToast = useToast();
  const [name, setName] = useState("");
  const [amountAvailable, setAmountAvailable] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const customer = await createCustomer({
        name,
        amountAvailable: Number(amountAvailable),
      });
      onCustomerCreated?.(customer);
      setName("");
      setAmountAvailable("");
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
        Available amount
        <input
          type="number"
          min="0"
          value={amountAvailable}
          onChange={(e) => setAmountAvailable(e.target.value)}
          required
        />
      </label>

      <button type="submit" disabled={submitting}>
        {submitting ? "Adding..." : "Add customer"}
      </button>
    </form>
  );
}
