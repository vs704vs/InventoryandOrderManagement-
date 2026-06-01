import { useEffect, useState } from "react";
import { api } from "../api/client";

function StatCard({ label, value }) {
  return (
    <article className="card stat-card">
      <p>{label}</p>
      <h3>{value}</h3>
    </article>
  );
}

export default function DashboardPage({ refreshToken }) {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await api.getDashboard();
        setSummary(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [refreshToken]);

  if (loading) {
    return <p className="hint">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="alert error">{error}</p>;
  }

  return (
    <section className="stack-lg">
      <div className="grid stats-grid">
        <StatCard label="Total Products" value={summary.total_products} />
        <StatCard label="Total Customers" value={summary.total_customers} />
        <StatCard label="Total Orders" value={summary.total_orders} />
      </div>

      <section className="card">
        <h2>Low Stock Products</h2>
        {summary.low_stock_products.length === 0 ? (
          <p className="hint">No low stock products right now.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {summary.low_stock_products.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.sku}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
