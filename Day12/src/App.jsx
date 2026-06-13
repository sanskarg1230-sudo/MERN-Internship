import "./App.css";

import { CategoryProvider } from "./context/CategoryContext";
import { ProductProvider } from "./context/ProductContext";

import StatsCards from "./components/StatsCards";
import CategoryForm from "./components/CategoryForm";
import CategoryList from "./components/CategoryList";
import ProductForm from "./components/ProductForm";
import ProductList from "./components/ProductList";

function App() {
  return (
    <CategoryProvider>
      <ProductProvider>
        <div className="container">
          <h1 className="title">
            Inventory Management System
          </h1>

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
      </ProductProvider>
    </CategoryProvider>
  );
}

export default App;