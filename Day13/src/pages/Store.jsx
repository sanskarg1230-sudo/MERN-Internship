import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

function Store() {
  const { products } = useProducts();
  const { addToCart } = useCart();

  return (
    <div className="container">
      <div className="store-header">
        <h1>Online Store</h1>

        <div className="nav-buttons">
          <Link to="/">
            <button className="store-btn">Dashboard</button>
          </Link>

          <Link to="/cart">
            <button className="cart-nav-btn">View Cart</button>
          </Link>
        </div>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product._id}>
            <img
              src={`https://picsum.photos/300/200?random=${product._id}`}
              alt={product.name}
              className="product-image"
            />

            <div className="product-content">
              <h3 className="product-name">{product.name}</h3>

              <p className="product-category">
                Category: {product.category?.name}
              </p>

              <p className="product-price">₹{product.price}</p>

              <p className="product-stock">Stock: {product.stock}</p>

              <button
                className="add-cart-btn"
                onClick={() => addToCart(product._id)}
              >
                Add To Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Store;
