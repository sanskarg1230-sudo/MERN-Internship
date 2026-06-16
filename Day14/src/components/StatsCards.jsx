import { useProducts } from "../context/ProductContext";

function StatsCards() {
  const { products } = useProducts();

  return (
    <div className="stats">
      <div className="stat-card">
        <h2>{products.length}</h2>
        <p>Total Products</p>
      </div>

      <div className="stat-card">
        <h2>
          {
            new Set(
              products.map(
                (p) => p.category
              )
            ).size
          }
        </h2>
        <p>Categories</p>
      </div>

      <div className="stat-card">
        <h2>
          {
            products.filter(
              (p) => p.stock < 10
            ).length
          }
        </h2>
        <p>Low Stock</p>
      </div>
    </div>
  );
}

export default StatsCards;