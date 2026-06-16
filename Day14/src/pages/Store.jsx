import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function Store() {
  const { products } = useProducts();

  const { addToCart } = useCart();

  const { addToWishlist } =
    useWishlist();

  return (
    <div className="container">
      <div className="store-header">
        <h1>Online Store</h1>

        <div className="nav-buttons">
          <Link to="/">
            <button className="store-btn">
              Dashboard
            </button>
          </Link>

          <Link to="/wishlist">
            <button className="wishlist-nav-btn">
              Wishlist
            </button>
          </Link>

          <Link to="/cart">
            <button className="cart-nav-btn">
              View Cart
            </button>
          </Link>
        </div>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <div
            className="product-card"
            key={product._id}
          >
            <img
              src={`https://picsum.photos/300/200?random=${product._id}`}
              alt={product.name}
              className="product-image"
            />

            <div className="product-content">
              <h3 className="product-name">
                {product.name}
              </h3>

              <p className="product-category">
                Category:{" "}
                {product.category?.name}
              </p>

              <p className="product-price">
                ₹{product.price}
              </p>

              <p className="product-stock">
                Stock: {product.stock}
              </p>

              <div className="product-actions">
                <button
                  className="add-cart-btn"
                  onClick={() => {
                    addToCart(
                      product._id
                    );

                    toast.success(
                      "Added to Cart 🛒"
                    );
                  }}
                >
                  Add To Cart
                </button>

                <button
                  className="wishlist-btn"
                  onClick={() => {
                    addToWishlist(
                      product._id
                    );

                    toast.success(
                      "Added to Wishlist ❤️"
                    );
                  }}
                >
                  Add To Wishlist
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Store;