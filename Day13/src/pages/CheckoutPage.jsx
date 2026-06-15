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
      <div className="card">
        <h1>Checkout</h1>

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