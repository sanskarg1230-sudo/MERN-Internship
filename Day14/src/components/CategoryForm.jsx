import { useState } from "react";
import { useCategories } from "../context/CategoryContext";

function CategoryForm() {
  const [name, setName] = useState("");

  const { addCategory } = useCategories();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    addCategory({ name });

    setName("");
  };

  return (
    <>
      <h2>Category Management</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Category Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <button>Add Category</button>
      </form>
    </>
  );
}

export default CategoryForm;