import { useState } from "react";
import { useProducts } from "../context/ProductContext";
import { useCategories } from "../context/CategoryContext";
import { toast } from "react-toastify";
import ProductForm from "./ProductForm";
import "../styles/admin.css";

function ProductList() {
  const { products, deleteProduct, setEditingProduct } = useProducts();
  const { categories } = useCategories();

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Sorting States
  const [sortField, setSortField] = useState(""); // name, price, stock
  const [sortOrder, setSortOrder] = useState("asc");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToView, setProductToView] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // Reset page when filters change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Filter Logic
  const filteredProducts = products.filter((product) => {
    const nameMatch = product.name?.toLowerCase().includes(search.toLowerCase());
    
    // Support category populate object or string ref
    const catId = product.category?._id || product.category;
    const categoryMatch = selectedCategory === "All" || catId === selectedCategory;
    
    return nameMatch && categoryMatch;
  });

  // Sort Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortField) return 0;
    
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === "name") {
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
    } else {
      aVal = Number(aVal);
      bVal = Number(bVal);
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);

  // Bulk Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = paginatedProducts.map((p) => p._id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((rowId) => rowId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete all ${selectedIds.length} selected products?`
      )
    ) {
      try {
        for (const id of selectedIds) {
          await deleteProduct(id);
        }
        toast.success(`Successfully deleted ${selectedIds.length} products! 🗑️`);
        setSelectedIds([]);
        setCurrentPage(1);
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete selected products.");
      }
    }
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete._id);
        toast.success(`Deleted product: ${productToDelete.name} 🗑️`);
        setProductToDelete(null);
        // Adjust page if empty
        if (paginatedProducts.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete product.");
      }
    }
  };

  return (
    <div className="card" style={{ padding: "0", background: "transparent", border: "none", boxShadow: "none" }}>
      
      {/* Search, Filter, Sort, Add Action Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "12px", flexGrow: "1", maxWidth: "600px" }}>
          <div className="header-search" style={{ width: "100%" }}>
            <span className="header-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by product name..."
              value={search}
              onChange={handleSearchChange}
              style={{ background: "#ffffff" }}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="form-group"
            style={{ width: "200px", margin: 0, padding: "10px 14px", height: "auto" }}
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <button className="admin-btn primary" onClick={() => setIsFormOpen(true)}>
          <span>➕</span> Add Product
        </button>
      </div>

      {/* Main Products Table */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "40px" }}>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={paginatedProducts.length > 0 && selectedIds.length === paginatedProducts.length}
                />
              </th>
              <th>Image</th>
              <th onClick={() => handleSort("name")} className={`sort-header ${sortField === "name" ? "active-sort" : ""}`}>
                Product Name <span className="sort-icon">{sortField === "name" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}</span>
              </th>
              <th>Category</th>
              <th onClick={() => handleSort("price")} className={`sort-header ${sortField === "price" ? "active-sort" : ""}`}>
                Price <span className="sort-icon">{sortField === "price" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}</span>
              </th>
              <th onClick={() => handleSort("stock")} className={`sort-header ${sortField === "stock" ? "active-sort" : ""}`}>
                Stock <span className="sort-icon">{sortField === "stock" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}</span>
              </th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => {
                const productCatName = product.category?.name || "Uncategorized";
                const isSelected = selectedIds.includes(product._id);
                const isLowStock = product.stock < 10;
                
                // Get product status (fallback based on stock if missing)
                const productStatus = product.status || (product.stock > 0 ? "Active" : "Inactive");
                
                return (
                  <tr key={product._id} className={isSelected ? "selected-row" : ""}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(product._id)}
                      />
                    </td>
                    <td>
                      <img
                        src={product.image || `https://picsum.photos/100/100?random=${product._id}`}
                        alt={product.name}
                        className="table-product-img"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/100/e2e8f0/0f172a?text=Product";
                        }}
                      />
                    </td>
                    <td style={{ fontWeight: "700" }}>{product.name}</td>
                    <td style={{ color: "var(--admin-text-muted)", fontWeight: "600" }}>{productCatName}</td>
                    <td style={{ fontWeight: "800" }}>₹{product.price.toLocaleString()}</td>
                    <td>
                      <span style={{ 
                        fontWeight: "700", 
                        color: isLowStock ? "var(--admin-danger)" : "var(--admin-text)" 
                      }}>
                        {product.stock}
                      </span>
                      {isLowStock && (
                        <span style={{ fontSize: "0.7rem", color: "var(--admin-danger)", background: "var(--admin-danger-light)", padding: "2px 4px", borderRadius: "4px", marginLeft: "6px", fontWeight: "700" }}>
                          Low
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`admin-badge ${productStatus.toLowerCase() === "active" ? "active" : "inactive"}`}>
                        {productStatus}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn" title="View details" onClick={() => setProductToView(product)}>
                          👁️
                        </button>
                        <button className="action-btn edit" title="Edit product" onClick={() => { setEditingProduct(product); }}>
                          ✏️
                        </button>
                        <button className="action-btn delete" title="Delete product" onClick={() => setProductToDelete(product)}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ padding: "0" }}>
                  <div className="empty-state-card" style={{ border: "none" }}>
                    <div className="empty-state-icon">📦</div>
                    <h3 className="empty-state-title">No Inventory Items</h3>
                    <p className="empty-state-desc">No products matched the search term or category filter. Reset search to view all.</p>
                    {(search || selectedCategory !== "All") && (
                      <button className="admin-btn secondary" onClick={() => { setSearch(""); setSelectedCategory("All"); }}>
                        Reset Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <span className="pagination-info">
            Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, sortedProducts.length)}</strong> of <strong>{sortedProducts.length}</strong> products
          </span>

          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="page-btn"
            >
              &laquo; Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`page-btn ${currentPage === pageNum ? "active-page" : ""}`}
              >
                {pageNum}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="page-btn"
            >
              Next &raquo;
            </button>
          </div>
        </div>
      )}

      {/* Floating Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="batch-actions-bar">
          <span className="batch-text">📦 {selectedIds.length} items selected</span>
          <button className="batch-btn" onClick={handleBulkDelete}>
            Delete Selected
          </button>
          <button className="admin-btn secondary" style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => setSelectedIds([])}>
            Deselect All
          </button>
        </div>
      )}

      {/* 1. Add/Edit Product Modal Form */}
      <ProductForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />

      {/* 2. View Product Details Modal */}
      {productToView && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "560px", width: "100%" }}>
            <div className="modal-header">
              <h3 className="modal-title">🔍 Inventory Product Details</h3>
              <button className="modal-close" onClick={() => setProductToView(null)}>&times;</button>
            </div>
            
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", gap: "20px" }}>
                <img
                  src={productToView.image || `https://picsum.photos/200/200?random=${productToView._id}`}
                  alt={productToView.name}
                  style={{ width: "140px", height: "140px", objectFit: "contain", border: "1px solid var(--admin-border)", borderRadius: "8px", background: "#f8fafc" }}
                  onError={(e) => {
                    e.target.src = "https://placehold.co/200/e2e8f0/0f172a?text=Product";
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <h4 style={{ fontSize: "1.25rem", fontWeight: "800", margin: 0 }}>{productToView.name}</h4>
                  <span className="admin-badge active" style={{ width: "fit-content" }}>
                    {productToView.category?.name || "Uncategorized"}
                  </span>
                  <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#2563eb", marginTop: "8px" }}>
                    ₹{productToView.price.toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--admin-border)", paddingTop: "16px" }}>
                <h5 style={{ margin: "0 0 6px 0", fontSize: "0.8rem", color: "var(--admin-text-muted)", textTransform: "uppercase" }}>Stock Metrics</h5>
                <div style={{ display: "flex", gap: "24px" }}>
                  <div>
                    <span style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>Quantity Available: </span>
                    <strong style={{ fontSize: "1.1rem" }}>{productToView.stock} units</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>Status: </span>
                    <span className={`admin-badge ${ (productToView.status || "Active").toLowerCase() === "active" ? "active" : "inactive" }`}>
                      {productToView.status || "Active"}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--admin-border)", paddingTop: "16px" }}>
                <h5 style={{ margin: "0 0 6px 0", fontSize: "0.8rem", color: "var(--admin-text-muted)", textTransform: "uppercase" }}>Description</h5>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--admin-text)", lineHeight: "1.6" }}>
                  {productToView.description || "Discover the amazing features of this high-quality product, designed to provide exceptional performance, durability, and value for your everyday needs."}
                </p>
              </div>

              <div style={{ borderTop: "1px solid var(--admin-border)", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h5 style={{ margin: "0 0 4px 0", fontSize: "0.8rem", color: "var(--admin-text-muted)", textTransform: "uppercase" }}>Ratings</h5>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#f59e0b", fontSize: "1.1rem" }}>★</span>
                    <strong>{productToView.averageRating?.toFixed(1) || "0.0"}</strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)" }}>({productToView.totalReviews || 0} reviews)</span>
                  </div>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                  Last Updated: {new Date(productToView.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="admin-btn secondary" onClick={() => setProductToView(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Delete Confirmation Modal */}
      {productToDelete && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "400px", width: "100%", padding: "28px", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", color: "var(--admin-danger)", marginBottom: "16px" }}>⚠️</div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "8px" }}>Permanently Delete Product?</h3>
            <p style={{ color: "var(--admin-text-muted)", fontSize: "0.88rem", marginBottom: "28px", lineHeight: "1.5" }}>
              Are you sure you want to delete <strong>{productToDelete.name}</strong>? This action will permanently remove it from the store catalog.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="admin-btn secondary" onClick={() => setProductToDelete(null)}>Cancel</button>
              <button className="admin-btn danger" onClick={confirmDelete}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ProductList;
