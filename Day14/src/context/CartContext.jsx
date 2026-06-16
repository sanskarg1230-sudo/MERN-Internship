import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";

const CartContext = createContext();

export const CartProvider = ({
  children,
}) => {
  const [cart, setCart] = useState([]);

  const API =
    "http://localhost:5000/api/cart";

  const fetchCart = async () => {
    const res = await axios.get(API);

    setCart(res.data);
  };

  const addToCart = async (
    productId
  ) => {
    await axios.post(API, {
      product: productId,
    });

    fetchCart();
  };

  const updateQuantity = async (
    id,
    quantity
  ) => {
    await axios.put(`${API}/${id}`, {
      quantity,
    });

    fetchCart();
  };

  const removeFromCart = async (
    id
  ) => {
    await axios.delete(
      `${API}/${id}`
    );

    fetchCart();
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () =>
  useContext(CartContext);