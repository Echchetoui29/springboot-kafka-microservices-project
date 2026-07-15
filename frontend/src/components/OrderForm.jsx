import { useEffect, useState } from "react";
import { getCustomers } from "../services/customersApi";
import { getProducts } from "../services/productsApi";
import { createOrder, getOrder } from "../services/ordersApi";
import { useToast } from "./ToastProvider";

const POLL_INTERVAL_MS = 1500;
const POLL_MAX_ATTEMPTS = 20;

export default function OrderForm({ onOrderCreated, catalogRefreshKey }) {
  const showToast = useToast();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [productCount, setProductCount] = useState(1);
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);

  useEffect(() => {
    getCustomers().then(setCustomers).catch((e) => showToast(`Failed to load customers: ${e.message}`));
    getProducts().then(setProducts).catch((e) => showToast(`Failed to load products: ${e.message}`));
  }, [showToast, catalogRefreshKey]);

  async function pollUntilFinal(id) {
    for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      let order;
      try {
        order = await getOrder(id);
      } catch {
        continue;
      }
      setPendingOrder(order);
      if (order.status !== "NEW") {
        onOrderCreated?.(order);
        return;
      }
    }
    showToast(`Order ${id} is still processing after ${POLL_MAX_ATTEMPTS * POLL_INTERVAL_MS / 1000}s`);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setPendingOrder(null);
    setSubmitting(true);
    try {
      const order = await createOrder({
        customerId: Number(customerId),
        productId: Number(productId),
        productCount: Number(productCount),
        price: Number(price),
        status: "NEW",
      });
      setPendingOrder(order);
      onOrderCreated?.(order);
      setProductCount(1);
      setPrice("");
      pollUntilFinal(order.id);
    } catch (e) {
      showToast(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Customer
        <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
          <option value="" disabled>-- which customer? --</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name} (available: {c.amountAvailable})</option>
          ))}
        </select>
      </label>

      <label>
        Product
        <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
          <option value="" disabled>-- which product? --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} (stock: {p.availableItems})</option>
          ))}
        </select>
      </label>

      <label>
        Quantity
        <input
          type="number"
          min="1"
          value={productCount}
          onChange={(e) => setProductCount(e.target.value)}
          required
        />
      </label>

      <label>
        Price
        <input
          type="number"
          min="1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </label>

      <button type="submit" disabled={submitting}>
        {submitting ? "Creating..." : "Create order"}
      </button>

      {pendingOrder && (
        <p>
          Order #{pendingOrder.id} — status: {pendingOrder.status}
          {pendingOrder.status === "NEW" && " (processing...)"}
        </p>
      )}
    </form>
  );
}
