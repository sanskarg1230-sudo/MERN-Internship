import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

function CheckoutPage() {
  const { cart } = useCart();

  const total = cart.reduce(
    (sum, item) =>
      sum +
      item.product.price * item.quantity,
    0
  );

  return (
    <div className="container">
      <div className="store-header">
        <h1>Checkout 💳</h1>

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

          <Link to="/wishlist">
            <button className="wishlist-nav-btn">
              Wishlist
            </button>
          </Link>

          <Link to="/cart">
            <button className="cart-nav-btn">
              Cart
            </button>
          </Link>
        </div>
      </div>

      <div className="card">
        {cart.map((item) => (
          <div
            key={item._id}
            className="checkout-item"
          >
            <span>
              {item.product.name}
            </span>

            <span>
              {item.quantity} × ₹
              {item.product.price}
            </span>
          </div>
        ))}

        <hr />

        <h2>Total: ₹{total}</h2>

        <button className="checkout-btn">
          Place Order
        </button>

        <Link to="/store">
          <button className="store-btn">
            Continue Shopping
          </button>
        </Link>
      </div>
    </div>
  );
}

export default CheckoutPage;