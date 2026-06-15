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

      <Link to="/store">
        <button className="store-btn">
          Open Store
        </button>
      </Link>

      <StatsCards />

      <div className="top-section">
        <div className="card">
          <CategoryForm />
          <CategoryList />
        </div>

        <div className="card">
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