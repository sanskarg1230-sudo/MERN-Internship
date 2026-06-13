import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";

const ProductContext = createContext();

export const ProductProvider = ({
  children,
}) => {
  const [products, setProducts] =
    useState([]);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const API =
    "http://localhost:5000/api/products";

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API);
      setProducts(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const addProduct = async (product) => {
    try {
      const res = await axios.post(
        API,
        product
      );

      fetchProducts();
    } catch (error) {
      console.log(error);
    }
  };

  const updateProduct = async (
    id,
    product
  ) => {
    try {
      await axios.put(
        `${API}/${id}`,
        product
      );

      fetchProducts();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);

      fetchProducts();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        editingProduct,
        setEditingProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () =>
  useContext(ProductContext);