import { useState } from "react";
import CustomerList from "./components/CustomerList";
import ProductList from "./components/ProductList";
import CustomerForm from "./components/CustomerForm";
import ProductForm from "./components/ProductForm";
import OrderForm from "./components/OrderForm";
import OrderList from "./components/OrderList";
import "./App.css";

function App() {
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0);
  const [catalogRefreshKey, setCatalogRefreshKey] = useState(0);

  function handleOrderCreated() {
    setOrdersRefreshKey((k) => k + 1);
  }

  function handleCatalogChanged() {
    setCatalogRefreshKey((k) => k + 1);
  }

  return (
    <section id="center">
      <h1>Order Management</h1>

      <h2>New order</h2>
      <OrderForm onOrderCreated={handleOrderCreated} catalogRefreshKey={catalogRefreshKey} />

      <h2>Orders</h2>
      <OrderList refreshKey={ordersRefreshKey + catalogRefreshKey} />

      <h2>Customers</h2>
      <CustomerForm onCustomerCreated={handleCatalogChanged} />
      <CustomerList refreshKey={catalogRefreshKey} />

      <h2>Products</h2>
      <ProductForm onProductCreated={handleCatalogChanged} />
      <ProductList refreshKey={catalogRefreshKey} />
    </section>
  );
}

export default App;
