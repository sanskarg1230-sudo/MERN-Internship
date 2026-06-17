import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const API = "http://localhost:5000/api/orders";

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API);
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async (orderData) => {
    try {
      const res = await axios.post(API, orderData);
      await fetchOrders();
      return { success: true, order: res.data };
    } catch (error) {
      console.error("Error placing order:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to place order",
      };
    }
  };

  const cancelOrder = async (id) => {
    try {
      const res = await axios.put(`${API}/${id}/cancel`);
      setOrders((prev) =>
        prev.map((order) => (order._id === id ? res.data : order))
      );
      return { success: true };
    } catch (error) {
      console.error("Error cancelling order:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to cancel order",
      };
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const res = await axios.put(`${API}/${id}/status`, { status });
      setOrders((prev) =>
        prev.map((order) => (order._id === id ? res.data : order))
      );
      return { success: true };
    } catch (error) {
      console.error("Error updating order status:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update status",
      };
    }
  };

  const deleteOrder = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);
      setOrders((prev) => prev.filter((order) => order._id !== id));
      return { success: true };
    } catch (error) {
      console.error("Error deleting order:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete order",
      };
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [token]);

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        fetchOrders,
        placeOrder,
        cancelOrder,
        updateOrderStatus,
        deleteOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
