import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const initialForm = { name: "", sku: "", price: "", quantity: "" };

export default function ProductsPage({ onDataChanged }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const submitLabel = useMemo(() => (editingId ? "Update Product" : "Add Product"), [editingId]);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function onChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function validate() {
    if (!form.name || !form.sku || !form.price || form.quantity === "") {
      return "All product fields are required";
    }
    if (Number(form.price) <= 0) {
      return "Price must be greater than 0";
    }
    if (Number(form.quantity) < 0) {
      return "Quantity cannot be negative";
    }
    return "";
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
    };

    try {
      if (editingId) {
        await api.updateProduct(editingId, payload);
        setSuccess("Product updated successfully");
      } else {
        await api.createProduct(payload);
        setSuccess("Product created successfully");
      }
      resetForm();
      await loadProducts();
      onDataChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.deleteProduct(id);
      setSuccess("Product deleted successfully");
      await loadProducts();
      onDataChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  function onEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: product.quantity,
    });
  }

  return (
    <section className="stack-lg">
      <form className="card form-grid" onSubmit={onSubmit}>
        <h2>{editingId ? "Edit Product" : "Add Product"}</h2>
        <label>
          Name
          <input name="name" value={form.name} onChange={onChange} required />
        </label>
        <label>
          SKU
          <input name="sku" value={form.sku} onChange={onChange} required />
        </label>
        <label>
          Price
          <input name="price" type="number" step="0.01" value={form.price} onChange={onChange} required />
        </label>
        <label>
          Quantity
          <input name="quantity" type="number" value={form.quantity} onChange={onChange} required />
        </label>

        <div className="row">
          <button type="submit">{submitLabel}</button>
          {editingId ? (
            <button type="button" className="ghost" onClick={resetForm}>
              Cancel
            </button>
          ) : null}
        </div>

        {error ? <p className="alert error">{error}</p> : null}
        {success ? <p className="alert success">{success}</p> : null}
      </form>

      <section className="card">
        <h2>Product List</h2>
        {loading ? (
          <p className="hint">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="hint">No products found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>${Number(product.price).toFixed(2)}</td>
                    <td>{product.quantity}</td>
                    <td className="row compact">
                      <button type="button" className="small" onClick={() => onEdit(product)}>
                        Edit
                      </button>
                      <button type="button" className="small danger" onClick={() => onDelete(product.id)}>
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
