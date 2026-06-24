import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useOrders } from "../context/OrderContext";
import { usePayment } from "../context/PaymentContext";
import OrderSummary from "../components/OrderSummary";
import PaymentButton from "../components/PaymentButton";
import StatusCard from "../components/StatusCard";
import "../styles/payment.css";

function PaymentPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const navigate = useNavigate();

  const { orders, fetchOrders } = useOrders();
  const {
    paymentStatus,
    transactionDetails,
    setPaymentStatus,
    setTransactionDetails,
    resetPaymentState,
  } = usePayment();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset payment states on mount
    resetPaymentState();
    
    const loadOrder = async () => {
      setLoading(true);
      try {
        if (!orders || orders.length === 0) {
          await fetchOrders();
        }
      } catch (err) {
        console.error("Error pre-loading orders:", err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrder();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  // Find order in order list
  useEffect(() => {
    if (orders && orders.length > 0 && orderId) {
      const foundOrder = orders.find((o) => o._id === orderId);
      setOrder(foundOrder);
    }
  }, [orders, orderId]);

  const handlePaymentSuccess = (paymentRecord) => {
    setPaymentStatus("success");
    setTransactionDetails(paymentRecord);
  };

  const handlePaymentFailure = (errorMessage, paymentRecord) => {
    setPaymentStatus("failed");
    setTransactionDetails({
      ...paymentRecord,
      failureReason: errorMessage,
    });
  };

  const handlePaymentPending = () => {
    setPaymentStatus("pending");
  };

  const handleRetry = () => {
    resetPaymentState();
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="payment-module-container">
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div className="skeleton-row" style={{ width: "300px", height: "40px", marginBottom: "12px" }}></div>
          <div className="skeleton-row" style={{ width: "200px", height: "20px", marginBottom: "40px" }}></div>
          <div className="payment-grid">
            <div className="premium-card">
              <div className="skeleton-row" style={{ width: "100%", height: "250px" }}></div>
            </div>
            <div className="premium-card">
              <div className="skeleton-row" style={{ width: "100%", height: "350px" }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Empty State (Invalid Order ID)
  if (!orderId || (!order && !loading)) {
    return (
      <div className="payment-module-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="empty-state-card">
          <div className="empty-state-icon">⚠️</div>
          <h2 className="empty-state-title">Invalid Checkout Session</h2>
          <p className="empty-state-desc">
            No valid order reference was found for this payment session. Make sure you initiate payments from the checkout page.
          </p>
          <Link to="/store">
            <button className="btn-status-primary">Return to Store</button>
          </Link>
        </div>
      </div>
    );
  }

  // 3. Status Screens (Success / Failure / Pending Verification)
  if (paymentStatus !== "idle") {
    return (
      <div className="payment-module-container">
        <StatusCard status={paymentStatus} details={transactionDetails} onRetry={handleRetry} />
      </div>
    );
  }

  // 4. Standard Checkout Payment Interface
  return (
    <div className="payment-module-container">
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", marginBottom: "32px", gap: "16px" }}>
          <div>
            <h1 className="payment-title">Payment Checkout 💳</h1>
            <p className="payment-subtitle" style={{ margin: 0 }}>
              Complete your transaction securely via Razorpay
            </p>
          </div>
          <Link to="/cart" style={{ color: "#4f46e5", fontWeight: "600", textDecoration: "none", fontSize: "0.95rem" }}>
            &larr; Back to Shopping Cart
          </Link>
        </div>

        <div className="payment-grid">
          {/* Left Column: Razorpay Payment Button Card */}
          <div className="premium-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "12px" }}>Complete Payment</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "30px" }}>
                You are paying for the order initiated on <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>. Payments are processed through Razorpay's PCI-DSS compliant secure network. Your credentials are never stored.
              </p>

              <div style={{ background: "#f8fafc", borderRadius: "12px", border: "1px solid var(--border-color)", padding: "20px", marginBottom: "30px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: "500" }}>Deliver to:</span>
                  <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{order.customerDetails?.name}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: "500" }}>Address:</span>
                  <span style={{ color: "var(--text-main)", fontWeight: "600", textAlign: "right" }}>
                    {order.shippingAddress?.address}, {order.shippingAddress?.city}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: "500" }}>Selected Method:</span>
                  <span style={{ color: "#6366f1", fontWeight: "700" }}>{order.paymentMethod} (Razorpay)</span>
                </div>
              </div>
            </div>

            <div className="payment-section">
              <div className="payment-amount-display">
                <p className="payment-amount-label">Total Payment Amount</p>
                <h2 className="payment-amount-value">&#8377;{order.totalAmount}</h2>
              </div>

              <PaymentButton
                orderId={order._id}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
                onPending={handlePaymentPending}
              />

              <div className="payment-gateways-badges">
                <span className="gateway-tag">
                  <span className="secure-lock-icon">&#128274;</span> SSL 256-bit Encrypted Transaction
                </span>
                <div style={{ display: "flex", gap: "10px", marginTop: "6px", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>
                  <span>UPI</span> &bull; <span>CARDS</span> &bull; <span>NETBANKING</span> &bull; <span>WALLETS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <OrderSummary order={order} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
