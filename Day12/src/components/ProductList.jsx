import { useState } from "react";
import { useProducts } from "../context/ProductContext";
import SearchFilter from "./SearchFilter";

function ProductList() {
  const { products, deleteProduct, setEditingProduct } = useProducts();
 

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [
    ...new Map(products.map((p) => [p.category?._id, p.category])).values(),
  ];

  const filteredProducts = products.filter((product) => {
    const searchMatch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const categoryMatch =
      category === "All" ? true : product.category?._id === category;

    return searchMatch && categoryMatch;
  });

  return (
    <div className="card">
      <SearchFilter
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        categories={categories}
      />

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <tr key={product._id}>
                <td>{product.name}</td>

                <td>{product.category?.name}</td>

                <td>₹{product.price}</td>

                <td>{product.stock}</td>

                <td>
                  {product.stock < 10 ? (
                    <span className="low-stock">Low Stock</span>
                  ) : (
                    <span className="in-stock">In Stock</span>
                  )}
                </td>

                <td>
                  <button
                    className="edit"
                    onClick={() => setEditingProduct(product)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete"
                    onClick={() => deleteProduct(product._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
                style={{
                  textAlign: "center",
                }}
              >
                No Products Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProductList;
