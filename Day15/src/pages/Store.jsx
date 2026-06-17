import { useState, useEffect } from "react";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCategories } from "../context/CategoryContext";
import { toast } from "react-toastify";
import "../App.css";

function Store() {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { categories } = useCategories();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [currentMaxLimit, setCurrentMaxLimit] = useState(100000);

  // Calculate maximum price range based on actual products loaded
  useEffect(() => {
    if (products && products.length > 0) {
      const highestPrice = Math.max(...products.map((p) => p.price));
      setCurrentMaxLimit(highestPrice);
      setMaxPrice(highestPrice);
    }
  }, [products]);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === "All" || product.category?._id === category || product.category === category;
    const matchesPrice = product.price <= maxPrice;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="container">
      <div className="store-header">
        <h1>Online Store 🛍️</h1>
        <p className="store-tagline">Browse our curated collection of high-quality products</p>
      </div>

      <div className="store-layout">
        {/* Left Side - Filters */}
        <div className="card store-filters-sidebar">
          <h3>Filters</h3>

          <div className="filter-group">
            <label>Search Product</label>
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="store-search-input"
            />
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="store-filter-select"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="price-label-row">
              <span>Price Limit</span>
              <strong>₹{maxPrice}</strong>
            </label>
            <input
              type="range"
              min="0"
              max={currentMaxLimit}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="price-range-slider"
            />
            <div className="slider-limits">
              <span>₹0</span>
              <span>₹{currentMaxLimit}</span>
            </div>
          </div>

          <button
            className="clear-filters-btn"
            onClick={() => {
              setSearch("");
              setCategory("All");
              setMaxPrice(currentMaxLimit);
            }}
          >
            Clear Filters
          </button>
        </div>

        {/* Right Side - Product Grid */}
        <div className="store-products-content">
          <div className="results-info-row">
            <span>Showing {filteredProducts.length} of {products.length} products</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="card no-results-card">
              <h3>No products found</h3>
              <p>Try clearing or modifying your filter values.</p>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <div className="product-card" key={product._id}>
                  <img
                    src={`https://picsum.photos/300/220?random=${product._id}`}
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/300x220?text=Product";
                    }}
                  />

                  <div className="product-content">
                    <h3 className="product-name">{product.name}</h3>

                    <p className="product-category">
                      Category: {product.category?.name || "Uncategorized"}
                    </p>

                    <p className="product-price">₹{product.price}</p>

                    <p className={`product-stock ${product.stock <= 5 ? "low" : ""}`}>
                      {product.stock === 0 ? "Out of Stock" : `Stock: ${product.stock}`}
                    </p>

                    <div className="product-actions">
                      <button
                        className="add-cart-btn"
                        disabled={product.stock === 0}
                        onClick={() => {
                          addToCart(product._id);
                          toast.success("Added to Cart 🛒");
                        }}
                      >
                        {product.stock === 0 ? "Out of Stock" : "Add To Cart"}
                      </button>

                      <button
                        className="wishlist-btn"
                        onClick={() => {
                          addToWishlist(product._id);
                          toast.success("Added to Wishlist ❤️");
                        }}
                      >
                        Add To Wishlist
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Store;