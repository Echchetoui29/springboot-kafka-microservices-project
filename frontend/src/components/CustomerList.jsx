import { useEffect, useState } from "react";
import { getCustomers } from "../services/customersApi";

export default function CustomerList({ refreshKey }) {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomers()
      .then(setCustomers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <p>Loading customers...</p>;
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
        {customers.map((c) => (
          <tr key={c.id}>
            <td>{c.id}</td>
            <td>{c.name}</td>
            <td>{c.amountAvailable}</td>
            <td>{c.amountReserved}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
