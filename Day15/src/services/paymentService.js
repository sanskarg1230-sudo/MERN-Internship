import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/payment";

export const createPaymentOrder = async (orderId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/create-order`, { orderId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const verifyPayment = async (verificationData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/verify`, verificationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPaymentHistory = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/history`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPaymentStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
