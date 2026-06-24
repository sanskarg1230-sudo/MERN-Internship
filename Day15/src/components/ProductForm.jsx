import { useState, useEffect } from "react";
import { useProducts } from "../context/ProductContext";
import { useCategories } from "../context/CategoryContext";
import { toast } from "react-toastify";
import "../styles/admin.css";

function ProductForm({ isOpen, onClose }) {
  const {
    addProduct,
    updateProduct,
    editingProduct,
    setEditingProduct,
  } = useProducts();

  const { categories } = useCategories();

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    image: "",
    status: "Active",
  });

  // Sync with editing product when clicked
  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name || "",
        price: editingProduct.price || "",
        stock: editingProduct.stock || "",
        category: editingProduct.category?._id || editingProduct.category || "",
        description: editingProduct.description || "",
        image: editingProduct.image || "",
        status: editingProduct.status || "Active",
      });
    } else {
      handleReset();
    }
  }, [editingProduct, isOpen]);

  const handleReset = () => {
    setForm({
      name: "",
      price: "",
      stock: "",
      category: "",
      description: "",
      image: "",
      status: "Active",
    });
  };

  const handleLocalClose = () => {
    setEditingProduct(null);
    handleReset();
    onClose && onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.stock || !form.category) {
      toast.warn("Please fill in all required fields (Name, Price, Stock, Category).");
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, form);
        toast.success("Product updated successfully! 📦");
      } else {
        await addProduct(form);
        toast.success("New product added to inventory! 📦");
      }
      handleLocalClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product.");
    }
  };

  const isModalOpen = isOpen || !!editingProduct;

  if (!isModalOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "640px", width: "100%" }}>
        <div className="modal-header">
          <h3 className="modal-title">
            {editingProduct ? "✏️ Edit Product Details" : "📦 Add New Product"}
          </h3>
          <button className="modal-close" onClick={handleLocalClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label>Product Name <span style={{ color: "var(--admin-danger)" }}>*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Logitech G-Pro X Superlight"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category <span style={{ color: "var(--admin-danger)" }}>*</span></label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Price (₹) <span style={{ color: "var(--admin-danger)" }}>*</span></label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 12450"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Stock Quantity <span style={{ color: "var(--admin-danger)" }}>*</span></label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 24"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label>Product Image URL</label>
                <input
                  type="text"
                  placeholder="e.g. https://images.unsplash.com/..."
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid-2" style={{ alignItems: "center" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Description</label>
                <textarea
                  placeholder="Describe the product details, warranty, and features..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows="4"
                  style={{ resize: "none" }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Image Live Preview</label>
                <div className="image-preview-box">
                  {form.image ? (
                    <img
                      src={form.image}
                      alt="Live Preview"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/600x400/e2e8f0/0f172a?text=Invalid+Image+URL";
                      }}
                    />
                  ) : (
                    <div style={{ color: "var(--admin-text-muted)", fontSize: "0.8rem", textAlign: "center" }}>
                      No Image URL Provided<br />
                      (Displays fallback thumbnail)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="admin-btn secondary" onClick={handleReset} style={{ marginRight: "auto" }}>
              Reset Fields
            </button>
            <button type="button" className="admin-btn secondary" onClick={handleLocalClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn primary">
              {editingProduct ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;