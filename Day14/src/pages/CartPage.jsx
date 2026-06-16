import Cart from "../components/Cart";
import { Link } from "react-router-dom";

function CartPage() {
  return (
    <div className="container">
      <div className="store-header">
        <h1>Shopping Cart 🛒</h1>

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
        </div>
      </div>

      <Cart />
    </div>
  );
}

export default CartPage;