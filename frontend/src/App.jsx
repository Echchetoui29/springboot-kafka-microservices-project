import CustomerList from "./components/CustomerList";
import ProductList from "./components/ProductList";
import "./App.css";

function App() {
  return (
    <section id="center">
      <h1>Customers</h1>
      <CustomerList />

      <h1>Products</h1>
      <ProductList />
    </section>
  );
}

export default App;
