import React, { useEffect, useState } from "react";
import { usePayment } from "../context/PaymentContext";
import { useAuth } from "../context/AuthContext";
import "../styles/payment.css";

function PaymentHistory() {
  const { user } = useAuth();
  const {
    paymentHistory,
    stats,
    historyLoading,
    statsLoading,
    fetchPaymentHistory,
    fetchPaymentStats,
  } = usePayment();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    fetchPaymentStats();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPaymentHistory({
        status: activeTab,
        search: search,
      });
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, activeTab]);

  const handleTabChange = (status) => {
    setActiveTab(status);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="payment-module-container">
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 className="payment-title">Transactions Ledger 📊</h1>
          <p className="payment-subtitle" style={{ margin: 0 }}>
            {isAdmin 
              ? "Global payment gateway analysis and transaction history (Administrator Panel)" 
              : "Review and manage your online payment history and transaction records"}
          </p>
        </div>

        {/* Dashboard Analytics Section */}
        {statsLoading ? (
          <div className="analytics-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="analytics-card">
                <div className="skeleton-row" style={{ width: "56px", height: "56px", borderRadius: "8px" }}></div>
                <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div className="skeleton-row" style={{ width: "60%", height: "24px" }}></div>
                  <div className="skeleton-row" style={{ width: "40%", height: "14px" }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="analytics-grid">
            {/* Card 1: Total Transactions */}
            <div className="analytics-card">
              <div className="analytics-icon-box total">💳</div>
              <div className="analytics-info">
                <span className="analytics-value">{stats.totalTransactions}</span>
                <span className="analytics-label">Total Transactions</span>
              </div>
            </div>

            {/* Card 2: Successful Payments */}
            <div className="analytics-card">
              <div className="analytics-icon-box success">✓</div>
              <div className="analytics-info">
                <span className="analytics-value">{stats.successfulPayments}</span>
                <span className="analytics-label">Successful</span>
              </div>
            </div>

            {/* Card 3: Failed Payments */}
            <div className="analytics-card">
              <div className="analytics-icon-box failed">✗</div>
              <div className="analytics-info">
                <span className="analytics-value">{stats.failedPayments}</span>
                <span className="analytics-label">Failed</span>
              </div>
            </div>

            {/* Card 4: Total Revenue */}
            <div className="analytics-card">
              <div className="analytics-icon-box revenue">&#8377;</div>
              <div className="analytics-info">
                <span className="analytics-value">&#8377;{stats.totalRevenue}</span>
                <span className="analytics-label">{isAdmin ? "Total Revenue" : "My Spending"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="history-controls">
          <div className="search-input-wrapper">
            <svg
              className="search-icon-svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder={isAdmin ? "Search Transaction, Order ID, Name, Email..." : "Search Transaction ID or Order ID..."}
              value={search}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <div className="filter-tabs">
            {["All", "Success", "Failed", "Pending"].map((status) => (
              <button
                key={status}
                onClick={() => handleTabChange(status)}
                className={`filter-tab ${activeTab === status ? "active" : ""}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table */}
        {historyLoading ? (
          <div className="history-table-container">
            <div style={{ padding: "20px" }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton-row" style={{ height: "30px", marginBottom: "15px", borderRadius: "6px" }}></div>
              ))}
            </div>
          </div>
        ) : paymentHistory.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-icon">📂</div>
            <h3 className="empty-state-title">No Transactions Found</h3>
            <p className="empty-state-desc">
              We couldn't find any transaction matching your current filters or search terms. Try modifying your inputs.
            </p>
            {(search || activeTab !== "All") && (
              <button
                className="btn-status-primary"
                onClick={() => {
                  setSearch("");
                  setActiveTab("All");
                }}
              >
                Reset Search Filters
              </button>
            )}
          </div>
        ) : (
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Order ID</th>
                  {isAdmin && <th>Customer</th>}
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date &amp; Time</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr key={payment._id}>
                    <td style={{ fontWeight: "700", color: "#4f46e5", fontSize: "0.9rem" }}>
                      {payment.transactionId}
                    </td>
                    <td style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                      {(() => {
                        if (!payment.orderId) return "N/A";
                        const idStr = typeof payment.orderId === "object" ? (payment.orderId._id || "").toString() : payment.orderId.toString();
                        if (!idStr) return "N/A";
                        return `#${idStr.substring(Math.max(0, idStr.length - 8)).toUpperCase()}`;
                      })()}
                    </td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontWeight: "600" }}>{payment.user?.name || "Customer"}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{payment.user?.email}</span>
                        </div>
                      </td>
                    )}
                    <td style={{ fontWeight: "700" }}>
                      &#8377;{payment.amount}
                    </td>
                    <td style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                      {payment.paymentMethod}
                    </td>
                    <td>
                      <span className={`status-badge ${payment.status.toLowerCase()}`}>
                        <span className={`status-dot ${payment.status.toLowerCase()}`}></span>
                        {payment.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                      {formatDate(payment.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentHistory;
