import React from "react";
import { Link } from "react-router-dom";
import "../styles/payment.css";

function StatusCard({ status, details, onRetry }) {
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleString();
    return new Date(dateString).toLocaleString();
  };

  if (status === "pending") {
    return (
      <div className="status-card-overlay">
        <div className="premium-card status-card">
          <div className="status-icon-box">
            <div className="pending-pulse-loader"></div>
          </div>
          <h2 className="status-title pending">Verifying Payment</h2>
          <p className="status-message">
            We are securely processing your transaction. Please do not refresh the page or click back.
          </p>
          <div className="status-details-table">
            <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
              Checking payment signature with Razorpay...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="status-card-overlay">
        <div className="premium-card status-card">
          <div className="status-icon-box">
            <svg className="success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="25" />
              <path d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
          <h2 className="status-title success">Payment Successful!</h2>
          <p className="status-message">
            Thank you! Your transaction was completed successfully and your order is being processed.
          </p>

          <div className="status-details-table">
            <div className="status-details-row">
              <span className="status-details-label">Transaction ID</span>
              <span className="status-details-value" style={{ color: "#6366f1" }}>
                {details?.transactionId}
              </span>
            </div>
            <div className="status-details-row">
              <span className="status-details-label">Order ID</span>
              <span className="status-details-value">
                #{details?.orderId?._id || details?.orderId}
              </span>
            </div>
            <div className="status-details-row">
              <span className="status-details-label">Amount Paid</span>
              <span className="status-details-value" style={{ color: "#10b981" }}>
                &#8377;{details?.amount}
              </span>
            </div>
            <div className="status-details-row">
              <span className="status-details-label">Payment Method</span>
              <span className="status-details-value">{details?.paymentMethod}</span>
            </div>
            <div className="status-details-row">
              <span className="status-details-label">Date &amp; Time</span>
              <span className="status-details-value">{formatDate(details?.createdAt)}</span>
            </div>
          </div>

          <div className="status-action-btns">
            <Link to="/store">
              <button className="btn-status-primary">Continue Shopping</button>
            </Link>
            <Link to="/orders">
              <button className="btn-status-secondary">View My Orders</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="status-card-overlay">
        <div className="premium-card status-card">
          <div className="status-icon-box">
            <svg className="failure-cross" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="25" />
              <path d="M16 16l20 20M36 16L16 36" />
            </svg>
          </div>
          <h2 className="status-title failed">Payment Failed</h2>
          <p className="status-message">
            Oops! Something went wrong with your transaction. Your payment could not be processed.
          </p>

          <div className="status-details-table">
            <div className="status-details-row">
              <span className="status-details-label">Reason for Failure</span>
              <span className="status-details-value" style={{ color: "var(--danger-color)" }}>
                {details?.failureReason || "Transaction declined by card network / bank."}
              </span>
            </div>
            {details?.transactionId && (
              <div className="status-details-row">
                <span className="status-details-label">Reference ID</span>
                <span className="status-details-value">{details?.transactionId}</span>
              </div>
            )}
            <div className="status-details-row">
              <span className="status-details-label">Amount Tried</span>
              <span className="status-details-value">&#8377;{details?.amount}</span>
            </div>
          </div>

          <div className="status-action-btns">
            <button className="btn-status-primary" onClick={onRetry}>
              Retry Payment
            </button>
            <Link to="/orders">
              <button className="btn-status-secondary">View Orders</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default StatusCard;
