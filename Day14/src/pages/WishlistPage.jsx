import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function WishlistPage() {
  const {
    wishlist,
    removeFromWishlist,
  } = useWishlist();

  const { addToCart } = useCart();

  return (
    <div className="wishlist-container">
      <div className="wishlist-nav">
        <h1 className="wishlist-title">
          My Wishlist ❤️
        </h1>

        <div className="nav-buttons">
          <Link to="/">
            <button className="store-btn">
              Dashboard
            </button>
          </Link>

          <Link to="/store">
            <button className="back-store-btn">
              Store
            </button>
          </Link>

          <Link to="/cart">
            <button className="cart-nav-btn">
              Cart
            </button>
          </Link>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <h2>❤️ Wishlist is Empty</h2>
          <p>Add products from the store.</p>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((item) => (
            <div
              key={item._id}
              className="wishlist-card"
            >
              <img
                src={`https://picsum.photos/300/200?random=${item.product._id}`}
                alt={item.product.name}
                className="wishlist-image"
              />

              <div className="wishlist-content">
                <h3 className="wishlist-name">
                  {item.product.name}
                </h3>

                <p className="wishlist-category">
                  Category:{" "}
                  {item.product.category?.name}
                </p>

                <p className="wishlist-price">
                  ₹{item.product.price}
                </p>

                <div className="wishlist-actions">
                  <button
                    className="move-cart-btn"
                    onClick={() => {
                      addToCart(
                        item.product._id
                      );

                      toast.success(
                        "Added to Cart 🛒"
                      );
                    }}
                  >
                    Move To Cart
                  </button>

                  <button
                    className="remove-wishlist-btn"
                    onClick={async () => {
                      await removeFromWishlist(
                        item._id
                      );

                      toast.error(
                        "Removed from Wishlist ❌"
                      );
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;