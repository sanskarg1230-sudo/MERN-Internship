import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";

const CategoryContext = createContext();

export const CategoryProvider = ({
  children,
}) => {
  const [categories, setCategories] =
    useState([]);

  const API =
    "http://localhost:5000/api/categories";

  const fetchCategories = async () => {
    try {
      const res = await axios.get(API);
      setCategories(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const addCategory = async (category) => {
    try {
      const res = await axios.post(
        API,
        category
      );

      setCategories([
        ...categories,
        res.data,
      ]);
    } catch (error) {
      console.log(error);
    }
  };

  const updateCategory = async (
    id,
    category
  ) => {
    try {
      const res = await axios.put(
        `${API}/${id}`,
        category
      );

      setCategories(
        categories.map((cat) =>
          cat._id === id ? res.data : cat
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);

      setCategories(
        categories.filter(
          (cat) => cat._id !== id
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () =>
  useContext(CategoryContext);