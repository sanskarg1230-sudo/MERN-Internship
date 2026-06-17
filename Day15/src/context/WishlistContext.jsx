import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "./AuthContext";

const WishlistContext =
  createContext();

export const WishlistProvider = ({
  children,
}) => {
  const [wishlist, setWishlist] =
    useState([]);
  const { token } = useAuth();

  const API =
    "http://localhost:5000/api/wishlist";

  const fetchWishlist =
    async () => {
      const res =
        await axios.get(API);

      setWishlist(res.data);
    };

  const addToWishlist =
    async (productId) => {
      const res =
        await axios.post(API, {
          product: productId,
        });

      setWishlist([
        ...wishlist,
        res.data,
      ]);
    };

 const removeFromWishlist = async (
  id
) => {
  await axios.delete(
    `${API}/${id}`
  );

  setWishlist(
    wishlist.filter(
      (item) => item._id !== id
    )
  );

  toast.error(
    "Removed from Wishlist ❌"
  );
};

  useEffect(() => {
    if (token) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [token]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () =>
  useContext(WishlistContext);