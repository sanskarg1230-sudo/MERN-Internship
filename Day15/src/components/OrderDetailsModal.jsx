import "../App.css";

function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  const steps = ["Order Placed", "Processing", "Shipped", "Delivered"];
  
  const getStepIndex = (status) => {
    switch (status) {
      case "Pending":
        return 0;
      case "Processing":
        return 1;
      case "Shipped":
        return 2;
      case "Delivered":
        return 3;
      default:
        return -1; // Cancelled
    }
  };

  const currentStepIndex = getStepIndex(order.status);
  const isCancelled = order.status === "Cancelled";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Order Details</h2>
            <p className="order-id-sub">ID: #{order._id}</p>
          </div>
          <button className="close-modal-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* Status Timeline */}
          <div className="timeline-card">
            <h3>Order Status</h3>
            {isCancelled ? (
              <div className="cancelled-banner">
                <span className="cancelled-dot"></span>
                <strong>This order has been Cancelled</strong>
              </div>
            ) : (
              <div className="timeline-container">
                <div className="timeline-progress-bar">
                  <div
                    className="timeline-progress-fill"
                    style={{
                      width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="timeline-steps">
                  {steps.map((step, idx) => {
                    const isCompleted = idx < currentStepIndex;
                    const isActive = idx === currentStepIndex;
                    return (
                      <div
                        key={step}
                        className={`timeline-step ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
                      >
                        <div className="step-circle">
                          {isCompleted ? "✓" : idx + 1}
                        </div>
                        <span className="step-label">{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="modal-grid">
            {/* Customer & Shipping info */}
            <div className="info-card">
              <h3>Customer Information</h3>
              <div className="info-group">
                <p><strong>Name:</strong> {order.customerDetails.name}</p>
                <p><strong>Email:</strong> {order.customerDetails.email}</p>
                <p><strong>Phone:</strong> {order.customerDetails.phone}</p>
              </div>

              <h3 style={{ marginTop: "20px" }}>Shipping Address</h3>
              <div className="info-group">
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
                <p style={{ marginTop: "10px" }}>
                  <strong>Payment Method:</strong> {order.paymentMethod}
                </p>
                <p>
                  <strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Products table */}
            <div className="products-card">
              <h3>Ordered Products</h3>
              <div className="modal-table-container">
                <table className="modal-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.products.map((item, idx) => {
                      const prodName = item.product?.name || "Deleted Product";
                      const price = item.price;
                      const qty = item.quantity;
                      const subtotal = price * qty;
                      const prodId = item.product?._id || idx;

                      return (
                        <tr key={idx}>
                          <td className="product-cell">
                            <img
                              src={`https://picsum.photos/60/40?random=${prodId}`}
                              alt={prodName}
                              className="modal-prod-img"
                              onError={(e) => {
                                e.target.src = "https://placehold.co/60x40?text=Prod";
                              }}
                            />
                            <span className="prod-name-text">{prodName}</span>
                          </td>
                          <td>₹{price}</td>
                          <td>{qty}</td>
                          <td>₹{subtotal}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="order-summary-row">
                <div className="total-label">Total Amount:</div>
                <div className="total-val">₹{order.totalAmount}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="back-store-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsModal;
