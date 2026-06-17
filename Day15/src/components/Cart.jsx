import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

function Cart() {
  const { cart, updateQuantity, removeFromCart } = useCart();

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <div className="card cart-container">
      <h2>Shopping Cart</h2>

      {cart.length === 0 ? (
        <div className="empty-cart">Cart is Empty</div>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item._id} className="cart-item">
              <div className="cart-info">
                <h4>{item.product.name}</h4>
                <p>₹{item.product.price}</p>
              </div>

              <div className="cart-controls">
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                >
                  -
                </button>

                <span>{item.quantity}</span>

                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              <button
                className="delete"
                onClick={() => removeFromCart(item._id)}
              >
                Remove
              </button>
            </div>
          ))}

          <div className="cart-total">
            <h3>Total: ₹{total}</h3>

            <Link to="/checkout">
              <button className="checkout-btn">Checkout</button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
