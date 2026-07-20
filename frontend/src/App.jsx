import { useState } from 'react';
import CustomerList from './components/CustomerList';
import ProductList from './components/ProductList';
import CustomerForm from './components/CustomerForm';
import ProductForm from './components/ProductForm';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';
import './App.css';

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
      <header className="app-header">
        <h1>Order Management</h1>
      </header>

      <div className="row-split">
        <section className="card">
          <h4>Customers</h4>
          <CustomerForm onCustomerCreated={handleCatalogChanged} />
          <div className="list-wrap">
            <CustomerList refreshKey={catalogRefreshKey + ordersRefreshKey} />
          </div>
        </section>

        <section className="card">
          <h4>Products</h4>
          <ProductForm onProductCreated={handleCatalogChanged} />
          <div className="list-wrap">
            <ProductList refreshKey={catalogRefreshKey + ordersRefreshKey} />
          </div>
        </section>
      </div>

      <section className="card">
        <h4>New order</h4>
        <OrderForm onOrderCreated={handleOrderCreated} catalogRefreshKey={catalogRefreshKey} />
      </section>

      <section className="card">
        <h4>Orders</h4>
        <OrderList refreshKey={ordersRefreshKey + catalogRefreshKey} />
      </section>
    </section>
  );
}

export default App;
