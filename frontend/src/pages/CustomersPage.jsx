import { useEffect, useState } from "react";
import { api } from "../api/client";

const initialForm = { full_name: "", email: "", phone: "" };

export default function CustomersPage({ onDataChanged }) {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadCustomers() {
    setLoading(true);
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function onChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.full_name || !form.email || !form.phone) {
      setError("All customer fields are required");
      return;
    }

    try {
      await api.createCustomer({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      setForm(initialForm);
      setSuccess("Customer added successfully");
      await loadCustomers();
      onDataChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Delete this customer?")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.deleteCustomer(id);
      setSuccess("Customer deleted successfully");
      await loadCustomers();
      onDataChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="stack-lg">
      <form className="card form-grid" onSubmit={onSubmit}>
        <h2>Add Customer</h2>
        <label>
          Full Name
          <input name="full_name" value={form.full_name} onChange={onChange} required />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={onChange} required />
        </label>
        <label>
          Phone
          <input name="phone" value={form.phone} onChange={onChange} required />
        </label>

        <button type="submit">Add Customer</button>

        {error ? <p className="alert error">{error}</p> : null}
        {success ? <p className="alert success">{success}</p> : null}
      </form>

      <section className="card">
        <h2>Customer List</h2>
        {loading ? (
          <p className="hint">Loading customers...</p>
        ) : customers.length === 0 ? (
          <p className="hint">No customers found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.full_name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td>
                      <button type="button" className="small danger" onClick={() => onDelete(customer.id)}>
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
    </section>
  );
}
