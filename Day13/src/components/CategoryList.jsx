import { useCategories } from "../context/CategoryContext";

function CategoryList() {
  const { categories, deleteCategory } =
    useCategories();

  return (
    <div>
      <h3>Categories</h3>

      {categories.map((cat) => (
        <div
          className="category-item"
          key={cat._id}
        >
          <span>{cat.name}</span>

          <button
            className="delete"
            onClick={() =>
              deleteCategory(cat._id)
            }
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default CategoryList;