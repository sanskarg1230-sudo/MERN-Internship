import { createContext, useContext, useState } from "react";
import * as paymentService from "../services/paymentService";

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    successfulPayments: 0,
    failedPayments: 0,
    pendingPayments: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("idle"); // idle, pending, success, failed
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [error, setError] = useState(null);

  // Fetch all payment logs
  const fetchPaymentHistory = async (filters = {}) => {
    setHistoryLoading(true);
    setError(null);
    try {
      const data = await paymentService.getPaymentHistory(filters);
      setPaymentHistory(data);
      return { success: true, data };
    } catch (err) {
      console.error("Error fetching payment history:", err);
      setError(err.message || "Failed to load payment history");
      return { success: false, error: err };
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch payment stats
  const fetchPaymentStats = async () => {
    setStatsLoading(true);
    try {
      const data = await paymentService.getPaymentStats();
      setStats(data);
      return { success: true, data };
    } catch (err) {
      console.error("Error fetching payment stats:", err);
      return { success: false, error: err };
    } finally {
      setStatsLoading(false);
    }
  };

  // Create a Razorpay Order/Mock Order
  const initiatePaymentOrder = async (orderId) => {
    setLoading(true);
    setPaymentStatus("pending");
    setError(null);
    try {
      const response = await paymentService.createPaymentOrder(orderId);
      setLoading(false);
      return { success: true, ...response };
    } catch (err) {
      console.error("Error initiating payment order:", err);
      setPaymentStatus("failed");
      setError(err.message || "Failed to initiate payment");
      setLoading(false);
      return { success: false, error: err };
    }
  };

  // Verify signature and record the transaction
  const verifyPaymentTransaction = async (verificationData) => {
    setLoading(true);
    setPaymentStatus("pending");
    try {
      const response = await paymentService.verifyPayment(verificationData);
      if (response.success) {
        setPaymentStatus("success");
        setTransactionDetails(response.payment);
        return { success: true, payment: response.payment };
      } else {
        setPaymentStatus("failed");
        setTransactionDetails(response.payment);
        return { success: false, message: response.message, payment: response.payment };
      }
    } catch (err) {
      console.error("Error verifying payment transaction:", err);
      setPaymentStatus("failed");
      setError(err.message || "Payment verification failed");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const resetPaymentState = () => {
    setPaymentStatus("idle");
    setTransactionDetails(null);
    setActiveOrder(null);
    setError(null);
  };

  return (
    <PaymentContext.Provider
      value={{
        paymentHistory,
        stats,
        loading,
        historyLoading,
        statsLoading,
        activeOrder,
        paymentStatus,
        transactionDetails,
        error,
        setActiveOrder,
        setPaymentStatus,
        setTransactionDetails,
        fetchPaymentHistory,
        fetchPaymentStats,
        initiatePaymentOrder,
        verifyPaymentTransaction,
        resetPaymentState,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => useContext(PaymentContext);
