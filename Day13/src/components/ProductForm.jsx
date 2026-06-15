import {
  useState,
  useEffect,
} from "react";
import { useProducts } from "../context/ProductContext";
import { useCategories } from "../context/CategoryContext";

function ProductForm() {
  const {
    addProduct,
    updateProduct,
    editingProduct,
    setEditingProduct,
  } = useProducts();

  const { categories } =
    useCategories();

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
  });

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        price: editingProduct.price,
        stock: editingProduct.stock,
        category:
          editingProduct.category?._id,
      });
    }
  }, [editingProduct]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingProduct) {
      await updateProduct(
        editingProduct._id,
        form
      );

      setEditingProduct(null);
    } else {
      await addProduct(form);
    }

    setForm({
      name: "",
      price: "",
      stock: "",
      category: "",
    });
  };

  return (
    <>
      <h2>
        {editingProduct
          ? "Edit Product"
          : "Add Product"}
      </h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Product Name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />

        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) =>
            setForm({
              ...form,
              price: e.target.value,
            })
          }
        />

        <input
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={(e) =>
            setForm({
              ...form,
              stock: e.target.value,
            })
          }
        />

        <select
          value={form.category}
          onChange={(e) =>
            setForm({
              ...form,
              category: e.target.value,
            })
          }
        >
          <option value="">
            Select Category
          </option>

          {categories.map((cat) => (
            <option
              key={cat._id}
              value={cat._id}
            >
              {cat.name}
            </option>
          ))}
        </select>

        <button type="submit">
          {editingProduct
            ? "Update Product"
            : "Add Product"}
        </button>
      </form>
    </>
  );
}

export default ProductForm;