import { useEffect, useState } from "react";
import { getCustomers } from "../services/customersApi";
import { getProducts } from "../services/productsApi";
import { createOrder, getOrder } from "../services/ordersApi";
import { useToast } from "./ToastProvider";
import Select from "./Select";

const POLL_INTERVAL_MS = 1500;
const POLL_MAX_ATTEMPTS = 20;

const BADGE_CLASS = {
  NEW: "badge-new",
  CONFIRMED: "badge-confirmed",
  REJECTED: "badge-rejected",
  ROLLBACK: "badge-rollback",
};

export default function OrderForm({ onOrderCreated, catalogRefreshKey }) {
  const showToast = useToast();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [productCount, setProductCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);

  useEffect(() => {
    getCustomers().then(setCustomers).catch((e) => showToast(`Failed to load customers: ${e.message}`));
    getProducts().then(setProducts).catch((e) => showToast(`Failed to load products: ${e.message}`));
  }, [showToast, catalogRefreshKey]);

  const selectedProduct = products.find((p) => String(p.id) === String(productId));
  const totalPrice = selectedProduct ? selectedProduct.price * Number(productCount || 0) : 0;

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
    if (!customerId || !productId) {
      showToast("Select a customer and a product first");
      return;
    }
    setPendingOrder(null);
    setSubmitting(true);
    try {
      const order = await createOrder({
        customerId: Number(customerId),
        productId: Number(productId),
        productCount: Number(productCount),
        price: totalPrice,
        status: "NEW",
      });
      setPendingOrder(order);
      onOrderCreated?.(order);
      setProductCount(1);
      pollUntilFinal(order.id);
    } catch (e) {
      showToast(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
    <form onSubmit={handleSubmit}>
      <label>
        Customer
        <Select
          value={customerId}
          onChange={setCustomerId}
          placeholder="Select a customer"
          options={customers.map((c) => ({
            value: c.id,
            label: `${c.name} (available: ${c.amountAvailable})`,
          }))}
        />
      </label>
 
      <label>
        Product
        <Select
          value={productId}
          onChange={setProductId}
          placeholder="Select a product"
          options={products.map((p) => ({
            value: p.id,
            label: `${p.name} (unit price: ${p.price}, stock: ${p.availableItems})`,
          }))}
        />
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

      <button type="submit" disabled={submitting}>
        {submitting ? "Creating..." : "Create order"}
      </button>
    </form>

    {pendingOrder && (
      <p className="muted list-wrap">
        Order #{pendingOrder.id} —{" "}
        <span className={`badge ${BADGE_CLASS[pendingOrder.status] ?? "badge-new"}`}>
          {pendingOrder.status}
        </span>
        {pendingOrder.status === "NEW" && " (processing...)"}
      </p>
    )}
    </>
  );
}
