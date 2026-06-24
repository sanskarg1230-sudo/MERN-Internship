import React from "react";
import "../styles/payment.css";

function OrderSummary({ order, loading }) {
  if (loading || !order) {
    return (
      <div className="premium-card">
        <div className="summary-title">
          <span>Order Summary</span>
          <div className="skeleton-row" style={{ width: "80px", height: "20px" }}></div>
        </div>
        <div className="summary-items-list">
          {[1, 2].map((i) => (
            <div key={i} className="summary-item-card" style={{ gap: "16px" }}>
              <div className="skeleton-row" style={{ width: "64px", height: "64px", borderRadius: "8px" }}></div>
              <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                <div className="skeleton-row" style={{ width: "60%" }}></div>
                <div className="skeleton-row" style={{ width: "30%", height: "14px" }}></div>
              </div>
              <div className="skeleton-row" style={{ width: "60px", height: "20px" }}></div>
            </div>
          ))}
        </div>
        <div className="summary-breakdown" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div className="skeleton-row" style={{ width: "100%" }}></div>
          <div className="skeleton-row" style={{ width: "100%" }}></div>
          <div className="skeleton-row" style={{ width: "100%", height: "30px", marginTop: "10px" }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-card">
      <div className="summary-title">
        <span>Order Summary</span>
        <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#6366f1" }}>
          ID: #{order._id.substring(order._id.length - 8).toUpperCase()}
        </span>
      </div>

      <div className="summary-items-list">
        {order.products &&
          order.products.map((item, idx) => {
            const product = item.product;
            const productName = product ? product.name : "Product Item";
            const productPrice = item.price || (product ? product.price : 0);
            const productId = product ? product._id : idx;

            return (
              <div key={idx} className="summary-item-card">
                <img
                  src={`https://picsum.photos/120/120?random=${productId}`}
                  alt={productName}
                  className="summary-item-img"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/120/e2e8f0/0f172a?text=Product";
                  }}
                />
                <div className="summary-item-info">
                  <h4 className="summary-item-name">{productName}</h4>
                  <p className="summary-item-qty">
                    Qty: {item.quantity} &times; &#8377;{productPrice}
                  </p>
                </div>
                <div className="summary-item-subtotal">
                  &#8377;{productPrice * item.quantity}
                </div>
              </div>
            );
          })}
      </div>

      <div className="summary-breakdown">
        <div className="breakdown-row">
          <span>Subtotal</span>
          <span>&#8377;{order.totalAmount}</span>
        </div>
        <div className="breakdown-row">
          <span>Shipping &amp; Handling</span>
          <span className="shipping-badge">FREE</span>
        </div>
        <div className="breakdown-row">
          <span>Taxes</span>
          <span>&#8377;0</span>
        </div>
        <div className="breakdown-row total-row">
          <span>Total Amount</span>
          <span>&#8377;{order.totalAmount}</span>
        </div>
      </div>
    </div>
  );
}

export default OrderSummary;
