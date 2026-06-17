import Cart from "../components/Cart";
import "../App.css";

function CartPage() {
  return (
    <div className="container">
      <div className="store-header">
        <h1>Shopping Cart 🛒</h1>
        <p className="store-tagline">Review your items and proceed to secure checkout</p>
      </div>

      <Cart />
    </div>
  );
}

export default CartPage;