import { Link } from "react-router-dom";

import StatsCards from "../components/StatsCards";
import CategoryForm from "../components/CategoryForm";
import CategoryList from "../components/CategoryList";
import ProductForm from "../components/ProductForm";
import ProductList from "../components/ProductList";

function Dashboard() {
  return (
    <div className="container">
      <h1 className="title">
        Inventory Management System
      </h1>

      <div className="nav-buttons" style={{ justifyContent: "center", marginBottom: "30px" }}>
        <Link to="/store">
          <button className="store-btn">
            Open Store 🛒
          </button>
        </Link>
        <Link to="/orders">
          <button className="wishlist-nav-btn">
            My Orders 📦
          </button>
        </Link>
        <Link to="/admin/orders">
          <button className="cart-nav-btn" style={{ background: "#2563eb" }}>
            Manage Orders 🛡️
          </button>
        </Link>
      </div>

      <StatsCards />

      <div className="top-section">
        <div className="card" id="categories">
          <CategoryForm />
          <CategoryList />
        </div>

        <div className="card" id="products">
          <ProductForm />
        </div>
      </div>

      <div className="card">
        <ProductList />
      </div>
    </div>
  );
}

export default Dashboard;