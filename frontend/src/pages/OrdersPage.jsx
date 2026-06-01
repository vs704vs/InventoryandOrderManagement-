import { useEffect, useState } from "react";
import { api } from "../api/client";

const initialItem = { product_id: "", quantity: "" };

export default function OrdersPage({ onDataChanged }) {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([initialItem]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const [ordersData, customersData, productsData] = await Promise.all([
        api.getOrders(),
        api.getCustomers(),
        api.getProducts(),
      ]);
      setOrders(ordersData);
      setCustomers(customersData);
      setProducts(productsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateItem(index, field, value) {
    setItems((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, initialItem]);
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function createOrder(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!customerId) {
      setError("Please select a customer");
      return;
    }

    const cleanedItems = items
      .map((item) => ({ product_id: Number(item.product_id), quantity: Number(item.quantity) }))
      .filter((item) => item.product_id > 0 && item.quantity > 0);

    if (cleanedItems.length === 0) {
      setError("Please add at least one valid order item");
      return;
    }

    try {
      await api.createOrder({ customer_id: Number(customerId), items: cleanedItems });
      setSuccess("Order created successfully");
      setCustomerId("");
      setItems([initialItem]);
      setSelectedOrder(null);
      await loadData();
      onDataChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  async function viewOrder(orderId) {
    setError("");
    try {
      const data = await api.getOrder(orderId);
      setSelectedOrder(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteOrder(orderId) {
    if (!window.confirm("Cancel this order? Stock will be restored.")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.deleteOrder(orderId);
      setSuccess("Order deleted successfully");
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
      await loadData();
      onDataChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="stack-lg">
      <form className="card form-grid" onSubmit={createOrder}>
        <h2>Create Order</h2>

        <label>
          Customer
          <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} required>
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.full_name} ({customer.email})
              </option>
            ))}
          </select>
        </label>

        <div className="stack-sm">
          <p className="subhead">Order Items</p>
          {items.map((item, index) => (
            <div key={index} className="row wrap">
              <select
                value={item.product_id}
                onChange={(event) => updateItem(index, "product_id", event.target.value)}
                required
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku}) - Stock: {product.quantity}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(event) => updateItem(index, "quantity", event.target.value)}
                required
              />

              {items.length > 1 ? (
                <button type="button" className="small danger" onClick={() => removeItem(index)}>
                  Remove
                </button>
              ) : null}
            </div>
          ))}
        </div>

        <div className="row">
          <button type="button" className="ghost" onClick={addItem}>
            Add Item
          </button>
          <button type="submit">Create Order</button>
        </div>

        {error ? <p className="alert error">{error}</p> : null}
        {success ? <p className="alert success">{success}</p> : null}
      </form>

      <section className="card">
        <h2>Order List</h2>
        {loading ? (
          <p className="hint">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="hint">No orders found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer_name}</td>
                    <td>${Number(order.total_amount).toFixed(2)}</td>
                    <td>{new Date(order.created_at).toLocaleString()}</td>
                    <td className="row compact">
                      <button type="button" className="small" onClick={() => viewOrder(order.id)}>
                        Details
                      </button>
                      <button type="button" className="small danger" onClick={() => deleteOrder(order.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedOrder ? (
        <section className="card">
          <h2>Order #{selectedOrder.id} Details</h2>
          <p>
            <strong>Customer:</strong> {selectedOrder.customer_name}
          </p>
          <p>
            <strong>Total:</strong> ${Number(selectedOrder.total_amount).toFixed(2)}
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>${Number(item.unit_price).toFixed(2)}</td>
                    <td>${Number(item.line_total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </section>
  );
}
