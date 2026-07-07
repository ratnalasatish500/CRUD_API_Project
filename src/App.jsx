import { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/products';

const emptyForm = {
  name: '',
  price: '',
  inStock: true
};

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const totalValue = useMemo(() => {
    return products.reduce((sum, product) => sum + Number(product.price || 0), 0);
  }, [products]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not load products');
      }

      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      name: form.name,
      price: Number(form.price),
      inStock: form.inStock
    };

    const url = editingId ? `${API_URL}/${editingId}` : API_URL;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        const validationMessage = data.errors?.[0]?.msg;
        throw new Error(validationMessage || data.message || 'Could not save product');
      }

      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      price: product.price,
      inStock: product.inStock
    });
  };

  const handleDelete = async (id) => {
    setError('');

    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not delete product');
      }

      if (editingId === id) {
        resetForm();
      }

      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="app-shell">
      <section className="header">
        <div>
          <p className="eyebrow">MERN CRUD</p>
          <h1>Product Manager</h1>
        </div>
        <div className="stats">
          <span>{products.length} products</span>
          <strong>${totalValue.toFixed(2)}</strong>
        </div>
      </section>

      <section className="content-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>
            {editingId && (
              <button className="ghost-button" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>

          <label>
            Product name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Laptop"
              required
            />
          </label>

          <label>
            Price
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              type="number"
              min="0.01"
              step="0.01"
              placeholder="999.99"
              required
            />
          </label>

          <label className="check-row">
            <input
              name="inStock"
              checked={form.inStock}
              onChange={handleChange}
              type="checkbox"
            />
            In stock
          </label>

          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
          </button>

          {error && <p className="error-message">{error}</p>}
        </form>

        <section className="panel list-panel">
          <div className="panel-heading">
            <h2>Products</h2>
            <button className="ghost-button" type="button" onClick={fetchProducts}>
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="muted">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="muted">No products yet. Add your first one.</p>
          ) : (
            <div className="product-list">
              {products.map((product) => (
                <article className="product-card" key={product._id}>
                  <div>
                    <h3>{product.name}</h3>
                    <p>${Number(product.price).toFixed(2)}</p>
                  </div>
                  <span className={product.inStock ? 'badge success' : 'badge'}>
                    {product.inStock ? 'In stock' : 'Out of stock'}
                  </span>
                  <div className="actions">
                    <button type="button" onClick={() => handleEdit(product)}>
                      Edit
                    </button>
                    <button type="button" className="danger" onClick={() => handleDelete(product._id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;

