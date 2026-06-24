import React, { useState } from "react";
import { usePayment } from "../context/PaymentContext";
import { toast } from "react-toastify";
import "../styles/payment.css";

// Helper to load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function PaymentButton({ orderId, onSuccess, onFailure, onPending }) {
  const { initiatePaymentOrder, verifyPaymentTransaction } = usePayment();
  const [btnLoading, setBtnLoading] = useState(false);
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockPaymentData, setMockPaymentData] = useState(null);

  const handlePayment = async () => {
    setBtnLoading(true);
    onPending && onPending();

    try {
      // 1. Initiate order creation on backend
      const res = await initiatePaymentOrder(orderId);
      if (!res.success) {
        toast.error(res.error?.message || "Failed to initiate payment");
        onFailure && onFailure("Initialization failed");
        setBtnLoading(false);
        return;
      }

      // 2. Check if we should use the Mock flow
      if (res.isMock) {
        toast.info("Running in Mock Mode. Showing simulated payment options.");
        setMockPaymentData(res);
        setShowMockModal(true);
        setBtnLoading(false);
        return;
      }

      // 3. Load script and open real Razorpay Checkout
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Failed to load Razorpay SDK. Check your internet connection.");
        onFailure && onFailure("SDK failed to load");
        setBtnLoading(false);
        return;
      }

      const options = {
        key: res.key,
        amount: res.order.amount,
        currency: res.order.currency,
        name: "InstaDot Shop",
        description: "Payment for Order Checkout",
        order_id: res.order.id,
        prefill: {
          name: res.orderDetail.customer?.name || "",
          email: res.orderDetail.customer?.email || "",
          contact: res.orderDetail.customer?.phone || "",
        },
        theme: {
          color: "#4f46e5",
        },
        handler: async function (response) {
          try {
            // Verify payment on the server
            const verifyRes = await verifyPaymentTransaction({
              orderId: res.orderDetail.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              toast.success("Payment Received Successfully!");
              onSuccess && onSuccess(verifyRes.payment);
            } else {
              toast.error(verifyRes.message || "Payment Verification Failed!");
              onFailure && onFailure(verifyRes.message || "Verification Failed", verifyRes.payment);
            }
          } catch (err) {
            toast.error("Error during payment verification!");
            onFailure && onFailure(err.message || "Verification Exception");
          }
        },
        modal: {
          ondismiss: async function () {
            toast.warn("Payment checkout closed.");
            onPending && onPending();
            try {
              const cancelTxId = `pay_cancel_${Math.random().toString(36).substr(2, 9)}`;
              const verifyRes = await verifyPaymentTransaction({
                orderId: res.orderDetail.id,
                razorpay_order_id: res.order.id,
                razorpay_payment_id: cancelTxId,
                razorpay_signature: "mock_signature_cancelled",
                paymentMethod: "Razorpay",
                status: "Failed",
                failureReason: "Payment cancelled by user"
              });
              onFailure && onFailure("Payment cancelled by user", verifyRes.payment);
            } catch (err) {
              onFailure && onFailure("Payment cancelled by user");
            }
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);
      
      rzpInstance.on("payment.failed", async function (response) {
        toast.error(`Payment Failed: ${response.error.description}`);
        onPending && onPending();
        try {
          const verifyRes = await verifyPaymentTransaction({
            orderId: res.orderDetail.id,
            razorpay_order_id: res.order.id,
            razorpay_payment_id: response.error.metadata?.payment_id || `pay_failed_${Math.random().toString(36).substr(2, 9)}`,
            razorpay_signature: "payment_failed_signature",
            paymentMethod: "Razorpay",
            status: "Failed",
            failureReason: response.error.description || "Gateway payment failed"
          });
          onFailure && onFailure(response.error.description, verifyRes.payment);
        } catch (err) {
          onFailure && onFailure(response.error.description);
        }
      });

      rzpInstance.open();
      setBtnLoading(false);
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error("An unexpected error occurred during payment.");
      onFailure && onFailure(error.message || "Unknown error");
      setBtnLoading(false);
    }
  };

  // Simulated Mock Verification triggers
  const handleMockStatus = async (status) => {
    setShowMockModal(false);
    onPending && onPending();
    
    const mockTxId = `pay_mock_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const verifyRes = await verifyPaymentTransaction({
        orderId: mockPaymentData.orderDetail.id,
        razorpay_order_id: mockPaymentData.order.id,
        razorpay_payment_id: mockTxId,
        razorpay_signature: "mock_signature_valid",
        paymentMethod: "UPI (Mock)",
        status: status, // Success or Failed
        failureReason: status === "Failed" ? "Insufficent Funds in Bank Account (Simulated)" : undefined
      });

      if (verifyRes.success && status === "Success") {
        toast.success("Mock Payment Successful! 🎉");
        onSuccess && onSuccess(verifyRes.payment);
      } else {
        toast.error("Mock Payment Failed / Declined! ❌");
        onFailure && onFailure(verifyRes.message || "Payment rejected by bank", verifyRes.payment);
      }
    } catch (err) {
      console.error("Mock verification error:", err);
      onFailure && onFailure("Mock Verification Exception");
    }
  };

  return (
    <>
      <button
        onClick={handlePayment}
        disabled={btnLoading}
        className="pay-now-btn"
      >
        {btnLoading ? (
          <>
            <span className="secure-lock-icon">&#128274;</span>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span className="secure-lock-icon">&#128274;</span>
            <span>Pay Now Securely</span>
          </>
        )}
      </button>

      {/* Mock Payment Gateway Dialog */}
      {showMockModal && mockPaymentData && (
        <div className="modal-overlay" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className="modal-content" style={{ maxWidth: "450px", width: "100%", padding: "30px", borderRadius: "16px", background: "white", textAlign: "center", boxShadow: "var(--shadow-xl)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>💳</div>
            <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "6px" }}>Mock Razorpay Gateway</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "20px" }}>
              Since no Razorpay credentials were found in the backend environment, you can simulate a successful or failed checkout transaction.
            </p>
            
            <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid var(--border-color)", marginBottom: "24px", textAlign: "left", fontSize: "0.9rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "var(--text-muted)" }}>Order ID:</span>
                <strong style={{ color: "var(--text-main)" }}>#{mockPaymentData.orderDetail.id.substring(mockPaymentData.orderDetail.id.length - 8).toUpperCase()}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "var(--text-muted)" }}>Customer:</span>
                <strong style={{ color: "var(--text-main)" }}>{mockPaymentData.orderDetail.customer?.name}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Amount Due:</span>
                <strong style={{ color: "#6366f1", fontSize: "1.1rem" }}>&#8377;{mockPaymentData.orderDetail.amount}</strong>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                className="btn-status-primary"
                style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)" }}
                onClick={() => handleMockStatus("Success")}
              >
                Simulate Successful Payment
              </button>
              <button
                className="btn-status-primary"
                style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)" }}
                onClick={() => handleMockStatus("Failed")}
              >
                Simulate Failed Payment
              </button>
              <button
                className="btn-status-secondary"
                onClick={async () => {
                  setShowMockModal(false);
                  onPending && onPending();
                  try {
                    const cancelTxId = `pay_cancel_${Math.random().toString(36).substr(2, 9)}`;
                    const verifyRes = await verifyPaymentTransaction({
                      orderId: mockPaymentData.orderDetail.id,
                      razorpay_order_id: mockPaymentData.order.id,
                      razorpay_payment_id: cancelTxId,
                      razorpay_signature: "mock_signature_cancelled",
                      paymentMethod: "UPI (Mock)",
                      status: "Failed",
                      failureReason: "Payment cancelled by user"
                    });
                    onFailure && onFailure("Payment cancelled by user", verifyRes.payment);
                  } catch (err) {
                    onFailure && onFailure("Payment cancelled by user");
                  }
                }}
              >
                Cancel Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PaymentButton;
